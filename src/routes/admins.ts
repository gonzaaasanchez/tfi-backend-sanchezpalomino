import { Router, RequestHandler } from 'express';
import Admin from '../models/Admin';
import Role from '../models/Role';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/auditLogger';
import { getChanges } from '../utils/changeDetector';
import { ResponseHelper } from '../utils/response';

const router = Router();

// POST /admins/login - Admin login
const loginAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      ResponseHelper.validationError(res, 'Email y contraseña son requeridos');
      return;
    }

    // Find admin with role
    const admin = await Admin.findOne({ email }).populate('role');
    if (!admin) {
      ResponseHelper.unauthorized(res, 'Credenciales inválidas');
      return;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      ResponseHelper.unauthorized(res, 'Credenciales inválidas');
      return;
    }

    // Generate token
    const token = generateToken({
      userId: admin._id?.toString() || '',
      email: admin.email,
      type: 'admin',
    });

    ResponseHelper.success(res, 'Login exitoso', {
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// POST /admins - Create new admin
const createAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, roleId } = req.body;

    if (!firstName || !lastName || !email || !password || !roleId) {
      ResponseHelper.validationError(res, 'Todos los campos son requeridos');
      return;
    }

    if (password.length < 6) {
      ResponseHelper.validationError(
        res,
        'La contraseña debe tener al menos 6 caracteres'
      );
      return;
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      ResponseHelper.validationError(res, 'El email ya está registrado');
      return;
    }

    // Verify that role exists and is not system role
    const role = await Role.findById(roleId);
    if (!role) {
      ResponseHelper.validationError(res, 'Rol no encontrado');
      return;
    }

    // Only allow assigning non-system roles (user and superadmin)
    if (role.isSystem) {
      ResponseHelper.validationError(
        res,
        'No se puede asignar roles del sistema a un admin'
      );
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    const admin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: roleId,
    });

    await admin.save();

    // Populate role for response
    await admin.populate('role');

    // Creation log
    const userName = req.user
      ? `${req.user.firstName} ${req.user.lastName}`
      : 'Sistema';
    const userId = req.user?._id?.toString() || 'system';
    logChanges('Admin', admin._id?.toString() ?? '', userId, userName, [
      { field: 'firstName', oldValue: null, newValue: firstName },
      { field: 'lastName', oldValue: null, newValue: lastName },
      { field: 'email', oldValue: null, newValue: email },
    ]);

    ResponseHelper.success(
      res,
      'Admin creado exitosamente',
      {
        admin: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// GET /admins/me - Get authenticated admin profile
const getProfile: RequestHandler = async (req, res, next) => {
  try {
    // Populate role to include role information
    await req.user.populate('role');

    ResponseHelper.success(res, 'Perfil obtenido exitosamente', {
      admin: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /admins - Get all admins
const getAllAdmins: RequestHandler = async (req, res, next) => {
  try {
    const admins = await Admin.find().populate('role').select('-password');
    ResponseHelper.success(res, 'Admins obtenidos exitosamente', 
      admins.map((admin) => ({
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      }))
    );
  } catch (error) {
    next(error);
  }
};

// GET /admins/:id - Get specific admin
const getAdmin: RequestHandler = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .populate('role')
      .select('-password');
    if (!admin) {
      ResponseHelper.notFound(res, 'Admin no encontrado');
      return;
    }

    ResponseHelper.success(res, 'Admin obtenido exitosamente', {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /admins/:id - Update admin
const updateAdmin: RequestHandler = async (req, res, next) => {
  try {
    const adminId = req.params.id;
    const updateData = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      ResponseHelper.notFound(res, 'Admin no encontrado');
      return;
    }

    // If role is being updated, verify it exists and is not system role
    if (updateData.roleId) {
      const role = await Role.findById(updateData.roleId);
      if (!role) {
        ResponseHelper.validationError(res, 'Rol no encontrado');
        return;
      }
      if (role.isSystem) {
        ResponseHelper.validationError(
          res,
          'No se puede asignar roles del sistema a un admin'
        );
        return;
      }
      // Rename roleId to role to match schema
      updateData.role = updateData.roleId;
      delete updateData.roleId;
    }

    // Detect changes before updating
    const changes = getChanges(admin, updateData);

    // Update document
    Object.assign(admin, updateData);
    await admin.save();

    // If there were changes, log them
    if (changes.length > 0) {
      const userName = req.user
        ? `${req.user.firstName} ${req.user.lastName}`
        : 'Sistema';
      const userId = req.user?._id?.toString() || 'system';
      logChanges('Admin', adminId, userId, userName, changes);
    }

    await admin.populate('role');

    ResponseHelper.success(
      res,
      'Admin actualizado exitosamente',
      {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      }
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /admins/:id - Delete admin
const deleteAdmin: RequestHandler = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      ResponseHelper.notFound(res, 'Admin no encontrado');
      return;
    }

    // Deletion log
    const userName = req.user
      ? `${req.user.firstName} ${req.user.lastName}`
      : 'Sistema';
    const userId = req.user?._id?.toString() || 'system';
    logChanges('Admin', req.params.id, userId, userName, [
      { field: 'deleted', oldValue: false, newValue: true },
    ]);

    await Admin.findByIdAndDelete(req.params.id);

    ResponseHelper.success(res, 'Admin eliminado exitosamente');
  } catch (error) {
    next(error);
  }
};

// ========================================
// ROUTES
// ========================================
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/login', loginAdmin);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/me', authMiddleware, getProfile);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/',
  authMiddleware,
  permissionMiddleware('admins', 'getAll'),
  getAllAdmins
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('admins', 'read'),
  getAdmin
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post(
  '/',
  authMiddleware,
  permissionMiddleware('admins', 'create'),
  createAdmin
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('admins', 'update'),
  updateAdmin
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('admins', 'delete'),
  deleteAdmin
);

export default router;
