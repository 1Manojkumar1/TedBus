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
 * Strictly brands all sender headers, titles, subjects, and HTML layouts as TedBus.
 */
export async function dispatchEmail({ to, subject, text, html }) {
  const brandSubject =
    subject && (subject.includes('TedBus') || subject.includes('[TedBus]'))
      ? subject
      : `TedBus 🚌 • ${subject}`;

  const plainText = `[TedBus Intercity Bus Travel]
--------------------------------------------------
${brandSubject}

${text}

--------------------------------------------------
TedBus India • 24/7 Traveler Care • https://tedbus-frontend.vercel.app
Safe & Seamless Intercity Journeys
Please do not reply directly to this automated email.`;

  const htmlBody =
    html ||
    `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(95, 66, 153, 0.08);">
      <!-- TedBus Header Banner -->
      <div style="background: linear-gradient(135deg, #4b337e 0%, #5F4299 100%); padding: 26px 32px; color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="display: inline-block; vertical-align: middle;">
                <span style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">TedBus</span>
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #e9d5ff; margin-left: 8px; padding: 2px 8px; background: rgba(255,255,255,0.18); border-radius: 20px; vertical-align: middle; font-weight: 600;">Intercity Travel</span>
              </div>
            </td>
            <td align="right">
              <span style="font-size: 26px;">🚌</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Message Body -->
      <div style="padding: 32px; color: #1e293b;">
        <h1 style="color: #5F4299; font-size: 19px; font-weight: 800; margin-top: 0; margin-bottom: 16px; line-height: 1.4;">
          ${brandSubject}
        </h1>
        <div style="font-size: 14px; line-height: 1.7; color: #334155; margin-bottom: 24px; white-space: pre-line;">
          ${text}
        </div>
        <div style="text-align: center; margin: 28px 0 10px;">
          <a href="https://tedbus-frontend.vercel.app" style="display: inline-block; background-color: #5F4299; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px; box-shadow: 0 2px 6px rgba(95,66,153,0.3);">
            Open TedBus App &rarr;
          </a>
        </div>
      </div>

      <!-- Official TedBus Footer -->
      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
        <p style="font-size: 12px; font-weight: 700; color: #5F4299; margin: 0 0 6px;">
          TedBus Mobility Network &bull; India's Verified Smart Bus Platform
        </p>
        <p style="font-size: 11px; color: #94a3b8; margin: 0 0 8px; line-height: 1.5;">
          You received this message because you have an account or active booking on TedBus.<br />
          Please do not reply directly to this automated email.
        </p>
        <p style="font-size: 10px; color: #cbd5e1; margin: 0;">
          &copy; ${new Date().getFullYear()} TedBus Travel Technologies. All rights reserved.
        </p>
      </div>
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
          name: 'TedBus',
          senderName: 'TedBus',
          fromName: 'TedBus Intercity Travel',
          sender: 'TedBus',
          appName: 'TedBus',
          app: 'TedBus',
          brand: 'TedBus',
          company: 'TedBus',
          from: 'TedBus <notifications@tedbus.travel>',
          subject: brandSubject,
          text: plainText,
          body: plainText,
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
      subject: brandSubject,
      text: plainText,
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
