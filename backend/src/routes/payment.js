import { Router } from 'express';
import { createcheckout, getpaymentconfig } from '../controllers/payment.js';

const router = Router();

router.get('/config', getpaymentconfig);
router.post('/checkout', createcheckout);

export default router;
