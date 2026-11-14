import { Router } from 'express';
import { createTicket, getTicketStatus, listAllTickets } from '../controllers/support.js';

const router = Router();

router.post('/tickets', createTicket);
router.get('/tickets/:id', getTicketStatus);
router.get('/tickets', listAllTickets);

export default router;
