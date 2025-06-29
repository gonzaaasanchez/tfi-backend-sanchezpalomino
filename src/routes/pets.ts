import { Router, RequestHandler } from 'express';
import Pet from '../models/Pet';
import PetType from '../models/PetType';
import PetCharacteristic from '../models/PetCharacteristic';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/audit';
import { getChanges } from '../utils/changeDetector';
import { uploadImage, handleUploadError } from '../middleware/upload';
import { ResponseHelper } from '../utils/response';
import { sanitizeMongooseDoc } from '../utils/common';

const router = Router();

// ========================================
// USER SERVICES (Own pets)
// ========================================

// POST /pets - Create new pet
const createPet: RequestHandler = async (req, res, next) => {
  try {
    const { name, comment, petTypeId, characteristics } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    if (!name || !petTypeId) {
      ResponseHelper.validationError(
        res,
        'El nombre y tipo de mascota son requeridos'
      );
      return;
    }

    // Parse characteristics if it comes as JSON string (common in multipart/form-data)
    let parsedCharacteristics = characteristics;
    if (typeof characteristics === 'string') {
      try {
        parsedCharacteristics = JSON.parse(characteristics);
      } catch (error) {
        ResponseHelper.validationError(
          res,
          'Formato de características inválido'
        );
        return;
      }
    }

    // Verify that the pet type exists
    const petType = await PetType.findById(petTypeId);
    if (!petType) {
      ResponseHelper.validationError(res, 'Tipo de mascota no encontrado');
      return;
    }

    // Verify that the characteristics exist (if provided)
    if (parsedCharacteristics && parsedCharacteristics.length > 0) {
      const characteristicIds = parsedCharacteristics.map(
        (c: any) => c.characteristicId
      );
      const existingCharacteristics = await PetCharacteristic.find({
        _id: { $in: characteristicIds },
      });
      if (existingCharacteristics.length !== characteristicIds.length) {
        ResponseHelper.validationError(
          res,
          'Una o más características no encontradas'
        );
        return;
      }
    }

    // Prepare pet data
    const petData: any = {
      name,
      comment,
      petType: petTypeId,
      characteristics: parsedCharacteristics
        ? parsedCharacteristics.map((c: any) => ({
            characteristic: c.characteristicId,
            value: c.value,
          }))
        : [],
      owner: userId,
    };

    // If there's an image in the request, save buffer and generate URL
    if (req.file) {
      petData.avatar = `/api/pets/avatar/${userId}`; // Temporary URL, will be updated later
      petData.avatarBuffer = req.file.buffer;
      petData.avatarContentType = req.file.mimetype;
    }

    // Create the pet
    const pet = new Pet(petData);
    await pet.save();

    // Update avatar URL with the real pet ID
    if (req.file) {
      pet.avatar = `/api/pets/${pet._id}/avatar`;
      await pet.save();
    }

    // Populate for response
    await pet.populate(['petType', 'characteristics.characteristic', 'owner']);

    // Creation log
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges('Pet', pet._id?.toString() ?? '', userId.toString(), userName, [
      { field: 'name', oldValue: null, newValue: name },
      { field: 'petType', oldValue: null, newValue: petType.name },
    ]);

    ResponseHelper.success(
      res,
      'Mascota creada exitosamente',
      sanitizeMongooseDoc(pet),
      201
    );
  } catch (error) {
    next(error);
  }
};

// GET /pets/my - Get authenticated user's pets
const getMyPets: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filters
    const filters: any = { owner: userId };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filters.name = searchRegex;
    }

    if (req.query.petType) {
      filters.petType = req.query.petType;
    }

    // Get pets with pagination and filters
    const pets = await Pet.find(filters)
      .populate(['petType', 'characteristics.characteristic', 'owner'])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total for pagination
    const totalPets = await Pet.countDocuments(filters);
    const totalPages = Math.ceil(totalPets / limit);

    ResponseHelper.success(res, 'Pets obtained successfully', {
      items: pets.map((pet) => sanitizeMongooseDoc(pet)),
      pagination: {
        page,
        limit,
        total: totalPets,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /pets/:id - Get specific pet (only if owner)
const getPet: RequestHandler = async (req, res, next) => {
  try {
    const petId = req.params.id;
    const userId = req.user?._id;

    const pet = await Pet.findById(petId).populate([
      'petType',
      'characteristics.characteristic',
      'owner',
    ]);
    if (!pet) {
      ResponseHelper.notFound(res, 'Mascota no encontrada');
      return;
    }

    // Verify permissions: only the owner can view the pet
    if (pet.owner._id.toString() !== userId?.toString()) {
      ResponseHelper.forbidden(res, 'No tienes permisos para ver esta mascota');
      return;
    }

    ResponseHelper.success(
      res,
      'Mascota obtenida exitosamente',
      sanitizeMongooseDoc(pet)
    );
  } catch (error) {
    next(error);
  }
};

// PUT /pets/:id - Update pet (only if owner)
const updatePet: RequestHandler = async (req, res, next) => {
  try {
    const petId = req.params.id;
    const userId = req.user?._id;
    const { name, comment, petTypeId, characteristics } = req.body;

    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      ResponseHelper.notFound(res, 'Mascota no encontrada');
      return;
    }

    // Verify permissions: only the owner can update the pet
    if (pet.owner.toString() !== userId.toString()) {
      ResponseHelper.forbidden(
        res,
        'No tienes permisos para actualizar esta mascota'
      );
      return;
    }

    // Parse characteristics if it comes as JSON string (common in multipart/form-data)
    let parsedCharacteristics = characteristics;
    if (typeof characteristics === 'string') {
      try {
        parsedCharacteristics = JSON.parse(characteristics);
      } catch (error) {
        ResponseHelper.validationError(
          res,
          'Formato de características inválido'
        );
        return;
      }
    }

    // Verify that the pet type exists (if updating)
    if (petTypeId) {
      const petType = await PetType.findById(petTypeId);
      if (!petType) {
        ResponseHelper.validationError(res, 'Tipo de mascota no encontrado');
        return;
      }
    }

    // Verify that the characteristics exist (if updating)
    if (parsedCharacteristics && parsedCharacteristics.length > 0) {
      const characteristicIds = parsedCharacteristics.map(
        (c: any) => c.characteristicId
      );
      const existingCharacteristics = await PetCharacteristic.find({
        _id: { $in: characteristicIds },
      });
      if (existingCharacteristics.length !== characteristicIds.length) {
        ResponseHelper.validationError(
          res,
          'Una o más características no encontradas'
        );
        return;
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (comment !== undefined) updateData.comment = comment;
    if (petTypeId) updateData.petType = petTypeId;
    if (parsedCharacteristics !== undefined)
      updateData.characteristics = parsedCharacteristics.map((c: any) => ({
        characteristic: c.characteristicId,
        value: c.value,
      }));

    // If there's an image in the request, save buffer and generate URL
    if (req.file) {
      updateData.avatar = `/api/pets/${petId}/avatar`;
      updateData.avatarBuffer = req.file.buffer;
      updateData.avatarContentType = req.file.mimetype;
    }

    // Detect changes before updating
    const changes = getChanges(pet, updateData);

    // Update the pet
    const updatedPet = await Pet.findByIdAndUpdate(petId, updateData, {
      new: true,
    }).populate(['petType', 'characteristics.characteristic', 'owner']);

    if (!updatedPet) {
      ResponseHelper.notFound(res, 'Mascota no encontrada');
      return;
    }

    // If there were changes, log them
    if (changes.length > 0) {
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      logChanges('Pet', petId, userId.toString(), userName, changes);
    }

    ResponseHelper.success(
      res,
      'Mascota actualizada exitosamente',
      sanitizeMongooseDoc(updatedPet)
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /pets/:id - Delete pet (only if owner)
const deletePet: RequestHandler = async (req, res, next) => {
  try {
    const petId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      ResponseHelper.notFound(res, 'Mascota no encontrada');
      return;
    }

    // Verify permissions: only the owner can delete the pet
    if (pet.owner.toString() !== userId.toString()) {
      ResponseHelper.forbidden(
        res,
        'No tienes permisos para eliminar esta mascota'
      );
      return;
    }

    await Pet.findByIdAndDelete(petId);

    // Deletion log
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges('Pet', petId, userId.toString(), userName, [
      { field: 'name', oldValue: pet.name, newValue: null },
    ]);

    ResponseHelper.success(res, 'Mascota eliminada exitosamente');
  } catch (error) {
    next(error);
  }
};

// ========================================
// ADMIN SERVICES (Read-only for all pets)
// ========================================

// GET /pets/admin/all - Get all pets (admins only)
const getAllPets: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filters
    const filters: any = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filters.name = searchRegex;
    }

    if (req.query.petType) {
      filters.petType = req.query.petType;
    }

    if (req.query.owner) {
      filters.owner = req.query.owner;
    }

    // Get pets with pagination and filters
    const pets = await Pet.find(filters)
      .populate(['petType', 'characteristics.characteristic', 'owner'])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total for pagination
    const totalPets = await Pet.countDocuments(filters);
    const totalPages = Math.ceil(totalPets / limit);

    ResponseHelper.success(res, 'Mascotas obtenidas exitosamente', {
      items: pets.map((pet) => sanitizeMongooseDoc(pet)),
      pagination: {
        page,
        limit,
        total: totalPets,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /pets/admin/:id - Get any pet (admins only)
const getPetAsAdmin: RequestHandler = async (req, res, next) => {
  try {
    const petId = req.params.id;

    const pet = await Pet.findById(petId).populate([
      'petType',
      'characteristics.characteristic',
      'owner',
    ]);
    if (!pet) {
      ResponseHelper.notFound(res, 'Mascota no encontrada');
      return;
    }

    ResponseHelper.success(
      res,
      'Mascota obtenida exitosamente',
      sanitizeMongooseDoc(pet)
    );
  } catch (error) {
    next(error);
  }
};

// ========================================
// PUBLIC SERVICES
// ========================================

// GET /pets/:id/avatar - Get pet avatar (public)
const getAvatar: RequestHandler = async (req, res, next) => {
  try {
    const petId = req.params.id;

    const pet = await Pet.findById(petId);
    if (!pet) {
      ResponseHelper.notFound(res, 'Mascota no encontrada');
      return;
    }

    if (!pet.avatarBuffer || !pet.avatarContentType) {
      ResponseHelper.notFound(res, 'Avatar no encontrado');
      return;
    }

    // Set content type and send buffer
    res.set('Content-Type', pet.avatarContentType);
    res.send(pet.avatarBuffer);
  } catch (error) {
    next(error);
  }
};

// ========================================
// ROUTES - USER SERVICES
// ========================================
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post(
  '/',
  authMiddleware,
  permissionMiddleware('pets', 'create'),
  uploadImage.single('avatarFile'),
  handleUploadError,
  createPet
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/my',
  authMiddleware,
  permissionMiddleware('pets', 'read'),
  getMyPets
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('pets', 'read'),
  getPet
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('pets', 'update'),
  uploadImage.single('avatarFile'),
  handleUploadError,
  updatePet
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('pets', 'delete'),
  deletePet
);

// ========================================
// ROUTES - ADMIN SERVICES
// ========================================
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/admin/all',
  authMiddleware,
  permissionMiddleware('pets', 'getAll'),
  getAllPets
);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get(
  '/admin/:id',
  authMiddleware,
  permissionMiddleware('pets', 'read'),
  getPetAsAdmin
);

// ========================================
// ROUTES - PUBLIC SERVICES
// ========================================
router.get('/:id/avatar', getAvatar);

export default router;
