import { Notification } from '../models/notification.js';
import { NotificationPreference } from '../models/notificationPreference.js';

/**
 * Dispatches an event-based notification to a customer, respecting their preferences.
 */
export async function sendNotification({
  recipientId,
  recipientEmail,
  title,
  message,
  category = 'system',
  actionUrl = '/profile',
  channel = 'in_app',
  metadata = {},
}) {
  if (!recipientId || !recipientEmail) {
    return null;
  }

  try {
    // Check preferences
    const prefs = await NotificationPreference.findOne({
      $or: [{ customerId: recipientId }, { email: recipientEmail.toLowerCase() }],
    }).lean().exec();

    if (prefs) {
      if (category === 'booking' && prefs.bookingUpdates === false) return null;
      if (category === 'community' && prefs.communityInteractions === false) return null;
      if (category === 'promo' && prefs.promotionalOffers === false) return null;
      if (channel === 'in_app' && prefs.inAppEnabled === false) return null;
    }

    const notification = await Notification.create({
      recipientId,
      recipientEmail: recipientEmail.toLowerCase(),
      title,
      message,
      category,
      actionUrl,
      channel,
      deliveryStatus: 'delivered',
      metadata,
    });

    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}

export async function sendBookingConfirmation(booking) {
  const recipientId = booking.customerId || booking.email;
  const recipientEmail = booking.email;
  const from = booking.boardingPoint ? `${booking.departureDetails?.city || 'Origin'} (${booking.boardingPoint})` : (booking.departureDetails?.city || 'Origin');
  const to = booking.droppingPoint ? `${booking.arrivalDetails?.city || 'Destination'} (${booking.droppingPoint})` : (booking.arrivalDetails?.city || 'Destination');
  const seats = booking.seats?.join(', ') || 'N/A';

  return sendNotification({
    recipientId,
    recipientEmail,
    title: 'Booking Confirmed! 🎫',
    message: `Your bus trip from ${from} to ${to} on ${booking.departureDetails?.date} is confirmed. Seats: ${seats}. Have a safe journey!`,
    category: 'booking',
    actionUrl: '/profile',
    metadata: { bookingId: booking._id, seats: booking.seats, fare: booking.fare },
  });
}

export async function sendBookingCancellation(booking) {
  const recipientId = booking.customerId || booking.email;
  const recipientEmail = booking.email;
  const from = booking.boardingPoint ? `${booking.departureDetails?.city || 'Origin'} (${booking.boardingPoint})` : (booking.departureDetails?.city || 'Origin');
  const to = booking.droppingPoint ? `${booking.arrivalDetails?.city || 'Destination'} (${booking.droppingPoint})` : (booking.arrivalDetails?.city || 'Destination');

  return sendNotification({
    recipientId,
    recipientEmail,
    title: 'Booking Cancelled ℹ️',
    message: `Your booking for ${from} to ${to} has been cancelled and seats released.`,
    category: 'booking',
    actionUrl: '/profile',
    metadata: { bookingId: booking._id },
  });
}

export async function sendCommunityInteractionNotification({
  recipientId,
  recipientEmail,
  actorName,
  type, // 'comment' | 'reply' | 'like'
  postTitle,
  postId,
}) {
  let title = 'New Community Interaction';
  let message = '';

  if (type === 'comment') {
    title = 'New Comment on Your Story 💬';
    message = `${actorName} commented on your travel post: "${postTitle}"`;
  } else if (type === 'reply') {
    title = 'New Reply to Your Comment 💬';
    message = `${actorName} replied to your comment on "${postTitle}"`;
  } else if (type === 'like') {
    title = 'Someone Liked Your Story ❤️';
    message = `${actorName} liked your travel post: "${postTitle}"`;
  }

  return sendNotification({
    recipientId,
    recipientEmail,
    title,
    message,
    category: 'community',
    actionUrl: `/community?postId=${postId}`,
    metadata: { postId, type },
  });
}
