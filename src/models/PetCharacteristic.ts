import mongoose, { Schema, Document } from 'mongoose';

export interface IPetCharacteristic extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const PetCharacteristicSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la característica es requerido'],
      trim: true,
      unique: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPetCharacteristic>('PetCharacteristic', PetCharacteristicSchema); 