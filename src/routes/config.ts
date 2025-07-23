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
  configs: any[]
): { isValid: boolean; error?: string } => {
  if (!Array.isArray(configs)) {
    return {
      isValid: false,
      error: 'Las configuraciones deben ser un array',
    };
  }

  for (const config of configs) {
    if (!config.key || typeof config.key !== 'string') {
      return {
        isValid: false,
        error: 'Cada configuración debe tener una clave válida',
      };
    }

    if (config.value === undefined || config.value === null) {
      return {
        isValid: false,
        error: `El valor para la configuración '${config.key}' es requerido`,
      };
    }

    if (
      !config.type ||
      !['number', 'string', 'boolean', 'object'].includes(config.type)
    ) {
      return {
        isValid: false,
        error: `El tipo para la configuración '${config.key}' debe ser: number, string, boolean u object`,
      };
    }

    // Validate value type matches declared type
    const actualType = typeof config.value;
    const declaredType = config.type;

    let isValid = false;

    switch (declaredType) {
      case 'number':
        isValid = actualType === 'number' && !isNaN(config.value);
        break;
      case 'string':
        isValid = actualType === 'string';
        break;
      case 'boolean':
        isValid = actualType === 'boolean';
        break;
      case 'object':
        isValid = actualType === 'object' && config.value !== null;
        break;
    }

    if (!isValid) {
      return {
        isValid: false,
        error: `El valor de '${config.key}' debe ser de tipo ${declaredType}`,
      };
    }
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

// PUT /config - Update all configurations at once
const updateAllConfigs: RequestHandler = async (req, res, next) => {
  try {
    const { configs } = req.body;

    // Validate input
    const validation = validateConfigUpdate(configs);
    if (!validation.isValid) {
      ResponseHelper.validationError(res, validation.error!);
      return;
    }

    // Get current configs for audit
    const currentConfigs = await Config.find();
    const currentConfigsMap = new Map(
      currentConfigs.map((config) => [config.key, config])
    );

    // Update each configuration
    const updatedConfigs = [];
    const errors = [];

    for (const configData of configs) {
      try {
        const existingConfig = currentConfigsMap.get(configData.key);

        if (!existingConfig) {
          errors.push(`La configuración '${configData.key}' no existe`);
          continue;
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

        updatedConfigs.push({
          id: existingConfig._id,
          key: existingConfig.key,
          value: existingConfig.value,
          type: existingConfig.type,
          description: existingConfig.description,
          isSystem: existingConfig.isSystem,
          createdAt: existingConfig.createdAt,
          updatedAt: existingConfig.updatedAt,
        });
      } catch (error) {
        errors.push(
          `Error al actualizar '${configData.key}': ${error instanceof Error ? error.message : 'Error desconocido'}`
        );
      }
    }

    if (errors.length > 0) {
      ResponseHelper.error(res, 'Errores al actualizar configuraciones', 400, {
        errors,
        updatedConfigs,
      });
      return;
    }

    ResponseHelper.success(
      res,
      'Configuraciones actualizadas exitosamente',
      updatedConfigs
    );
  } catch (error) {
    next(error);
  }
};

// GET /config/template - Get configuration template
const getConfigTemplate: RequestHandler = async (req, res, next) => {
  try {
    const configs = await Config.find()
      .select('key type description')
      .sort({ key: 1 });

    const template = configs.map((config) => ({
      key: config.key,
      value: null, // Placeholder for value
      type: config.type,
      description: config.description,
    }));

    ResponseHelper.success(
      res,
      'Template de configuraciones obtenido exitosamente',
      template
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
router.put(
  '/',
  authMiddleware,
  permissionMiddleware('config', 'update'),
  updateAllConfigs
);
router.get(
  '/template',
  authMiddleware,
  permissionMiddleware('config', 'read'),
  getConfigTemplate
);

export default router;
