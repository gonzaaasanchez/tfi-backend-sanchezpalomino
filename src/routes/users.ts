import { Router, RequestHandler } from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/audit';
import { getChanges } from '../utils/changeDetector';
import { uploadImage, handleUploadError } from '../middleware/upload';
import { ResponseHelper } from '../utils/response';

const router = Router();

// GET /users/me - Obtener perfil del usuario autenticado
const getMyProfile: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const user = await User.findById(userId).populate('role');
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    ResponseHelper.success(res, 'Perfil obtenido exitosamente', user);

  } catch (error) {
    next(error);
  }
};

// PUT /users/me - Actualizar perfil del usuario autenticado
const updateMyProfile: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const updateData = req.body;
    
    // Prevenir que el usuario modifique campos sensibles
    delete updateData.role;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.avatarBuffer;
    delete updateData.avatarContentType;

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }
    
    // Detectar cambios antes de actualizar
    const changes = getChanges(user, updateData);

    // Actualizar el documento sin populate para evitar problemas con roles
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    if (!updatedUser) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }
    
    // Si hubo cambios, registrarlos
    if (changes.length > 0) {
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      logChanges('User', userId.toString(), userId.toString(), userName, changes);
    }

    // Convertir a objeto y eliminar campos sensibles
    const userResponse = updatedUser.toObject();
    const { password, avatarBuffer, ...safeUserResponse } = userResponse;

    ResponseHelper.success(res, 'Perfil actualizado exitosamente', safeUserResponse);

  } catch (error) {
    next(error);
  }
};

// PUT /users/me/avatar - Actualizar avatar del usuario autenticado
const updateMyAvatar: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }
    
    const updateData: any = {};
    
    // Si hay una imagen en el request, guardar buffer y generar URL
    if (req.file) {
      updateData.avatar = `/api/users/${userId}/avatar`;
      updateData.avatarBuffer = req.file.buffer;
      updateData.avatarContentType = req.file.mimetype;
    } else {
      ResponseHelper.validationError(res, 'No se proporcionó ninguna imagen');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }
    
    // Detectar cambios antes de actualizar
    const changes = getChanges(user, updateData);

    // Actualizar el documento
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate('role');
    
    // Si hubo cambios, registrarlos
    if (changes.length > 0) {
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      logChanges('User', userId.toString(), userId.toString(), userName, changes);
    }

    ResponseHelper.success(res, 'Avatar actualizado exitosamente', updatedUser);

  } catch (error) {
    next(error);
  }
};

// PUT /users/:id - Actualizar un usuario específico (solo admins)
const updateUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }
    
    // Detectar cambios antes de actualizar
    const changes = getChanges(user, updateData);

    // Actualizar el documento directamente en la BD sin correr todos los validadores
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    // Si hubo cambios, registrarlos
    if (changes.length > 0) {
      const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Sistema';
      const userIdPerformingAction = req.user?._id?.toString() || 'system';
      logChanges('User', userId, userIdPerformingAction, userName, changes);
    }

    ResponseHelper.success(res, 'Usuario actualizado exitosamente', updatedUser);

  } catch (error) {
    next(error);
  }
};

// PUT /users/profile/avatar - Actualizar avatar del usuario autenticado (mantener compatibilidad)
const updateAvatar: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }
    
    const updateData: any = {};
    
    // Si hay una imagen en el request, guardar buffer y generar URL
    if (req.file) {
      updateData.avatar = `/api/users/${userId}/avatar`;
      updateData.avatarBuffer = req.file.buffer;
      updateData.avatarContentType = req.file.mimetype;
    } else {
      ResponseHelper.validationError(res, 'No se proporcionó ninguna imagen');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }
    
    // Detectar cambios antes de actualizar
    const changes = getChanges(user, updateData);

    // Actualizar el documento
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    // Si hubo cambios, registrarlos
    if (changes.length > 0) {
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      logChanges('User', userId.toString(), userId.toString(), userName, changes);
    }

    ResponseHelper.success(res, 'Avatar actualizado exitosamente', updatedUser);

  } catch (error) {
    next(error);
  }
};

// GET /users/:id/avatar - Obtener avatar de un usuario
const getAvatar: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }
    
    if (!user.avatarBuffer || !user.avatarContentType) {
      ResponseHelper.notFound(res, 'Avatar no encontrado');
      return;
    }
    
    // Establecer el tipo de contenido y enviar el buffer
    res.set('Content-Type', user.avatarContentType);
    res.send(user.avatarBuffer);
    
  } catch (error) {
    next(error);
  }
};

// GET /users/:id - Obtener un usuario específico (solo admins)
const getOneUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).populate('role');
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Convertir a objeto y eliminar campos sensibles
    const userResponse = user.toObject();
    const { password, avatarBuffer, ...safeUserResponse } = userResponse;

    ResponseHelper.success(res, 'Usuario obtenido exitosamente', safeUserResponse);

  } catch (error) {
    next(error);
  }
};

// GET /users - Obtener todos los usuarios (solo admins)
const getAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Construir filtros opcionales
    const filters: any = {};
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filters.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    }

    if (req.query.role) {
      filters.role = req.query.role;
    }

    // Obtener usuarios con paginación y filtros
    const users = await User.find(filters)
      .populate('role')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Obtener el total de usuarios para la paginación
    const totalUsers = await User.countDocuments(filters);
    const totalPages = Math.ceil(totalUsers / limit);

    // Eliminar campos sensibles de cada usuario
    const safeUsers = users.map(user => {
      const userObj = user.toObject();
      const { password, avatarBuffer, ...safeUser } = userObj;
      return safeUser;
    });

    ResponseHelper.success(res, 'Usuarios obtenidos exitosamente', {
      users: safeUsers,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    next(error);
  }
};

// Rutas para el usuario autenticado (sin permisos especiales) - DEBEN IR PRIMERO
router.get('/me', authMiddleware, getMyProfile);
router.put('/me', authMiddleware, updateMyProfile);
router.put('/me/avatar', authMiddleware, uploadImage.single('avatar'), handleUploadError, updateMyAvatar);

// Rutas para admins (con permisos) - DEBEN IR DESPUÉS
// @ts-ignore
router.get('/', authMiddleware, permissionMiddleware('users', 'getAll'), getAllUsers);
// @ts-ignore
router.put('/profile/avatar', authMiddleware, uploadImage.single('avatar'), handleUploadError, updateAvatar);
// @ts-ignore
router.get('/:id/avatar', getAvatar);
// @ts-ignore
router.get('/:id', authMiddleware, permissionMiddleware('users', 'read'), getOneUser);
// @ts-ignore
router.put('/:id', authMiddleware, permissionMiddleware('users', 'update'), updateUser);

export default router; 