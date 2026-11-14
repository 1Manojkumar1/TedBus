import { Router } from 'express';
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  addComment,
  toggleLikeComment,
  deleteComment,
  reportContent,
  getUserCommunityStats,
} from '../controllers/community.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Post endpoints
router.get('/posts', listPosts);
router.get('/posts/:id', getPost);
router.post('/posts', createPost);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);
router.post('/posts/:id/like', toggleLikePost);

// Comment endpoints
router.post('/posts/:id/comments', addComment);
router.post('/comments/:id/like', toggleLikeComment);
router.delete('/comments/:id', deleteComment);

// Moderation & Reporting
router.post('/report', reportContent);

// User stats & badges
router.get('/user-stats/:customerId', getUserCommunityStats);

export default router;
