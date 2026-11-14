import mongoose from 'mongoose';

const savedRouteSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    from: {
      name: { type: String, required: true, trim: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    to: {
      name: { type: String, required: true, trim: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    waypoints: [
      {
        name: { type: String, trim: true },
        lat: { type: Number },
        lng: { type: Number },
      },
    ],
    distanceKm: {
      type: Number,
      required: true,
    },
    estimatedDuration: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const SavedRoute = mongoose.model('SavedRoute', savedRouteSchema);
