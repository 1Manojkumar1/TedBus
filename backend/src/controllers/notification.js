import mongoose from 'mongoose';
import { Notification } from '../models/notification.js';
import { NotificationPreference } from '../models/notificationPreference.js';

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
        communityInteractions: true,
        promotionalOffers: true,
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
      communityInteractions,
      promotionalOffers,
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
        communityInteractions: communityInteractions ?? true,
        promotionalOffers: promotionalOffers ?? true,
      },
      { upsert: true, new: true }
    ).exec();

    return res.json(updated);
  } catch (err) {
    console.error('updatePreferences error:', err);
    return res.status(500).json({ error: 'Failed to update preferences' });
  }
}
