import { Router, RequestHandler } from 'express';
import Admin from '../models/Admin';
import Role from '../models/Role';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/audit';
import { getChanges } from '../utils/changeDetector';
import { ResponseHelper } from '../utils/response';

const router = Router();

// POST /admins/login - Login de admin
const loginAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      ResponseHelper.validationError(res, 'Email y contraseña son requeridos');
      return;
    }

    // Buscar el admin con su rol
    const admin = await Admin.findOne({ email }).populate('role');
    if (!admin) {
      ResponseHelper.unauthorized(res, 'Credenciales inválidas');
      return;
    }

    // Verificar la contraseña
    const isPasswordValid = await verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      ResponseHelper.unauthorized(res, 'Credenciales inválidas');
      return;
    }

    // Generar token
    const token = generateToken({
      userId: admin._id?.toString() || '',
      email: admin.email,
      type: 'admin'
    });

    ResponseHelper.success(res, 'Login exitoso', {
      admin: admin.toJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

// POST /admins - Crear nuevo admin
const createAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, roleId } = req.body;

    if (!firstName || !lastName || !email || !password || !roleId) {
      ResponseHelper.validationError(res, 'Todos los campos son requeridos');
      return;
    }

    if (password.length < 6) {
      ResponseHelper.validationError(res, 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Verificar si el admin ya existe
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      ResponseHelper.validationError(res, 'El email ya está registrado');
      return;
    }

    // Verificar que el rol existe y no es del sistema
    const role = await Role.findById(roleId);
    if (!role) {
      ResponseHelper.validationError(res, 'Rol no encontrado');
      return;
    }

    // Solo permitir asignar roles que no sean del sistema (user y superadmin)
    if (role.isSystem) {
      ResponseHelper.validationError(res, 'No se puede asignar roles del sistema a un admin');
      return;
    }

    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear el admin
    const admin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: roleId
    });

    await admin.save();

    // Populate role para la respuesta
    await admin.populate('role');

    // Log de creación
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Sistema';
    const userId = req.user?._id?.toString() || 'system';
    logChanges('Admin', admin._id?.toString() ?? '', userId, userName, [
      { field: 'firstName', oldValue: null, newValue: firstName },
      { field: 'lastName', oldValue: null, newValue: lastName },
      { field: 'email', oldValue: null, newValue: email }
    ]);

    ResponseHelper.success(res, 'Admin creado exitosamente', {
      admin: admin.toJSON()
    }, 201);
  } catch (error) {
    next(error);
  }
};

// GET /admins/me - Obtener perfil del admin autenticado
const getProfile: RequestHandler = async (req, res, next) => {
  try {
    // Populate role para incluir información del rol
    await req.user.populate('role');
    
    ResponseHelper.success(res, 'Perfil obtenido exitosamente', {
      admin: req.user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// GET /admins - Obtener todos los admins
const getAllAdmins: RequestHandler = async (req, res, next) => {
  try {
    const admins = await Admin.find().populate('role').select('-password');
    ResponseHelper.success(res, 'Admins obtenidos exitosamente', admins);
  } catch (error) {
    next(error);
  }
};

// GET /admins/:id - Obtener admin específico
const getAdmin: RequestHandler = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id).populate('role').select('-password');
    if (!admin) {
      ResponseHelper.notFound(res, 'Admin no encontrado');
      return;
    }
    
    ResponseHelper.success(res, 'Admin obtenido exitosamente', admin);
  } catch (error) {
    next(error);
  }
};

// PUT /admins/:id - Actualizar admin
const updateAdmin: RequestHandler = async (req, res, next) => {
  try {
    const adminId = req.params.id;
    const updateData = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      ResponseHelper.notFound(res, 'Admin no encontrado');
      return;
    }

    // Si se actualiza el rol, verificar que existe y no es de sistema
    if (updateData.roleId) {
      const role = await Role.findById(updateData.roleId);
      if (!role) {
        ResponseHelper.validationError(res, 'Rol no encontrado');
        return;
      }
      if (role.isSystem) {
        ResponseHelper.validationError(res, 'No se puede asignar roles del sistema a un admin');
        return;
      }
      // Renombrar roleId a role para que coincida con el schema
      updateData.role = updateData.roleId;
      delete updateData.roleId;
    }
    
    // Detectar cambios antes de actualizar
    const changes = getChanges(admin, updateData);

    // Actualizar el documento
    Object.assign(admin, updateData);
    await admin.save();
    
    // Si hubo cambios, registrarlos
    if (changes.length > 0) {
      const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Sistema';
      const userId = req.user?._id?.toString() || 'system';
      logChanges('Admin', adminId, userId, userName, changes);
    }
    
    await admin.populate('role');

    ResponseHelper.success(res, 'Admin actualizado exitosamente', admin.toJSON());

  } catch (error) {
    next(error);
  }
};

// DELETE /admins/:id - Eliminar admin
const deleteAdmin: RequestHandler = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      ResponseHelper.notFound(res, 'Admin no encontrado');
      return;
    }

    // Log de eliminación
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Sistema';
    const userId = req.user?._id?.toString() || 'system';
    logChanges('Admin', req.params.id, userId, userName, [
      { field: 'deleted', oldValue: false, newValue: true }
    ]);

    await Admin.findByIdAndDelete(req.params.id);
    
    ResponseHelper.success(res, 'Admin eliminado exitosamente');
  } catch (error) {
    next(error);
  }
};

// Rutas
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/login', loginAdmin);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/me', authMiddleware, getProfile);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/', authMiddleware, permissionMiddleware('admins', 'getAll'), getAllAdmins);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/:id', authMiddleware, permissionMiddleware('admins', 'read'), getAdmin);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/', authMiddleware, permissionMiddleware('admins', 'create'), createAdmin);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.put('/:id', authMiddleware, permissionMiddleware('admins', 'update'), updateAdmin);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.delete('/:id', authMiddleware, permissionMiddleware('admins', 'delete'), deleteAdmin);

export default router; 