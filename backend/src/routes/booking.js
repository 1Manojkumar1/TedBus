import { Router } from 'express';
import {
  cancelbooking,
  createbooking,
  getbookingbyid,
  getbookingsbycustomer,
  getrefundquote,
} from '../controllers/booking.js';
import { requireauth } from '../middleware/auth.js';

const router = Router();

router.use(requireauth);

router.post('/', createbooking);
router.get('/:customerId', getbookingsbycustomer);
router.get('/id/:id', getbookingbyid);
router.get('/:id/refund-quote', getrefundquote);
router.patch('/:id/cancel', cancelbooking);

export default router;
