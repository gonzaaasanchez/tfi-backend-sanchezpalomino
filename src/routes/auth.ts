import { Router, RequestHandler } from 'express';
import User from '../models/User';
import Role from '../models/Role';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { authMiddleware } from '../middleware/auth';
import { logChanges } from '../utils/audit';
import { ResponseHelper } from '../utils/response';
import { addCareAddressData } from '../utils/userHelpers';

const router = Router();

// POST /auth/register - User registration
const register: RequestHandler = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    if (!firstName || !lastName || !email || !password) {
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

// ========================================
// ROUTES
// ========================================
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/register', register);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/login', login);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/me', authMiddleware, getProfile);

export default router;
