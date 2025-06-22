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

const router = Router();

// ========================================
// SERVICIOS DE USUARIO (Mascotas propias)
// ========================================

// POST /pets - Crear nueva mascota
const createPet: RequestHandler = async (req, res, next) => {
  try {
    const { name, comment, petTypeId, characteristics } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    if (!name || !petTypeId) {
      ResponseHelper.validationError(res, 'El nombre y tipo de mascota son requeridos');
      return;
    }

    // Verificar que el tipo de mascota existe
    const petType = await PetType.findById(petTypeId);
    if (!petType) {
      ResponseHelper.validationError(res, 'Tipo de mascota no encontrado');
      return;
    }

    // Verificar que las características existen (si se proporcionan)
    if (characteristics && characteristics.length > 0) {
      const characteristicIds = characteristics.map((c: any) => c.characteristicId);
      const existingCharacteristics = await PetCharacteristic.find({
        _id: { $in: characteristicIds }
      });
      if (existingCharacteristics.length !== characteristicIds.length) {
        ResponseHelper.validationError(res, 'Una o más características no encontradas');
        return;
      }
    }

    // Preparar datos de la mascota
    const petData: any = {
      name,
      comment,
      petType: petTypeId,
      characteristics: characteristics ? characteristics.map((c: any) => ({
        characteristic: c.characteristicId,
        value: c.value
      })) : [],
      owner: userId,
    };

    // Si hay una imagen en el request, guardar buffer y generar URL
    if (req.file) {
      petData.avatar = `/api/pets/avatar/${userId}`; // URL temporal, se actualizará después
      petData.avatarBuffer = req.file.buffer;
      petData.avatarContentType = req.file.mimetype;
    }

    // Crear la mascota
    const pet = new Pet(petData);
    await pet.save();

    // Actualizar la URL del avatar con el ID real de la mascota
    if (req.file) {
      pet.avatar = `/api/pets/${pet._id}/avatar`;
      await pet.save();
    }

    // Populate para la respuesta
    await pet.populate(['petType', 'characteristics.characteristic', 'owner']);

    // Log de creación
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges('Pet', pet._id?.toString() ?? '', userId.toString(), userName, [
      { field: 'name', oldValue: null, newValue: name },
      { field: 'petType', oldValue: null, newValue: petType.name },
    ]);

    ResponseHelper.success(
      res,
      'Mascota creada exitosamente',
      {
        id: pet._id,
        name: pet.name,
        comment: pet.comment,
        avatar: pet.avatar,
        petType: {
          id: (pet.petType as any)._id,
          name: (pet.petType as any).name
        },
        characteristics: pet.characteristics.map(char => ({
          id: (char.characteristic as any)._id,
          name: (char.characteristic as any).name,
          value: char.value
        })),
        owner: {
          id: (pet.owner as any)._id,
          name: `${(pet.owner as any).firstName} ${(pet.owner as any).lastName}`,
          email: (pet.owner as any).email
        },
        createdAt: pet.createdAt,
        updatedAt: pet.updatedAt
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// GET /pets/my - Obtener mascotas del usuario autenticado
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

    // Construir filtros
    const filters: any = { owner: userId };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filters.name = searchRegex;
    }

    if (req.query.petType) {
      filters.petType = req.query.petType;
    }

    // Obtener mascotas con paginación y filtros
    const pets = await Pet.find(filters)
      .populate(['petType', 'characteristics.characteristic', 'owner'])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Obtener el total para la paginación
    const totalPets = await Pet.countDocuments(filters);
    const totalPages = Math.ceil(totalPets / limit);

    ResponseHelper.success(res, 'Mascotas obtenidas exitosamente', {
      items: pets.map(pet => ({
        id: pet._id,
        name: pet.name,
        comment: pet.comment,
        avatar: pet.avatar,
        petType: {
          id: (pet.petType as any)._id,
          name: (pet.petType as any).name
        },
        characteristics: pet.characteristics.map(char => ({
          id: (char.characteristic as any)._id,
          name: (char.characteristic as any).name,
          value: char.value
        })),
        owner: {
          id: (pet.owner as any)._id,
          name: `${(pet.owner as any).firstName} ${(pet.owner as any).lastName}`,
          email: (pet.owner as any).email
        },
        createdAt: pet.createdAt,
        updatedAt: pet.updatedAt
      })),
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

// GET /pets/:id - Obtener mascota específica (solo si es propietario)
const getPet: RequestHandler = async (req, res, next) => {
  try {
    const petId = req.params.id;
    const userId = req.user?._id;

    const pet = await Pet.findById(petId).populate(['petType', 'characteristics.characteristic', 'owner']);
    if (!pet) {
      ResponseHelper.notFound(res, 'Mascota no encontrada');
      return;
    }

    // Verificar permisos: solo el propietario puede ver la mascota
    if (pet.owner._id.toString() !== userId?.toString()) {
      ResponseHelper.forbidden(res, 'No tienes permisos para ver esta mascota');
      return;
    }

    ResponseHelper.success(res, 'Mascota obtenida exitosamente', pet);
  } catch (error) {
    next(error);
  }
};

// PUT /pets/:id - Actualizar mascota (solo si es propietario)
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

    // Verificar permisos: solo el propietario puede actualizar la mascota
    if (pet.owner.toString() !== userId.toString()) {
      ResponseHelper.forbidden(res, 'No tienes permisos para actualizar esta mascota');
      return;
    }

    // Verificar que el tipo de mascota existe (si se actualiza)
    if (petTypeId) {
      const petType = await PetType.findById(petTypeId);
      if (!petType) {
        ResponseHelper.validationError(res, 'Tipo de mascota no encontrado');
        return;
      }
    }

    // Verificar que las características existen (si se actualizan)
    if (characteristics && characteristics.length > 0) {
      const characteristicIds = characteristics.map((c: any) => c.characteristicId);
      const existingCharacteristics = await PetCharacteristic.find({
        _id: { $in: characteristicIds }
      });
      if (existingCharacteristics.length !== characteristicIds.length) {
        ResponseHelper.validationError(res, 'Una o más características no encontradas');
        return;
      }
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (name) updateData.name = name;
    if (comment !== undefined) updateData.comment = comment;
    if (petTypeId) updateData.petType = petTypeId;
    if (characteristics !== undefined) updateData.characteristics = characteristics.map((c: any) => ({
      characteristic: c.characteristicId,
      value: c.value
    }));

    // Si hay una imagen en el request, guardar buffer y generar URL
    if (req.file) {
      updateData.avatar = `/api/pets/${petId}/avatar`;
      updateData.avatarBuffer = req.file.buffer;
      updateData.avatarContentType = req.file.mimetype;
    }

    // Detectar cambios antes de actualizar
    const changes = getChanges(pet, updateData);

    // Actualizar la mascota
    const updatedPet = await Pet.findByIdAndUpdate(
      petId,
      updateData,
      { new: true }
    ).populate(['petType', 'characteristics.characteristic', 'owner']);

    if (!updatedPet) {
      ResponseHelper.notFound(res, 'Mascota no encontrada');
      return;
    }

    // Si hubo cambios, registrarlos
    if (changes.length > 0) {
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      logChanges(
        'Pet',
        petId,
        userId.toString(),
        userName,
        changes
      );
    }

    ResponseHelper.success(
      res,
      'Mascota actualizada exitosamente',
      updatedPet
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /pets/:id - Eliminar mascota (solo si es propietario)
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

    // Verificar permisos: solo el propietario puede eliminar la mascota
    if (pet.owner.toString() !== userId.toString()) {
      ResponseHelper.forbidden(res, 'No tienes permisos para eliminar esta mascota');
      return;
    }

    await Pet.findByIdAndDelete(petId);

    // Log de eliminación
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    logChanges(
      'Pet',
      petId,
      userId.toString(),
      userName,
      [
        { field: 'name', oldValue: pet.name, newValue: null },
      ]
    );

    ResponseHelper.success(res, 'Mascota eliminada exitosamente');
  } catch (error) {
    next(error);
  }
};

// ========================================
// SERVICIOS DE ADMIN (Solo lectura de todas las mascotas)
// ========================================

// GET /pets/admin/all - Obtener todas las mascotas (solo admins)
const getAllPets: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Construir filtros
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

    // Obtener mascotas con paginación y filtros
    const pets = await Pet.find(filters)
      .populate(['petType', 'characteristics.characteristic', 'owner'])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Obtener el total para la paginación
    const totalPets = await Pet.countDocuments(filters);
    const totalPages = Math.ceil(totalPets / limit);

    ResponseHelper.success(res, 'Mascotas obtenidas exitosamente', {
      items: pets,
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

// GET /pets/admin/:id - Obtener cualquier mascota (solo admins)
const getPetAsAdmin: RequestHandler = async (req, res, next) => {
  try {
    const petId = req.params.id;

    const pet = await Pet.findById(petId).populate(['petType', 'characteristics.characteristic', 'owner']);
    if (!pet) {
      ResponseHelper.notFound(res, 'Mascota no encontrada');
      return;
    }

    ResponseHelper.success(res, 'Mascota obtenida exitosamente', pet);
  } catch (error) {
    next(error);
  }
};

// ========================================
// SERVICIOS PÚBLICOS
// ========================================

// GET /pets/:id/avatar - Obtener avatar de una mascota (público)
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

    // Establecer el tipo de contenido y enviar el buffer
    res.set('Content-Type', pet.avatarContentType);
    res.send(pet.avatarBuffer);
  } catch (error) {
    next(error);
  }
};

// ========================================
// RUTAS - SERVICIOS DE USUARIO
// ========================================
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/', authMiddleware, permissionMiddleware('pets', 'create'), uploadImage.single('avatar'), handleUploadError, createPet);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/my', authMiddleware, permissionMiddleware('pets', 'read'), getMyPets);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/:id', authMiddleware, permissionMiddleware('pets', 'read'), getPet);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.put('/:id', authMiddleware, permissionMiddleware('pets', 'update'), uploadImage.single('avatar'), handleUploadError, updatePet);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.delete('/:id', authMiddleware, permissionMiddleware('pets', 'delete'), deletePet);

// ========================================
// RUTAS - SERVICIOS DE ADMIN
// ========================================
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/admin/all', authMiddleware, permissionMiddleware('pets', 'getAll'), getAllPets);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/admin/:id', authMiddleware, permissionMiddleware('pets', 'read'), getPetAsAdmin);

// ========================================
// RUTAS - SERVICIOS PÚBLICOS
// ========================================
router.get('/:id/avatar', getAvatar);

export default router; 