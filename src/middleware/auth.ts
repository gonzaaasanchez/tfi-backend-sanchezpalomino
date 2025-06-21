import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/auth';
import User from '../models/User';
import Admin from '../models/Admin';
import { ResponseHelper } from '../utils/response';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHelper.unauthorized(res, 'Token de acceso requerido');
    }

    // Extraer el token (remover "Bearer ")
    const token = authHeader.substring(7);

    // Verificar el token
    const decoded = verifyToken(token) as JWTPayload;

    // Buscar el usuario o admin según el tipo de token
    let user;
    if (decoded.type === 'admin') {
      user = await Admin.findById(decoded.userId).select('-password');
    } else {
      user = await User.findById(decoded.userId).select('-password');
    }
    
    if (!user) {
      return ResponseHelper.unauthorized(res, 'Usuario no encontrado');
    }

    // Agregar el usuario al request
    req.user = {
      ...user.toObject(),
      type: decoded.type
    };
    next();

  } catch (error) {
    return ResponseHelper.unauthorized(res, 'Token inválido o expirado');
  }
}; 