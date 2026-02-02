const pool = require("../config/db");

exports.getTeams = async (req, res) => {
  try {
    const user = req.user;
    let query = `
      SELECT 
        t.*,
        g.name as group_name,
        u.name as admin_name,
        u.email as admin_email,
        COUNT(DISTINCT u2.id) as user_count
      FROM teams t
      LEFT JOIN \`groups\` g ON t.group_id = g.id
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN users u2 ON t.id = u2.team_id
      WHERE 1=1
    `;

    const params = [];

    // If request is for specific group (from /groups/:id/teams endpoint)
    if (req.params.id) {
      const groupId = req.params.id;

      // Check if user has access to this group
      if (user.role === "group_admin" && user.group_id != groupId) {
        return res.status(403).json({ message: "Access denied" });
      }

      query += " AND t.group_id = ?";
      params.push(groupId);
    } else {
      // For general /teams endpoint, filter based on user role
      if (user.role === "group_admin") {
        query += " AND t.group_id = ?";
        params.push(user.group_id);
      }
      // team_admin shouldn't access this endpoint directly
    }

    query += " GROUP BY t.id ORDER BY t.created_at DESC";

    const [teams] = await pool.execute(query, params);

    res.json({
      success: true,
      data: teams,
    });
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({
      message: "Failed to fetch teams",
      error: error.message,
    });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, description, group_id } = req.body;
    const userId = req.user.id;

    if (!name || !group_id) {
      return res.status(400).json({
        message: "Team name and group ID are required",
      });
    }

    // Check if user has permission to create team in this group
    const user = req.user;
    if (user.role === "group_admin" && user.group_id != group_id) {
      return res.status(403).json({
        message: "You can only create teams in your own group",
      });
    }

    // Generate unique code
    const code = `${name.replace(/\s+/g, "").substring(0, 3).toUpperCase()}-${Date.now().toString().substr(-4)}`;

    const [result] = await pool.execute(
      "INSERT INTO teams (name, code, description, group_id, created_by, status) VALUES (?, ?, ?, ?, ?, 'active')",
      [name, code, description || null, group_id, userId],
    );

    const [newTeam] = await pool.execute(
      "SELECT t.*, g.name as group_name FROM teams t LEFT JOIN `groups` g ON t.group_id = g.id WHERE t.id = ?",
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: newTeam[0],
    });
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({
      message: "Failed to create team",
      error: error.message,
    });
  }
};

exports.updateTeamStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Check permissions
    const [team] = await pool.execute(
      "SELECT group_id FROM teams WHERE id = ?",
      [id],
    );

    if (team.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (user.role === "group_admin" && user.group_id != team[0].group_id) {
      return res.status(403).json({
        message: "You can only update teams in your group",
      });
    }

    await pool.execute("UPDATE teams SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    // Also update users under this team if deactivating
    if (status === "inactive") {
      await pool.execute(
        "UPDATE users SET status = 'inactive' WHERE team_id = ?",
        [id],
      );
    }

    res.json({
      success: true,
      message: `Team ${status === "active" ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Update team status error:", error);
    res.status(500).json({
      message: "Failed to update team status",
      error: error.message,
    });
  }
};

exports.getTeamDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const [teams] = await pool.execute(
      `
      SELECT 
        t.*,
        g.name as group_name,
        u.name as admin_name,
        u.email as admin_email
      FROM teams t
      LEFT JOIN \`groups\` g ON t.group_id = g.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `,
      [id],
    );

    if (teams.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    const team = teams[0];

    // Check access
    if (user.role === "group_admin" && user.group_id != team.group_id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (user.role === "team_admin" && user.team_id != id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error("Get team details error:", error);
    res.status(500).json({
      message: "Failed to fetch team details",
      error: error.message,
    });
  }
};

exports.getTeamUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Check access
    const [team] = await pool.execute(
      "SELECT group_id FROM teams WHERE id = ?",
      [id],
    );

    if (team.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (user.role === "group_admin" && user.group_id != team[0].group_id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (user.role === "team_admin" && user.team_id != id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const [users] = await pool.execute(
      `
      SELECT 
        u.*,
        g.name as group_name,
        t.name as team_name
      FROM users u
      LEFT JOIN \`groups\` g ON u.group_id = g.id
      LEFT JOIN teams t ON u.team_id = t.id
      WHERE u.team_id = ?
      ORDER BY 
        CASE u.role
          WHEN 'team_admin' THEN 1
          WHEN 'employee' THEN 2
          ELSE 3
        END,
        u.created_at DESC
    `,
      [id],
    );

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get team users error:", error);
    res.status(500).json({
      message: "Failed to fetch team users",
      error: error.message,
    });
  }
};
