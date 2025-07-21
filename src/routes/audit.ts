import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { ResponseHelper } from '../utils/response';
import {
  getSessions,
  getUserSessions,
  getFailedLogins,
  getRecentSessions,
  getSessionStats,
  getSuspiciousIPs,
  SessionFilters,
} from '../utils/sessionAudit';

const router = Router();

// GET /audit/sessions - Get all sessions with filters
const getAllSessions: RequestHandler = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      userType,
      action,
      success,
      ipAddress,
      startDate,
      endDate,
    } = req.query;

    const filters: SessionFilters = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    if (userId) filters.userId = userId as string;
    if (userType) filters.userType = userType as 'user' | 'admin';
    if (action) filters.action = action as any;
    if (success !== undefined) filters.success = success === 'true';
    if (ipAddress) filters.ipAddress = ipAddress as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const result = await getSessions(filters);

    res.status(200).json({
      success: true,
      message: 'Sesiones obtenidas exitosamente',
      data: result.sessions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// GET /audit/sessions/:userId - Get sessions for specific user
const getUserSessionHistory: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await getUserSessions(
      userId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: 'Historial de sesiones obtenido exitosamente',
      data: result.sessions,
      pagination: result.pagination,
      userId: result.userId,
    });
  } catch (error) {
    next(error);
  }
};

// GET /audit/sessions/failed - Get failed login attempts
const getFailedLoginAttempts: RequestHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    const result = await getFailedLogins(
      parseInt(page as string),
      parseInt(limit as string),
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.status(200).json({
      success: true,
      message: 'Intentos fallidos obtenidos exitosamente',
      data: result.sessions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// GET /audit/sessions/recent - Get recent sessions
const getRecentSessionActivity: RequestHandler = async (req, res, next) => {
  try {
    const { hours = 24, limit = 50 } = req.query;

    const result = await getRecentSessions(
      parseInt(hours as string),
      parseInt(limit as string)
    );

    ResponseHelper.success(res, 'Actividad reciente obtenida exitosamente', result);
  } catch (error) {
    next(error);
  }
};

// GET /audit/stats - Get session statistics
const getSessionStatistics: RequestHandler = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await getSessionStats(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    ResponseHelper.success(res, 'Estadísticas obtenidas exitosamente', stats);
  } catch (error) {
    next(error);
  }
};

// GET /audit/suspicious-ips - Get suspicious IP addresses
const getSuspiciousIPAddresses: RequestHandler = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const suspiciousIPs = await getSuspiciousIPs(parseInt(limit as string));

    ResponseHelper.success(res, 'IPs sospechosas obtenidas exitosamente', {
      suspiciousIPs,
    });
  } catch (error) {
    next(error);
  }
};

// GET /audit/dashboard - Get dashboard data (combines stats and recent activity)
const getDashboardData: RequestHandler = async (req, res, next) => {
  try {
    const { hours = 24 } = req.query;

    // Get stats for the last X hours
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - parseInt(hours as string));

    const [stats, recentSessions, suspiciousIPs] = await Promise.all([
      getSessionStats(startDate),
      getRecentSessions(parseInt(hours as string), 20),
      getSuspiciousIPs(5),
    ]);

    const dashboardData = {
      stats,
      recentActivity: recentSessions,
      alerts: {
        failedLoginsLastHour: stats.failedLogins,
        suspiciousIPs: suspiciousIPs.length,
      },
      suspiciousIPs,
    };

    ResponseHelper.success(res, 'Datos del dashboard obtenidos exitosamente', dashboardData);
  } catch (error) {
    next(error);
  }
};

// ========================================
// ROUTES
// ========================================
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/sessions',
  authMiddleware,
  permissionMiddleware('audit', 'read'),
  getAllSessions
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/sessions/:userId',
  authMiddleware,
  permissionMiddleware('audit', 'read'),
  getUserSessionHistory
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/sessions/failed',
  authMiddleware,
  permissionMiddleware('audit', 'read'),
  getFailedLoginAttempts
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/sessions/recent',
  authMiddleware,
  permissionMiddleware('audit', 'read'),
  getRecentSessionActivity
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/stats',
  authMiddleware,
  permissionMiddleware('audit', 'read'),
  getSessionStatistics
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/suspicious-ips',
  authMiddleware,
  permissionMiddleware('audit', 'read'),
  getSuspiciousIPAddresses
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/dashboard',
  authMiddleware,
  permissionMiddleware('audit', 'read'),
  getDashboardData
);

export default router; 