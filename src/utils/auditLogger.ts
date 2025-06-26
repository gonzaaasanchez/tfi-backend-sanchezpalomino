import mongoose, { Schema, Document } from 'mongoose';

// Base interface for all logs
interface IAuditLog extends Document {
  userId: string;
  userName: string;
  entityId: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
}

// Cache for log models
const logModelsCache = new Map<string, mongoose.Model<IAuditLog>>();

/**
 * Creates or gets a log model for a specific entity
 * @param entityName - Entity name (e.g., 'User', 'Admin', 'Role')
 * @returns Mongoose model for that entity's logs
 */
function getLogModel(entityName: string): mongoose.Model<IAuditLog> {
  // Check if it already exists in cache
  if (logModelsCache.has(entityName)) {
    return logModelsCache.get(entityName)!;
  }

  // Create the log schema
  const logSchema = new Schema(
    {
      userId: { type: String, required: true },
      userName: { type: String, required: true },
      entityId: { type: String, required: true },
      field: { type: String, required: true },
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed,
      timestamp: { type: Date, default: Date.now },
    },
    {
      collection: `${entityName.toLowerCase()}logs`,
    }
  );

  // Create indexes to optimize queries
  logSchema.index({ entityId: 1 });
  logSchema.index({ timestamp: -1 });
  logSchema.index({ userId: 1 });

  // Create the model
  const LogModel = mongoose.model<IAuditLog>(`${entityName}Log`, logSchema);

  // Save in cache
  logModelsCache.set(entityName, LogModel);

  return LogModel;
}

/**
 * Logs a change in the database
 * @param entityName - Entity name
 * @param userId - ID of the user who made the change
 * @param userName - User name
 * @param entityId - ID of the modified entity
 * @param field - Field that was modified
 * @param oldValue - Previous value
 * @param newValue - New value
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
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error al registrar cambio:', error);
    // Don't throw the error to avoid interrupting the main operation
  }
}

/**
 * Logs multiple changes at once
 * @param entityName - Entity name
 * @param userId - ID of the user who made the change
 * @param userName - User name
 * @param entityId - ID of the modified entity
 * @param changes - Array of changes [{field, oldValue, newValue}]
 */
export async function logChanges(
  entityName: string,
  userId: string,
  userName: string,
  entityId: string,
  changes: Array<{ field: string; oldValue: any; newValue: any }>
): Promise<void> {
  try {
    const LogModel = getLogModel(entityName);

    const logs = changes.map((change) => ({
      userId,
      userName,
      entityId,
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      timestamp: new Date(),
    }));

    await LogModel.insertMany(logs);
  } catch (error) {
    console.error('Error al registrar cambios:', error);
    // Don't throw the error to avoid interrupting the main operation
  }
}

/**
 * Gets the change history of a specific entity
 * @param entityName - Entity name
 * @param entityId - Entity ID
 * @returns Array of logs sorted by descending date
 */
export async function getEntityHistory(
  entityName: string,
  entityId: string
): Promise<IAuditLog[]> {
  try {
    const LogModel = getLogModel(entityName);

    return await LogModel.find({ entityId }).sort({ timestamp: -1 }).lean();
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return [];
  }
}

/**
 * Gets all logs of an entity with optional filters
 * @param entityName - Entity name
 * @param filters - Optional filters
 * @returns Array of logs
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
): Promise<{ logs: IAuditLog[]; total: number }> {
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
