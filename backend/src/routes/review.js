import { Router } from 'express';
import {
  createReview,
  updateReview,
  getBusReviews,
  getUserReviews,
  toggleHelpful,
  reportReview,
  moderateReview,
} from '../controllers/review.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', createReview);
router.put('/:id', updateReview);
router.get('/bus/:busId', getBusReviews);
router.get('/user/:customerId', getUserReviews);
router.post('/:id/vote', toggleHelpful);
router.post('/:id/report', reportReview);
router.patch('/:id/moderate', moderateReview);

export default router;
