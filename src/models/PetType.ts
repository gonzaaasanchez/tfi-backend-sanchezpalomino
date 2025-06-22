import mongoose, { Schema, Document } from 'mongoose';

export interface IPetType extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const PetTypeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del tipo de mascota es requerido'],
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

export default mongoose.model<IPetType>('PetType', PetTypeSchema); 