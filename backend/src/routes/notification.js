import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
  sendTestNotification,
  broadcastPromo,
  triggerUpcomingReminders,
  retryFailed,
  notifyScheduleChange,
  broadcastToAll,
  getPassengersCount,
} from '../controllers/notification.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Notification Feed & Lifecycle
router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Preference Management & Localization
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.post('/preferences', updatePreferences);

// Multi-Channel Dispatch & Automated Events
router.get('/passengers-count', getPassengersCount);
router.post('/test-channel', sendTestNotification);
router.post('/broadcast-promo', broadcastPromo);
router.post('/broadcast-all', broadcastToAll);
router.post('/trigger-reminders', triggerUpcomingReminders);
router.post('/retry-failed', retryFailed);
router.post('/schedule-change', notifyScheduleChange);

export default router;
