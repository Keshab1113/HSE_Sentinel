const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

exports.register = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      signupType,
      name,
      email,
      password,
      mobile,
      position,
      employeeId,
      workLocation,
      groupId,
      teamId,
      groupName,
      teamName
    } = req.body;

    // Validate password strength
    if (!passwordRegex.test(password)) {
      await connection.rollback();
      return res.status(400).json({
        message: "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character"
      });
    }

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Determine role based on signup type
    let role;
    if (signupType === "group") {
      role = "group_admin";
    } else if (signupType === "team") {
      role = "team_admin";
    } else {
      role = "employee";
    }

    // For group admin: create new group
    let finalGroupId = groupId ? parseInt(groupId) : null;
    let finalTeamId = teamId ? parseInt(teamId) : null;
    let finalGroupName = groupName;
    let finalTeamName = teamName;
    
    if (signupType === "group") {
      // Create new group
      const groupCode = `${groupName.replace(/\s+/g, '').substring(0, 3).toUpperCase()}-${Date.now().toString().substr(-4)}`;
      
      const [groupResult] = await connection.execute(
        "INSERT INTO `groups` (name, code, status) VALUES (?, ?, ?)",
        [groupName, groupCode, 'active']
      );
      
      finalGroupId = groupResult.insertId;
    }
    
    if (signupType === "team" && finalGroupId) {
      // Get group name first
      const [groupInfo] = await connection.execute(
        "SELECT name FROM `groups` WHERE id = ?",
        [finalGroupId]
      );
      
      if (groupInfo.length > 0) {
        finalGroupName = groupInfo[0].name;
      }
      
      // Create new team within existing group
      const teamCode = `${teamName.replace(/\s+/g, '').substring(0, 3).toUpperCase()}-${Date.now().toString().substr(-4)}`;
      
      const [teamResult] = await connection.execute(
        "INSERT INTO teams (name, code, group_id, status) VALUES (?, ?, ?, ?)",
        [teamName, teamCode, finalGroupId, 'active']
      );
      
      finalTeamId = teamResult.insertId;
    }
    
    // For employee signup: Get group and team names
    if (signupType === "employee" && finalGroupId && finalTeamId) {
      const [groupInfo] = await connection.execute(
        "SELECT name FROM `groups` WHERE id = ?",
        [finalGroupId]
      );
      const [teamInfo] = await connection.execute(
        "SELECT name FROM teams WHERE id = ?",
        [finalTeamId]
      );
      
      if (groupInfo.length > 0) {
        finalGroupName = groupInfo[0].name;
      }
      if (teamInfo.length > 0) {
        finalTeamName = teamInfo[0].name;
      }
    }

    // Determine approval status
    const isApproved = false;
    const status = "pending";

    // Insert user into database
    const [userResult] = await connection.execute(
      `INSERT INTO users (
        name, email, password_hash, role, mobile, position, 
        employee_id, work_location, group_id, team_id, 
        group_name, team_name, is_approved, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        email,
        hash,
        role,
        mobile || null,
        position || null,
        employeeId || null,
        workLocation || null,
        finalGroupId || null,
        finalTeamId || null,
        finalGroupName || null,
        finalTeamName || null,
        isApproved,
        status
      ]
    );

    const userId = userResult.insertId;

    // Update created_by in groups/teams if this user created them
    if (signupType === "group" && finalGroupId) {
      await connection.execute(
        "UPDATE `groups` SET created_by = ? WHERE id = ?",
        [userId, finalGroupId]
      );
    }
    
    if (signupType === "team" && finalTeamId) {
      await connection.execute(
        "UPDATE teams SET created_by = ? WHERE id = ?",
        [userId, finalTeamId]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Registration successful. Your account is pending approval.",
      data: {
        userId,
        name,
        email,
        role,
        status: "pending"
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed. Please try again.",
      error: error.message
    });
  } finally {
    connection.release();
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with email
    const [users] = await pool.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    // Check if user is approved
    if (!user.is_approved) {
      return res.status(403).json({
        message: "Your account is pending approval. Please contact your administrator.",
        status: "pending"
      });
    }

    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({
        message: `Account is ${user.status}. Please contact administrator.`
      });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        group_id: user.group_id,
        team_id: user.team_id,
        is_approved: user.is_approved
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Update last login time (optional)
    await pool.execute(
      "UPDATE users SET last_login = NOW() WHERE id = ?",
      [user.id]
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        group_id: user.group_id,
        team_id: user.team_id,
        is_approved: user.is_approved,
        status: user.status
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed. Please try again.",
      error: error.message
    });
  }
};

// Get pending approvals (for admin dashboard)
exports.getPendingApprovals = async (req, res) => {
  try {
    const user = req.user; // From JWT middleware
    
    // Check if user has permission to view approvals
    if (!['super_admin', 'group_admin', 'team_admin'].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    let query = `
      SELECT 
        u.id, u.name, u.email, u.role, u.mobile, u.position,
        u.employee_id, u.work_location, u.group_id, u.team_id,
        u.group_name, u.team_name, u.is_approved, u.status,
        u.created_at,
        g.name as group_name_full,
        t.name as team_name_full
      FROM users u
      LEFT JOIN \`groups\` g ON u.group_id = g.id
      LEFT JOIN teams t ON u.team_id = t.id
      WHERE u.is_approved = FALSE AND u.status = 'pending'
    `;

    const params = [];

    // Filter based on user role
    if (user.role === 'group_admin') {
      query += " AND u.group_id = ?";
      params.push(user.group_id);
      query += " AND u.role IN ('employee', 'team_admin')";
    } else if (user.role === 'team_admin') {
      query += " AND u.team_id = ? AND u.role = 'employee'";
      params.push(user.team_id);
    }
    // super_admin can see all pending approvals

    query += " ORDER BY u.created_at DESC";

    const [pendingUsers] = await pool.execute(query, params);

    res.json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers
    });

  } catch (error) {
    console.error("Get pending approvals error:", error);
    res.status(500).json({
      message: "Failed to fetch pending approvals",
      error: error.message
    });
  }
};

// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = req.user; // From JWT middleware

    // Check if user has permission to approve
    if (!['super_admin', 'group_admin', 'team_admin'].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get user to approve
    const [users] = await pool.execute(
      `SELECT * FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToApprove = users[0];

    // Check permissions based on role hierarchy
    if (user.role === 'team_admin') {
      // Team admin can only approve employees in their team
      if (userToApprove.role !== 'employee' || userToApprove.team_id !== user.team_id) {
        return res.status(403).json({ message: "You can only approve employees in your team" });
      }
    } else if (user.role === 'group_admin') {
      // Group admin can approve team_admins and employees in their group
      if (!['team_admin', 'employee'].includes(userToApprove.role) || userToApprove.group_id !== user.group_id) {
        return res.status(403).json({ message: "You can only approve users in your group" });
      }
    }
    // super_admin can approve anyone

    // Update user status
    await pool.execute(
      `UPDATE users 
       SET is_approved = TRUE, 
           status = 'active',
           approved_by = ?,
           approved_at = NOW()
       WHERE id = ?`,
      [user.id, userId]
    );

    res.json({
      success: true,
      message: "User approved successfully"
    });

  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({
      message: "Failed to approve user",
      error: error.message
    });
  }
};

// Reject user
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const user = req.user;

    // Check if user has permission to reject
    if (!['super_admin', 'group_admin', 'team_admin'].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get user to reject
    const [users] = await pool.execute(
      `SELECT * FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToReject = users[0];

    // Check permissions based on role hierarchy
    if (user.role === 'team_admin') {
      if (userToReject.role !== 'employee' || userToReject.team_id !== user.team_id) {
        return res.status(403).json({ message: "Permission denied" });
      }
    } else if (user.role === 'group_admin') {
      if (!['team_admin', 'employee'].includes(userToReject.role) || userToReject.group_id !== user.group_id) {
        return res.status(403).json({ message: "Permission denied" });
      }
    }

    // Update user status to rejected
    await pool.execute(
      `UPDATE users 
       SET status = 'rejected',
           approved_by = ?,
           approved_at = NOW(),
           rejection_reason = ?
       WHERE id = ?`,
      [user.id, reason || 'Registration rejected', userId]
    );

    res.json({
      success: true,
      message: "User registration rejected"
    });

  } catch (error) {
    console.error("Reject user error:", error);
    res.status(500).json({
      message: "Failed to reject user",
      error: error.message
    });
  }
};