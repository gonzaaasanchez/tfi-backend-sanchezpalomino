import { Router, RequestHandler } from 'express';
import User from '../models/User';
import Role from '../models/Role';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { authMiddleware } from '../middleware/auth';
import { logChanges } from '../utils/audit';

const router = Router();

// POST /auth/register
const register: RequestHandler = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
      });
      return;
    }

    // Obtener el rol 'user' por defecto
    const userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      res.status(500).json({
        success: false,
        message: 'Error interno: Rol de usuario no encontrado',
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: userRole._id
    });

    await user.save();

    // Populate role para la respuesta
    await user.populate('role');

    // Log de creación
    logChanges('User', user._id?.toString() || '', 'system', 'Sistema', [
      { field: 'firstName', oldValue: null, newValue: firstName },
      { field: 'lastName', oldValue: null, newValue: lastName },
      { field: 'email', oldValue: null, newValue: email }
    ]);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/login
const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
      });
      return;
    }

    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
      return;
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
      return;
    }

    const token = generateToken({
      userId: user._id?.toString() || '',
      email: user.email,
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.toJSON(),
        token,
      },
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
    
    res.json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: {
        user: req.user.toJSON(),
      },
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
