import { Notification } from '../models/notification.js';
import { NotificationPreference } from '../models/notificationPreference.js';
import { Booking } from '../models/booking.js';
import { Customer } from '../models/customer.js';
import { getLocalizedContent } from './notificationTemplates.js';
import { dispatchEmail, dispatchWebPush, retryFailedDeliveries } from './notificationDelivery.js';

export { retryFailedDeliveries };

/**
 * Dispatches a multi-channel notification to a customer, respecting their preferences
 * and generating the message in their chosen language.
 */
export async function sendNotification({
  recipientId,
  recipientEmail,
  templateKey,
  templateParams = {},
  title,
  message,
  category = 'system',
  actionUrl = '/profile',
  channels = ['in_app'],
  metadata = {},
}) {
  if (!recipientId && !recipientEmail) {
    return null;
  }

  try {
    const emailLower = recipientEmail ? recipientEmail.toLowerCase() : '';

    // Retrieve user preferences
    const prefs = await NotificationPreference.findOne({
      $or: [
        ...(recipientId ? [{ customerId: recipientId }] : []),
        ...(emailLower ? [{ email: emailLower }] : []),
      ],
    }).lean().exec();

    const lang = prefs?.preferredLanguage || 'en';

    // Check opt-out rules
    if (prefs) {
      if (category === 'booking' && prefs.bookingUpdates === false) return null;
      if (category === 'community' && prefs.communityInteractions === false) return null;
      if (category === 'promo' && prefs.promotionalOffers === false) return null;
      if (category === 'trip' && prefs.journeyReminders === false) return null;
    }

    // Resolve localized title and message
    let finalTitle = title;
    let finalMessage = message;

    if (templateKey) {
      const localized = getLocalizedContent(templateKey, lang, templateParams);
      finalTitle = localized.title || title;
      finalMessage = localized.message || message;
    }

    // Determine active channels based on preferences
    const activeChannels = [];
    if (prefs ? prefs.inAppEnabled !== false : true) {
      activeChannels.push('in_app');
    }
    if (prefs ? prefs.emailEnabled : true) {
      activeChannels.push('email');
    }
    if (prefs?.pushEnabled) {
      activeChannels.push('push');
    }

    if (activeChannels.length === 0) {
      activeChannels.push('in_app');
    }

    // Create the persistent notification record in MongoDB (History Log)
    const notification = await Notification.create({
      recipientId: recipientId || emailLower,
      recipientEmail: emailLower,
      title: finalTitle,
      message: finalMessage,
      category,
      actionUrl,
      channel: activeChannels[0] || 'in_app',
      channels: activeChannels,
      deliveryStatus: 'pending',
      deliveryAttempts: 1,
      lastAttemptAt: new Date(),
      language: lang,
      metadata: { ...metadata, templateKey, lang },
    });

    let overallSuccess = true;
    let failureDetail = null;

    // Dispatch Email if enabled and email address exists
    if (activeChannels.includes('email') && emailLower) {
      const emailResult = await dispatchEmail({
        to: emailLower,
        subject: finalTitle,
        text: finalMessage,
      });
      if (!emailResult.success) {
        overallSuccess = false;
        failureDetail = `Email: ${emailResult.error}`;
      }
    }

    // Dispatch Web Push if enabled and user has subscription
    if (activeChannels.includes('push') && prefs?.pushSubscription) {
      const pushResult = await dispatchWebPush(prefs.pushSubscription, {
        title: finalTitle,
        body: finalMessage,
        url: actionUrl,
      });
      if (!pushResult.success) {
        // Push warning recorded but doesn't fail in-app
        console.warn(`Push dispatch notice: ${pushResult.error}`);
      }
    }

    // Update delivery status
    notification.deliveryStatus = overallSuccess ? 'delivered' : 'failed';
    notification.failureReason = failureDetail;
    if (!overallSuccess) {
      // Schedule initial retry in 2 minutes
      notification.nextRetryAt = new Date(Date.now() + 2 * 60 * 1000);
    }
    await notification.save();

    return notification;
  } catch (err) {
    console.error('sendNotification failed:', err);
    return null;
  }
}

/**
 * 1. Booking Confirmation Notification
 */
export async function sendBookingConfirmation(booking) {
  const recipientId = booking.customerId || booking.email;
  const recipientEmail = booking.email;
  const from = booking.boardingPoint
    ? `${booking.departureDetails?.city || 'Origin'} (${booking.boardingPoint})`
    : (booking.departureDetails?.city || 'Origin');
  const to = booking.droppingPoint
    ? `${booking.arrivalDetails?.city || 'Destination'} (${booking.droppingPoint})`
    : (booking.arrivalDetails?.city || 'Destination');
  const seats = booking.seats?.join(', ') || 'N/A';
  const date = booking.departureDetails?.date || 'Upcoming';

  return sendNotification({
    recipientId,
    recipientEmail,
    templateKey: 'booking_confirmed',
    templateParams: { from, to, seats, date },
    category: 'booking',
    actionUrl: '/profile',
    metadata: {
      bookingId: booking._id,
      seats: booking.seats,
      fare: booking.fare,
      pnr: booking.pnr || String(booking._id).slice(-8).toUpperCase(),
    },
  });
}

/**
 * 2. Booking Cancellation Notification
 */
export async function sendBookingCancellation(booking) {
  const recipientId = booking.customerId || booking.email;
  const recipientEmail = booking.email;
  const from = booking.departureDetails?.city || 'Origin';
  const to = booking.arrivalDetails?.city || 'Destination';

  return sendNotification({
    recipientId,
    recipientEmail,
    templateKey: 'booking_cancelled',
    templateParams: { from, to },
    category: 'booking',
    actionUrl: '/profile',
    metadata: {
      bookingId: booking._id,
      pnr: booking.pnr || String(booking._id).slice(-8).toUpperCase(),
    },
  });
}

/**
 * 3. Schedule Change Notification (when route or departure time changes)
 */
export async function sendScheduleChangeNotification({
  booking,
  oldTime,
  newTime,
  operatorName = 'Bus Operator',
}) {
  const recipientId = booking.customerId || booking.email;
  const recipientEmail = booking.email;
  const from = booking.departureDetails?.city || 'Origin';
  const to = booking.arrivalDetails?.city || 'Destination';
  const date = booking.departureDetails?.date || 'Journey Date';

  return sendNotification({
    recipientId,
    recipientEmail,
    templateKey: 'schedule_changed',
    templateParams: {
      from,
      to,
      date,
      oldTime,
      newTime,
      operatorName,
    },
    category: 'trip',
    actionUrl: '/profile',
    metadata: {
      bookingId: booking._id,
      oldTime,
      newTime,
      operatorName,
    },
  });
}

/**
 * 4. Upcoming Journey Reminder Notification (sent prior to departure)
 */
export async function sendJourneyReminderNotification({
  booking,
  hoursLeft = 4,
}) {
  const recipientId = booking.customerId || booking.email;
  const recipientEmail = booking.email;
  const to = booking.arrivalDetails?.city || 'Destination';
  const departureTime = booking.departureDetails?.time || 'Scheduled Time';
  const boardingPoint = booking.boardingPoint || booking.departureDetails?.city || 'Boarding Point';

  return sendNotification({
    recipientId,
    recipientEmail,
    templateKey: 'journey_reminder',
    templateParams: {
      to,
      hoursLeft,
      departureTime,
      boardingPoint,
    },
    category: 'trip',
    actionUrl: '/profile',
    metadata: {
      bookingId: booking._id,
      hoursLeft,
      departureTime,
      boardingPoint,
    },
  });
}

/**
 * 5. Promotional & Offer Notification (broadcast or targeted)
 */
export async function sendPromotionalNotification({
  recipientId,
  recipientEmail,
  code = 'TEDTRIP',
  discount = '15% OFF',
  title,
  message,
}) {
  return sendNotification({
    recipientId,
    recipientEmail,
    templateKey: 'promotional_offer',
    templateParams: { code, discount, title, message },
    category: 'promo',
    actionUrl: '/',
    metadata: { code, discount },
  });
}

/**
 * 6. Community Interaction Notification
 */
export async function sendCommunityInteractionNotification({
  recipientId,
  recipientEmail,
  actorName,
  type, // 'comment' | 'reply' | 'like'
  postTitle,
  postId,
}) {
  return sendNotification({
    recipientId,
    recipientEmail,
    templateKey: 'community_interaction',
    templateParams: { actorName, type, postTitle },
    category: 'community',
    actionUrl: `/community?postId=${postId}`,
    metadata: { postId, type },
  });
}

/**
 * Periodic scanner for upcoming journeys to dispatch automatic reminders.
 */
export async function scanUpcomingJourneys() {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Find active confirmed bookings departing today
    const upcomingBookings = await Booking.find({
      'departureDetails.date': today,
      status: { $in: ['confirmed', 'booked', 'active'] },
    }).limit(50).lean().exec();

    let sentCount = 0;
    for (const b of upcomingBookings) {
      // Check if reminder was already sent today for this booking
      const alreadySent = await Notification.findOne({
        'metadata.bookingId': b._id,
        category: 'trip',
        'metadata.hoursLeft': { $exists: true },
      }).exec();

      if (!alreadySent) {
        await sendJourneyReminderNotification({
          booking: b,
          hoursLeft: 4,
        });
        sentCount++;
      }
    }

    return { scanned: upcomingBookings.length, remindersSent: sentCount };
  } catch (err) {
    console.error('scanUpcomingJourneys error:', err);
    return { error: err.message };
  }
}

/**
 * Validates whether an account is a genuine Google Sign-In account.
 * Excludes all seeded dummy accounts (@tedbus.test, @tedbus.community, etc.).
 */
export function isRealGoogleAccount(c) {
  if (!c || !c.email) return false;
  const email = c.email.toLowerCase().trim();

  // Exclude all dummy seeded email domains
  if (
    email.endsWith('.test') ||
    email.endsWith('.community') ||
    email.endsWith('.example') ||
    email.includes('@tedbus.test') ||
    email.includes('@tedbus.community')
  ) {
    return false;
  }

  // Must have a genuine Google Sign-In ID (from Google OAuth)
  if (!c.googleId) return false;

  // Exclude mock / synthetic seed googleIds
  if (
    c.googleId.startsWith('demo-') ||
    c.googleId.startsWith('google-') ||
    c.googleId === 'mock-google-id'
  ) {
    return false;
  }

  return true;
}

/**
 * Retrieves all verified passenger accounts created using Google Sign In from the database.
 * Completely filters out dummy seeded test accounts (@tedbus.test, @tedbus.community, etc.).
 */
export async function getAllPassengerAccounts() {
  const customers = await Customer.find({
    email: { $exists: true, $ne: '' },
    googleId: { $exists: true, $ne: '' },
  })
    .select('name email phoneNumber googleId')
    .lean()
    .exec();

  const realGoogleCustomers = customers.filter(isRealGoogleAccount);

  const emailMap = new Map();

  for (const c of realGoogleCustomers) {
    if (c.email) {
      const em = c.email.toLowerCase().trim();
      emailMap.set(em, {
        customerId: c._id ? c._id.toString() : em,
        name: c.name || 'Valued Passenger',
        email: em,
        googleId: c.googleId,
        source: 'google_sign_in',
      });
    }
  }

  return Array.from(emailMap.values());
}

/**
 * Broadcasts an announcement or alert message to ALL registered passenger accounts in the database.
 * Dispatches both in-app notification logs and live emails to each passenger's mailbox.
 * Processes in batches of 5 to ensure reliable delivery without hitting rate-limits.
 */
export async function broadcastToAllPassengers({
  title,
  message,
  category = 'system',
  actionUrl = '/notifications',
  code,
  discount,
  sendEmailChannel = true,
}) {
  const passengers = await getAllPassengerAccounts();
  console.log(`[Broadcast Engine] Dispatching message to all ${passengers.length} passenger accounts in database...`);

  let dispatched = 0;
  let delivered = 0;
  let failed = 0;

  // Dispatch in controlled batches of 5
  const batchSize = 5;
  for (let i = 0; i < passengers.length; i += batchSize) {
    const batch = passengers.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (passenger) => {
        try {
          const channels = ['in_app'];
          if (sendEmailChannel) {
            channels.push('email');
          }

          const notif = await sendNotification({
            recipientId: passenger.customerId,
            recipientEmail: passenger.email,
            title: title || 'Important Notice from TedBus 🚌',
            message: message || 'We have an important travel update for your account.',
            category,
            actionUrl,
            channels,
            metadata: {
              broadcastToAll: true,
              passengerName: passenger.name,
              code,
              discount,
            },
          });

          dispatched++;
          if (notif?.deliveryStatus === 'delivered') {
            delivered++;
          } else {
            failed++;
          }
        } catch (err) {
          console.error(`[Broadcast Error] Failed for ${passenger.email}:`, err.message);
          failed++;
        }
      })
    );

    if (i + batchSize < passengers.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return {
    success: true,
    totalPassengers: passengers.length,
    dispatched,
    delivered,
    failed,
  };
}
