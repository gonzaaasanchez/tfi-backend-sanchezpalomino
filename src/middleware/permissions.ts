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

// Interfaz para permisos
export interface Permission {
  resource: string;
  action: Action;
}

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

// Middleware para verificar si es superadmin
export const superadminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
    
    if (role.name !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de superadministrador'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de superadmin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar permisos de superadministrador'
    });
  }
};

// Middleware para verificar si NO es user (es decir, tiene acceso al dashboard)
export const dashboardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
    
    // Solo permitir acceso si NO es user (es decir, es superadmin u otro rol del dashboard)
    if (role.name === 'user') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo usuarios del dashboard pueden acceder'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar permisos del dashboard'
    });
  }
};

// Función helper para verificar múltiples permisos
export const requireAnyPermission = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implementar lógica para verificar si el usuario tiene al menos uno de los permisos
    next();
  };
};

// Función helper para verificar todos los permisos
export const requireAllPermissions = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implementar lógica para verificar si el usuario tiene todos los permisos
    next();
  };
}; 