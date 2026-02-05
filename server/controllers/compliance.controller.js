import pool from "../config/db.js";

export const getComplianceItems = async (req, res) => {
  try {
    const { groupId, status } = req.query;
    const user = req.user;

    let query = `
      SELECT 
        ci.*,
        u.name as assignee_name,
        u.email as assignee_email,
        ub.name as assigned_by_name,
        g.name as group_name,
        t.name as team_name
      FROM compliance_items ci
      LEFT JOIN users u ON ci.assigned_to = u.id
      LEFT JOIN users ub ON ci.assigned_by = ub.id
      LEFT JOIN \`groups\` g ON ci.group_id = g.id
      LEFT JOIN teams t ON ci.team_id = t.id
      WHERE ci.group_id = ?
    `;

    const params = [groupId || user.group_id];

    if (status) {
      query += ' AND ci.status = ?';
      params.push(status);
    }

    if (user.role === 'team_admin') {
      query += ' AND ci.team_id = ?';
      params.push(user.team_id);
    }

    query += ' ORDER BY ci.due_date ASC, ci.created_at DESC';

    const [items] = await pool.execute(query, params);

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error("Get compliance items error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch compliance items",
      error: error.message
    });
  }
};

export const addComplianceItem = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      regulation,
      requirement,
      category,
      due_date,
      status,
      notes,
      group_id,
      team_id,
      assigned_to
    } = req.body;

    const assigned_by = req.user.id;

    const [result] = await connection.execute(`
      INSERT INTO compliance_items 
      (regulation, requirement, category, due_date, status, notes, 
       group_id, team_id, assigned_to, assigned_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [regulation, requirement, category, due_date, status || 'pending', notes,
        group_id, team_id, assigned_to || req.user.id, assigned_by]);

    await connection.commit();

    res.json({
      success: true,
      id: result.insertId,
      message: "Compliance item added successfully"
    });
  } catch (error) {
    await connection.rollback();
    console.error("Add compliance item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add compliance item",
      error: error.message
    });
  } finally {
    connection.release();
  }
};

export const updateComplianceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const [result] = await pool.execute(`
      UPDATE compliance_items 
      SET status = ?, updated_at = NOW()
      WHERE id = ? AND (assigned_to = ? OR assigned_by = ?)
    `, [status, id, userId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Compliance item not found or unauthorized"
      });
    }

    res.json({
      success: true,
      message: "Compliance status updated successfully"
    });
  } catch (error) {
    console.error("Update compliance status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update compliance status",
      error: error.message
    });
  }
};

export const uploadComplianceEvidence = async (req, res) => {
  try {
    const { compliance_id } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const userId = req.user.id;

    // Verify permission
    const [compliance] = await pool.execute(`
      SELECT * FROM compliance_items 
      WHERE id = ? AND (assigned_to = ? OR assigned_by = ?)
    `, [compliance_id, userId, userId]);

    if (compliance.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const evidenceUrl = `/uploads/compliance/${req.file.filename}`;

    await pool.execute(`
      UPDATE compliance_items 
      SET evidence_url = ?, updated_at = NOW()
      WHERE id = ?
    `, [evidenceUrl, compliance_id]);

    res.json({
      success: true,
      url: evidenceUrl,
      message: "Evidence uploaded successfully"
    });
  } catch (error) {
    console.error("Upload evidence error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload evidence",
      error: error.message
    });
  }
};

export const getComplianceReport = async (req, res) => {
  try {
    const { groupId, format = 'pdf' } = req.query;
    const user = req.user;

    const [complianceData] = await pool.execute(`
      SELECT 
        regulation,
        requirement,
        category,
        status,
        due_date,
        notes,
        evidence_url,
        created_at
      FROM compliance_items
      WHERE group_id = ?
      ORDER BY due_date ASC
    `, [groupId || user.group_id]);

    // Generate report based on format
    // Similar to analytics controller report generation
    // ...

    res.json({
      success: true,
      data: complianceData,
      count: complianceData.length
    });
  } catch (error) {
    console.error("Get compliance report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate compliance report",
      error: error.message
    });
  }
};