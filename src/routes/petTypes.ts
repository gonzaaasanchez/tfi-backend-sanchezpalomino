import { Router, RequestHandler } from 'express';
import PetType from '../models/PetType';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/audit';
import { getChanges } from '../utils/changeDetector';
import { ResponseHelper } from '../utils/response';

const router = Router();

// POST /pet-types - Create new pet type
const createPetType: RequestHandler = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      ResponseHelper.validationError(res, 'El nombre es requerido');
      return;
    }

    // Check if pet type already exists
    const existingPetType = await PetType.findOne({ name });
    if (existingPetType) {
      ResponseHelper.validationError(
        res,
        'Ya existe un tipo de mascota con ese nombre'
      );
      return;
    }

    // Create the pet type
    const petType = new PetType({ name });
    await petType.save();

    // Creation log
    const userName = req.user
      ? `${req.user.firstName} ${req.user.lastName}`
      : 'Sistema';
    const userId = req.user?._id?.toString() || 'system';
    logChanges('PetType', petType._id?.toString() ?? '', userId, userName, [
      { field: 'name', oldValue: null, newValue: name },
    ]);

    ResponseHelper.success(
      res,
      'Tipo de mascota creado exitosamente',
      {
        id: petType._id,
        name: petType.name,
        createdAt: petType.createdAt,
        updatedAt: petType.updatedAt,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// GET /pet-types - Get all pet types
const getAllPetTypes: RequestHandler = async (req, res, next) => {
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

    // Get pet types with pagination and filters
    const petTypes = await PetType.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total for pagination
    const totalPetTypes = await PetType.countDocuments(filters);
    const totalPages = Math.ceil(totalPetTypes / limit);

    ResponseHelper.success(res, 'Tipos de mascota obtenidos exitosamente', {
      items: petTypes.map((petType) => ({
        id: petType._id,
        name: petType.name,
        createdAt: petType.createdAt,
        updatedAt: petType.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total: totalPetTypes,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /pet-types/:id - Get specific pet type
const getPetType: RequestHandler = async (req, res, next) => {
  try {
    const petTypeId = req.params.id;

    const petType = await PetType.findById(petTypeId);
    if (!petType) {
      ResponseHelper.notFound(res, 'Tipo de mascota no encontrado');
      return;
    }

    ResponseHelper.success(
      res,
      'Tipo de mascota obtenido exitosamente',
      {
        id: petType._id,
        name: petType.name,
        createdAt: petType.createdAt,
        updatedAt: petType.updatedAt,
      }
    );
  } catch (error) {
    next(error);
  }
};

// PUT /pet-types/:id - Update pet type
const updatePetType: RequestHandler = async (req, res, next) => {
  try {
    const petTypeId = req.params.id;
    const { name } = req.body;

    if (!name) {
      ResponseHelper.validationError(res, 'El nombre es requerido');
      return;
    }

    const petType = await PetType.findById(petTypeId);
    if (!petType) {
      ResponseHelper.notFound(res, 'Tipo de mascota no encontrado');
      return;
    }

    // Check if another type with the same name already exists
    const existingPetType = await PetType.findOne({
      name,
      _id: { $ne: petTypeId },
    });
    if (existingPetType) {
      ResponseHelper.validationError(
        res,
        'Ya existe un tipo de mascota con ese nombre'
      );
      return;
    }

    // Detect changes before updating
    const changes = getChanges(petType, { name });

    // Update the pet type
    const updatedPetType = await PetType.findByIdAndUpdate(
      petTypeId,
      { name },
      { new: true }
    );

    if (!updatedPetType) {
      ResponseHelper.notFound(res, 'Tipo de mascota no encontrado');
      return;
    }

    // If there were changes, log them
    if (changes.length > 0) {
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      logChanges(
        'PetType',
        petTypeId,
        req.user._id.toString(),
        userName,
        changes
      );
    }

    ResponseHelper.success(
      res,
      'Tipo de mascota actualizado exitosamente',
      {
        id: updatedPetType._id,
        name: updatedPetType.name,
        createdAt: updatedPetType.createdAt,
        updatedAt: updatedPetType.updatedAt,
      }
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /pet-types/:id - Delete pet type
const deletePetType: RequestHandler = async (req, res, next) => {
  try {
    const petTypeId = req.params.id;

    const petType = await PetType.findById(petTypeId);
    if (!petType) {
      ResponseHelper.notFound(res, 'Tipo de mascota no encontrado');
      return;
    }

    // TODO: Check if there are pets using this type before deleting
    // For now just delete directly

    await PetType.findByIdAndDelete(petTypeId);

    // Deletion log
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges('PetType', petTypeId, req.user._id.toString(), userName, [
      { field: 'name', oldValue: petType.name, newValue: null },
    ]);

    ResponseHelper.success(res, 'Tipo de mascota eliminado exitosamente');
  } catch (error) {
    next(error);
  }
};

// GET /pet-types/all - Get all pet types without pagination
const getAllPetTypesSimple: RequestHandler = async (req, res, next) => {
  try {
    // Get all pet types ordered by name
    const petTypes = await PetType.find({})
      .sort({ name: 1 })
      .select('_id name');

    ResponseHelper.success(
      res,
      'Tipos de mascota obtenidos exitosamente',
      petTypes
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
  permissionMiddleware('petTypes', 'create'),
  createPetType
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/all',
  authMiddleware,
  permissionMiddleware('petTypes', 'read'),
  getAllPetTypesSimple
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/',
  authMiddleware,
  permissionMiddleware('petTypes', 'getAll'),
  getAllPetTypes
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('petTypes', 'read'),
  getPetType
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('petTypes', 'update'),
  updatePetType
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('petTypes', 'delete'),
  deletePetType
);

export default router;
