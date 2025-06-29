import { Router, RequestHandler } from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/audit';
import { getChanges } from '../utils/changeDetector';
import { uploadImage, handleUploadError } from '../middleware/upload';
import { ResponseHelper } from '../utils/response';
import { addCareAddressData } from '../utils/userHelpers';
import { sanitizeMongooseDoc } from '../utils/common';
import PetType from '../models/PetType';

const router = Router();

// GET /users/me - Get authenticated user profile
const getMyProfile: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const user = await User.findById(userId)
      .populate('role')
      .populate('carerConfig.petTypes', 'name');
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Create a copy of the user object for the response
    const userResponse = sanitizeMongooseDoc(user);

    // Add careAddressData if careAddress is configured
    addCareAddressData(userResponse);

    ResponseHelper.success(res, 'Perfil obtenido exitosamente', userResponse);
  } catch (error) {
    next(error);
  }
};

// PUT /users/me - Update authenticated user profile
const updateMyProfile: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const updateData = req.body;

    // Prevent user from modifying sensitive fields
    delete updateData.role;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.avatarBuffer;
    delete updateData.avatarContentType;

    // If there's an image in the request, save buffer and generate URL
    if (req.file) {
      updateData.avatar = `/api/users/${userId}/avatar`;
      updateData.avatarBuffer = req.file.buffer;
      updateData.avatarContentType = req.file.mimetype;
    }

    // If user sends an avatar URL in the body, override the generated one
    if (req.body.avatar && !req.file) {
      updateData.avatar = req.body.avatar;
    }

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Detect changes before updating
    const changes = getChanges(user, updateData);

    // Update the document without populate to avoid role issues
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (changes.length > 0) {
      const userName = req.user
        ? `${req.user.firstName} ${req.user.lastName}`
        : 'Sistema';
      const userIdPerformingAction = req.user?._id?.toString() || 'system';
      logChanges('User', userId, userIdPerformingAction, userName, changes);
    }

    if (!updatedUser) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Convert to object and remove sensitive fields
    const userResponse = sanitizeMongooseDoc(updatedUser);
    const { password, avatarBuffer, ...safeUserResponse } = userResponse;
    
    safeUserResponse.id = safeUserResponse._id;
    delete safeUserResponse._id;

    // Add careAddressData if careAddress is configured
    addCareAddressData(safeUserResponse);

    ResponseHelper.success(
      res,
      'Perfil actualizado exitosamente',
      safeUserResponse
    );
  } catch (error) {
    next(error);
  }
};

// GET /users/:id/avatar - Get user avatar
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

    // Set content type and send buffer
    res.set('Content-Type', user.avatarContentType);
    res.send(user.avatarBuffer);
  } catch (error) {
    next(error);
  }
};

// GET /users/:id - Get a specific user (admins only)
const getOneUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).populate('role');
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Convert to object and remove sensitive fields
    const userResponse = sanitizeMongooseDoc(user);
    const { password, avatarBuffer, ...safeUserResponse } = userResponse;
    
    safeUserResponse.id = safeUserResponse._id;
    delete safeUserResponse._id;

    // Add careAddressData if careAddress is configured
    addCareAddressData(safeUserResponse);

    ResponseHelper.success(
      res,
      'Usuario obtenido exitosamente',
      safeUserResponse
    );
  } catch (error) {
    next(error);
  }
};

// GET /users - Get all users (admins only)
const getAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build optional filters
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

    // Get users with pagination and filters
    const users = await User.find(filters)
      .populate('role')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total users for pagination
    const totalUsers = await User.countDocuments(filters);
    const totalPages = Math.ceil(totalUsers / limit);

    // Remove sensitive fields from each user
    const safeUsers = users.map((user) => {
      const userObj = sanitizeMongooseDoc(user);
      const { password, avatarBuffer, ...safeUser } = userObj;
      
      // Add careAddressData if careAddress is configured
      addCareAddressData(safeUser);
      
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

// PUT /users/:id - Update a specific user (admins only)
const updateUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // If there's an image in the request, save buffer and generate URL
    if (req.file) {
      updateData.avatar = `/api/users/${userId}/avatar`;
      updateData.avatarBuffer = req.file.buffer;
      updateData.avatarContentType = req.file.mimetype;
    }

    // If user sends an avatar URL in the body, override the generated one
    if (req.body.avatar && !req.file) {
      updateData.avatar = req.body.avatar;
    }

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Detect changes before updating
    const changes = getChanges(user, updateData);

    // Update the document directly in the DB without running all validators
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    // If there were changes, log them
    if (changes.length > 0) {
      const userName = req.user
        ? `${req.user.firstName} ${req.user.lastName}`
        : 'Sistema';
      const userIdPerformingAction = req.user?._id?.toString() || 'system';
      logChanges('User', userId, userIdPerformingAction, userName, changes);
    }

    if (!updatedUser) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Convert to object and remove sensitive fields
    const userResponse = sanitizeMongooseDoc(updatedUser);
    const { password, avatarBuffer, ...safeUserResponse } = userResponse;

    // Add careAddressData if careAddress is configured
    addCareAddressData(safeUserResponse);

    ResponseHelper.success(
      res,
      'Usuario actualizado exitosamente',
      safeUserResponse
    );
  } catch (error) {
    next(error);
  }
};

// PUT /users/me/carer-config - Update authenticated user's care configuration
const updateMyCarerConfig: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const carerConfig = req.body.carerConfig;

    // Validate that only carerConfig is sent
    if (Object.keys(req.body).length > 1 || !carerConfig) {
      ResponseHelper.validationError(res, 'Solo se permite actualizar carerConfig');
      return;
    }

    // Validate petTypes if provided
    if (carerConfig.petTypes && Array.isArray(carerConfig.petTypes)) {
      // Verify that all petType IDs are valid
      const petTypeIds = carerConfig.petTypes;
      const validPetTypes = await PetType.find({ _id: { $in: petTypeIds } });
      
      if (validPetTypes.length !== petTypeIds.length) {
        ResponseHelper.validationError(
          res, 
          'Uno o más tipos de mascota no son válidos'
        );
        return;
      }
    }

    // Validate careAddress if provided
    if (carerConfig.careAddress) {
      const user = await User.findById(userId);
      if (!user) {
        ResponseHelper.notFound(res, 'Usuario no encontrado');
        return;
      }

      // Verify that the address exists among the user's addresses
      const addressExists = user.addresses?.some(
        (address: any) => address._id?.toString() === carerConfig.careAddress
      );

      if (!addressExists) {
        ResponseHelper.validationError(
          res,
          'La dirección de cuidado seleccionada no existe entre tus direcciones'
        );
        return;
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Detect changes before updating
    const changes = getChanges(user, { carerConfig });

    // Update only the care configuration
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { carerConfig },
      { new: true }
    ).populate('carerConfig.petTypes', 'name');

    if (!updatedUser) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // If there were changes, log them
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

    // Convert to object and remove sensitive fields
    const userResponse = sanitizeMongooseDoc(updatedUser);
    const { password, avatarBuffer, ...safeUserResponse } = userResponse;

    // Add careAddressData if careAddress is configured
    addCareAddressData(safeUserResponse);

    ResponseHelper.success(
      res,
      'Configuración de cuidado actualizada exitosamente',
      safeUserResponse
    );
  } catch (error) {
    next(error);
  }
};

// GET /users/me/addresses - Obtener todas las direcciones del usuario autenticado
const getMyAddresses: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    const addresses = user.addresses || [];
    ResponseHelper.success(res, 'Direcciones obtenidas exitosamente', addresses);
  } catch (error) {
    next(error);
  }
};

// GET /users/me/addresses/:id - Get a specific address of the authenticated user
const getMyAddress: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const addressId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    if (!user.addresses || user.addresses.length === 0) {
      ResponseHelper.notFound(res, 'No hay direcciones disponibles');
      return;
    }

    // Find the address by ID
    const address = user.addresses.find(
      (address: any) => address._id?.toString() === addressId
    );

    if (!address) {
      ResponseHelper.notFound(res, 'Dirección no encontrada');
      return;
    }

    ResponseHelper.success(res, 'Dirección obtenida exitosamente', address);
  } catch (error) {
    next(error);
  }
};

// POST /users/me/addresses - Add a new address to the authenticated user
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

    // Add the new address to the array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { addresses: newAddress } },
      { new: true }
    );

    if (!updatedUser) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Get the newly added address (the last one in the array)
    const addedAddress = updatedUser.addresses?.[updatedUser.addresses.length - 1];

    // Log the change
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

// PUT /users/me/addresses/:id - Update a specific address of the authenticated user
const updateMyAddress: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const addressId = req.params.id;
    const updatedAddress = req.body;

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    if (!user.addresses || user.addresses.length === 0) {
      ResponseHelper.notFound(res, 'No hay direcciones disponibles');
      return;
    }

    // Find the address by ID
    const addressIndex = user.addresses.findIndex(
      (address: any) => address._id?.toString() === addressId
    );

    // Verify that the address exists
    if (addressIndex === -1) {
      ResponseHelper.notFound(res, 'Dirección no encontrada');
      return;
    }

    // Detect changes before updating
    const oldAddress = user.addresses[addressIndex];
    const changes: any[] = [];
    
    // Compare fields manually
    Object.keys(updatedAddress).forEach(key => {
      if ((oldAddress as any)[key] !== (updatedAddress as any)[key]) {
        changes.push({
          field: key,
          oldValue: (oldAddress as any)[key],
          newValue: (updatedAddress as any)[key]
        });
      }
    });

    // Update the specific address
    const updateQuery: any = {};
    Object.keys(updatedAddress).forEach(key => {
      updateQuery[`addresses.${addressIndex}.${key}`] = (updatedAddress as any)[key];
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

    // If there were changes, log them
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

// DELETE /users/me/addresses/:id - Delete a specific address of the authenticated user
const deleteMyAddress: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const addressId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    if (!user.addresses || user.addresses.length === 0) {
      ResponseHelper.notFound(res, 'No hay direcciones para eliminar');
      return;
    }

    // Find the address by ID
    const addressToDelete = user.addresses.find(
      (address: any) => address._id?.toString() === addressId
    );

    if (!addressToDelete) {
      ResponseHelper.notFound(res, 'Dirección no encontrada');
      return;
    }

    // Delete the specific address
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: addressToDelete } },
      { new: true }
    );

    if (!updatedUser) {
      ResponseHelper.notFound(res, 'Usuario no encontrado');
      return;
    }

    // Log the change
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

// Routes for authenticated user (no special permissions) - MUST GO FIRST
router.get('/me', authMiddleware, getMyProfile);
router.put(
  '/me',
  authMiddleware,
  uploadImage.single('avatarFile'),
  handleUploadError,
  updateMyProfile
);
router.put('/me/carer-config', authMiddleware, updateMyCarerConfig);

// Routes to manage addresses
router.get('/me/addresses', authMiddleware, getMyAddresses);
router.get('/me/addresses/:id', authMiddleware, getMyAddress);
router.post('/me/addresses', authMiddleware, addMyAddress);
router.put('/me/addresses/:id', authMiddleware, updateMyAddress);
router.delete('/me/addresses/:id', authMiddleware, deleteMyAddress);

// Routes for admins (with permissions) - MUST GO AFTER
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
