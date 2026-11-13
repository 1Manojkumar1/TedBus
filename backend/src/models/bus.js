import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  operatorName: { type: String, required: true },
  busType: { type: String, required: true },
  departureTime: { type: String, required: true },
  rating: { type: [Number], default: [] },
  totalSeats: { type: Number },
  routes: { type: mongoose.Schema.Types.ObjectId, ref: 'Routes', required: true, index: true },
  images: { type: String, required: true },
  liveTracking: { type: Number, default: 1 },
  reschedulable: { type: Number, default: 0 },
});

export const Bus = mongoose.model('Buses', busSchema);
