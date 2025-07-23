import { Router, RequestHandler } from 'express';
import Config from '../models/Config';
import { authMiddleware } from '../middleware/auth';
import { permissionMiddleware } from '../middleware/permissions';
import { logChanges } from '../utils/auditLogger';
import { getChanges } from '../utils/changeDetector';
import { ResponseHelper } from '../utils/response';

const router = Router();

// Helper function to validate config structure
const validateConfigUpdate = (
  configData: any
): { isValid: boolean; error?: string } => {
  if (!configData.key || typeof configData.key !== 'string') {
    return {
      isValid: false,
      error: 'La configuración debe tener una clave válida',
    };
  }

  if (configData.value === undefined || configData.value === null) {
    return {
      isValid: false,
      error: `El valor para la configuración '${configData.key}' es requerido`,
    };
  }

  if (
    !configData.type ||
    !['number', 'string', 'boolean', 'object'].includes(configData.type)
  ) {
    return {
      isValid: false,
      error: `El tipo para la configuración '${configData.key}' debe ser: number, string, boolean u object`,
    };
  }

  // Validate value type matches declared type
  const actualType = typeof configData.value;
  const declaredType = configData.type;

  let isValid = false;

  switch (declaredType) {
    case 'number':
      isValid = actualType === 'number' && !isNaN(configData.value);
      break;
    case 'string':
      isValid = actualType === 'string';
      break;
    case 'boolean':
      isValid = actualType === 'boolean';
      break;
    case 'object':
      isValid = actualType === 'object' && configData.value !== null;
      break;
  }

  if (!isValid) {
    return {
      isValid: false,
      error: `El valor de '${configData.key}' debe ser de tipo ${declaredType}`,
    };
  }

  return { isValid: true };
};

// GET /config - Get all configurations
const getAllConfigs: RequestHandler = async (req, res, next) => {
  try {
    const configs = await Config.find().select('-__v').sort({ key: 1 });

    ResponseHelper.success(
      res,
      'Configuraciones obtenidas exitosamente',
      configs.map((config) => ({
        id: config._id,
        key: config.key,
        value: config.value,
        type: config.type,
        description: config.description,
        isSystem: config.isSystem,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      }))
    );
  } catch (error) {
    next(error);
  }
};

// GET /config/:key - Get one configuration by key
const getOneConfig: RequestHandler = async (req, res, next) => {
  try {
    const { key } = req.params;

    const config = await Config.findOne({ key }).select('-__v');

    if (!config) {
      ResponseHelper.notFound(res, `La configuración '${key}' no existe`);
      return;
    }

    ResponseHelper.success(
      res,
      'Configuración obtenida exitosamente',
      {
        id: config._id,
        key: config.key,
        value: config.value,
        type: config.type,
        description: config.description,
        isSystem: config.isSystem,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      }
    );
  } catch (error) {
    next(error);
  }
};

// PUT /config/:key - Update one configuration by key
const updateOneConfig: RequestHandler = async (req, res, next) => {
  try {
    const { key } = req.params;
    const configData = req.body;

    // Validate input
    const validation = validateConfigUpdate({ ...configData, key });
    if (!validation.isValid) {
      ResponseHelper.validationError(res, validation.error!);
      return;
    }

    // Find existing config
    const existingConfig = await Config.findOne({ key });

    if (!existingConfig) {
      ResponseHelper.notFound(res, `La configuración '${key}' no existe`);
      return;
    }

    // Store old values for audit
    const oldValues = {
      value: existingConfig.value,
      type: existingConfig.type,
      description: existingConfig.description,
    };

    // Update the configuration
    existingConfig.value = configData.value;
    existingConfig.type = configData.type;
    existingConfig.description = configData.description;

    await existingConfig.save();

    // Log changes for audit
    const changes = getChanges(existingConfig, {
      value: configData.value,
      type: configData.type,
      description: configData.description,
    });

    if (changes.length > 0) {
      await logChanges(
        'Config',
        String(existingConfig._id),
        req.user?.id || 'unknown',
        req.user?.name || 'unknown',
        changes
      );
    }

    ResponseHelper.success(
      res,
      'Configuración actualizada exitosamente',
      {
        id: existingConfig._id,
        key: existingConfig.key,
        value: existingConfig.value,
        type: existingConfig.type,
        description: existingConfig.description,
        isSystem: existingConfig.isSystem,
        createdAt: existingConfig.createdAt,
        updatedAt: existingConfig.updatedAt,
      }
    );
  } catch (error) {
    next(error);
  }
};

// Routes
router.get(
  '/',
  authMiddleware,
  permissionMiddleware('config', 'read'),
  getAllConfigs
);
router.get(
  '/:key',
  authMiddleware,
  permissionMiddleware('config', 'read'),
  getOneConfig
);
router.put(
  '/:key',
  authMiddleware,
  permissionMiddleware('config', 'update'),
  updateOneConfig
);

export default router;
