import pool from "../config/db.js";
import EmailService from "../services/email.service.js";

const emailService = new EmailService();

export const sendAssignmentNotification = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const [assignment] = await pool.execute(`
      SELECT 
        ia.*,
        li.name as indicator_name,
        li.category,
        u.email as assignee_email,
        u.name as assignee_name,
        ub.email as assigned_by_email,
        ub.name as assigned_by_name
      FROM indicator_assignments ia
      LEFT JOIN leading_indicators li ON ia.indicator_id = li.id AND ia.indicator_type = 'leading'
      LEFT JOIN lagging_indicators lgi ON ia.indicator_id = lgi.id AND ia.indicator_type = 'lagging'
      LEFT JOIN users u ON ia.assigned_to = u.id
      LEFT JOIN users ub ON ia.assigned_by = ub.id
      WHERE ia.id = ?
    `, [assignmentId]);

    if (assignment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    const assignmentData = assignment[0];
    
    // If indicator is lagging, get name from lagging_indicators
    if (!assignmentData.indicator_name) {
      const [laggingIndicator] = await pool.execute(`
        SELECT name FROM lagging_indicators WHERE id = ?
      `, [assignmentData.indicator_id]);
      
      if (laggingIndicator.length > 0) {
        assignmentData.indicator_name = laggingIndicator[0].name;
      }
    }

    await emailService.sendAssignmentNotification(
      assignmentData,
      {
        email: assignmentData.assignee_email,
        name: assignmentData.assignee_name
      },
      {
        email: assignmentData.assigned_by_email,
        name: assignmentData.assigned_by_name
      }
    );

    res.json({
      success: true,
      message: "Assignment notification sent successfully"
    });
  } catch (error) {
    console.error("Send assignment notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send assignment notification",
      error: error.message
    });
  }
};

export const sendAlertNotification = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const [alert] = await pool.execute(`
      SELECT 
        pa.*,
        g.name as group_name,
        t.name as team_name
      FROM predictive_alerts pa
      LEFT JOIN \`groups\` g ON pa.group_id = g.id
      LEFT JOIN teams t ON pa.team_id = t.id
      WHERE pa.id = ?
    `, [alertId]);

    if (alert.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Alert not found"
      });
    }

    const alertData = alert[0];

    // Get recipients based on alert scope
    let query = `
      SELECT email, name FROM users 
      WHERE status = 'active'
    `;
    let params = [];

    if (alertData.group_id && alertData.team_id) {
      query += ' AND group_id = ? AND team_id = ?';
      params = [alertData.group_id, alertData.team_id];
    } else if (alertData.group_id) {
      query += ' AND group_id = ? AND role IN ("super_admin", "group_admin")';
      params = [alertData.group_id];
    } else {
      query += ' AND role IN ("super_admin")';
    }

    const [recipients] = await pool.execute(query, params);

    if (recipients.length === 0) {
      return res.json({
        success: true,
        message: "No recipients found for alert"
      });
    }

    await emailService.sendAlertNotification(alertData, recipients);

    // Update alert status
    await pool.execute(`
      UPDATE predictive_alerts 
      SET notification_sent = 1, notification_sent_at = NOW()
      WHERE id = ?
    `, [alertId]);

    res.json({
      success: true,
      message: "Alert notifications sent successfully",
      recipients_count: recipients.length
    });
  } catch (error) {
    console.error("Send alert notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send alert notifications",
      error: error.message
    });
  }
};

export const sendReportEmail = async (req, res) => {
  try {
    const {
      report_type,
      report_data,
      recipient_emails,
      subject,
      message
    } = req.body;

    const user = req.user;

    // Generate report file
    // ... (similar to analytics controller)

    // Send email
    await emailService.sendReportEmail(
      recipient_emails,
      {
        report_type,
        subject: subject || `${report_type} Report`,
        message: message || "Please find attached the requested report.",
        // file attachment
      }
    );

    res.json({
      success: true,
      message: "Report emails sent successfully"
    });
  } catch (error) {
    console.error("Send report email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send report emails",
      error: error.message
    });
  }
};

export const getEmailLogs = async (req, res) => {
  try {
    const { type, startDate, endDate, limit = 50 } = req.query;
    const user = req.user;

    let query = `
      SELECT * FROM email_logs 
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND email_type = ?';
      params.push(type);
    }

    if (startDate) {
      query += ' AND DATE(created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(created_at) <= ?';
      params.push(endDate);
    }

    if (user.role === 'group_admin') {
      query += ' AND recipient_email IN (SELECT email FROM users WHERE group_id = ?)';
      params.push(user.group_id);
    } else if (user.role === 'team_admin') {
      query += ' AND recipient_email IN (SELECT email FROM users WHERE team_id = ?)';
      params.push(user.team_id);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [logs] = await pool.execute(query, params);

    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error("Get email logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch email logs",
      error: error.message
    });
  }
};