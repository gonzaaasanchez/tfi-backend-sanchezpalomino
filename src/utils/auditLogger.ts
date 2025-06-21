import mongoose, { Schema, Document } from 'mongoose';

// Interfaz base para todos los logs
interface IAuditLog extends Document {
  userId: string;
  userName: string;
  entityId: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
}

// Cache para modelos de logs
const logModelsCache = new Map<string, mongoose.Model<IAuditLog>>();

/**
 * Crea o obtiene un modelo de log para una entidad específica
 * @param entityName - Nombre de la entidad (ej: 'User', 'Admin', 'Role')
 * @returns Modelo de Mongoose para los logs de esa entidad
 */
function getLogModel(entityName: string): mongoose.Model<IAuditLog> {
  // Verificar si ya existe en cache
  if (logModelsCache.has(entityName)) {
    return logModelsCache.get(entityName)!;
  }

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

  // Crear índices para optimizar consultas
  logSchema.index({ entityId: 1 });
  logSchema.index({ timestamp: -1 });
  logSchema.index({ userId: 1 });

  // Crear el modelo
  const LogModel = mongoose.model<IAuditLog>(`${entityName}Log`, logSchema);
  
  // Guardar en cache
  logModelsCache.set(entityName, LogModel);
  
  return LogModel;
}

/**
 * Registra un cambio en la base de datos
 * @param entityName - Nombre de la entidad
 * @param userId - ID del usuario que hizo el cambio
 * @param userName - Nombre del usuario
 * @param entityId - ID de la entidad modificada
 * @param field - Campo que se modificó
 * @param oldValue - Valor anterior
 * @param newValue - Valor nuevo
 */
export async function logChange(
  entityName: string,
  userId: string,
  userName: string,
  entityId: string,
  field: string,
  oldValue: any,
  newValue: any
): Promise<void> {
  try {
    const LogModel = getLogModel(entityName);
    
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
    // No lanzar el error para no interrumpir la operación principal
  }
}

/**
 * Registra múltiples cambios de una vez
 * @param entityName - Nombre de la entidad
 * @param userId - ID del usuario que hizo el cambio
 * @param userName - Nombre del usuario
 * @param entityId - ID de la entidad modificada
 * @param changes - Array de cambios [{field, oldValue, newValue}]
 */
export async function logChanges(
  entityName: string,
  userId: string,
  userName: string,
  entityId: string,
  changes: Array<{field: string, oldValue: any, newValue: any}>
): Promise<void> {
  try {
    const LogModel = getLogModel(entityName);
    
    const logs = changes.map(change => ({
      userId,
      userName,
      entityId,
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      timestamp: new Date()
    }));
    
    await LogModel.insertMany(logs);
  } catch (error) {
    console.error('Error al registrar cambios:', error);
    // No lanzar el error para no interrumpir la operación principal
  }
}

/**
 * Obtiene el historial de cambios de una entidad específica
 * @param entityName - Nombre de la entidad
 * @param entityId - ID de la entidad
 * @returns Array de logs ordenados por fecha descendente
 */
export async function getEntityHistory(
  entityName: string,
  entityId: string
): Promise<IAuditLog[]> {
  try {
    const LogModel = getLogModel(entityName);
    
    return await LogModel.find({ entityId })
      .sort({ timestamp: -1 })
      .lean();
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return [];
  }
}

/**
 * Obtiene todos los logs de una entidad con filtros opcionales
 * @param entityName - Nombre de la entidad
 * @param filters - Filtros opcionales
 * @returns Array de logs
 */
export async function getEntityLogs(
  entityName: string,
  filters: {
    userId?: string;
    entityId?: string;
    field?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  } = {}
): Promise<{logs: IAuditLog[], total: number}> {
  try {
    const LogModel = getLogModel(entityName);
    
    const query: any = {};
    
    if (filters.userId) query.userId = filters.userId;
    if (filters.entityId) query.entityId = filters.entityId;
    if (filters.field) query.field = filters.field;
    
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = filters.startDate;
      if (filters.endDate) query.timestamp.$lte = filters.endDate;
    }
    
    const limit = filters.limit || 50;
    const skip = filters.skip || 0;
    
    const logs = await LogModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
    
    const total = await LogModel.countDocuments(query);
    
    return { logs, total };
  } catch (error) {
    console.error('Error al obtener logs:', error);
    return { logs: [], total: 0 };
  }
} 