import mongoose from 'mongoose';

const journeyReviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    busId: {
      type: String,
      required: true,
      index: true,
    },
    route: {
      from: { type: String, required: true, trim: true },
      to: { type: String, required: true, trim: true },
    },
    author: {
      customerId: { type: String, required: true, index: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      picture: { type: String },
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    aspectRatings: {
      punctuality: { type: Number, min: 1, max: 5, default: 5 },
      cleanliness: { type: Number, min: 1, max: 5, default: 5 },
      comfort: { type: Number, min: 1, max: 5, default: 5 },
      staff: { type: Number, min: 1, max: 5, default: 5 },
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    travelDate: {
      type: String,
      required: true,
    },
    isVerifiedPassenger: {
      type: Boolean,
      default: true,
    },
    helpfulVotes: {
      type: [String],
      default: [],
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['published', 'hidden', 'deleted'],
      default: 'published',
      index: true,
    },
  },
  { timestamps: true }
);

journeyReviewSchema.index({ busId: 1, status: 1, createdAt: -1 });

export const JourneyReview = mongoose.model('JourneyReview', journeyReviewSchema);
