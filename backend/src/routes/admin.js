import { Router } from 'express';
import {
  getAdminStats,
  listReports,
  resolveReport,
  listAllPosts,
  moderatePost,
} from '../controllers/admin.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/stats', getAdminStats);
router.get('/reports', listReports);
router.patch('/reports/:id', resolveReport);
router.get('/posts', listAllPosts);
router.patch('/posts/:id/status', moderatePost);

export default router;
