import { Router, RequestHandler } from 'express';

import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { ResponseHelper } from '../utils/response';
// Import audit functions to ensure log models are registered
import { getEntityLogs as getAuditEntityLogs } from '../utils/auditLogger';

const router = Router();

// GET /logs/:entityType/:entityId - Get logs for a specific entity
const getEntityLogs: RequestHandler = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;

    // Use the audit logger function to get logs (this ensures models are registered)
    const logs = await getAuditEntityLogs(entityType, { entityId });

    ResponseHelper.success(
      res,
      'Logs obtenidos exitosamente',
      logs.logs.map((log) => ({
        id: log._id,
        entityId: log.entityId,
        userId: log.userId,
        userName: log.userName,
        field: log.field,
        oldValue: log.oldValue,
        newValue: log.newValue,
        timestamp: log.timestamp,
      }))
    );
  } catch (error) {
    next(error);
  }
};

// GET /logs/:entityType - Get all logs for an entity type
const getAllEntityLogs: RequestHandler = async (req, res, next) => {
  try {
    const { entityType } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    // Use the audit logger function to get logs (this ensures models are registered)
    const logs = await getAuditEntityLogs(entityType, { limit });

    ResponseHelper.success(
      res,
      'Logs obtenidos exitosamente',
      logs.logs.map((log) => ({
        id: log._id,
        entityId: log.entityId,
        userId: log.userId,
        userName: log.userName,
        field: log.field,
        oldValue: log.oldValue,
        newValue: log.newValue,
        timestamp: log.timestamp,
      }))
    );
  } catch (error) {
    next(error);
  }
};

// ========================================
// ROUTES with authentication and permission middleware
// ========================================
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/:entityType/:entityId',
  authMiddleware,
  permissionMiddleware('logs', 'read'),
  getEntityLogs
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/:entityType',
  authMiddleware,
  permissionMiddleware('logs', 'getAll'),
  getAllEntityLogs
);

export default router;
