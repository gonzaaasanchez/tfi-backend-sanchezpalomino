import mongoose, { Schema } from 'mongoose';

// Cache para modelos de logs
const logModelsCache = new Map<string, mongoose.Model<any>>();

/**
 * Función simple para registrar un cambio
 * @param entityName - Nombre de la entidad (ej: 'User', 'Admin', 'Role')
 * @param entityId - ID de la entidad
 * @param userId - ID del usuario que hizo el cambio
 * @param userName - Nombre del usuario
 * @param field - Campo que cambió
 * @param oldValue - Valor anterior
 * @param newValue - Valor nuevo
 */
export async function logChange(
  entityName: string,
  entityId: string,
  userId: string,
  userName: string,
  field: string,
  oldValue: any,
  newValue: any
): Promise<void> {
  try {
    // Obtener o crear el modelo de log para esta entidad
    let LogModel = logModelsCache.get(entityName);
    
    if (!LogModel) {
      // Crear el esquema de log
      const logSchema = new Schema({
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        entityId: { type: String, required: true },
        field: { type: String, required: true },
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now }
      }, {
        collection: `${entityName.toLowerCase()}logs`
      });

      // Crear índices
      logSchema.index({ entityId: 1 });
      logSchema.index({ timestamp: -1 });

      // Crear el modelo
      LogModel = mongoose.model(`${entityName}Log`, logSchema);
      logModelsCache.set(entityName, LogModel);
    }

    // Crear el log
    await LogModel.create({
      userId,
      userName,
      entityId,
      field,
      oldValue,
      newValue,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error al registrar cambio:', error);
    // No lanzar error para no interrumpir la operación principal
  }
}

/**
 * Función para registrar múltiples cambios de una vez
 * @param entityName - Nombre de la entidad
 * @param entityId - ID de la entidad
 * @param userId - ID del usuario
 * @param userName - Nombre del usuario
 * @param changes - Array de cambios [{field, oldValue, newValue}]
 */
export async function logChanges(
  entityName: string,
  entityId: string,
  userId: string,
  userName: string,
  changes: Array<{field: string, oldValue: any, newValue: any}>
): Promise<void> {
  for (const change of changes) {
    await logChange(entityName, entityId, userId, userName, change.field, change.oldValue, change.newValue);
  }
} 