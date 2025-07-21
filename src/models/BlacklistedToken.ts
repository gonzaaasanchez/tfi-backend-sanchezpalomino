import mongoose, { Schema, Document } from 'mongoose';

export interface IBlacklistedToken extends Document {
  token: string;
  userId: string;
  userType: 'user' | 'admin';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blacklistedTokenSchema = new Schema<IBlacklistedToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries and automatic cleanup
blacklistedTokenSchema.index({ token: 1 });
blacklistedTokenSchema.index({ userId: 1, userType: 1 });
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IBlacklistedToken>('BlacklistedToken', blacklistedTokenSchema); 