import mongoose from 'mongoose';
import { Notification } from '../models/notification.js';
import { NotificationPreference } from '../models/notificationPreference.js';
import { Booking } from '../models/booking.js';
import {
  sendNotification,
  sendScheduleChangeNotification,
  sendJourneyReminderNotification,
  sendPromotionalNotification,
  scanUpcomingJourneys,
  retryFailedDeliveries,
} from '../services/notification.js';

export async function getNotifications(req, res) {
  try {
    const customerId = req.query.customerId || req.auth?.sub;
    const email = req.query.email || req.auth?.email;

    if (!customerId && !email) {
      return res.status(400).json({ error: 'customerId or email is required' });
    }

    const filter = {
      $or: [],
    };
    if (customerId) filter.$or.push({ recipientId: customerId });
    if (email) filter.$or.push({ recipientEmail: email.toLowerCase() });

    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }

    if (req.query.unreadOnly === 'true') {
      filter.read = false;
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Notification.countDocuments(filter).exec(),
      Notification.countDocuments({
        $or: filter.$or,
        read: false,
      }).exec(),
    ]);

    return res.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    ).exec();

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json(notification);
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const customerId = req.body.customerId || req.auth?.sub;
    const email = req.body.email || req.auth?.email;

    if (!customerId && !email) {
      return res.status(400).json({ error: 'customerId or email is required' });
    }

    const filter = {
      $or: [],
      read: false,
    };
    if (customerId) filter.$or.push({ recipientId: customerId });
    if (email) filter.$or.push({ recipientEmail: email.toLowerCase() });

    const result = await Notification.updateMany(filter, { read: true }).exec();

    return res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error('markAllAsRead error:', err);
    return res.status(500).json({ error: 'Failed to mark all as read' });
  }
}

export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    await Notification.findByIdAndDelete(id).exec();
    return res.json({ message: 'Notification deleted', id });
  } catch (err) {
    console.error('deleteNotification error:', err);
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
}

export async function getPreferences(req, res) {
  try {
    const customerId = req.query.customerId || req.auth?.sub;
    const email = req.query.email || req.auth?.email;

    if (!customerId && !email) {
      return res.status(400).json({ error: 'customerId or email is required' });
    }

    let prefs = await NotificationPreference.findOne({
      $or: [
        ...(customerId ? [{ customerId }] : []),
        ...(email ? [{ email: email.toLowerCase() }] : []),
      ],
    })
      .lean()
      .exec();

    if (!prefs) {
      prefs = {
        customerId: customerId || email,
        email: email || '',
        inAppEnabled: true,
        emailEnabled: true,
        pushEnabled: false,
        bookingUpdates: true,
        journeyReminders: true,
        scheduleChanges: true,
        communityInteractions: true,
        promotionalOffers: true,
        preferredLanguage: 'en',
      };
    }

    return res.json(prefs);
  } catch (err) {
    console.error('getPreferences error:', err);
    return res.status(500).json({ error: 'Failed to retrieve preferences' });
  }
}

export async function updatePreferences(req, res) {
  try {
    const {
      customerId,
      email,
      inAppEnabled,
      emailEnabled,
      pushEnabled,
      bookingUpdates,
      journeyReminders,
      scheduleChanges,
      communityInteractions,
      promotionalOffers,
      preferredLanguage,
      pushSubscription,
    } = req.body;

    const id = customerId || req.auth?.sub;
    const userEmail = email || req.auth?.email;

    if (!id || !userEmail) {
      return res.status(400).json({ error: 'customerId and email are required' });
    }

    const updated = await NotificationPreference.findOneAndUpdate(
      { customerId: id },
      {
        customerId: id,
        email: userEmail.toLowerCase(),
        inAppEnabled: inAppEnabled ?? true,
        emailEnabled: emailEnabled ?? true,
        pushEnabled: pushEnabled ?? false,
        bookingUpdates: bookingUpdates ?? true,
        journeyReminders: journeyReminders ?? true,
        scheduleChanges: scheduleChanges ?? true,
        communityInteractions: communityInteractions ?? true,
        promotionalOffers: promotionalOffers ?? true,
        preferredLanguage: preferredLanguage || 'en',
        ...(pushSubscription ? { pushSubscription } : {}),
      },
      { upsert: true, new: true }
    ).exec();

    return res.json(updated);
  } catch (err) {
    console.error('updatePreferences error:', err);
    return res.status(500).json({ error: 'Failed to update preferences' });
  }
}

/**
 * Sends a test notification to verify channel delivery (In-app, Email, Push)
 * in the user's preferred language.
 */
export async function sendTestNotification(req, res) {
  try {
    const customerId = req.body.customerId || req.auth?.sub;
    const email = req.body.email || req.auth?.email;
    const channel = req.body.channel || 'all';

    if (!customerId && !email) {
      return res.status(400).json({ error: 'customerId or email is required' });
    }

    const notification = await sendNotification({
      recipientId: customerId,
      recipientEmail: email,
      title: 'Channel Test Notification 🔔',
      message: 'This is a test notification from TedBus verifying your delivery channel and real-time alerts.',
      category: 'system',
      actionUrl: '/notifications',
      channels: channel === 'all' ? ['in_app', 'email', 'push'] : [channel],
      metadata: { isTest: true },
    });

    return res.json({ success: true, notification });
  } catch (err) {
    console.error('sendTestNotification error:', err);
    return res.status(500).json({ error: 'Failed to send test notification' });
  }
}

/**
 * Broadcasts or dispatches a promotional notification to opted-in travelers.
 */
export async function broadcastPromo(req, res) {
  try {
    const { code = 'TEDTRIP', discount = '15% OFF', title, message, targetEmail } = req.body;

    let targetUsers = [];
    if (targetEmail) {
      targetUsers = [{ email: targetEmail, customerId: targetEmail }];
    } else {
      targetUsers = await NotificationPreference.find({
        promotionalOffers: true,
      }).lean().exec();
    }

    let sent = 0;
    for (const u of targetUsers) {
      const email = u.email;
      const customerId = u.customerId || email;
      if (email) {
        await sendPromotionalNotification({
          recipientId: customerId,
          recipientEmail: email,
          code,
          discount,
          title,
          message,
        });
        sent++;
      }
    }

    return res.json({ success: true, recipientsCount: sent });
  } catch (err) {
    console.error('broadcastPromo error:', err);
    return res.status(500).json({ error: 'Failed to broadcast promo' });
  }
}

/**
 * Triggers journey reminders for bookings departing today.
 */
export async function triggerUpcomingReminders(req, res) {
  try {
    const result = await scanUpcomingJourneys();
    return res.json(result);
  } catch (err) {
    console.error('triggerUpcomingReminders error:', err);
    return res.status(500).json({ error: 'Failed to trigger reminders' });
  }
}

/**
 * Retries failed deliveries with exponential backoff.
 */
export async function retryFailed(req, res) {
  try {
    const result = await retryFailedDeliveries();
    return res.json(result);
  } catch (err) {
    console.error('retryFailed error:', err);
    return res.status(500).json({ error: 'Failed to retry deliveries' });
  }
}

/**
 * Notifies booked passengers of a bus schedule change.
 */
export async function notifyScheduleChange(req, res) {
  try {
    const { busId, date, oldTime, newTime, operatorName } = req.body;
    if (!busId || !date || !newTime) {
      return res.status(400).json({ error: 'busId, date, and newTime are required' });
    }

    const affectedBookings = await Booking.find({
      busId,
      'departureDetails.date': date,
      status: { $in: ['confirmed', 'booked', 'active'] },
    }).lean().exec();

    let notifiedCount = 0;
    for (const b of affectedBookings) {
      await sendScheduleChangeNotification({
        booking: b,
        oldTime: oldTime || b.departureDetails?.time || 'Scheduled',
        newTime,
        operatorName: operatorName || 'Bus Operator',
      });
      notifiedCount++;
    }

    return res.json({ success: true, notifiedCount });
  } catch (err) {
    console.error('notifyScheduleChange error:', err);
    return res.status(500).json({ error: 'Failed to notify schedule change' });
  }
}
