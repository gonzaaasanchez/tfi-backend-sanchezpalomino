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
  carerConfig?: {
    homeCare: {
      enabled: boolean;
      dayPrice?: number;
    };
    petHomeCare: {
      enabled: boolean;
      visitPrice?: number;
    };
    petTypes?: mongoose.Types.ObjectId[];
  };
  addresses?: Array<{
    name: string;
    fullAddress: string;
    floor?: string;
    apartment?: string;
    coords: {
      lat: number;
      lon: number;
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    },
    lastName: {
      type: String,
      required: [true, 'El apellido es requerido'],
      trim: true,
      minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
      maxlength: [50, 'El apellido no puede exceder 50 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingresa un email válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
      match: [
        /^\+?[\d\s\-\(\)]+$/,
        'Por favor ingresa un número de teléfono válido',
      ],
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'El rol es requerido'],
    },
    avatar: {
      type: String,
      required: false,
      trim: true,
    },
    avatarBuffer: {
      type: Buffer,
      required: false,
    },
    avatarContentType: {
      type: String,
      required: false,
    },
    carerConfig: {
      type: {
        homeCare: {
          enabled: {
            type: Boolean,
            default: false,
          },
          dayPrice: {
            type: Number,
            min: [0, 'El precio por día no puede ser negativo'],
          },
        },
        petHomeCare: {
          enabled: {
            type: Boolean,
            default: false,
          },
          visitPrice: {
            type: Number,
            min: [0, 'El precio por visita no puede ser negativo'],
          },
        },
        petTypes: {
          type: [Schema.Types.ObjectId],
          ref: 'PetType',
        },
      },
      required: false,
    },
    addresses: [
      {
        name: {
          type: String,
          required: [true, 'El nombre de la dirección es requerido'],
          trim: true,
          minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
          maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
        },
        fullAddress: {
          type: String,
          required: [true, 'La dirección completa es requerida'],
          trim: true,
          minlength: [10, 'La dirección debe tener al menos 10 caracteres'],
          maxlength: [200, 'La dirección no puede exceder 200 caracteres'],
        },
        floor: {
          type: String,
          required: false,
          trim: true,
          maxlength: [10, 'El piso no puede exceder 10 caracteres'],
        },
        apartment: {
          type: String,
          required: false,
          trim: true,
          maxlength: [10, 'El departamento no puede exceder 10 caracteres'],
        },
        coords: {
          lat: {
            type: Number,
            required: [true, 'La latitud es requerida'],
            min: [-90, 'La latitud debe estar entre -90 y 90'],
            max: [90, 'La latitud debe estar entre -90 y 90'],
          },
          lon: {
            type: Number,
            required: [true, 'La longitud es requerida'],
            min: [-180, 'La longitud debe estar entre -180 y 180'],
            max: [180, 'La longitud debe estar entre -180 y 180'],
          },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Validación personalizada para carerConfig
UserSchema.pre('save', function (next) {
  const user = this as any;

  if (user.carerConfig) {
    // Validar homeCare
    if (
      user.carerConfig.homeCare?.enabled &&
      !user.carerConfig.homeCare.dayPrice
    ) {
      return next(
        new Error(
          'El precio por día es requerido cuando el cuidado en hogar está habilitado'
        )
      );
    }

    // Validar petHomeCare
    if (
      user.carerConfig.petHomeCare?.enabled &&
      !user.carerConfig.petHomeCare.visitPrice
    ) {
      return next(
        new Error(
          'El precio por visita es requerido cuando el cuidado en hogar de mascotas está habilitado'
        )
      );
    }
  }

  next();
});

// Validación personalizada para findByIdAndUpdate
UserSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;

  if (update.carerConfig) {
    // Validar homeCare
    if (
      update.carerConfig.homeCare?.enabled &&
      !update.carerConfig.homeCare.dayPrice
    ) {
      return next(
        new Error(
          'El precio por día es requerido cuando el cuidado en hogar está habilitado'
        )
      );
    }

    // Validar petHomeCare
    if (
      update.carerConfig.petHomeCare?.enabled &&
      !update.carerConfig.petHomeCare.visitPrice
    ) {
      return next(
        new Error(
          'El precio por visita es requerido cuando el cuidado en hogar de mascotas está habilitado'
        )
      );
    }
  }

  next();
});

// Método para excluir password y avatarBuffer en las respuestas
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.avatarBuffer;
  return user;
};

export default mongoose.model<IUser>('User', UserSchema);
