import { Router } from 'express';
import { createbus, getbus, listbuses } from '../controllers/bus.js';
import { requireauth } from '../middleware/auth.js';

const router = Router();

router.get('/', listbuses);
router.post('/', requireauth, createbus);
router.get('/:id', getbus);

export default router;
