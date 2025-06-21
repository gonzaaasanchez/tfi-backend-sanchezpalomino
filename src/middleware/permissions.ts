import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Admin from '../models/Admin';
import Role from '../models/Role';

// Extender la interfaz Request para incluir user con role
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Tipos de acciones disponibles
export type Action = 'create' | 'read' | 'update' | 'delete' | 'getAll';

// Middleware de permisos
export const permissionMiddleware = (resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'getAll') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      let userWithRole;
      
      // Verificar si es un admin o un usuario regular
      if (req.user.type === 'admin') {
        userWithRole = await Admin.findById(req.user._id).populate('role');
      } else {
        userWithRole = await User.findById(req.user._id).populate('role');
      }
      
      if (!userWithRole || !userWithRole.role) {
        return res.status(403).json({
          success: false,
          message: 'Usuario sin rol asignado'
        });
      }

      const role = userWithRole.role as any;
      
      // Superadmin tiene acceso completo
      if (role.name === 'superadmin') {
        return next();
      }

      // Verificar si el usuario tiene el permiso requerido
      if (!role.permissions || !role.permissions[resource] || !role.permissions[resource][action]) {
        return res.status(403).json({
          success: false,
          message: `No tienes permisos para ${action} en ${resource}`
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
}; 