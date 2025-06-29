import { Router, RequestHandler } from 'express';
import PetCharacteristic from '../models/PetCharacteristic';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/audit';
import { getChanges } from '../utils/changeDetector';
import { ResponseHelper } from '../utils/response';
import { sanitizeMongooseDoc } from '../utils/common';

const router = Router();

// POST /pet-characteristics - Create new pet characteristic
const createPetCharacteristic: RequestHandler = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      ResponseHelper.validationError(res, 'El nombre es requerido');
      return;
    }

    // Check if characteristic already exists
    const existingCharacteristic = await PetCharacteristic.findOne({ name });
    if (existingCharacteristic) {
      ResponseHelper.validationError(
        res,
        'Ya existe una característica con ese nombre'
      );
      return;
    }

    // Create the characteristic
    const characteristic = new PetCharacteristic({ name });
    await characteristic.save();

    // Creation log
    const userName = req.user
      ? `${req.user.firstName} ${req.user.lastName}`
      : 'Sistema';
    const userId = req.user?._id?.toString() || 'system';
    logChanges(
      'PetCharacteristic',
      characteristic._id?.toString() ?? '',
      userId,
      userName,
      [{ field: 'name', oldValue: null, newValue: name }]
    );

    ResponseHelper.success(
      res,
      'Característica de mascota creada exitosamente',
      sanitizeMongooseDoc(characteristic),
      201
    );
  } catch (error) {
    next(error);
  }
};

// GET /pet-characteristics - Get all pet characteristics
const getAllPetCharacteristics: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build optional filters
    const filters: any = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filters.name = searchRegex;
    }

    // Get characteristics with pagination and filters
    const characteristics = await PetCharacteristic.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total for pagination
    const totalCharacteristics = await PetCharacteristic.countDocuments(
      filters
    );
    const totalPages = Math.ceil(totalCharacteristics / limit);

    ResponseHelper.success(
      res,
      'Características de mascota obtenidas exitosamente',
      {
        items: characteristics.map((characteristic) =>
          sanitizeMongooseDoc(characteristic)
        ),
        pagination: {
          page,
          limit,
          total: totalCharacteristics,
          totalPages,
        },
      }
    );
  } catch (error) {
    next(error);
  }
};

// GET /pet-characteristics/:id - Get specific characteristic
const getPetCharacteristic: RequestHandler = async (req, res, next) => {
  try {
    const characteristicId = req.params.id;

    const characteristic = await PetCharacteristic.findById(characteristicId);
    if (!characteristic) {
      ResponseHelper.notFound(res, 'Característica de mascota no encontrada');
      return;
    }

    ResponseHelper.success(
      res,
      'Característica de mascota obtenida exitosamente',
      sanitizeMongooseDoc(characteristic)
    );
  } catch (error) {
    next(error);
  }
};

// PUT /pet-characteristics/:id - Update pet characteristic
const updatePetCharacteristic: RequestHandler = async (req, res, next) => {
  try {
    const characteristicId = req.params.id;
    const { name } = req.body;

    if (!name) {
      ResponseHelper.validationError(res, 'El nombre es requerido');
      return;
    }

    const characteristic = await PetCharacteristic.findById(characteristicId);
    if (!characteristic) {
      ResponseHelper.notFound(res, 'Característica de mascota no encontrada');
      return;
    }

    // Check if another characteristic with the same name already exists
    const existingCharacteristic = await PetCharacteristic.findOne({
      name,
      _id: { $ne: characteristicId },
    });
    if (existingCharacteristic) {
      ResponseHelper.validationError(
        res,
        'Ya existe una característica con ese nombre'
      );
      return;
    }

    // Detect changes before updating
    const changes = getChanges(characteristic, { name });

    // Update the characteristic
    const updatedCharacteristic = await PetCharacteristic.findByIdAndUpdate(
      characteristicId,
      { name },
      { new: true }
    );

    if (!updatedCharacteristic) {
      ResponseHelper.notFound(res, 'Característica de mascota no encontrada');
      return;
    }

    // If there were changes, log them
    if (changes.length > 0) {
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      logChanges(
        'PetCharacteristic',
        characteristicId,
        req.user._id.toString(),
        userName,
        changes
      );
    }

    ResponseHelper.success(
      res,
      'Característica de mascota actualizada exitosamente',
      sanitizeMongooseDoc(updatedCharacteristic)
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /pet-characteristics/:id - Delete pet characteristic
const deletePetCharacteristic: RequestHandler = async (req, res, next) => {
  try {
    const characteristicId = req.params.id;

    const characteristic = await PetCharacteristic.findById(characteristicId);
    if (!characteristic) {
      ResponseHelper.notFound(res, 'Característica de mascota no encontrada');
      return;
    }

    // TODO: Check if there are characteristic values using this characteristic before deleting
    // For now just delete directly

    await PetCharacteristic.findByIdAndDelete(characteristicId);

    // Deletion log
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges(
      'PetCharacteristic',
      characteristicId,
      req.user._id.toString(),
      userName,
      [{ field: 'name', oldValue: characteristic.name, newValue: null }]
    );

    ResponseHelper.success(
      res,
      'Característica de mascota eliminada exitosamente'
    );
  } catch (error) {
    next(error);
  }
};

// ========================================
// ROUTES - Use correct permission system
// ========================================
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post(
  '/',
  authMiddleware,
  permissionMiddleware('petCharacteristics', 'create'),
  createPetCharacteristic
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/',
  authMiddleware,
  permissionMiddleware('petCharacteristics', 'getAll'),
  getAllPetCharacteristics
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('petCharacteristics', 'read'),
  getPetCharacteristic
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('petCharacteristics', 'update'),
  updatePetCharacteristic
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('petCharacteristics', 'delete'),
  deletePetCharacteristic
);

export default router;
