import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema = new Schema({
  firstName: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }
}, {
  timestamps: true
});

// Método para excluir password en las respuestas
AdminSchema.methods.toJSON = function() {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

export default mongoose.model<IAdmin>('Admin', AdminSchema); 