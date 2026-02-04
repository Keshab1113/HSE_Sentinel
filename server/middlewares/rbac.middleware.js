// backend/middlewares/rbac.middleware.js
// This middleware checks if a user has specific permissions

import { userHasPermission } from '../controllers/Systemadministration/rbac.controller.js';

/**
 * Middleware to check if user has required permissions
 * Usage: 
 * router.post('/indicators', authenticate, requirePermissions(['create_indicators']), createIndicator);
 * 
 * @param {string|string[]} permissions - Permission key(s) required
 * @param {boolean} requireAll - If true, user must have ALL permissions. If false, ANY permission is sufficient
 */
export function requirePermissions(permissions, requireAll = false) {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Convert single permission to array
      const permsToCheck = Array.isArray(permissions) ? permissions : [permissions];

      // Check each permission
      const checks = await Promise.all(
        permsToCheck.map(async (perm) => {
          return await userHasPermission(user.id, perm);
        })
      );

      // Determine if user has required permissions
      const hasPermission = requireAll 
        ? checks.every(check => check === true)
        : checks.some(check => check === true);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: permsToCheck
        });
      }

      // User has permission, continue
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
}

/**
 * Check permission without blocking the request
 * Adds `req.permissions` object with permission status
 */
export function checkPermissions(permissions) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      req.permissions = {};

      if (!user) {
        next();
        return;
      }

      const permsToCheck = Array.isArray(permissions) ? permissions : [permissions];

      for (const perm of permsToCheck) {
        req.permissions[perm] = await userHasPermission(user.id, perm);
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      next(); // Continue even if permission check fails
    }
  };
}

/**
 * Middleware for role-based OR permission-based access
 * Allows access if user has either the required role OR the required permission
 * This is useful for backward compatibility during migration
 */
export function requireRoleOrPermission(roles, permissions) {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check role first
      const rolesArray = Array.isArray(roles) ? roles : [roles];
      if (rolesArray.includes(user.role)) {
        return next();
      }

      // Check permissions
      const permsArray = Array.isArray(permissions) ? permissions : [permissions];
      const checks = await Promise.all(
        permsArray.map(async (perm) => {
          return await userHasPermission(user.id, perm);
        })
      );

      const hasPermission = checks.some(check => check === true);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required_role: rolesArray,
          required_permissions: permsArray
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        error: error.message
      });
    }
  };
}

export default {
  requirePermissions,
  checkPermissions,
  requireRoleOrPermission
};