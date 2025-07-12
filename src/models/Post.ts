import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  description: string;
  image: string;
  imageBuffer?: Buffer;
  imageContentType?: string;
  author: mongoose.Types.ObjectId;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres'],
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
      minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
    },
    image: {
      type: String,
      required: [true, 'La imagen es requerida'],
      trim: true,
    },
    imageBuffer: {
      type: Buffer,
      required: false,
    },
    imageContentType: {
      type: String,
      required: false,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El autor es requerido'],
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: [0, 'El contador de comentarios no puede ser negativo'],
    },
  },
  {
    timestamps: true,
  }
);

// Method to exclude imageBuffer from responses
PostSchema.methods.toJSON = function () {
  const post = this.toObject();
  delete post.imageBuffer;
  return post;
};

// Indexes to improve query performance
PostSchema.index({ author: 1 });
PostSchema.index({ createdAt: -1 });

export default mongoose.model<IPost>('Post', PostSchema); 