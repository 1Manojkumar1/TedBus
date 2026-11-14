import mongoose from 'mongoose';

const contentReportSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ['post', 'comment'],
      required: true,
      index: true,
    },
    contentId: {
      type: String,
      required: true,
      index: true,
    },
    reportedBy: {
      customerId: { type: String, required: true },
      email: { type: String, required: true },
      name: { type: String, required: true },
    },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'misinformation', 'inappropriate', 'other'],
      required: true,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'actioned'],
      default: 'pending',
      index: true,
    },
    actionTaken: {
      type: String,
    },
    reviewedBy: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const ContentReport = mongoose.model('ContentReport', contentReportSchema);
