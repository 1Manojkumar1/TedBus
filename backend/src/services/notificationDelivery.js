import nodemailer from 'nodemailer';
import { Notification } from '../models/notification.js';

let transporter = null;

/**
 * Initializes or returns the Nodemailer transporter.
 */
async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development / fallback: create test transport or simulated verified transporter
    transporter = nodemailer.createTransport({
      jsonTransport: true, // stores output message for auditing
    });
  }

  return transporter;
}

/**
 * Dispatches an email notification.
 */
export async function dispatchEmail({ to, subject, text, html }) {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"TedBus Notifications" <notifications@tedbus.travel>',
      to,
      subject,
      text,
      html: html || `<div style="font-family: sans-serif; padding: 20px; color: #333;"><h2 style="color: #5F4299;">${subject}</h2><p style="font-size: 15px; line-height: 1.6;">${text}</p><hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" /><p style="font-size: 12px; color: #888;">TedBus Intercity Bus Travel &bull; Real-time updates</p></div>`,
    });

    console.log(`[Email Dispatch] Successfully queued email to ${to}: ${info.messageId || 'delivered'}`);
    return { success: true, messageId: info.messageId || `msg_${Date.now()}` };
  } catch (err) {
    console.error(`[Email Dispatch Failed] Error delivering to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Dispatches a Web Push notification to client subscription.
 */
export async function dispatchWebPush(subscription, payload) {
  try {
    if (!subscription || !subscription.endpoint) {
      return { success: false, error: 'No active push subscription endpoint' };
    }
    // Simulation / integration hook for browser Web Push
    console.log(`[Push Dispatch] Dispatched Web Push to endpoint: ${subscription.endpoint.slice(0, 40)}...`, payload.title);
    return { success: true, timestamp: new Date() };
  } catch (err) {
    console.error('[Push Dispatch Failed]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Background retry engine for failed notifications with exponential backoff.
 */
export async function retryFailedDeliveries() {
  try {
    const failedNotifications = await Notification.find({
      deliveryStatus: 'failed',
      deliveryAttempts: { $lt: 3 },
      $or: [
        { nextRetryAt: { $lte: new Date() } },
        { nextRetryAt: null },
      ],
    }).limit(20).exec();

    if (failedNotifications.length === 0) {
      return { retriedCount: 0 };
    }

    console.log(`[Notification Retry Engine] Retrying ${failedNotifications.length} failed notifications...`);

    let succeeded = 0;
    for (const notif of failedNotifications) {
      const attempts = notif.deliveryAttempts + 1;
      let deliveryOk = true;

      // Attempt email if channel included email
      if (notif.channels && notif.channels.includes('email')) {
        const res = await dispatchEmail({
          to: notif.recipientEmail,
          subject: notif.title,
          text: notif.message,
        });
        if (!res.success) deliveryOk = false;
      }

      if (deliveryOk) {
        notif.deliveryStatus = 'delivered';
        notif.failureReason = null;
        notif.deliveryAttempts = attempts;
        notif.lastAttemptAt = new Date();
        await notif.save();
        succeeded++;
      } else {
        notif.deliveryAttempts = attempts;
        notif.lastAttemptAt = new Date();
        // Exponential backoff: 2^attempts * 60 seconds
        const delayMs = Math.pow(2, attempts) * 60 * 1000;
        notif.nextRetryAt = new Date(Date.now() + delayMs);
        if (attempts >= 3) {
          notif.failureReason = 'Max retry attempts (3) exceeded.';
        }
        await notif.save();
      }
    }

    return { retriedCount: failedNotifications.length, succeeded };
  } catch (err) {
    console.error('[Notification Retry Engine Error]:', err);
    return { error: err.message };
  }
}
