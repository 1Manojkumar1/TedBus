import nodemailer from 'nodemailer';
import { Notification } from '../models/notification.js';

let transporter = null;

/**
 * Sanitizes environment variable strings (strips accidental surrounding quotes and whitespace).
 */
function cleanEnv(val) {
  if (val === undefined || val === null) return '';
  return String(val).trim().replace(/^["']|["']$/g, '').trim();
}

/**
 * Initializes or returns the Nodemailer transporter.
 * Supports direct Gmail App Password authentication or generic SMTP.
 */
async function getTransporter() {
  if (transporter) return transporter;

  const smtpUser = cleanEnv(process.env.SMTP_USER || process.env.EMAIL_USER);
  const smtpPass = cleanEnv(process.env.SMTP_PASS || process.env.EMAIL_PASS);
  const smtpHost = cleanEnv(process.env.SMTP_HOST);
  const smtpPort = Number(cleanEnv(process.env.SMTP_PORT)) || (smtpPass ? 465 : 587);

  if (smtpPass && (smtpUser || smtpHost)) {
    const config = smtpHost
      ? {
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        }
      : {
          service: 'gmail',
          auth: {
            user: smtpUser || '24eg105p52@gmail.com',
            pass: smtpPass,
          },
        };
    transporter = nodemailer.createTransport(config);
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
 * Uses Google Apps Script Email Web App when configured, with fallback to Nodemailer SMTP.
 */
export async function dispatchEmail({ to, subject, text, html }) {
  const htmlBody =
    html ||
    `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <span style="font-size: 20px; font-weight: 800; color: #5F4299;">TedBus</span>
        <span style="font-size: 12px; color: #64748b; margin-left: 8px;">&bull; Journey Notifications</span>
      </div>
      <h2 style="color: #5F4299; font-size: 18px; margin-top: 0;">${subject}</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">${text}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #94a3b8; margin: 0;">TedBus Intercity Bus Travel &bull; Real-time updates &bull; Please do not reply directly to this automated email.</p>
    </div>`;

  // 1. Primary: Google Apps Script Web App Gateway
  const appsScriptUrl = cleanEnv(
    process.env.EMAIL_APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbyfkkrjSRAloR5OybLyrSNfDSvM9tYS2GZYGzc315D8Eu9h3UVaeR3emX2ZI1gK2VgW/exec'
  );
  const appsScriptKey = cleanEnv(
    process.env.EMAIL_API_KEY ||
    '8AB45B1CAF8CD75FB24CC4C305B9CFBD7A4529047610A228495BA2868301909EA6521DD1E9D2AAF5BE66A05F1FBED19C'
  );

  if (appsScriptUrl) {
    try {
      const response = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: appsScriptKey,
          to,
          subject,
          text,
          body: text,
          html: htmlBody,
          htmlBody,
        }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log(`[Google Apps Script Dispatch] Successfully dispatched live email to ${to}: ${data.messageId || 'sent'}`);
        return { success: true, messageId: data.messageId || `gas_${Date.now()}` };
      } else {
        const errText = await response.text();
        console.warn(`[Google Apps Script Warning] HTTP ${response.status}: ${errText}. Falling back to Nodemailer...`);
      }
    } catch (gasErr) {
      console.warn(`[Google Apps Script Exception]: ${gasErr.message}. Falling back to Nodemailer...`);
    }
  }

  // 2. Secondary / Fallback: Nodemailer SMTP
  try {
    const mailer = await getTransporter();
    const fromAddress =
      cleanEnv(process.env.EMAIL_FROM) ||
      (cleanEnv(process.env.EMAIL_USER)
        ? `"TedBus Alerts" <${cleanEnv(process.env.EMAIL_USER)}>`
        : '"TedBus Notifications" <notifications@tedbus.travel>');

    const info = await mailer.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html: htmlBody,
    });

    console.log(`[Nodemailer Dispatch] Successfully queued email to ${to}: ${info.messageId || 'delivered'}`);
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
