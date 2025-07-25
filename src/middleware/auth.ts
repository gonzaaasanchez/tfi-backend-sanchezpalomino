import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/auth';
import User from '../models/User';
import Admin from '../models/Admin';
import { ResponseHelper } from '../utils/response';
import { isTokenBlacklisted } from '../utils/tokenBlacklist';

// Extend the Request interface to include the user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHelper.unauthorized(res, 'Token de acceso requerido');
    }

    // Extract the token (remove "Bearer ")
    const token = authHeader.substring(7);

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return ResponseHelper.unauthorized(res, 'Token invalidado');
    }

    // Verify the token
    const decoded = verifyToken(token) as JWTPayload;

    // Find the user or admin based on token type
    let user;
    if (decoded.type === 'admin') {
      user = await Admin.findById(decoded.userId).select('-password').populate('role');
    } else {
      user = await User.findById(decoded.userId).select('-password').populate('role');
    }

    if (!user) {
      return ResponseHelper.unauthorized(res, 'Usuario no encontrado');
    }

    // Add the user to the request
    req.user = {
      ...user.toObject(),
      type: decoded.type,
    };
    next();
  } catch (error) {
    return ResponseHelper.unauthorized(res, 'Token inválido o expirado');
  }
};
