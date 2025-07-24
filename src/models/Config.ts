import mongoose, { Document, Schema } from 'mongoose';

export interface IConfig extends Document {
  key: string;
  value: any;
  type: 'number' | 'string' | 'boolean' | 'object';
  description: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConfigSchema = new Schema<IConfig>(
  {
    key: {
      type: String,
      required: [true, 'La clave de configuración es requerida'],
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: [true, 'El valor de configuración es requerido'],
    },
    type: {
      type: String,
      required: [true, 'El tipo de configuración es requerido'],
      enum: {
        values: ['number', 'string', 'boolean', 'object'],
        message: 'El tipo debe ser: number, string, boolean u object',
      },
    },
    description: {
      type: String,
      required: [true, 'La descripción de configuración es requerida'],
      trim: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to validate value type
ConfigSchema.pre('save', function (next) {
  const config = this as IConfig;
  
  // Validate value type matches the declared type
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
    return next(new Error(`El valor debe ser de tipo ${declaredType}`));
  }
  
  next();
});

export default mongoose.model<IConfig>('Config', ConfigSchema); 