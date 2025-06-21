import { Router, RequestHandler } from 'express';
import User from '../models/User';
import Role from '../models/Role';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { authMiddleware } from '../middleware/auth';
import { logChanges } from '../utils/audit';
import { ResponseHelper } from '../utils/response';

const router = Router();

// POST /auth/register
const register: RequestHandler = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    if (!firstName || !lastName || !email || !password) {
      ResponseHelper.validationError(res, 'Todos los campos son requeridos');
      return;
    }

    if (password.length < 6) {
      ResponseHelper.validationError(res, 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      ResponseHelper.validationError(res, 'El email ya está registrado');
      return;
    }

    // Obtener el rol 'user' por defecto
    const userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      ResponseHelper.serverError(res, 'Error interno: Rol de usuario no encontrado');
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      role: userRole._id
    });

    await user.save();

    // Populate role para la respuesta
    await user.populate('role');

    // Log de creación
    logChanges('User', user._id?.toString() || '', 'system', 'Sistema', [
      { field: 'firstName', oldValue: null, newValue: firstName },
      { field: 'lastName', oldValue: null, newValue: lastName },
      { field: 'email', oldValue: null, newValue: email },
      { field: 'phoneNumber', oldValue: null, newValue: phoneNumber }
    ]);

    ResponseHelper.success(res, 'Usuario registrado exitosamente', {
      user: user.toJSON(),
    }, 201);
  } catch (error) {
    next(error);
  }
};

// POST /auth/login
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

    ResponseHelper.success(res, 'Login exitoso', {
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

// GET /auth/me - Obtener perfil del usuario autenticado
const getProfile: RequestHandler = async (req, res, next) => {
  try {
    // Populate role para incluir información del rol
    await req.user.populate('role');
    
    ResponseHelper.success(res, 'Perfil obtenido exitosamente', {
      user: req.user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/register', register);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/login', login);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/me', authMiddleware, getProfile);

export default router;
