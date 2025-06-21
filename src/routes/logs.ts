import { Router, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';

const router = Router();

// GET /logs/:entityType/:entityId - Obtener logs de una entidad específica
const getEntityLogs: RequestHandler = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    
    // Obtener el modelo de log
    const LogModel = mongoose.model(`${entityType}Log`);
    
    const logs = await LogModel.find({ entityId })
      .sort({ timestamp: -1 })
      .lean();
    
    res.json({
      success: true,
      message: 'Logs obtenidos exitosamente',
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// GET /logs/:entityType - Obtener todos los logs de una entidad
const getAllEntityLogs: RequestHandler = async (req, res, next) => {
  try {
    const { entityType } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Obtener el modelo de log
    const LogModel = mongoose.model(`${entityType}Log`);
    
    const logs = await LogModel.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    res.json({
      success: true,
      message: 'Logs obtenidos exitosamente',
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// Rutas con middleware de autenticación y permisos
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/:entityType/:entityId', authMiddleware, permissionMiddleware('logs', 'read'), getEntityLogs);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/:entityType', authMiddleware, permissionMiddleware('logs', 'getAll'), getAllEntityLogs);

export default router; 