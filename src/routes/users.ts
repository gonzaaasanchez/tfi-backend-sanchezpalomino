import { Router, RequestHandler } from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/audit';
import { getChanges } from '../utils/changeDetector';
import { uploadImage, handleUploadError } from '../middleware/upload';

const router = Router();

// PUT /users/:id - Actualizar un usuario específico
const updateUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
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

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser,
    });

  } catch (error) {
    next(error);
  }
};

// PUT /users/profile/avatar - Actualizar avatar del usuario autenticado
const updateAvatar: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'No autorizado' });
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
      res.status(400).json({ success: false, message: 'No se proporcionó ninguna imagen' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
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

    res.json({
      success: true,
      message: 'Avatar actualizado exitosamente',
      data: updatedUser,
    });

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