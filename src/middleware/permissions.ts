import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Admin from '../models/Admin';
import Role from '../models/Role';
import { ResponseHelper } from '../utils/response';

// Extend the Request interface to include user with role
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Available action types
export type Action = 'create' | 'read' | 'update' | 'delete' | 'getAll';

// Permissions middleware
export const permissionMiddleware = (
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete' | 'getAll'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, 'Usuario no autenticado');
      }

      let userWithRole;

      // Check if it's an admin or regular user
      if (req.user.type === 'admin') {
        userWithRole = await Admin.findById(req.user._id).populate('role');
      } else {
        userWithRole = await User.findById(req.user._id).populate('role');
      }

      if (!userWithRole || !userWithRole.role) {
        return ResponseHelper.forbidden(res, 'Usuario sin rol asignado');
      }

      const role = userWithRole.role as any;

      // Superadmin has full access
      if (role.name === 'superadmin') {
        return next();
      }

      // Check if the user has the required permission
      if (
        !role.permissions ||
        !role.permissions[resource] ||
        !role.permissions[resource][action]
      ) {
        return ResponseHelper.forbidden(
          res,
          `No tienes permisos para ${action} en ${resource}`
        );
      }

      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      ResponseHelper.serverError(res, 'Error al verificar permisos');
    }
  };
};
