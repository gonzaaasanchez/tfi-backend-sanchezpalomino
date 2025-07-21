import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionAudit extends Document {
  userId: string;
  userType: 'user' | 'admin';
  action: 'login' | 'logout' | 'login_failed' | 'token_invalidated';
  ipAddress: string;
  success: boolean;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionAuditSchema = new Schema<ISessionAudit>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userType: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['login', 'logout', 'login_failed', 'token_invalidated'],
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    success: {
      type: Boolean,
      required: true,
      index: true,
    },
    failureReason: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
sessionAuditSchema.index({ userId: 1, createdAt: -1 });
sessionAuditSchema.index({ userType: 1, createdAt: -1 });
sessionAuditSchema.index({ action: 1, createdAt: -1 });
sessionAuditSchema.index({ success: 1, createdAt: -1 });
sessionAuditSchema.index({ ipAddress: 1, createdAt: -1 });
sessionAuditSchema.index({ createdAt: -1 });

// TTL index for automatic cleanup after 1 year
sessionAuditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export default mongoose.model<ISessionAudit>('SessionAudit', sessionAuditSchema); 