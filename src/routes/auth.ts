import { Router, RequestHandler } from 'express';
import User from '../models/User';
import Role from '../models/Role';
import PasswordReset from '../models/PasswordReset';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { authMiddleware } from '../middleware/auth';
import { logChanges } from '../utils/auditLogger';
import { ResponseHelper } from '../utils/response';
import { addCareAddressData } from '../utils/userHelpers';
import { sendEmail, generatePasswordResetEmail } from '../utils/email';
import { generateResetCode, validatePassword } from '../utils/passwordReset';

const router = Router();

// POST /auth/register - User registration
const register: RequestHandler = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    if (!firstName || !lastName || !email || !password) {
      ResponseHelper.validationError(res, 'Todos los campos son requeridos');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      ResponseHelper.validationError(res, passwordValidation.errors.join(', '));
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      ResponseHelper.validationError(res, 'El email ya está registrado');
      return;
    }

    // Get the default 'user' role
    const userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      ResponseHelper.serverError(
        res,
        'Error interno: Rol de usuario no encontrado'
      );
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      role: userRole._id,
    });

    await user.save();

    // Populate role for response
    await user.populate('role');

    // Creation log
    logChanges('User', user._id?.toString() || '', 'system', 'Sistema', [
      { field: 'firstName', oldValue: null, newValue: firstName },
      { field: 'lastName', oldValue: null, newValue: lastName },
      { field: 'email', oldValue: null, newValue: email },
      { field: 'phoneNumber', oldValue: null, newValue: phoneNumber },
    ]);

    ResponseHelper.success(
      res,
      'Usuario registrado exitosamente',
      {
        user: user.toJSON(),
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// POST /auth/login - User login
const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      ResponseHelper.validationError(res, 'Email y contraseña son requeridos');
      return;
    }

    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      ResponseHelper.unauthorized(res, 'Credenciales inválidas');
      return;
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      ResponseHelper.unauthorized(res, 'Credenciales inválidas');
      return;
    }

    const token = generateToken({
      userId: user._id?.toString() || '',
      email: user.email,
    });

    const userResponse = user.toJSON();
    addCareAddressData(userResponse);

    ResponseHelper.success(res, 'Login exitoso', {
      user: userResponse,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// GET /auth/me - Get authenticated user profile
const getProfile: RequestHandler = async (req, res, next) => {
  try {
    // Populate role to include role information
    await req.user.populate('role');

    const userResponse = req.user.toJSON();
    addCareAddressData(userResponse);

    ResponseHelper.success(res, 'Perfil obtenido exitosamente', {
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/forgot-password - Request password reset
const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      ResponseHelper.validationError(res, 'El email es requerido');
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
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
      { userId: user._id, used: false },
      {
        code: resetCode,
        expiresAt,
        used: false,
      },
      { upsert: true, new: true }
    );

    // Send email
    const emailHtml = generatePasswordResetEmail(resetCode, user.firstName);
    const emailSent = await sendEmail({
      to: user.email,
      subject: '🔐 Código de Recuperación de Contraseña',
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
      user._id?.toString() || '',
      'system',
      'Sistema',
      [
        { field: 'resetRequested', oldValue: null, newValue: true },
        { field: 'email', oldValue: null, newValue: user.email },
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

// POST /auth/reset-password - Reset password with code
const resetPassword: RequestHandler = async (req, res, next) => {
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

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      ResponseHelper.validationError(res, 'Usuario no encontrado');
      return;
    }

    // Find valid reset code
    const resetRecord = await PasswordReset.findOne({
      userId: user._id,
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      ResponseHelper.validationError(res, 'Código inválido o expirado');
      return;
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      ResponseHelper.validationError(
        res,
        'La nueva contraseña debe ser diferente a la actual'
      );
      return;
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update user password
    const oldPassword = user.password;
    user.password = hashedNewPassword;
    await user.save();

    // Mark reset code as used
    resetRecord.used = true;
    await resetRecord.save();

    // Log the password change
    await logChanges('User', user._id?.toString() || '', 'system', 'Sistema', [
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
router.post('/register', register);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/login', login);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/me', authMiddleware, getProfile);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/forgot-password', forgotPassword);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/reset-password', resetPassword);

export default router;
