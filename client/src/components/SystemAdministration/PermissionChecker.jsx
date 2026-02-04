import { useEffect, useState } from "react";
import api from "../../api/axios";

/**
 * Permission Checker Component
 * Conditionally renders children based on user permissions
 * 
 * Usage:
 * <PermissionChecker permission="create_indicators">
 *   <Button>Create Indicator</Button>
 * </PermissionChecker>
 * 
 * Multiple permissions (any):
 * <PermissionChecker permissions={["create_indicators", "edit_indicators"]}>
 *   <Button>Manage Indicators</Button>
 * </PermissionChecker>
 * 
 * Multiple permissions (all required):
 * <PermissionChecker permissions={["create_indicators", "edit_indicators"]} requireAll={true}>
 *   <Button>Full Management</Button>
 * </PermissionChecker>
 */
export default function PermissionChecker({ 
  permission, 
  permissions = [], 
  requireAll = false, 
  children,
  fallback = null,
  showLoading = false
}) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, [permission, permissions]);

  const checkPermissions = async () => {
    try {
      // Get user from token
      const token = localStorage.getItem("token");
      if (!token) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.id;

      // Build list of permissions to check
      const permsToCheck = permission ? [permission] : permissions;

      if (permsToCheck.length === 0) {
        setHasPermission(true);
        setLoading(false);
        return;
      }

      // Check each permission
      const checks = await Promise.all(
        permsToCheck.map(async (perm) => {
          const response = await api.get(`/rbac/permissions/check?userId=${userId}&permissionKey=${perm}`);
          if (response.status === 200 && response.data?.success) {
            const data = await response.data;
            return data.has_permission;
          }
          return false;
        })
      );

      // Determine if user has required permissions
      const result = requireAll 
        ? checks.every(check => check === true)
        : checks.some(check => check === true);

      setHasPermission(result);
    } catch (error) {
      console.error("Permission check error:", error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && showLoading) {
    return <div className="animate-pulse h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>;
  }

  if (loading && !showLoading) {
    return fallback;
  }

  return hasPermission ? children : fallback;
}