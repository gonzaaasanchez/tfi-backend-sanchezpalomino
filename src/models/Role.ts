import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: {
    users: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    roles: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    admins: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
  };
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: {
    users: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      getAll: { type: Boolean, default: false }
    },
    roles: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      getAll: { type: Boolean, default: false }
    },
    admins: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      getAll: { type: Boolean, default: false }
    }
  },
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<IRole>('Role', RoleSchema); 