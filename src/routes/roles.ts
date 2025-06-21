import { Router, RequestHandler } from 'express';
import Role from '../models/Role';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/audit';
import { getChanges } from '../utils/changeDetector';

const router = Router();

// GET /roles - Obtener todos los roles
const getRoles: RequestHandler = async (req, res, next) => {
  try {
    const roles = await Role.find().select('-__v');
    res.json({
      success: true,
      message: 'Roles obtenidos exitosamente',
      data: roles
    });
  } catch (error) {
    next(error);
  }
};

// GET /roles/:id - Obtener un rol específico
const getRole: RequestHandler = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id).select('-__v');
    if (!role) {
      res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Rol obtenido exitosamente',
      data: role
    });
  } catch (error) {
    next(error);
  }
};

// POST /roles - Crear nuevo rol
const createRole: RequestHandler = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name || !description) {
      res.status(400).json({
        success: false,
        message: 'Nombre y descripción son requeridos'
      });
      return;
    }

    // Validar que se envíen todos los permisos
    if (!permissions || !permissions.users || !permissions.roles || !permissions.admins) {
      res.status(400).json({
        success: false,
        message: 'Se requieren todos los permisos: users, roles y admins'
      });
      return;
    }

    // Verificar si el rol ya existe
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      res.status(400).json({
        success: false,
        message: 'El rol ya existe'
      });
      return;
    }

    // No permitir crear roles del sistema
    if (['superadmin', 'user'].includes(name)) {
      res.status(400).json({
        success: false,
        message: 'No se pueden crear roles del sistema'
      });
      return;
    }

    const newRole = new Role({
      name,
      description,
      permissions,
      isSystem: false
    });

    const savedRole = await newRole.save();
    
    // Log de creación
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Sistema';
    const userId = req.user?._id?.toString() || 'system';
    logChanges('Role', savedRole._id?.toString() || '', userId, userName, [
      { field: 'name', oldValue: null, newValue: name },
      { field: 'description', oldValue: null, newValue: description }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Rol creado exitosamente',
      data: savedRole
    });
  } catch (error) {
    next(error);
  }
};

// PUT /roles/:id - Actualizar rol
const updateRole: RequestHandler = async (req, res, next) => {
  try {
    const roleId = req.params.id;
    const updateData = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      res.status(404).json({ success: false, message: 'Rol no encontrado' });
      return;
    }

    // No permitir modificar roles del sistema
    if (role.isSystem) {
      res.status(400).json({ success: false, message: 'No se puede modificar roles del sistema' });
      return;
    }
    
    // Detectar cambios antes de actualizar
    const changes = getChanges(role, updateData);

    // Actualizar el documento
    Object.assign(role, updateData);
    await role.save();
    
    // Si hubo cambios, registrarlos
    if (changes.length > 0) {
      const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Sistema';
      const userId = req.user?._id?.toString() || 'system';
      logChanges('Role', roleId, userId, userName, changes);
    }

    res.json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: role.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /roles/:id - Eliminar rol
const deleteRole: RequestHandler = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
      return;
    }

    // No permitir eliminar roles del sistema
    if (role.isSystem) {
      res.status(400).json({
        success: false,
        message: 'No se puede eliminar roles del sistema'
      });
      return;
    }

    // Log de eliminación
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Sistema';
    const userId = req.user?._id?.toString() || 'system';
    logChanges('Role', req.params.id, userId, userName, [
      { field: 'deleted', oldValue: false, newValue: true }
    ]);

    await Role.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Rol eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Rutas con middleware de autenticación y permisos
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/', authMiddleware, permissionMiddleware('roles', 'getAll'), getRoles);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/:id', authMiddleware, permissionMiddleware('roles', 'read'), getRole);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/', authMiddleware, permissionMiddleware('roles', 'create'), createRole);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.put('/:id', authMiddleware, permissionMiddleware('roles', 'update'), updateRole);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.delete('/:id', authMiddleware, permissionMiddleware('roles', 'delete'), deleteRole);

export default router; 