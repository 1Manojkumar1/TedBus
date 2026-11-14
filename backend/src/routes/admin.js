import { Router } from 'express';
import { getAdminStats, listReports, resolveReport } from '../controllers/admin.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/stats', getAdminStats);
router.get('/reports', listReports);
router.patch('/reports/:id', resolveReport);

export default router;
