import { Router, RequestHandler } from 'express';
import Admin from '../models/Admin';
import Role from '../models/Role';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';

const router = Router();

// POST /admins/login - Login de admin
const loginAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
      return;
    }

    // Buscar el admin con su rol
    const admin = await Admin.findOne({ email }).populate('role');
    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
      return;
    }

    // Verificar la contraseña
    const isPasswordValid = await verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
      return;
    }

    // Generar token
    const token = generateToken({
      userId: admin._id?.toString() || '',
      email: admin.email,
      type: 'admin'
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        admin: admin.toJSON(),
        token
      }
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
      res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    // Verificar si el admin ya existe
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
      return;
    }

    // Verificar que el rol existe y no es del sistema
    const role = await Role.findById(roleId);
    if (!role) {
      res.status(400).json({
        success: false,
        message: 'Rol no encontrado'
      });
      return;
    }

    // Solo permitir asignar roles que no sean del sistema (user y superadmin)
    if (role.isSystem) {
      res.status(400).json({
        success: false,
        message: 'No se puede asignar roles del sistema a un admin'
      });
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

    res.status(201).json({
      success: true,
      message: 'Admin creado exitosamente',
      data: {
        admin: admin.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /admins/me - Obtener perfil del admin autenticado
const getProfile: RequestHandler = async (req, res, next) => {
  try {
    // Populate role para incluir información del rol
    await req.user.populate('role');
    
    res.json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: {
        admin: req.user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /admins - Obtener todos los admins
const getAllAdmins: RequestHandler = async (req, res, next) => {
  try {
    const admins = await Admin.find().populate('role').select('-password');
    res.json({
      success: true,
      message: 'Admins obtenidos exitosamente',
      data: admins
    });
  } catch (error) {
    next(error);
  }
};

// GET /admins/:id - Obtener admin específico
const getAdmin: RequestHandler = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id).populate('role').select('-password');
    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin no encontrado'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Admin obtenido exitosamente',
      data: admin
    });
  } catch (error) {
    next(error);
  }
};

// PUT /admins/:id - Actualizar admin
const updateAdmin: RequestHandler = async (req, res, next) => {
  try {
    const { firstName, lastName, email, roleId } = req.body;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin no encontrado'
      });
      return;
    }

    // Verificar que el rol existe si se está actualizando
    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role) {
        res.status(400).json({
          success: false,
          message: 'Rol no encontrado'
        });
        return;
      }

      // Solo permitir asignar roles que no sean del sistema (user y superadmin)
      if (role.isSystem) {
        res.status(400).json({
          success: false,
          message: 'No se puede asignar roles del sistema a un admin'
        });
        return;
      }
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, role: roleId },
      { new: true, runValidators: true }
    ).populate('role').select('-password');

    res.json({
      success: true,
      message: 'Admin actualizado exitosamente',
      data: updatedAdmin
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /admins/:id - Eliminar admin
const deleteAdmin: RequestHandler = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin no encontrado'
      });
      return;
    }

    await Admin.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Admin eliminado exitosamente'
    });
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