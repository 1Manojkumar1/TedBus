import { Router } from 'express';
import {
  listSavedRoutes,
  createSavedRoute,
  deleteSavedRoute,
} from '../controllers/savedRoute.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', listSavedRoutes);
router.post('/', createSavedRoute);
router.delete('/:id', deleteSavedRoute);

export default router;
