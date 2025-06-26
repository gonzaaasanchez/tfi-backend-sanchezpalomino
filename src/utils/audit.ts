import mongoose, { Schema } from 'mongoose';

// Cache for log models
const logModelsCache = new Map<string, mongoose.Model<any>>();

/**
 * Simple function to log a change
 * @param entityName - Entity name (e.g., 'User', 'Admin', 'Role')
 * @param entityId - Entity ID
 * @param userId - ID of the user who made the change
 * @param userName - User name
 * @param field - Field that changed
 * @param oldValue - Previous value
 * @param newValue - New value
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
    // Get or create the log model for this entity
    let LogModel = logModelsCache.get(entityName);

    if (!LogModel) {
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

      // Create indexes
      logSchema.index({ entityId: 1 });
      logSchema.index({ timestamp: -1 });

      // Create the model
      LogModel = mongoose.model(`${entityName}Log`, logSchema);
      logModelsCache.set(entityName, LogModel);
    }

    // Create the log
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
    // Don't throw error to avoid interrupting the main operation
  }
}

/**
 * Function to log multiple changes at once
 * @param entityName - Entity name
 * @param entityId - Entity ID
 * @param userId - User ID
 * @param userName - User name
 * @param changes - Array of changes [{field, oldValue, newValue}]
 */
export async function logChanges(
  entityName: string,
  entityId: string,
  userId: string,
  userName: string,
  changes: Array<{ field: string; oldValue: any; newValue: any }>
): Promise<void> {
  for (const change of changes) {
    await logChange(
      entityName,
      entityId,
      userId,
      userName,
      change.field,
      change.oldValue,
      change.newValue
    );
  }
}
