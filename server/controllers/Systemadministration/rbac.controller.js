import pool from "../../config/db.js";

// Get all roles
export const getRoles = async (req, res) => {
  try {
    const [roles] = await pool.execute(
      `SELECT r.*, 
                    u.name as created_by_name,
                    COUNT(DISTINCT rp.permission_id) as permission_count,
                    COUNT(DISTINCT users.id) as user_count
             FROM roles r
             LEFT JOIN users u ON r.created_by = u.id
             LEFT JOIN role_permissions rp ON r.id = rp.role_id
             LEFT JOIN users ON users.role_id = r.id
             WHERE r.is_active = TRUE
             GROUP BY r.id
             ORDER BY r.hierarchy_level ASC, r.created_at DESC`
    );

    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
      error: error.message,
    });
  }
};

// Get single role with permissions
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const [roles] = await pool.execute(
      `SELECT r.*, u.name as created_by_name
             FROM roles r
             LEFT JOIN users u ON r.created_by = u.id
             WHERE r.id = ?`,
      [id]
    );

    if (roles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Get permissions for this role
    const [permissions] = await pool.execute(
      `SELECT p.*, pg.group_name, pg.icon
             FROM role_permissions rp
             JOIN permissions p ON rp.permission_id = p.id
             LEFT JOIN permission_groups pg ON p.group_id = pg.id
             WHERE rp.role_id = ?
             ORDER BY pg.display_order, p.permission_name`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...roles[0],
        permissions,
      },
    });
  } catch (error) {
    console.error("Get role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch role",
      error: error.message,
    });
  }
};

// Create new role
export const createRole = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { role_key, role_name, description, hierarchy_level, permissions } =
      req.body;
    const userId = req.user.id;

    // Validate unique role_key
    const [existing] = await connection.execute(
      "SELECT id FROM roles WHERE role_key = ?",
      [role_key]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Role key already exists",
      });
    }

    // Create role
    const [result] = await connection.execute(
      `INSERT INTO roles (role_key, role_name, description, hierarchy_level, is_system, created_by, created_at)
             VALUES (?, ?, ?, ?, FALSE, ?, NOW())`,
      [role_key, role_name, description, hierarchy_level || 3, userId]
    );

    const roleId = result.insertId;

    // Assign permissions if provided
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      const values = permissions.map((permId) => [roleId, permId, userId]);
      await connection.query(
        `INSERT INTO role_permissions (role_id, permission_id, granted_by) VALUES ?`,
        [values]
      );
    }

    // Audit log
    await connection.execute(
      `INSERT INTO permission_audit_log (action_type, role_id, performed_by, new_value, ip_address, created_at)
             VALUES ('role_created', ?, ?, ?, ?, NOW())`,
      [
        roleId,
        userId,
        JSON.stringify({ role_key, role_name, permissions }),
        req.ip,
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      role_id: roleId,
      message: "Role created successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create role",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Update role - MODIFIED TO ALLOW SYSTEM ROLE EDITING
export const updateRole = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { role_name, description, hierarchy_level, permissions } = req.body;
    const userId = req.user.id;

    // Check if role exists
    const [roles] = await connection.execute(
      "SELECT * FROM roles WHERE id = ?",
      [id]
    );

    if (roles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // REMOVED: System role check - now allows editing system roles
    // Note: Be cautious when editing system roles in production

    // Get old value for audit
    const [oldPermissions] = await connection.execute(
      "SELECT permission_id FROM role_permissions WHERE role_id = ?",
      [id]
    );

    // Update role
    await connection.execute(
      `UPDATE roles 
             SET role_name = ?, description = ?, hierarchy_level = ?, updated_at = NOW()
             WHERE id = ?`,
      [role_name, description, hierarchy_level, id]
    );

    // Update permissions if provided
    if (permissions && Array.isArray(permissions)) {
      // Delete existing permissions
      await connection.execute(
        "DELETE FROM role_permissions WHERE role_id = ?",
        [id]
      );

      // Insert new permissions
      if (permissions.length > 0) {
        const values = permissions.map((permId) => [id, permId, userId]);
        await connection.query(
          `INSERT INTO role_permissions (role_id, permission_id, granted_by) VALUES ?`,
          [values]
        );
      }
    }

    // Audit log
    await connection.execute(
      `INSERT INTO permission_audit_log (action_type, role_id, performed_by, old_value, new_value, ip_address, created_at)
             VALUES ('role_updated', ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        userId,
        JSON.stringify({
          permissions: oldPermissions.map((p) => p.permission_id),
        }),
        JSON.stringify({ role_name, permissions }),
        req.ip,
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Update role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update role",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Delete role
export const deleteRole = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const userId = req.user.id;

    // Check if role exists and is not system role
    const [roles] = await connection.execute(
      "SELECT * FROM roles WHERE id = ?",
      [id]
    );

    if (roles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    if (roles[0].is_system) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete system roles",
      });
    }

    // Check if any users have this role
    const [users] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE role_id = ?",
      [id]
    );

    if (users[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role: ${users[0].count} user(s) are currently assigned to this role`,
      });
    }

    // Get role data for audit log
    const roleData = roles[0];

    // Delete role permissions first
    await connection.execute("DELETE FROM role_permissions WHERE role_id = ?", [
      id,
    ]);

    // Soft delete role
    await connection.execute(
      "UPDATE roles SET is_active = FALSE, updated_at = NOW() WHERE id = ?",
      [id]
    );

    // Audit log
    await connection.execute(
      `INSERT INTO permission_audit_log (action_type, role_id, performed_by, old_value, ip_address, created_at)
             VALUES ('role_deleted', ?, ?, ?, ?, NOW())`,
      [
        id,
        userId,
        JSON.stringify({
          role_key: roleData.role_key,
          role_name: roleData.role_name,
        }),
        req.ip,
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Delete role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete role",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Get all permissions grouped
export const getPermissions = async (req, res) => {
  try {
    const [permissionGroups] = await pool.execute(
      `SELECT pg.*, 
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', p.id,
                            'permission_key', p.permission_key,
                            'permission_name', p.permission_name,
                            'description', p.description,
                            'module', p.module,
                            'action', p.action
                        )
                    ) as permissions
             FROM permission_groups pg
             LEFT JOIN permissions p ON pg.id = p.group_id
             GROUP BY pg.id
             ORDER BY pg.display_order`
    );

    res.json({
      success: true,
      data: permissionGroups.map((group) => ({
        ...group,
        permissions: JSON.parse(group.permissions).filter((p) => p.id !== null),
      })),
    });
  } catch (error) {
    console.error("Get permissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
      error: error.message,
    });
  }
};

// Get user permissions
export const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    const [user] = await pool.execute(
      "SELECT role_id FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get role permissions
    const [rolePermissions] = await pool.execute(
      `SELECT DISTINCT p.permission_key, p.permission_name, p.module, p.action
             FROM role_permissions rp
             JOIN permissions p ON rp.permission_id = p.id
             WHERE rp.role_id = ?`,
      [user[0].role_id]
    );

    // Get user overrides
    const [overrides] = await pool.execute(
      `SELECT p.permission_key, p.permission_name, upo.is_granted, upo.expires_at
             FROM user_permission_overrides upo
             JOIN permissions p ON upo.permission_id = p.id
             WHERE upo.user_id = ? AND (upo.expires_at IS NULL OR upo.expires_at > NOW())`,
      [userId]
    );

    // Merge permissions with overrides
    const permissionsMap = {};

    rolePermissions.forEach((perm) => {
      permissionsMap[perm.permission_key] = {
        ...perm,
        granted: true,
        source: "role",
      };
    });

    overrides.forEach((override) => {
      if (override.is_granted) {
        permissionsMap[override.permission_key] = {
          permission_key: override.permission_key,
          permission_name: override.permission_name,
          granted: true,
          source: "override",
          expires_at: override.expires_at,
        };
      } else {
        delete permissionsMap[override.permission_key];
      }
    });

    res.json({
      success: true,
      data: Object.values(permissionsMap),
    });
  } catch (error) {
    console.error("Get user permissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user permissions",
      error: error.message,
    });
  }
};

// Grant permission override to user
export const grantUserPermission = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { userId, permissionId, reason, expiresAt } = req.body;
    const grantedBy = req.user.id;

    await connection.execute(
      `INSERT INTO user_permission_overrides (user_id, permission_id, is_granted, reason, granted_by, expires_at, created_at)
             VALUES (?, ?, TRUE, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE is_granted = TRUE, reason = ?, granted_by = ?, expires_at = ?, created_at = NOW()`,
      [
        userId,
        permissionId,
        reason,
        grantedBy,
        expiresAt,
        reason,
        grantedBy,
        expiresAt,
      ]
    );

    // Audit log
    await connection.execute(
      `INSERT INTO permission_audit_log (action_type, user_id, permission_id, performed_by, reason, ip_address, created_at)
             VALUES ('user_override', ?, ?, ?, ?, ?, NOW())`,
      [userId, permissionId, grantedBy, reason, req.ip]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Permission granted successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Grant permission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to grant permission",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Revoke permission from user
export const revokeUserPermission = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { userId, permissionId, reason } = req.body;
    const revokedBy = req.user.id;

    await connection.execute(
      `INSERT INTO user_permission_overrides (user_id, permission_id, is_granted, reason, granted_by, created_at)
             VALUES (?, ?, FALSE, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE is_granted = FALSE, reason = ?, granted_by = ?, created_at = NOW()`,
      [userId, permissionId, reason, revokedBy, reason, revokedBy]
    );

    // Audit log
    await connection.execute(
      `INSERT INTO permission_audit_log (action_type, user_id, permission_id, performed_by, reason, ip_address, created_at)
             VALUES ('permission_revoked', ?, ?, ?, ?, ?, NOW())`,
      [userId, permissionId, revokedBy, reason, req.ip]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Permission revoked successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Revoke permission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to revoke permission",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Get audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const { limit = 100, action_type, role_id, user_id } = req.query;

    let query = `
            SELECT pal.*, 
                   r.role_name,
                   u.name as user_name,
                   p.permission_name,
                   pb.name as performed_by_name
            FROM permission_audit_log pal
            LEFT JOIN roles r ON pal.role_id = r.id
            LEFT JOIN users u ON pal.user_id = u.id
            LEFT JOIN permissions p ON pal.permission_id = p.id
            LEFT JOIN users pb ON pal.performed_by = pb.id
            WHERE 1=1
        `;

    const params = [];

    if (action_type) {
      query += " AND pal.action_type = ?";
      params.push(action_type);
    }

    if (role_id) {
      query += " AND pal.role_id = ?";
      params.push(role_id);
    }

    if (user_id) {
      query += " AND pal.user_id = ?";
      params.push(user_id);
    }

    query += " ORDER BY pal.created_at DESC LIMIT ?";
    params.push(parseInt(limit));

    const [logs] = await pool.execute(query, params);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

// Check if user has permission
export const checkPermission = async (req, res) => {
  try {
    const { userId, permissionKey } = req.query;

    const hasPermission = await userHasPermission(userId, permissionKey);

    res.json({
      success: true,
      has_permission: hasPermission,
    });
  } catch (error) {
    console.error("Check permission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check permission",
      error: error.message,
    });
  }
};

// Helper function to check permission
export async function userHasPermission(userId, permissionKey) {
  try {
    const [result] = await pool.execute(
      `SELECT EXISTS(
                SELECT 1 FROM users u
                JOIN role_permissions rp ON u.role_id = rp.role_id
                JOIN permissions p ON rp.permission_id = p.id
                WHERE u.id = ? AND p.permission_key = ?
                
                UNION
                
                SELECT 1 FROM user_permission_overrides upo
                JOIN permissions p ON upo.permission_id = p.id
                WHERE upo.user_id = ? AND p.permission_key = ? 
                AND upo.is_granted = TRUE
                AND (upo.expires_at IS NULL OR upo.expires_at > NOW())
                
                EXCEPT
                
                SELECT 1 FROM user_permission_overrides upo
                JOIN permissions p ON upo.permission_id = p.id
                WHERE upo.user_id = ? AND p.permission_key = ? 
                AND upo.is_granted = FALSE
            ) as has_permission`,
      [userId, permissionKey, userId, permissionKey, userId, permissionKey]
    );

    return result[0].has_permission === 1;
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}

// Add this function to your rbac.controller.js file

export const createPermission = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { permission_key, permission_name, description, module, action, group_id } = req.body;
    const userId = req.user.id;

    // Validate unique permission_key
    const [existing] = await connection.execute(
      "SELECT id FROM permissions WHERE permission_key = ?",
      [permission_key]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Permission key already exists",
      });
    }

    // Validate group exists
    const [group] = await connection.execute(
      "SELECT id FROM permission_groups WHERE id = ?",
      [group_id]
    );

    if (group.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid permission group",
      });
    }

    // Create permission
    const [result] = await connection.execute(
      `INSERT INTO permissions (permission_key, permission_name, description, module, action, group_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [permission_key, permission_name, description, module, action, group_id]
    );

    const permissionId = result.insertId;

    // Audit log
    await connection.execute(
      `INSERT INTO permission_audit_log (action_type, permission_id, performed_by, new_value, ip_address, created_at)
       VALUES ('permission_created', ?, ?, ?, ?, NOW())`,
      [
        permissionId,
        userId,
        JSON.stringify({ permission_key, permission_name, module, action }),
        req.ip,
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      permission_id: permissionId,
      message: "Permission created successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create permission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create permission",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};