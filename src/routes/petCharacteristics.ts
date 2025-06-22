import { Router, RequestHandler } from 'express';
import PetCharacteristic from '../models/PetCharacteristic';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/audit';
import { getChanges } from '../utils/changeDetector';
import { ResponseHelper } from '../utils/response';

const router = Router();

// POST /pet-characteristics - Crear nueva característica de mascota
const createPetCharacteristic: RequestHandler = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      ResponseHelper.validationError(res, 'El nombre es requerido');
      return;
    }

    // Verificar si la característica ya existe
    const existingCharacteristic = await PetCharacteristic.findOne({ name });
    if (existingCharacteristic) {
      ResponseHelper.validationError(res, 'Ya existe una característica con ese nombre');
      return;
    }

    // Crear la característica
    const characteristic = new PetCharacteristic({ name });
    await characteristic.save();

    // Log de creación
    const userName = req.user
      ? `${req.user.firstName} ${req.user.lastName}`
      : 'Sistema';
    const userId = req.user?._id?.toString() || 'system';
    logChanges('PetCharacteristic', characteristic._id?.toString() ?? '', userId, userName, [
      { field: 'name', oldValue: null, newValue: name },
    ]);

    ResponseHelper.success(
      res,
      'Característica de mascota creada exitosamente',
      characteristic,
      201
    );
  } catch (error) {
    next(error);
  }
};

// GET /pet-characteristics - Obtener todas las características de mascota
const getAllPetCharacteristics: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Construir filtros opcionales
    const filters: any = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filters.name = searchRegex;
    }

    // Obtener características con paginación y filtros
    const characteristics = await PetCharacteristic.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Obtener el total para la paginación
    const totalCharacteristics = await PetCharacteristic.countDocuments(filters);
    const totalPages = Math.ceil(totalCharacteristics / limit);

    ResponseHelper.success(res, 'Características de mascota obtenidas exitosamente', {
      items: characteristics,
      pagination: {
        page,
        limit,
        total: totalCharacteristics,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /pet-characteristics/:id - Obtener característica específica
const getPetCharacteristic: RequestHandler = async (req, res, next) => {
  try {
    const characteristicId = req.params.id;

    const characteristic = await PetCharacteristic.findById(characteristicId);
    if (!characteristic) {
      ResponseHelper.notFound(res, 'Característica de mascota no encontrada');
      return;
    }

    ResponseHelper.success(res, 'Característica de mascota obtenida exitosamente', characteristic);
  } catch (error) {
    next(error);
  }
};

// PUT /pet-characteristics/:id - Actualizar característica de mascota
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

    // Verificar si ya existe otra característica con el mismo nombre
    const existingCharacteristic = await PetCharacteristic.findOne({ 
      name, 
      _id: { $ne: characteristicId } 
    });
    if (existingCharacteristic) {
      ResponseHelper.validationError(res, 'Ya existe una característica con ese nombre');
      return;
    }

    // Detectar cambios antes de actualizar
    const changes = getChanges(characteristic, { name });

    // Actualizar la característica
    const updatedCharacteristic = await PetCharacteristic.findByIdAndUpdate(
      characteristicId,
      { name },
      { new: true }
    );

    if (!updatedCharacteristic) {
      ResponseHelper.notFound(res, 'Característica de mascota no encontrada');
      return;
    }

    // Si hubo cambios, registrarlos
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
      updatedCharacteristic
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /pet-characteristics/:id - Eliminar característica de mascota
const deletePetCharacteristic: RequestHandler = async (req, res, next) => {
  try {
    const characteristicId = req.params.id;

    const characteristic = await PetCharacteristic.findById(characteristicId);
    if (!characteristic) {
      ResponseHelper.notFound(res, 'Característica de mascota no encontrada');
      return;
    }

    // TODO: Verificar si hay valores de características usando esta característica antes de eliminar
    // Por ahora solo eliminamos directamente

    await PetCharacteristic.findByIdAndDelete(characteristicId);

    // Log de eliminación
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges(
      'PetCharacteristic',
      characteristicId,
      req.user._id.toString(),
      userName,
      [
        { field: 'name', oldValue: characteristic.name, newValue: null },
      ]
    );

    ResponseHelper.success(res, 'Característica de mascota eliminada exitosamente');
  } catch (error) {
    next(error);
  }
};

// Rutas - Usar sistema de permisos correcto
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/', authMiddleware, permissionMiddleware('petCharacteristics', 'create'), createPetCharacteristic);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/', authMiddleware, permissionMiddleware('petCharacteristics', 'getAll'), getAllPetCharacteristics);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/:id', authMiddleware, permissionMiddleware('petCharacteristics', 'read'), getPetCharacteristic);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.put('/:id', authMiddleware, permissionMiddleware('petCharacteristics', 'update'), updatePetCharacteristic);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.delete('/:id', authMiddleware, permissionMiddleware('petCharacteristics', 'delete'), deletePetCharacteristic);

export default router; 