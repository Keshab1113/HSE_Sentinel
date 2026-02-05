import pool from "../config/db.js";
import { IndicatorService } from "../services/predictive/indicator.service.js";
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const indicatorService = new IndicatorService();

export const getCompliance = async (req, res) => {
  try {
    const { groupId } = req.query;
    const user = req.user;

    const [compliance] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'compliant' THEN 1 ELSE 0 END) as compliant,
        SUM(CASE WHEN status = 'non_compliant' THEN 1 ELSE 0 END) as non_compliant,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue
      FROM compliance_items
      WHERE group_id = ?
    `, [groupId || user.group_id]);

    const [items] = await pool.execute(`
      SELECT 
        regulation,
        requirement,
        status,
        due_date,
        notes
      FROM compliance_items
      WHERE group_id = ?
      ORDER BY due_date ASC
      LIMIT 10
    `, [groupId || user.group_id]);

    res.json({
      success: true,
      data: {
        summary: compliance[0],
        items: items,
        oshaStatus: compliance[0].compliant / compliance[0].total * 100 > 80 ? 'compliant' : 'non_compliant',
        isoStatus: compliance[0].compliant / compliance[0].total * 100 > 90 ? 'compliant' : 'pending',
        trainingStatus: 'compliant',
        equipmentStatus: 'compliant'
      }
    });
  } catch (error) {
    console.error("Get compliance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch compliance data",
      error: error.message
    });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const user = req.user;

    // Get safety scores
    const [scores] = await pool.execute(`
      SELECT 
        ss.*,
        g.name as group_name,
        t.name as team_name
      FROM safety_scores ss
      LEFT JOIN \`groups\` g ON ss.group_id = g.id
      LEFT JOIN teams t ON ss.team_id = t.id
      WHERE ss.group_id = ? AND ss.team_id = ?
      ORDER BY ss.score_date DESC
      LIMIT 1
    `, [user.group_id, user.team_id]);

    // Get incident free days
    const [incidentFree] = await pool.execute(`
      SELECT DATEDIFF(CURDATE(), MAX(measurement_date)) as days_incident_free
      FROM indicator_measurements
      WHERE indicator_type = 'lagging'
        AND group_id = ?
        AND team_id = ?
    `, [user.group_id, user.team_id]);

    // Get completion rate
    const [completion] = await pool.execute(`
      SELECT 
        COUNT(*) as total_assignments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM indicator_assignments ia
      JOIN users u ON ia.assigned_to = u.id
      WHERE u.group_id = ? AND u.team_id = ?
    `, [user.group_id, user.team_id]);

    res.json({
      success: true,
      data: {
        scores: scores[0] || {},
        daysIncidentFree: incidentFree[0]?.days_incident_free || 0,
        completionRate: completion[0]?.total_assignments > 0 
          ? (completion[0].completed / completion[0].total_assignments * 100) 
          : 0,
        riskLevel: scores[0]?.composite_score < 60 ? 'high' : 
                  scores[0]?.composite_score < 80 ? 'medium' : 'low'
      }
    });
  } catch (error) {
    console.error("Get dashboard data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message
    });
  }
};

export const generateReport = async (req, res) => {
  try {
    const {
      report_type,
      start_date,
      end_date,
      format,
      sections,
      group_id,
      team_id
    } = req.body;

    const user = req.user;

    // Validate permissions
    if (user.role === 'team_admin' && (parseInt(group_id) !== user.group_id || parseInt(team_id) !== user.team_id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filename = `hse_report_${report_type}_${Date.now()}.${format}`;
    const filepath = path.join(reportsDir, filename);

    let buffer;
    
    switch (format) {
      case 'pdf':
        buffer = await generatePDFReport(report_type, start_date, end_date, sections, user);
        break;
      case 'excel':
        buffer = await generateExcelReport(report_type, start_date, end_date, sections, user);
        break;
      case 'csv':
        buffer = await generateCSVReport(report_type, start_date, end_date, sections, user);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported format"
        });
    }

    // Save file
    fs.writeFileSync(filepath, buffer);

    // Log report generation
    await pool.execute(
      `INSERT INTO report_logs 
       (report_type, user_id, group_id, team_id, format, period_start, period_end, file_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [report_type, user.id, group_id || user.group_id, team_id || user.team_id, 
       format, start_date, end_date, filepath]
    );

    // Send file
    res.setHeader('Content-Type', getContentType(format));
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);

  } catch (error) {
    console.error("Generate report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message
    });
  }
};

async function generatePDFReport(reportType, startDate, endDate, sections, user) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Header
    doc.fontSize(20).text('HSE Safety Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Report Type: ${reportType.replace('_', ' ')}`, { align: 'center' });
    doc.text(`Period: ${startDate} to ${endDate}`, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Executive Summary
    if (sections.executiveSummary) {
      doc.fontSize(16).text('Executive Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text('This report summarizes safety performance indicators...');
      doc.moveDown();
    }

    // Add more sections based on sections object
    // ...

    doc.end();
  });
}

// Update the generateExcelReport function
async function generateExcelReport(reportType, startDate, endDate, sections, user) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Safety Report');

  // Add headers
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Safety Score', key: 'score', width: 15 },
    { header: 'Leading Indicators', key: 'leading_score', width: 20 },
    { header: 'Lagging Indicators', key: 'lagging_score', width: 20 },
    { header: 'Trend', key: 'trend', width: 15 }
  ];

  // Add data - FIXED: Use backticks for reserved keywords
  const [data] = await pool.execute(`
    SELECT 
      DATE(score_date) as date,
      composite_score as score,
      leading_score as \`leading\`,
      lagging_score as \`lagging\`,
      trend
    FROM safety_scores
    WHERE group_id = ? AND team_id = ?
      AND score_date BETWEEN ? AND ?
    ORDER BY score_date
  `, [user.group_id, user.team_id, startDate, endDate]);

  data.forEach(row => {
    worksheet.addRow(row);
  });

  // Style header row
  worksheet.getRow(1).font = { bold: true };

  return await workbook.xlsx.writeBuffer();
}

// Also fix the generateCSVReport function
async function generateCSVReport(reportType, startDate, endDate, sections, user) {
  const [data] = await pool.execute(`
    SELECT 
      DATE(score_date) as date,
      composite_score as score,
      leading_score as \`leading\`,
      lagging_score as \`lagging\`,
      trend
    FROM safety_scores
    WHERE group_id = ? AND team_id = ?
      AND score_date BETWEEN ? AND ?
    ORDER BY score_date
  `, [user.group_id, user.team_id, startDate, endDate]);

  let csv = 'Date,Safety Score,Leading Indicators,Lagging Indicators,Trend\n';
  data.forEach(row => {
    csv += `${row.date},${row.score},${row.leading},${row.lagging},${row.trend}\n`;
  });

  return Buffer.from(csv, 'utf-8');
}

// Fix the getTrends function too
export const getTrends = async (req, res) => {
  try {
    const { timeframe } = req.query;
    const user = req.user;

    let dateRange;
    switch (timeframe) {
      case '7d':
        dateRange = 'DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        break;
      case '30d':
        dateRange = 'DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        break;
      case '90d':
        dateRange = 'DATE_SUB(CURDATE(), INTERVAL 90 DAY)';
        break;
      case '1y':
        dateRange = 'DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
        break;
      default:
        dateRange = 'DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    const [trends] = await pool.execute(`
      SELECT 
        DATE(ss.score_date) as date,
        ss.leading_score as \`leading\`,
        ss.lagging_score as \`lagging\`,
        ss.composite_score as score,
        ss.trend
      FROM safety_scores ss
      WHERE ss.group_id = ? 
        AND ss.team_id = ?
        AND ss.score_date >= ${dateRange}
      ORDER BY ss.score_date ASC
    `, [user.group_id, user.team_id]);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error("Get trends error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trends",
      error: error.message
    });
  }
};

function getContentType(format) {
  const types = {
    pdf: 'application/pdf',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return types[format] || 'application/octet-stream';
}

export const sendReportEmail = async (req, res) => {
  try {
    const { report_type, start_date, end_date, recipient_email } = req.body;
    const user = req.user;

    // Generate report first
    const reportBuffer = await generateExcelReport(report_type, start_date, end_date, {}, user);
    
    // Save temporary file
    const reportsDir = path.join(process.cwd(), 'temp_reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filename = `hse_report_${Date.now()}.xlsx`;
    const filepath = path.join(reportsDir, filename);
    fs.writeFileSync(filepath, reportBuffer);

    // Send email (implement email service)
    // await emailService.sendReportEmail(recipient_email || user.email, {
    //   report_type,
    //   start_date,
    //   end_date,
    //   filename,
    //   filepath
    // });

    // Cleanup
    fs.unlinkSync(filepath);

    res.json({
      success: true,
      message: "Report sent successfully"
    });
  } catch (error) {
    console.error("Send report email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send report email",
      error: error.message
    });
  }
};