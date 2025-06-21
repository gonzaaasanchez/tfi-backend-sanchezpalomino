import mongoose from 'mongoose';

/**
 * Detecta cambios entre dos objetos
 * @param oldObj - Objeto anterior
 * @param newObj - Objeto nuevo
 * @param excludedFields - Campos a excluir de la comparación
 * @returns Array de cambios detectados
 */
export function detectChanges(
  oldObj: any,
  newObj: any,
  excludedFields: string[] = []
): Array<{ field: string; oldValue: any; newValue: any }> {
  const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

  if (!oldObj || !newObj) return changes;

  // Campos a excluir por defecto
  const excludeFields = [...excludedFields, '__v', 'createdAt', 'updatedAt'];

  // Convertir a objetos planos si son documentos de Mongoose
  const old = oldObj.toObject ? oldObj.toObject() : oldObj;
  const new_ = newObj.toObject ? newObj.toObject() : newObj;

  // Revisar todos los campos del nuevo objeto
  for (const key in new_) {
    if (excludeFields.includes(key)) continue;

    const oldValue = old[key];
    const newValue = new_[key];

    // Comparar valores (considerando ObjectIds y otros tipos)
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
 * Detecta cambios para un campo específico
 * @param oldValue - Valor anterior
 * @param newValue - Valor nuevo
 * @param field - Nombre del campo
 * @returns Objeto de cambio o null si no hay cambio
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
 * Compara un documento de Mongoose con un objeto de nuevos datos y devuelve los cambios.
 * @param doc El documento original de Mongoose.
 * @param newData El objeto con los nuevos datos.
 * @returns Un array de objetos que describen los cambios.
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
      // Convertimos a string para comparar de forma segura, especialmente ObjectId
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
