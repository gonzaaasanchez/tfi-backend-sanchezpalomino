import mongoose, { Schema, Document } from 'mongoose';

export interface ILike extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es requerido'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'El post es requerido'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one like per user per post
LikeSchema.index({ user: 1, post: 1 }, { unique: true });

// Indexes to improve query performance
LikeSchema.index({ post: 1 });
LikeSchema.index({ user: 1 });

export default mongoose.model<ILike>('Like', LikeSchema); 