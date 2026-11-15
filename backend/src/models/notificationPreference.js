import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    inAppEnabled: { type: Boolean, default: true },
    emailEnabled: { type: Boolean, default: true },
    pushEnabled: { type: Boolean, default: false },
    bookingUpdates: { type: Boolean, default: true },
    journeyReminders: { type: Boolean, default: true },
    scheduleChanges: { type: Boolean, default: true },
    communityInteractions: { type: Boolean, default: true },
    promotionalOffers: { type: Boolean, default: true },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'te', 'ta', 'kn', 'ml'],
      default: 'en',
    },
    pushSubscription: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const NotificationPreference = mongoose.model(
  'NotificationPreference',
  notificationPreferenceSchema
);
