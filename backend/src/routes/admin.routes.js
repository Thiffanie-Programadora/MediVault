import { Router } from 'express';
import {
  listUsers,
  changeUserRole,
  listAuditLogs,
  getStats,
  listDeletionRequests,
  rotateKeys
} from '../controllers/admin.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { roleUpdateSchema } from '../middlewares/schemas.js';

const router = Router();

router.use(authenticateToken);

router.get('/users', requireRoles('admin', 'auditor'), listUsers);
router.get('/audit-logs', requireRoles('admin', 'auditor'), listAuditLogs);
router.get('/stats', requireRoles('admin', 'auditor'), getStats);
router.get('/deletion-requests', requireRoles('admin', 'auditor'), listDeletionRequests);

router.put('/users/role', requireRoles('admin'), validate(roleUpdateSchema), changeUserRole);
router.post('/rotate-keys', requireRoles('admin'), rotateKeys);

export default router;
