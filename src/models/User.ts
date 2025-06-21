import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
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