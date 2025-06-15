import mongoose, { Schema, Document } from 'mongoose';

export interface ITest extends Document {
  name: string;
  value: number;
}

const TestSchema: Schema = new Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true }
});

export default mongoose.model<ITest>('Test', TestSchema); 