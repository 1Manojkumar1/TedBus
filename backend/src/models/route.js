import mongoose from 'mongoose';

const routesSchema = new mongoose.Schema({
  departureLocation: {
    name: { type: String, required: true },
    subLocations: { type: [String], default: [] },
  },
  arrivalLocation: {
    name: { type: String, required: true },
    subLocations: { type: [String], default: [] },
  },
  duration: { type: Number, required: true },
});

routesSchema.index({ 'departureLocation.name': 1, 'arrivalLocation.name': 1 }, { unique: true });

export const Route = mongoose.model('Routes', routesSchema);
