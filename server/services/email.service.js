import nodemailer from "nodemailer";
import pool from "../config/db.js";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendAssignmentNotification(assignment, assignee, assignedBy) {
    const mailOptions = {
      from: `"HSE System" <${process.env.SMTP_FROM}>`,
      to: assignee.email,
      subject: `New Safety Assignment: ${assignment.indicator_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">New Safety Assignment</h2>
          <p>Hello ${assignee.name},</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${assignment.indicator_name}</h3>
            <p><strong>Type:</strong> ${assignment.indicator_type.toUpperCase()}</p>
            <p><strong>Category:</strong> ${assignment.category}</p>
            ${assignment.due_date ? `<p><strong>Due Date:</strong> ${new Date(assignment.due_date).toLocaleDateString()}</p>` : ""}
            ${assignment.notes ? `<p><strong>Notes:</strong> ${assignment.notes}</p>` : ""}
          </div>
          
          <p><strong>Assigned by:</strong> ${assignedBy.name}</p>
          
          <a href="${process.env.FRONTEND_URL}/indicators" 
             style="display: inline-block; background-color: #0ea5e9; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                    margin: 20px 0;">
            View Assignment
          </a>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
            This is an automated message from the HSE Safety System.
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);

    // Log email sent
    await pool.execute(
      `INSERT INTO email_logs (email_type, recipient_email, recipient_name, 
        subject, status, sent_at) VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        "assignment_notification",
        assignee.email,
        assignee.name,
        mailOptions.subject,
        "sent",
      ],
    );
  }

  async sendAlertNotification(alert, recipients) {
    const mailOptions = {
      from: `"HSE System" <${process.env.SMTP_FROM}>`,
      bcc: recipients.map((r) => r.email).join(","),
      subject: `🚨 Safety Alert: ${alert.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${alert.severity === "high" ? "#fef2f2" : alert.severity === "medium" ? "#fffbeb" : "#f0f9ff"}; 
                    border-left: 4px solid ${alert.severity === "high" ? "#dc2626" : alert.severity === "medium" ? "#f59e0b" : "#0ea5e9"};
                    padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h2 style="color: ${alert.severity === "high" ? "#dc2626" : alert.severity === "medium" ? "#f59e0b" : "#0ea5e9"}; 
                      margin-top: 0;">
              Safety Alert
            </h2>
            <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
            <p><strong>Type:</strong> ${alert.alert_type}</p>
            <p><strong>Message:</strong> ${alert.message}</p>
            <p><strong>Date:</strong> ${new Date(alert.created_at).toLocaleString()}</p>
          </div>
          
          <a href="${process.env.FRONTEND_URL}/alerts" 
             style="display: inline-block; background-color: #0ea5e9; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Alert Details
          </a>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
            This alert requires your attention. Please review and take appropriate action.
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendReportEmail(recipientEmail, reportData) {
    const mailOptions = {
      from: `"HSE System" <${process.env.SMTP_FROM}>`,
      to: recipientEmail,
      subject: `HSE Report: ${reportData.report_type}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">HSE Report</h2>
          <p>Your requested report is ready.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${reportData.report_type.replace("_", " ").toUpperCase()}</h3>
            <p><strong>Period:</strong> ${new Date(reportData.start_date).toLocaleDateString()} 
               to ${new Date(reportData.end_date).toLocaleDateString()}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>The report is attached to this email.</p>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
            If you have any questions, contact your HSE administrator.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: reportData.filename,
          path: reportData.filepath,
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export default EmailService;
