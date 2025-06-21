import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: mongoose.Types.ObjectId;
  avatar?: string;
  avatarBuffer?: Buffer;
  avatarContentType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  firstName: { 
    type: String, 
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  lastName: { 
    type: String, 
    required: [true, 'El apellido es requerido'],
    trim: true,
    minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
    maxlength: [50, 'El apellido no puede exceder 50 caracteres']
  },
  email: { 
    type: String, 
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  password: { 
    type: String, 
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Por favor ingresa un número de teléfono válido']
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'El rol es requerido']
  },
  avatar: {
    type: String,
    required: false,
    trim: true
  },
  avatarBuffer: {
    type: Buffer,
    required: false
  },
  avatarContentType: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Método para excluir password y avatarBuffer en las respuestas
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.avatarBuffer;
  return user;
};

export default mongoose.model<IUser>('User', UserSchema); 