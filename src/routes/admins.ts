import { Router, RequestHandler } from 'express';
import Admin from '../models/Admin';
import Role from '../models/Role';
import PasswordReset from '../models/PasswordReset';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/auditLogger';
import { getChanges } from '../utils/changeDetector';
import { ResponseHelper } from '../utils/response';
import { sendEmail } from '../utils/emailService';
import { generatePasswordResetEmail } from '../utils/passwordResetEmail';
import { generateResetCode, validatePassword } from '../utils/passwordReset';
import { blacklistToken } from '../utils/tokenBlacklist';
import { logSessionEvent } from '../utils/sessionAudit';

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
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!admin) {
      // Log failed login attempt
      await logSessionEvent({
        userId: 'unknown',
        userType: 'admin',
        action: 'login_failed',
        ipAddress,
        success: false,
        failureReason: 'Admin no encontrado',
      });
      
      ResponseHelper.unauthorized(res, 'Credenciales inválidas');
      return;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      // Log failed login attempt
      await logSessionEvent({
        userId: admin._id?.toString() || '',
        userType: 'admin',
        action: 'login_failed',
        ipAddress,
        success: false,
        failureReason: 'Contraseña incorrecta',
      });
      
      ResponseHelper.unauthorized(res, 'Credenciales inválidas');
      return;
    }

    // Generate token
    const token = generateToken({
      userId: admin._id?.toString() || '',
      email: admin.email,
      type: 'admin',
    });

    // Log successful login
    await logSessionEvent({
      userId: admin._id?.toString() || '',
      userType: 'admin',
      action: 'login',
      ipAddress,
      success: true,
    });

    ResponseHelper.success(res, 'Login exitoso', {
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: {
          id: (admin.role as any)._id,
          name: (admin.role as any).name,
          description: (admin.role as any).description,
          permissions: (admin.role as any).permissions,
          isSystem: (admin.role as any).isSystem,
        },
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
          role: {
            id: (admin.role as any)._id,
            name: (admin.role as any).name,
            isSystem: (admin.role as any).isSystem,
          },
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
        role: {
          id: (req.user.role as any)._id,
          name: (req.user.role as any).name,
          description: (req.user.role as any).description,
          permissions: (req.user.role as any).permissions,
          isSystem: (req.user.role as any).isSystem,
        },
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
        role: {
          id: (admin.role as any)._id,
          name: (admin.role as any).name,
          description: (admin.role as any).description,
          permissions: (admin.role as any).permissions,
          isSystem: (admin.role as any).isSystem,
        },
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
      role: {
        id: (admin.role as any)._id,
        name: (admin.role as any).name,
        description: (admin.role as any).description,
        permissions: (admin.role as any).permissions,
        isSystem: (admin.role as any).isSystem,
      },
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
        role: {
          id: (admin.role as any)._id,
          name: (admin.role as any).name,
          isSystem: (admin.role as any).isSystem,
        },
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

// POST /admins/logout - Admin logout
const logoutAdmin: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseHelper.unauthorized(res, 'Token de acceso requerido');
      return;
    }

    const token = authHeader.substring(7);
    
    // Add token to blacklist
    const blacklisted = await blacklistToken(token);
    
    if (!blacklisted) {
      ResponseHelper.serverError(res, 'Error al invalidar el token');
      return;
    }

    // Log the logout
    const userName = req.user
      ? `${req.user.firstName} ${req.user.lastName}`
      : 'Admin';
    const userId = req.user?._id?.toString() || 'unknown';
    
    await logChanges('Admin', userId, userId, userName, [
      { field: 'logout', oldValue: null, newValue: true },
      { field: 'tokenBlacklisted', oldValue: null, newValue: true },
    ]);

    // Log session event
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    await logSessionEvent({
      userId,
      userType: 'admin',
      action: 'logout',
      ipAddress,
      success: true,
    });

    ResponseHelper.success(res, 'Logout exitoso');
  } catch (error) {
    next(error);
  }
};

// POST /admins/forgot-password - Request password reset for admin
const forgotPasswordAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      ResponseHelper.validationError(res, 'El email es requerido');
      return;
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('🔍 Admin not found, returning success message');
      // Don't reveal if admin exists or not for security
      ResponseHelper.success(
        res,
        'Si el email existe, recibirás un código de recuperación'
      );
      return;
    }

    // Generate reset code
    const resetCode = generateResetCode();

    // Set expiration (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Save or update reset code
    await PasswordReset.findOneAndUpdate(
      { userId: admin._id, userType: 'admin', used: false },
      {
        code: resetCode,
        expiresAt,
        used: false,
      },
      { upsert: true, new: true }
    );

    // Send email
    const emailHtml = generatePasswordResetEmail(resetCode, `${admin.firstName} ${admin.lastName}`);
    const emailSent = await sendEmail({
      to: admin.email,
      subject: 'PawPals - 🔐 Código de Recuperación de Contraseña - Admin',
      html: emailHtml,
    });

    if (!emailSent) {
      ResponseHelper.serverError(
        res,
        'Error al enviar el email de recuperación'
      );
      return;
    }

    // Log the request
    await logChanges(
      'PasswordReset',
      admin._id?.toString() || '',
      'system',
      'Sistema',
      [
        { field: 'resetRequested', oldValue: null, newValue: true },
        { field: 'email', oldValue: null, newValue: admin.email },
        { field: 'userType', oldValue: null, newValue: 'admin' },
      ]
    );

    ResponseHelper.success(
      res,
      'Si el email existe, recibirás un código de recuperación'
    );
  } catch (error) {
    next(error);
  }
};

// POST /admins/reset-password - Reset password with code for admin
const resetPasswordAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      ResponseHelper.validationError(
        res,
        'Email, código y nueva contraseña son requeridos'
      );
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      ResponseHelper.validationError(res, passwordValidation.errors.join(', '));
      return;
    }

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      ResponseHelper.validationError(res, 'Admin no encontrado');
      return;
    }

    // Find valid reset code
    const resetRecord = await PasswordReset.findOne({
      userId: admin._id,
      userType: 'admin',
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      ResponseHelper.validationError(res, 'Código inválido o expirado');
      return;
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(newPassword, admin.password);
    if (isSamePassword) {
      ResponseHelper.validationError(
        res,
        'La nueva contraseña debe ser diferente a la actual'
      );
      return;
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update admin password
    const oldPassword = admin.password;
    admin.password = hashedNewPassword;
    await admin.save();

    // Mark reset code as used
    resetRecord.used = true;
    await resetRecord.save();

    // Log the password change
    await logChanges('Admin', admin._id?.toString() || '', 'system', 'Sistema', [
      { field: 'password', oldValue: '***', newValue: '***' },
      { field: 'resetCode', oldValue: code, newValue: 'USED' },
    ]);

    ResponseHelper.success(res, 'Contraseña actualizada exitosamente');
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
router.post('/forgot-password', forgotPasswordAdmin);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/reset-password', resetPasswordAdmin);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/logout', authMiddleware, logoutAdmin);
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
