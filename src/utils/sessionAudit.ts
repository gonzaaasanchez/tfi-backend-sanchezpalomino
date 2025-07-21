import SessionAudit, { ISessionAudit } from '../models/SessionAudit';

export interface SessionEvent {
  userId: string;
  userType: 'user' | 'admin';
  action: 'login' | 'logout' | 'login_failed' | 'token_invalidated';
  ipAddress: string;
  success: boolean;
  failureReason?: string;
}

export interface SessionFilters {
  userId?: string;
  userType?: 'user' | 'admin';
  action?: 'login' | 'logout' | 'login_failed' | 'token_invalidated';
  success?: boolean;
  ipAddress?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface SessionStats {
  totalSessions: number;
  successfulLogins: number;
  failedLogins: number;
  logouts: number;
  uniqueUsers: number;
  uniqueIPs: number;
}

/**
 * Log a session event
 */
export const logSessionEvent = async (event: SessionEvent): Promise<boolean> => {
  try {
    const sessionAudit = new SessionAudit(event);
    await sessionAudit.save();
    return true;
  } catch (error) {
    console.error('Error logging session event:', error);
    return false;
  }
};

/**
 * Get sessions with filters and pagination
 */
export const getSessions = async (filters: SessionFilters = {}) => {
  try {
    const {
      userId,
      userType,
      action,
      success,
      ipAddress,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    // Build query
    const query: any = {};
    
    if (userId) query.userId = userId;
    if (userType) query.userType = userType;
    if (action) query.action = action;
    if (success !== undefined) query.success = success;
    if (ipAddress) query.ipAddress = ipAddress;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const sessions = await SessionAudit.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await SessionAudit.countDocuments(query);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting sessions:', error);
    throw error;
  }
};

/**
 * Get sessions for a specific user
 */
export const getUserSessions = async (
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  try {
    const skip = (page - 1) * limit;

    const sessions = await SessionAudit.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SessionAudit.countDocuments({ userId });

    return {
      userId,
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting user sessions:', error);
    throw error;
  }
};

/**
 * Get failed login attempts
 */
export const getFailedLogins = async (
  page: number = 1,
  limit: number = 20,
  startDate?: Date,
  endDate?: Date
) => {
  try {
    const query: any = {
      action: 'login_failed',
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const sessions = await SessionAudit.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SessionAudit.countDocuments(query);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting failed logins:', error);
    throw error;
  }
};

/**
 * Get recent sessions (last X hours)
 */
export const getRecentSessions = async (
  hours: number = 24,
  limit: number = 50
) => {
  try {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    const sessions = await SessionAudit.find({
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return { sessions, hours };
  } catch (error) {
    console.error('Error getting recent sessions:', error);
    throw error;
  }
};

/**
 * Get session statistics
 */
export const getSessionStats = async (startDate?: Date, endDate?: Date): Promise<SessionStats> => {
  try {
    const query: any = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const [
      totalSessions,
      successfulLogins,
      failedLogins,
      logouts,
      uniqueUsers,
      uniqueIPs,
    ] = await Promise.all([
      SessionAudit.countDocuments(query),
      SessionAudit.countDocuments({ ...query, action: 'login', success: true }),
      SessionAudit.countDocuments({ ...query, action: 'login_failed' }),
      SessionAudit.countDocuments({ ...query, action: 'logout' }),
      SessionAudit.distinct('userId', query).then(users => users.length),
      SessionAudit.distinct('ipAddress', query).then(ips => ips.length),
    ]);

    return {
      totalSessions,
      successfulLogins,
      failedLogins,
      logouts,
      uniqueUsers,
      uniqueIPs,
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    throw error;
  }
};

/**
 * Get IP addresses with most failed attempts
 */
export const getSuspiciousIPs = async (limit: number = 10) => {
  try {
    const suspiciousIPs = await SessionAudit.aggregate([
      { $match: { action: 'login_failed' } },
      {
        $group: {
          _id: '$ipAddress',
          failedAttempts: { $sum: 1 },
          lastAttempt: { $max: '$createdAt' },
          users: { $addToSet: '$userId' },
        },
      },
      { $sort: { failedAttempts: -1 } },
      { $limit: limit },
    ]);

    return suspiciousIPs;
  } catch (error) {
    console.error('Error getting suspicious IPs:', error);
    throw error;
  }
}; 