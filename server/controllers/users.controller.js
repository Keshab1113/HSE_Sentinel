const pool = require("../config/db");
const bcrypt = require("bcryptjs");

exports.getUsers = async (req, res) => {
  try {
    const user = req.user;
    let query = `
      SELECT 
        u.*,
        g.name as group_name,
        t.name as team_name,
        ua.name as approved_by_name
      FROM users u
      LEFT JOIN \`groups\` g ON u.group_id = g.id
      LEFT JOIN teams t ON u.team_id = t.id
      LEFT JOIN users ua ON u.approved_by = ua.id
      WHERE 1=1
    `;

    const params = [];

    // Apply filters based on user role
    if (user.role === "group_admin") {
      query += " AND u.group_id = ?";
      params.push(user.group_id);
    } else if (user.role === "team_admin") {
      query += " AND u.team_id = ?";
      params.push(user.team_id);
    }

    query += " ORDER BY u.created_at DESC";

    const [users] = await pool.execute(query, params);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const user = req.user;

    let query = `
      SELECT 
        u.*,
        g.name as group_name,
        t.name as team_name
      FROM users u
      LEFT JOIN \`groups\` g ON u.group_id = g.id
      LEFT JOIN teams t ON u.team_id = t.id
      WHERE u.is_approved = FALSE AND u.status = 'pending'
    `;

    const params = [];

    // Filter based on user role
    if (user.role === "group_admin") {
      query += " AND u.group_id = ?";
      params.push(user.group_id);
      query += " AND u.role IN ('employee', 'team_admin')";
    } else if (user.role === "team_admin") {
      query += " AND u.team_id = ? AND u.role = 'employee'";
      params.push(user.team_id);
    }
    // super_admin can see all pending approvals

    query += " ORDER BY u.created_at DESC";

    const [pendingUsers] = await pool.execute(query, params);

    res.json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers,
    });
  } catch (error) {
    console.error("Get pending approvals error:", error);
    res.status(500).json({
      message: "Failed to fetch pending approvals",
      error: error.message,
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const [users] = await pool.execute(
      `
      SELECT 
        u.*,
        g.name as group_name,
        t.name as team_name,
        ua.name as approved_by_name,
        uc.name as created_by_name
      FROM users u
      LEFT JOIN \`groups\` g ON u.group_id = g.id
      LEFT JOIN teams t ON u.team_id = t.id
      LEFT JOIN users ua ON u.approved_by = ua.id
      LEFT JOIN users uc ON u.created_by = uc.id
      WHERE u.id = ?
    `,
      [id],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = users[0];

    // Check access
    if (user.role === "group_admin" && user.group_id != userData.group_id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (user.role === "team_admin" && user.team_id != userData.team_id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Get user to approve
    const [users] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [
      id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToApprove = users[0];

    // Check permissions based on role hierarchy
    if (user.role === "team_admin") {
      // Team admin can only approve employees in their team
      if (
        userToApprove.role !== "employee" ||
        userToApprove.team_id !== user.team_id
      ) {
        return res
          .status(403)
          .json({ message: "You can only approve employees in your team" });
      }
    } else if (user.role === "group_admin") {
      // Group admin can approve team_admins and employees in their group
      if (
        !["team_admin", "employee"].includes(userToApprove.role) ||
        userToApprove.group_id !== user.group_id
      ) {
        return res
          .status(403)
          .json({ message: "You can only approve users in your group" });
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
      [user.id, id],
    );

    // Send email notification (in production)
    // await sendApprovalEmail(userToApprove.email, userToApprove.name);

    res.json({
      success: true,
      message: "User approved successfully",
    });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({
      message: "Failed to approve user",
      error: error.message,
    });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;

    // Get user to reject
    const [users] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [
      id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToReject = users[0];

    // Check permissions based on role hierarchy
    if (user.role === "team_admin") {
      if (
        userToReject.role !== "employee" ||
        userToReject.team_id !== user.team_id
      ) {
        return res.status(403).json({ message: "Permission denied" });
      }
    } else if (user.role === "group_admin") {
      if (
        !["team_admin", "employee"].includes(userToReject.role) ||
        userToReject.group_id !== user.group_id
      ) {
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
      [user.id, reason || "Registration rejected", id],
    );

    // Send rejection email (in production)
    // await sendRejectionEmail(userToReject.email, userToReject.name, reason);

    res.json({
      success: true,
      message: "User registration rejected",
    });
  } catch (error) {
    console.error("Reject user error:", error);
    res.status(500).json({
      message: "Failed to reject user",
      error: error.message,
    });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (!["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Get user to update
    const [users] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [
      id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToUpdate = users[0];

    // Check permissions
    if (user.role === "team_admin") {
      if (
        userToUpdate.role !== "employee" ||
        userToUpdate.team_id !== user.team_id
      ) {
        return res.status(403).json({ message: "Permission denied" });
      }
    } else if (user.role === "group_admin") {
      if (
        !["team_admin", "employee"].includes(userToUpdate.role) ||
        userToUpdate.group_id !== user.group_id
      ) {
        return res.status(403).json({ message: "Permission denied" });
      }
    }

    await pool.execute("UPDATE users SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    res.json({
      success: true,
      message: `User status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const requestingUser = req.user;

    // Check if user is updating their own profile
    if (requestingUser.id != userId && requestingUser.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "You can only update your own profile" });
    }

    // Allowed fields for update
    const allowedFields = [
      "name",
      "email",  // Add email if users can update it
      "mobile",
      "position",
      "work_location",
      "bio",
      "timezone",
      "language",
    ];
    
    const filteredUpdates = {};

    for (const key in updates) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Build update query
    const setClause = Object.keys(filteredUpdates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(filteredUpdates), userId];

    await pool.execute(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values,
    );

    // Get updated user with all joins
    const [updatedUsers] = await pool.execute(
      `
      SELECT 
        u.*,
        g.name as group_name,
        t.name as team_name,
        ua.name as approved_by_name
      FROM users u
      LEFT JOIN \`groups\` g ON u.group_id = g.id
      LEFT JOIN teams t ON u.team_id = t.id
      LEFT JOIN users ua ON u.approved_by = ua.id
      WHERE u.id = ?
      `,
      [userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUsers[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user
    const [users] = await pool.execute(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Validate new password
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      });
    }

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.execute(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
      [hash, userId],
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// Get user activity logs
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestingUser = req.user;

    // Check if user can view these logs
    if (requestingUser.id != userId && requestingUser.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // In a real app, you would have an activity_logs table
    // For now, return some mock data
    const mockActivity = [
      {
        id: 1,
        action: "Login",
        description: "Logged in to ASES platform",
        timestamp: "2 hours ago",
        ip: "192.168.1.100",
      },
      {
        id: 2,
        action: "Profile Update",
        description: "Updated profile information",
        timestamp: "1 day ago",
        ip: "192.168.1.100",
      },
      {
        id: 3,
        action: "Dashboard Access",
        description: "Accessed safety dashboard",
        timestamp: "2 days ago",
        ip: "192.168.1.101",
      },
    ];

    res.json({
      success: true,
      data: mockActivity,
    });
  } catch (error) {
    console.error("Get user activity error:", error);
    res.status(500).json({
      message: "Failed to fetch user activity",
      error: error.message,
    });
  }
};

// Get user safety metrics
exports.getUserMetrics = async (req, res) => {
  try {
    const userId = req.params.userId;
    const requestingUser = req.user;

    // Check permissions
    if (requestingUser.id != userId && requestingUser.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // In a real app, you would calculate metrics from various tables
    // For now, return mock data
    const mockMetrics = [
      { label: "Safety Score", value: 87, target: 90, trend: "up" },
      { label: "Training Completion", value: 92, target: 95, trend: "up" },
      { label: "Incidents Reported", value: 5, target: 3, trend: "down" },
      { label: "Compliance Rate", value: 94, target: 95, trend: "up" },
    ];

    res.json({
      success: true,
      data: mockMetrics,
    });
  } catch (error) {
    console.error("Get user metrics error:", error);
    res.status(500).json({
      message: "Failed to fetch user metrics",
      error: error.message,
    });
  }
};
