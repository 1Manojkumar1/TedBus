import { Router } from 'express';
import {
  cancelbooking,
  createbooking,
  getbookingbyid,
  getbookingsbycustomer,
  getrefundquote,
  lookupBookingByPnr,
} from '../controllers/booking.js';
import { requireauth } from '../middleware/auth.js';

const router = Router();

// Public PNR status lookup (accessible on Help & Support page)
router.get('/lookup/:pnr', lookupBookingByPnr);

router.use(requireauth);

router.post('/', createbooking);
router.get('/:customerId', getbookingsbycustomer);
router.get('/id/:id', getbookingbyid);
router.get('/:id/refund-quote', getrefundquote);
router.patch('/:id/cancel', cancelbooking);
router.delete('/:id', cancelbooking);

export default router;
