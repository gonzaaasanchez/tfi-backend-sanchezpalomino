import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  comment: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    comment: {
      type: String,
      required: [true, 'El comentario es requerido'],
      trim: true,
      minlength: [1, 'El comentario debe tener al menos 1 carácter'],
      maxlength: [500, 'El comentario no puede exceder 500 caracteres'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El autor es requerido'],
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

// Indexes to improve query performance
CommentSchema.index({ post: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ createdAt: -1 });

export default mongoose.model<IComment>('Comment', CommentSchema); 