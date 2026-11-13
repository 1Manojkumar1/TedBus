import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import customerroutes from './routes/customer.js';
import bookingroutes from './routes/booking.js';
import routeroutes from './routes/route.js';
import busroutes from './routes/bus.js';
import paymentroutes from './routes/payment.js';
import { stripewebhook, paymentmode } from './controllers/payment.js';
import { authenticate } from './middleware/auth.js';
import { errorhandler, notfound } from './middleware/errors.js';

export function createapp() {
  const app = express();

  const allowedorigins = (process.env.CORS_ORIGIN ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedorigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`origin ${origin} is not allowed by CORS`));
      },
    })
  );

  // Stripe signs the raw request body, so this route must stay above express.json().
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripewebhook);

  app.use(express.json({ limit: '1mb' }));
  app.use('/api', authenticate);

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      payments: paymentmode(),
      auth: process.env.AUTH_REQUIRED === 'true' ? 'required' : 'optional',
    });
  });

  app.use('/api/customers', customerroutes);
  app.use('/api/bookings', bookingroutes);
  app.use('/api/routes', routeroutes);
  app.use('/api/buses', busroutes);
  app.use('/api/payments', paymentroutes);

  app.use(notfound);
  app.use(errorhandler);

  return app;
}
