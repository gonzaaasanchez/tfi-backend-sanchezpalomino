import mongoose from 'mongoose';

/**
 * Detects changes between two objects
 * @param oldObj - Previous object
 * @param newObj - New object
 * @param excludedFields - Fields to exclude from comparison
 * @returns Array of detected changes
 */
export function detectChanges(
  oldObj: any,
  newObj: any,
  excludedFields: string[] = []
): Array<{ field: string; oldValue: any; newValue: any }> {
  const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

  if (!oldObj || !newObj) return changes;

  // Default fields to exclude
  const excludeFields = [...excludedFields, '__v', 'createdAt', 'updatedAt'];

  // Convert to plain objects if they are Mongoose documents
  const old = oldObj.toObject ? oldObj.toObject() : oldObj;
  const new_ = newObj.toObject ? newObj.toObject() : newObj;

  // Review all fields of the new object
  for (const key in new_) {
    if (excludeFields.includes(key)) continue;

    const oldValue = old[key];
    const newValue = new_[key];

    // Compare values (considering ObjectIds and other types)
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue: oldValue,
        newValue: newValue,
      });
    }
  }

  return changes;
}

/**
 * Detects changes for a specific field
 * @param oldValue - Previous value
 * @param newValue - New value
 * @param field - Field name
 * @returns Change object or null if there's no change
 */
export function detectFieldChange(
  oldValue: any,
  newValue: any,
  field: string
): { field: string; oldValue: any; newValue: any } | null {
  if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
    return {
      field,
      oldValue,
      newValue,
    };
  }
  return null;
}

/**
 * Compares a Mongoose document with a new data object and returns the changes.
 * @param doc The original Mongoose document.
 * @param newData The object with new data.
 * @returns An array of objects describing the changes.
 */
export function getChanges<T extends mongoose.Document>(
  doc: T,
  newData: Record<string, any>
): { field: string; oldValue: any; newValue: any }[] {
  const changes = [];
  const oldDoc = doc.toObject();

  for (const key in newData) {
    if (
      Object.prototype.hasOwnProperty.call(oldDoc, key) &&
      newData[key] !== undefined
    ) {
      // Convert to string for safe comparison, especially ObjectId
      if (String(oldDoc[key]) !== String(newData[key])) {
        changes.push({
          field: key,
          oldValue: oldDoc[key],
          newValue: newData[key],
        });
      }
    }
  }

  return changes;
}
