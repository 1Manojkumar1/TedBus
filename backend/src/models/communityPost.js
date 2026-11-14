import mongoose from 'mongoose';

export const COMMUNITY_CATEGORIES = [
  'Bus routes',
  'Destinations',
  'Travel experiences',
  'Travel tips',
  'Safety and recommendations',
  'General discussions',
];

const communityPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 10000 },
    category: {
      type: String,
      required: true,
      enum: COMMUNITY_CATEGORIES,
      default: 'General discussions',
      index: true,
    },
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] },
    routeTag: {
      from: { type: String, trim: true },
      to: { type: String, trim: true },
    },
    author: {
      customerId: { type: String, required: true, index: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      picture: { type: String },
      badge: { type: String, default: 'Traveler' },
    },
    likes: { type: [String], default: [] },
    likesCount: { type: Number, default: 0, index: true },
    commentsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['published', 'hidden', 'deleted'],
      default: 'published',
      index: true,
    },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

communityPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
