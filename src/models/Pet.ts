import mongoose, { Schema, Document } from 'mongoose';

export interface IPet extends Document {
  name: string;
  comment?: string;
  avatar?: string;
  avatarBuffer?: Buffer;
  avatarContentType?: string;
  petType: mongoose.Types.ObjectId;
  characteristics: Array<{
    characteristic: mongoose.Types.ObjectId;
    value: string;
  }>;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PetSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la mascota es requerido'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    },
    comment: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, 'El comentario no puede exceder 500 caracteres'],
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
    petType: {
      type: Schema.Types.ObjectId,
      ref: 'PetType',
      required: [true, 'El tipo de mascota es requerido'],
    },
    characteristics: [{
      characteristic: {
        type: Schema.Types.ObjectId,
        ref: 'PetCharacteristic',
        required: true,
      },
      value: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, 'El valor debe tener al menos 1 carácter'],
        maxlength: [100, 'El valor no puede exceder 100 caracteres'],
      },
    }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El propietario es requerido'],
    },
  },
  {
    timestamps: true,
  }
);

// Método para excluir avatarBuffer en las respuestas
PetSchema.methods.toJSON = function () {
  const pet = this.toObject();
  delete pet.avatarBuffer;
  return pet;
};

// Índices para mejorar el rendimiento de las consultas
PetSchema.index({ owner: 1 });
PetSchema.index({ petType: 1 });
PetSchema.index({ 'characteristics.characteristic': 1 });

export default mongoose.model<IPet>('Pet', PetSchema); 