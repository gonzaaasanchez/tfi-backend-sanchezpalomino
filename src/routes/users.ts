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

    // Si hay una imagen en el request, guardar buffer y generar URL
    if (req.file) {
      updateData.avatar = `/api/users/${userId}/avatar`;
      updateData.avatarBuffer = req.file.buffer;
      updateData.avatarContentType = req.file.mimetype;
    }

    // Si el usuario envía una URL de avatar en el body, sobrescribir la generada
    if (req.body.avatar && !req.file) {
      updateData.avatar = req.body.avatar;
    }

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Detectar cambios antes de actualizar
    const changes = getChanges(user, updateData);

    // Actualizar el documento sin populate para evitar problemas con roles
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Si hubo cambios, registrarlos
    if (changes.length > 0) {
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      logChanges(
        'User',
        userId.toString(),
        userId.toString(),
        userName,
        changes
      );
    }

    // Convertir a objeto y eliminar campos sensibles
    const userResponse = updatedUser.toObject();
    const { password, avatarBuffer, ...safeUserResponse } = userResponse;

    ResponseHelper.success(
      res,
      'Perfil actualizado exitosamente',
      safeUserResponse
    );
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

    ResponseHelper.success(
      res,
      'Usuario obtenido exitosamente',
      safeUserResponse
    );
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
        { email: searchRegex },
        { phoneNumber: searchRegex },
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
    const safeUsers = users.map((user) => {
      const userObj = user.toObject();
      const { password, avatarBuffer, ...safeUser } = userObj;
      return safeUser;
    });

    ResponseHelper.success(res, 'Usuarios obtenidos exitosamente', {
      items: safeUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /users/:id - Actualizar un usuario específico (solo admins)
const updateUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Si hay una imagen en el request, guardar buffer y generar URL
    if (req.file) {
      updateData.avatar = `/api/users/${userId}/avatar`;
      updateData.avatarBuffer = req.file.buffer;
      updateData.avatarContentType = req.file.mimetype;
    }

    // Si el usuario envía una URL de avatar en el body, sobrescribir la generada
    if (req.body.avatar && !req.file) {
      updateData.avatar = req.body.avatar;
    }

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Detectar cambios antes de actualizar
    const changes = getChanges(user, updateData);

    // Actualizar el documento directamente en la BD sin correr todos los validadores
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    // Si hubo cambios, registrarlos
    if (changes.length > 0) {
      const userName = req.user
        ? `${req.user.firstName} ${req.user.lastName}`
        : 'Sistema';
      const userIdPerformingAction = req.user?._id?.toString() || 'system';
      logChanges('User', userId, userIdPerformingAction, userName, changes);
    }

    ResponseHelper.success(
      res,
      'Usuario actualizado exitosamente',
      updatedUser
    );
  } catch (error) {
    next(error);
  }
};

// PUT /users/me/carer-config - Actualizar configuración de cuidado del usuario autenticado
const updateMyCarerConfig: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const carerConfig = req.body.carerConfig;

    // Validar que solo se envíe carerConfig
    if (Object.keys(req.body).length > 1 || !carerConfig) {
      ResponseHelper.validationError(res, 'Solo se permite actualizar carerConfig');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Detectar cambios antes de actualizar
    const changes = getChanges(user, { carerConfig });

    // Actualizar solo la configuración de cuidado
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { carerConfig },
      { new: true }
    );

    if (!updatedUser) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Si hubo cambios, registrarlos
    if (changes.length > 0) {
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      logChanges(
        'User',
        userId.toString(),
        userId.toString(),
        userName,
        changes
      );
    }

    // Convertir a objeto y eliminar campos sensibles
    const userResponse = updatedUser.toObject();
    const { password, avatarBuffer, ...safeUserResponse } = userResponse;

    ResponseHelper.success(
      res,
      'Configuración de cuidado actualizada exitosamente',
      safeUserResponse
    );
  } catch (error) {
    next(error);
  }
};

// POST /users/me/addresses - Agregar una nueva dirección al usuario autenticado
const addMyAddress: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const newAddress = req.body;

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Agregar la nueva dirección al array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { addresses: newAddress } },
      { new: true }
    );

    if (!updatedUser) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Obtener la dirección recién agregada (la última del array)
    const addedAddress = updatedUser.addresses?.[updatedUser.addresses.length - 1];

    // Registrar el cambio
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges(
      'User',
      userId.toString(),
      userId.toString(),
      userName,
      [{ field: 'addresses', oldValue: 'N/A', newValue: 'Dirección agregada' }]
    );

    ResponseHelper.success(
      res,
      'Dirección agregada exitosamente',
      addedAddress
    );
  } catch (error) {
    next(error);
  }
};

// PUT /users/me/addresses/:index - Actualizar una dirección específica del usuario autenticado
const updateMyAddress: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const addressIndex = parseInt(req.params.index);
    const updatedAddress = req.body;

    // Validar que el índice sea válido
    if (isNaN(addressIndex) || addressIndex < 0) {
      ResponseHelper.validationError(res, 'Índice de dirección inválido');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Verificar que la dirección existe
    if (!user.addresses || addressIndex >= user.addresses.length) {
      ResponseHelper.notFound(res, 'Dirección no encontrada');
      return;
    }

    // Detectar cambios antes de actualizar
    const oldAddress = user.addresses[addressIndex];
    const changes: any[] = [];
    
    // Comparar campos manualmente
    Object.keys(updatedAddress).forEach(key => {
      if ((oldAddress as any)[key] !== (updatedAddress as any)[key]) {
        changes.push({
          field: key,
          oldValue: (oldAddress as any)[key],
          newValue: (updatedAddress as any)[key]
        });
      }
    });

    // Actualizar la dirección específica
    const updateQuery: any = {};
    Object.keys(updatedAddress).forEach(key => {
      updateQuery[`addresses.${addressIndex}.${key}`] = updatedAddress[key];
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateQuery },
      { new: true }
    );

    if (!updatedUser) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Si hubo cambios, registrarlos
    if (changes.length > 0) {
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      logChanges(
        'User',
        userId.toString(),
        userId.toString(),
        userName,
        changes.map(change => ({
          ...change,
          field: `addresses[${addressIndex}].${change.field}`
        }))
      );
    }

    ResponseHelper.success(
      res,
      'Dirección actualizada exitosamente',
      updatedUser.addresses?.[addressIndex]
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /users/me/addresses/:index - Eliminar una dirección específica del usuario autenticado
const deleteMyAddress: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const addressIndex = parseInt(req.params.index);

    // Validar que el índice sea válido
    if (isNaN(addressIndex) || addressIndex < 0) {
      ResponseHelper.validationError(res, 'Índice de dirección inválido');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Verificar que la dirección existe
    if (!user.addresses || addressIndex >= user.addresses.length) {
      ResponseHelper.notFound(res, 'Dirección no encontrada');
      return;
    }

    // Eliminar la dirección específica
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: user.addresses[addressIndex] } },
      { new: true }
    );

    if (!updatedUser) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Registrar el cambio
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges(
      'User',
      userId.toString(),
      userId.toString(),
      userName,
      [{ field: 'addresses', oldValue: 'Dirección eliminada', newValue: 'N/A' }]
    );

    ResponseHelper.success(
      res,
      'Dirección eliminada exitosamente',
      null
    );
  } catch (error) {
    next(error);
  }
};

// Rutas para el usuario autenticado (sin permisos especiales) - DEBEN IR PRIMERO
router.get('/me', authMiddleware, getMyProfile);
router.put(
  '/me',
  authMiddleware,
  uploadImage.single('avatarFile'),
  handleUploadError,
  updateMyProfile
);
router.put('/me/carer-config', authMiddleware, updateMyCarerConfig);

// Rutas para gestionar direcciones
router.post('/me/addresses', authMiddleware, addMyAddress);
router.put('/me/addresses/:index', authMiddleware, updateMyAddress);
router.delete('/me/addresses/:index', authMiddleware, deleteMyAddress);

// Rutas para admins (con permisos) - DEBEN IR DESPUÉS
// @ts-ignore
router.get(
  '/',
  authMiddleware,
  permissionMiddleware('users', 'getAll'),
  getAllUsers
);
// @ts-ignore
router.get('/:id/avatar', getAvatar);
// @ts-ignore
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('users', 'read'),
  getOneUser
);
// @ts-ignore
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('users', 'update'),
  uploadImage.single('avatarFile'),
  handleUploadError,
  updateUser
);

export default router;
