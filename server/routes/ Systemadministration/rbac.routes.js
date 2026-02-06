import { Router } from 'express';
import {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    getUserPermissions,
    grantUserPermission,
    revokeUserPermission,
    getAuditLogs,
    checkPermission,
    createPermission
} from '../../controllers/Systemadministration/rbac.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';
import checkRole from '../../middlewares/role.middleware.js';

const router = Router();

// Roles
router.get('/roles', authenticate, checkRole(['super_admin']), getRoles);
router.get('/roles/:id', authenticate, checkRole(['super_admin']), getRoleById);
router.post('/roles', authenticate, checkRole(['super_admin']), createRole);
router.put('/roles/:id', authenticate, checkRole(['super_admin']), updateRole);
router.delete('/roles/:id', authenticate, checkRole(['super_admin']), deleteRole);

// Permissions
router.get('/permissions', authenticate, checkRole(['super_admin']), getPermissions);
router.get('/permissions/user/:userId', authenticate, getUserPermissions);
router.get('/permissions/check', authenticate, checkPermission);
router.post('/permissions/create', authenticate, checkRole(['super_admin']), createPermission);

// User permission overrides
router.post('/permissions/grant', authenticate, checkRole(['super_admin']), grantUserPermission);
router.post('/permissions/revoke', authenticate, checkRole(['super_admin']), revokeUserPermission);

// Audit logs
router.get('/audit-logs', authenticate, checkRole(['super_admin']), getAuditLogs);

export default router;