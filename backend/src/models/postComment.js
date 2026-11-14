import mongoose from 'mongoose';

const postCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
      index: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PostComment',
      default: null,
      index: true,
    },
    author: {
      customerId: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      picture: { type: String },
      badge: { type: String, default: 'Traveler' },
    },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    likes: { type: [String], default: [] },
    likesCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['published', 'hidden', 'deleted'],
      default: 'published',
      index: true,
    },
  },
  { timestamps: true }
);

export const PostComment = mongoose.model('PostComment', postCommentSchema);
