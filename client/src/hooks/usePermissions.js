import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

/**
 * usePermissions Hook
 * Provides permission checking functionality throughout the app
 * 
 * Usage:
 * ```javascript
 * const { hasPermission, hasAnyPermission, hasAllPermissions, loading, checkPermission, refreshPermissions } = usePermissions();
 * 
 * // Check single permission
 * if (hasPermission('create_indicators')) {
 *   // Show create button
 * }
 * 
 * // Check if user has ANY of these permissions
 * if (hasAnyPermission(['edit_indicators', 'delete_indicators'])) {
 *   // Show manage button
 * }
 * 
 * // Check if user has ALL permissions
 * if (hasAllPermissions(['create_indicators', 'assign_indicators'])) {
 *   // Show full control UI
 * }
 * 
 * // Async check (useful for async operations)
 * const canDelete = await checkPermission('delete_indicators');
 * ```
 */
export function usePermissions() {
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    initializePermissions();
  }, []);

  const initializePermissions = async () => {
    try {
      // Get user from token
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);

      // Fetch user permissions
      const response = await api.get(`/rbac/permissions/user/${payload.id}`);
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        setUserPermissions(data.data || []);
      }
    } catch (error) {
      console.error("Initialize permissions error:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = useCallback((permissionKey) => {
    return userPermissions.some(p => p.permission_key === permissionKey && p.granted);
  }, [userPermissions]);

  const hasAnyPermission = useCallback((permissionKeys) => {
    return permissionKeys.some(key => hasPermission(key));
  }, [userPermissions, hasPermission]);

  const hasAllPermissions = useCallback((permissionKeys) => {
    return permissionKeys.every(key => hasPermission(key));
  }, [userPermissions, hasPermission]);

  const checkPermission = useCallback(async (permissionKey) => {
    try {
      if (!userId) return false;

      const response = await api.get(`/rbac/permissions/check?userId=${userId}&permissionKey=${permissionKey}`);
      if (response.status === 200 && response.data?.success) {
        const data = await response.data;
        return data.has_permission;
      }
      return false;
    } catch (error) {
      console.error("Check permission error:", error);
      return false;
    }
  }, [userId]);

  const refreshPermissions = useCallback(async () => {
    setLoading(true);
    await initializePermissions();
  }, []);

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission,
    refreshPermissions,
    loading
  };
}