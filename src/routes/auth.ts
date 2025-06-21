import { Router, Request, Response, RequestHandler } from 'express';
import User from '../models/User';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /auth/register
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  // Validaciones básicas
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered'
    });
  }

  // Hashear la contraseña
  const hashedPassword = await hashPassword(password);

  // Crear el usuario
  const user = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword
  });

  await user.save();

  // Retornar respuesta exitosa (sin incluir password)
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toJSON()
    }
  });
}));

// POST /auth/login
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validaciones básicas
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Buscar el usuario
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Verificar la contraseña
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generar token
  const token = generateToken({
    userId: user._id?.toString() || '',
    email: user.email
  });

  // Retornar usuario y token
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      token
    }
  });
}));

// GET /auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    }
  });
}));

export default router; 