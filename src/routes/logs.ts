import { Router, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { ResponseHelper } from '../utils/response';
import { sanitizeMongooseDoc } from '../utils/common';

const router = Router();

// GET /logs/:entityType/:entityId - Get logs for a specific entity
const getEntityLogs: RequestHandler = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;

    // Get log model
    const LogModel = mongoose.model(`${entityType}Log`);

    const logs = await LogModel.find({ entityId })
      .sort({ timestamp: -1 })
      .lean();

    ResponseHelper.success(
      res,
      'Logs obtenidos exitosamente',
      logs.map((log) => sanitizeMongooseDoc(log))
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

    // Get log model
    const LogModel = mongoose.model(`${entityType}Log`);

    const logs = await LogModel.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    ResponseHelper.success(
      res,
      'Logs obtenidos exitosamente',
      logs.map((log) => sanitizeMongooseDoc(log))
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
