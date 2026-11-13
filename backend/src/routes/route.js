import { Router } from 'express';
import { createroute, getbusforroute, listroutes } from '../controllers/route.js';
import { requireauth } from '../middleware/auth.js';

const router = Router();

router.get('/', listroutes);
router.post('/', requireauth, createroute);
router.get('/:departure/:arrival/:date', getbusforroute);

export default router;
