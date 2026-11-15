import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, required: true, index: true },
    recipientEmail: { type: String, required: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['booking', 'community', 'payment', 'trip', 'promo', 'system'],
      default: 'system',
      index: true,
    },
    actionUrl: { type: String, trim: true },
    read: { type: Boolean, default: false, index: true },
    channel: {
      type: String,
      enum: ['in_app', 'email', 'push'],
      default: 'in_app',
    },
    deliveryStatus: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'pending'],
      default: 'delivered',
    },
    deliveryAttempts: { type: Number, default: 1 },
    lastAttemptAt: { type: Date, default: Date.now },
    nextRetryAt: { type: Date },
    failureReason: { type: String, default: null },
    language: { type: String, default: 'en' },
    channels: [{ type: String, enum: ['in_app', 'email', 'push'] }],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
