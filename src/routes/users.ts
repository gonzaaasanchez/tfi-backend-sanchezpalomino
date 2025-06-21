import { Router, RequestHandler } from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/audit';
import { getChanges } from '../utils/changeDetector';

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

// Rutas
// @ts-ignore
router.put('/:id', authMiddleware, permissionMiddleware('users', 'update'), updateUser);

export default router; 