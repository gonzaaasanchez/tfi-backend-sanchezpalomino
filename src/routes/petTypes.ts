import { Router, RequestHandler } from 'express';
import PetType from '../models/PetType';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/audit';
import { getChanges } from '../utils/changeDetector';
import { ResponseHelper } from '../utils/response';

const router = Router();

// POST /pet-types - Crear nuevo tipo de mascota
const createPetType: RequestHandler = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      ResponseHelper.validationError(res, 'El nombre es requerido');
      return;
    }

    // Verificar si el tipo de mascota ya existe
    const existingPetType = await PetType.findOne({ name });
    if (existingPetType) {
      ResponseHelper.validationError(
        res,
        'Ya existe un tipo de mascota con ese nombre'
      );
      return;
    }

    // Crear el tipo de mascota
    const petType = new PetType({ name });
    await petType.save();

    // Log de creación
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
      petType,
      201
    );
  } catch (error) {
    next(error);
  }
};

// GET /pet-types - Obtener todos los tipos de mascota
const getAllPetTypes: RequestHandler = async (req, res, next) => {
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

    // Obtener tipos de mascota con paginación y filtros
    const petTypes = await PetType.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Obtener el total para la paginación
    const totalPetTypes = await PetType.countDocuments(filters);
    const totalPages = Math.ceil(totalPetTypes / limit);

    ResponseHelper.success(res, 'Tipos de mascota obtenidos exitosamente', {
      items: petTypes,
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

// GET /pet-types/:id - Obtener tipo de mascota específico
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
      petType
    );
  } catch (error) {
    next(error);
  }
};

// PUT /pet-types/:id - Actualizar tipo de mascota
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

    // Verificar si ya existe otro tipo con el mismo nombre
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

    // Detectar cambios antes de actualizar
    const changes = getChanges(petType, { name });

    // Actualizar el tipo de mascota
    const updatedPetType = await PetType.findByIdAndUpdate(
      petTypeId,
      { name },
      { new: true }
    );

    if (!updatedPetType) {
      ResponseHelper.notFound(res, 'Tipo de mascota no encontrado');
      return;
    }

    // Si hubo cambios, registrarlos
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
      updatedPetType
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /pet-types/:id - Eliminar tipo de mascota
const deletePetType: RequestHandler = async (req, res, next) => {
  try {
    const petTypeId = req.params.id;

    const petType = await PetType.findById(petTypeId);
    if (!petType) {
      ResponseHelper.notFound(res, 'Tipo de mascota no encontrado');
      return;
    }

    // TODO: Verificar si hay mascotas usando este tipo antes de eliminar
    // Por ahora solo eliminamos directamente

    await PetType.findByIdAndDelete(petTypeId);

    // Log de eliminación
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges('PetType', petTypeId, req.user._id.toString(), userName, [
      { field: 'name', oldValue: petType.name, newValue: null },
    ]);

    ResponseHelper.success(res, 'Tipo de mascota eliminado exitosamente');
  } catch (error) {
    next(error);
  }
};

// GET /pet-types/all - Obtener todos los tipos de mascota sin paginación
const getAllPetTypesSimple: RequestHandler = async (req, res, next) => {
  try {
    // Obtener todos los tipos de mascota ordenados por nombre
    const petTypes = await PetType.find({})
      .sort({ name: 1 })
      .select('_id name');

    ResponseHelper.success(res, 'Tipos de mascota obtenidos exitosamente', petTypes);
  } catch (error) {
    next(error);
  }
};

// Rutas - Usar sistema de permisos correcto
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
