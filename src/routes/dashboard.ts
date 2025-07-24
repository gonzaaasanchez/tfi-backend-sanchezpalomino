import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { ResponseHelper } from '../utils/response';
import { getDashboardStats } from '../utils/dashboardHelpers';

const router = Router();

// GET /dashboard/stats - Get dashboard statistics for administrators
const getDashboardStatsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { period = '12m', startDate, endDate } = req.query;

    // Validate parameters
    const validPeriods = ['3m', '6m', '12m', '24m'];
    if (!validPeriods.includes(period as string)) {
      return ResponseHelper.validationError(
        res,
        'Invalid period. Must be: 3m, 6m, 12m, or 24m'
      );
    }

    // Get dashboard statistics
    const stats = await getDashboardStats({
      period: period as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    ResponseHelper.success(res, 'Dashboard data retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

// Routes
router.get(
  '/stats',
  authMiddleware,
  permissionMiddleware('dashboard', 'read'),
  getDashboardStatsHandler
);

export default router;
