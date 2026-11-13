import { createHmac, timingSafeEqual } from 'node:crypto';
import { Booking } from '../models/booking.js';
import {
  assertseatsfree,
  persistbooking,
  validatebooking,
} from '../services/booking.js';
import { ownscustomer } from '../services/access.js';

const stripekey = process.env.STRIPE_SECRET_KEY?.trim() ?? '';
const webhooksecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? '';
const appurl = (process.env.APP_URL ?? 'http://localhost:4200').replace(/\/$/, '');

export function paymentmode() {
  const requested = (process.env.PAYMENT_MODE ?? 'auto').toLowerCase();
  if (requested === 'stripe' && stripekey) {
    return 'stripe';
  }
  if (requested === 'stripe') {
    return 'unconfigured';
  }
  if (requested === 'mock') {
    return 'mock';
  }
  return stripekey ? 'stripe' : 'mock';
}

export function getpaymentconfig(_req, res) {
  const mode = paymentmode();
  res.json({
    mode: mode === 'unconfigured' ? 'mock' : mode,
    stripeConfigured: Boolean(stripekey),
    currency: 'INR',
  });
}

async function createstripesession(booking) {
  const params = new URLSearchParams({
    mode: 'payment',
    success_url: `${appurl}/profile?payment=success&booking=${booking._id}`,
    cancel_url: `${appurl}/profile?payment=cancelled`,
    customer_email: booking.email,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'inr',
    'line_items[0][price_data][unit_amount]': String(Math.round(booking.fare * 100)),
    'line_items[0][price_data][product_data][name]': `Bus ticket ${booking.departureDetails.city} to ${booking.arrivalDetails.city}`,
    'line_items[0][price_data][product_data][description]': `${booking.seats.length} seat(s) · ${booking.seats.join(', ')}`,
    'metadata[bookingId]': String(booking._id),
    'payment_intent_data[metadata][bookingId]': String(booking._id),
  });

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripekey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Stripe rejected the checkout session');
  }

  return payload;
}

/**
 * Creates the booking (holding its seats) and either completes it immediately
 * in mock mode or hands back a Stripe Checkout URL.
 */
export async function createcheckout(req, res) {
  const body = req.body ?? {};
  const problem = validatebooking(body);
  if (problem) {
    return res.status(400).json({ error: problem });
  }

  if (!(await ownscustomer(req, body.customerId))) {
    return res.status(403).json({ error: 'you can only pay for your own booking' });
  }

  try {
    await assertseatsfree({
      busId: body.busId,
      date: body.departureDetails.date,
      seats: body.seats,
    });
  } catch (error) {
    return res.status(error.status ?? 500).json({ error: error.message });
  }

  const mode = paymentmode();
  if (mode === 'unconfigured') {
    return res.status(503).json({
      error: 'Stripe is selected but STRIPE_SECRET_KEY is missing on the API',
    });
  }

  const booking = await persistbooking(body, {
    status: mode === 'stripe' ? 'pending' : 'upcoming',
  });

  if (mode === 'mock') {
    booking.payment = {
      provider: 'mock',
      reference: `mock_${booking._id}`,
      amount: booking.fare,
      paidAt: new Date(),
    };
    await booking.save();
    return res.status(201).json({ mode, booking });
  }

  try {
    const session = await createstripesession(booking);
    booking.payment = { provider: 'stripe', reference: session.id, amount: booking.fare };
    await booking.save();
    return res.status(201).json({
      mode,
      bookingId: booking._id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    // Do not keep seats locked if Stripe could not start a payment.
    await Booking.deleteOne({ _id: booking._id }).exec();
    return res.status(502).json({ error: error.message });
  }
}

function verifystripesignature(rawbody, header) {
  if (!webhooksecret || !header) {
    return false;
  }

  const parts = Object.fromEntries(
    header.split(',').map((part) => {
      const [key, value] = part.split('=');
      return [key?.trim(), value?.trim()];
    })
  );

  const timestamp = Number(parts.t);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) {
    return false;
  }

  const expected = createHmac('sha256', webhooksecret)
    .update(`${parts.t}.${rawbody.toString()}`)
    .digest();
  const received = Buffer.from(parts.v1 ?? '', 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function stripewebhook(req, res) {
  if (!verifystripesignature(req.body, req.get('stripe-signature'))) {
    return res.status(400).json({ error: 'invalid Stripe webhook signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: 'invalid webhook payload' });
  }

  const session = event?.data?.object;
  const bookingid = session?.metadata?.bookingId;

  if (bookingid) {
    if (event.type === 'checkout.session.completed' && session.payment_status === 'paid') {
      await Booking.updateOne(
        { _id: bookingid },
        {
          $set: {
            status: 'upcoming',
            payment: {
              provider: 'stripe',
              reference: session.id,
              amount: (session.amount_total ?? 0) / 100,
              paidAt: new Date(),
            },
          },
        }
      ).exec();
    }

    if (event.type === 'checkout.session.expired') {
      await Booking.updateOne(
        { _id: bookingid, status: 'pending' },
        { $set: { status: 'cancelled', cancelledAt: new Date() } }
      ).exec();
    }
  }

  return res.json({ received: true });
}
