import { Router, RequestHandler } from 'express';
import Role from '../models/Role';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/auditLogger';
import { getChanges } from '../utils/changeDetector';
import { ResponseHelper } from '../utils/response';

const router = Router();

// Helper function to validate permissions structure
const validatePermissions = (
  permissions: any
): { isValid: boolean; error?: string } => {
  if (!permissions || typeof permissions !== 'object') {
    return {
      isValid: false,
      error: 'Los permisos son requeridos y deben ser un objeto',
    };
  }

  const requiredPermissions = {
    users: ['create', 'read', 'update', 'delete', 'getAll'],
    roles: ['create', 'read', 'update', 'delete', 'getAll'],
    admins: ['create', 'read', 'update', 'delete', 'getAll'],
    logs: ['read', 'getAll'],
    audit: ['read'],
    petTypes: ['create', 'read', 'update', 'delete', 'getAll'],
    petCharacteristics: ['create', 'read', 'update', 'delete', 'getAll'],
    pets: ['create', 'read', 'update', 'delete', 'getAll'],
    caregiverSearch: ['read'],
    reservations: ['create', 'read', 'update', 'getAll'],
    reviews: ['create', 'read'],
    posts: ['create', 'read', 'delete', 'getAll'],
    comments: ['create', 'getAll', 'delete'],
    likes: ['create', 'delete'],
    config: ['read', 'update'],
  };

  for (const [resource, requiredProps] of Object.entries(requiredPermissions)) {
    if (!permissions[resource] || typeof permissions[resource] !== 'object') {
      return {
        isValid: false,
        error: `El recurso '${resource}' es requerido y debe ser un objeto`,
      };
    }

    for (const prop of requiredProps) {
      if (!(prop in permissions[resource])) {
        return {
          isValid: false,
          error: `La propiedad '${prop}' es requerida en '${resource}'`,
        };
      }

      if (typeof permissions[resource][prop] !== 'boolean') {
        return {
          isValid: false,
          error: `La propiedad '${prop}' en '${resource}' debe ser un booleano (true/false)`,
        };
      }
    }
  }

  return { isValid: true };
};

// GET /roles - Get all roles
const getRoles: RequestHandler = async (req, res, next) => {
  try {
    const roles = await Role.find().select('-__v');
    ResponseHelper.success(
      res,
      'Roles obtenidos exitosamente',
      roles.map((role) => ({
        id: role._id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      }))
    );
  } catch (error) {
    next(error);
  }
};

// GET /roles/:id - Get a specific role
const getRole: RequestHandler = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id).select('-__v');
    if (!role) {
      ResponseHelper.notFound(res, 'Rol no encontrado');
      return;
    }

    ResponseHelper.success(res, 'Rol obtenido exitosamente', {
      id: role._id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// POST /roles - Create new role
const createRole: RequestHandler = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name || !description) {
      ResponseHelper.validationError(
        res,
        'Nombre y descripción son requeridos'
      );
      return;
    }

    // Validate permissions structure
    const permissionsValidation = validatePermissions(permissions);
    if (!permissionsValidation.isValid) {
      ResponseHelper.validationError(
        res,
        permissionsValidation.error || 'Error en la validación de permisos'
      );
      return;
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      ResponseHelper.validationError(res, 'El rol ya existe');
      return;
    }

    // Don't allow creating system roles
    if (['superadmin', 'user'].includes(name)) {
      ResponseHelper.validationError(
        res,
        'No se pueden crear roles del sistema'
      );
      return;
    }

    const newRole = new Role({
      name,
      description,
      permissions,
      isSystem: false,
    });

    const savedRole = await newRole.save();

    // Creation log
    const userName = req.user
      ? `${req.user.firstName} ${req.user.lastName}`
      : 'Sistema';
    const userId = req.user?._id?.toString() || 'system';
    logChanges('Role', savedRole._id?.toString() || '', userId, userName, [
      { field: 'name', oldValue: null, newValue: name },
      { field: 'description', oldValue: null, newValue: description },
    ]);

    ResponseHelper.success(
      res,
      'Rol creado exitosamente',
      {
        id: savedRole._id,
        name: savedRole.name,
        description: savedRole.description,
        permissions: savedRole.permissions,
        isSystem: savedRole.isSystem,
        createdAt: savedRole.createdAt,
        updatedAt: savedRole.updatedAt,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// PUT /roles/:id - Update role
const updateRole: RequestHandler = async (req, res, next) => {
  try {
    const roleId = req.params.id;
    const updateData = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      ResponseHelper.notFound(res, 'Rol no encontrado');
      return;
    }

    // Don't allow modifying system roles
    if (role.isSystem) {
      ResponseHelper.validationError(
        res,
        'No se puede modificar roles del sistema'
      );
      return;
    }

    // Validate permissions structure (same as create)
    const { permissions } = updateData;
    const permissionsValidation = validatePermissions(permissions);
    if (!permissionsValidation.isValid) {
      ResponseHelper.validationError(
        res,
        permissionsValidation.error || 'Error en la validación de permisos'
      );
      return;
    }

    // Detect changes before updating
    const changes = getChanges(role, updateData);

    // Update the document
    Object.assign(role, updateData);
    await role.save();

    // If there were changes, log them
    if (changes.length > 0) {
      const userName = req.user
        ? `${req.user.firstName} ${req.user.lastName}`
        : 'Sistema';
      const userId = req.user?._id?.toString() || 'system';
      logChanges('Role', roleId, userId, userName, changes);
    }

    ResponseHelper.success(res, 'Rol actualizado exitosamente', {
      id: role._id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /roles/:id - Delete role
const deleteRole: RequestHandler = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      ResponseHelper.notFound(res, 'Rol no encontrado');
      return;
    }

    // Don't allow deleting system roles
    if (role.isSystem) {
      ResponseHelper.validationError(
        res,
        'No se puede eliminar roles del sistema'
      );
      return;
    }

    // Deletion log
    const userName = req.user
      ? `${req.user.firstName} ${req.user.lastName}`
      : 'Sistema';
    const userId = req.user?._id?.toString() || 'system';
    logChanges('Role', req.params.id, userId, userName, [
      { field: 'deleted', oldValue: false, newValue: true },
    ]);

    await Role.findByIdAndDelete(req.params.id);

    ResponseHelper.success(res, 'Rol eliminado exitosamente');
  } catch (error) {
    next(error);
  }
};

// GET /roles/permissions/template - Get empty permissions template
const getPermissionsTemplate: RequestHandler = async (req, res, next) => {
  try {
    const permissionsTemplate = {
      users: {
        create: false,
        read: false,
        update: false,
        delete: false,
        getAll: false,
      },
      roles: {
        create: false,
        read: false,
        update: false,
        delete: false,
        getAll: false,
      },
      admins: {
        create: false,
        read: false,
        update: false,
        delete: false,
        getAll: false,
      },
      logs: {
        read: false,
        getAll: false,
      },
      audit: {
        read: false,
      },
      petTypes: {
        create: false,
        read: false,
        update: false,
        delete: false,
        getAll: false,
      },
      petCharacteristics: {
        create: false,
        read: false,
        update: false,
        delete: false,
        getAll: false,
      },
      pets: {
        create: false,
        read: false,
        update: false,
        delete: false,
        getAll: false,
      },
      caregiverSearch: {
        read: false,
      },
      reservations: {
        create: false,
        read: false,
        update: false,
        getAll: false,
      },
      reviews: {
        create: false,
        read: false,
      },
      posts: {
        create: false,
        read: false,
        delete: false,
        getAll: false,
      },
      comments: {
        create: false,
        getAll: false,
        delete: false,
      },
      likes: {
        create: false,
        delete: false,
      },
      config: {
        read: false,
        update: false,
      },
    };

    ResponseHelper.success(
      res,
      'Plantilla de permisos obtenida exitosamente',
      permissionsTemplate
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
  '/',
  authMiddleware,
  permissionMiddleware('roles', 'getAll'),
  getRoles
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/permissions/template',
  authMiddleware,
  permissionMiddleware('roles', 'read'),
  getPermissionsTemplate
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('roles', 'read'),
  getRole
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post(
  '/',
  authMiddleware,
  permissionMiddleware('roles', 'create'),
  createRole
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('roles', 'update'),
  updateRole
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('roles', 'delete'),
  deleteRole
);

export default router;
