import { Router, RequestHandler } from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/audit';
import { getChanges } from '../utils/changeDetector';
import { uploadImage, handleUploadError } from '../middleware/upload';
import { ResponseHelper } from '../utils/response';

const router = Router();

// PUT /users/:id - Actualizar un usuario específico
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

// PUT /users/profile/avatar - Actualizar avatar del usuario autenticado
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
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updateData.avatar = `${baseUrl}/users/${userId}/avatar`;
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

// Rutas
// @ts-ignore
router.put('/profile/avatar', authMiddleware, uploadImage.single('avatar'), handleUploadError, updateAvatar);
// @ts-ignore
router.put('/:id', authMiddleware, permissionMiddleware('users', 'update'), updateUser);

export default router; 