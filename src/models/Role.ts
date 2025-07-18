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
    logs: {
      read: boolean;
      getAll: boolean;
    };
    petTypes: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    petCharacteristics: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    pets: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      getAll: boolean;
    };
    caregiverSearch: {
      read: boolean;
    };
    reservations: {
      create: boolean;
      read: boolean;
      update: boolean;
      admin: boolean;
    };
    reviews: {
      create: boolean;
      read: boolean;
    };
    posts: {
      create: boolean;
      read: boolean;
      delete: boolean;
      getAll: boolean;
    };
    comments: {
      create: boolean;
      getAll: boolean;
      delete: boolean;
    };
    likes: {
      create: boolean;
      delete: boolean;
    };
  };
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del rol es requerido'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción del rol es requerida'],
    },
    permissions: {
      type: {
        users: {
          create: { type: Boolean, default: false },
          read: { type: Boolean, default: false },
          update: { type: Boolean, default: false },
          delete: { type: Boolean, default: false },
          getAll: { type: Boolean, default: false },
        },
        roles: {
          create: { type: Boolean, default: false },
          read: { type: Boolean, default: false },
          update: { type: Boolean, default: false },
          delete: { type: Boolean, default: false },
          getAll: { type: Boolean, default: false },
        },
        admins: {
          create: { type: Boolean, default: false },
          read: { type: Boolean, default: false },
          update: { type: Boolean, default: false },
          delete: { type: Boolean, default: false },
          getAll: { type: Boolean, default: false },
        },
        logs: {
          read: { type: Boolean, default: false },
          getAll: { type: Boolean, default: false },
        },
        petTypes: {
          create: { type: Boolean, default: false },
          read: { type: Boolean, default: false },
          update: { type: Boolean, default: false },
          delete: { type: Boolean, default: false },
          getAll: { type: Boolean, default: false },
        },
        petCharacteristics: {
          create: { type: Boolean, default: false },
          read: { type: Boolean, default: false },
          update: { type: Boolean, default: false },
          delete: { type: Boolean, default: false },
          getAll: { type: Boolean, default: false },
        },
        pets: {
          create: { type: Boolean, default: false },
          read: { type: Boolean, default: false },
          update: { type: Boolean, default: false },
          delete: { type: Boolean, default: false },
          getAll: { type: Boolean, default: false },
        },
        caregiverSearch: {
          read: { type: Boolean, default: false },
        },
        reservations: {
          create: { type: Boolean, default: false },
          read: { type: Boolean, default: false },
          update: { type: Boolean, default: false },
          admin: { type: Boolean, default: false },
        },
        reviews: {
          create: { type: Boolean, default: false },
          read: { type: Boolean, default: false },
        },
        posts: {
          create: { type: Boolean, default: false },
          read: { type: Boolean, default: false },
          delete: { type: Boolean, default: false },
          getAll: { type: Boolean, default: false },
        },
        comments: {
          create: { type: Boolean, default: false },
          getAll: { type: Boolean, default: false },
          delete: { type: Boolean, default: false },
        },
        likes: {
          create: { type: Boolean, default: false },
          delete: { type: Boolean, default: false },
        },
      },
      required: [true, 'Los permisos son requeridos'],
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

export default mongoose.model<IRole>('Role', RoleSchema);
