import { Router } from 'express';
import { getcustomer, upsertcustomer } from '../controllers/customer.js';
import { requireauth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireauth, upsertcustomer);
router.get('/:id', getcustomer);

export default router;
