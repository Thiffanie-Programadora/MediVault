import {
  getAllUsers,
  updateUserRole,
  getAuditLogs,
  getSystemSecurityStats
} from '../services/admin.service.js';
import { getDeletionRequests } from '../services/governance.service.js';

export async function listUsers(req, res, next) {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    next(err);
  }
}

export async function changeUserRole(req, res, next) {
  try {
    const { userId, roleName } = req.body;
    const result = await updateUserRole({
      adminId: req.user.id,
      targetUserId: userId,
      newRoleName: roleName,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

export async function listAuditLogs(req, res, next) {
  try {
    const { eventType, limit, offset } = req.query;
    const logs = await getAuditLogs({
      eventType,
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0
    });

    res.status(200).json({
      success: true,
      total: logs.length,
      logs
    });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const stats = await getSystemSecurityStats();
    res.status(200).json({
      success: true,
      stats
    });
  } catch (err) {
    next(err);
  }
}

export async function listDeletionRequests(req, res, next) {
  try {
    const requests = await getDeletionRequests();
    res.status(200).json({
      success: true,
      requests
    });
  } catch (err) {
    next(err);
  }
}

export async function rotateKeys(req, res, next) {
  try {
    const { fromVersion, toVersion } = req.body || {};
    const { rotateAllNotesKeys } = await import('../services/admin.service.js');
    const result = await rotateAllNotesKeys({
      fromVersion: fromVersion || 'v1',
      toVersion: toVersion || 'v2',
      adminId: req.user.id,
      ip: req.ip
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
