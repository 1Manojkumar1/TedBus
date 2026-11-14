import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import customerroutes from './routes/customer.js';
import bookingroutes from './routes/booking.js';
import routeroutes from './routes/route.js';
import busroutes from './routes/bus.js';
import paymentroutes from './routes/payment.js';
import communityroutes from './routes/community.js';
import notificationroutes from './routes/notification.js';
import reviewroutes from './routes/review.js';
import savedroutes from './routes/savedRoute.js';
import adminroutes from './routes/admin.js';
import supportroutes from './routes/support.js';
import { stripewebhook, paymentmode } from './controllers/payment.js';
import { authenticate } from './middleware/auth.js';
import { errorhandler, notfound } from './middleware/errors.js';

export function createapp() {
  const app = express();

  const rawOrigins = process.env.CORS_ORIGIN || '';
  const allowedorigins = rawOrigins
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, '').replace(/^["']|["']$/g, ''))
    .filter(Boolean);

  const isOriginAllowed = (origin) => {
    if (!origin) return true;
    const clean = origin.trim().replace(/\/+$/, '').replace(/^["']|["']$/g, '');

    // Allow wildcard or explicit origin match
    if (allowedorigins.includes('*') || allowedorigins.includes(clean)) {
      return true;
    }

    // Always allow localhost & 127.0.0.1 on any port for local development
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) {
      return true;
    }

    // Always allow any vercel deployment (production, preview, branch deploys)
    if (/^https:\/\/[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*\.vercel\.app$/.test(clean)) {
      return true;
    }

    // Always allow onrender.com subdomains
    if (/^https:\/\/[a-zA-Z0-9_-]+\.onrender\.com$/.test(clean)) {
      return true;
    }

    return false;
  };

  const corsMiddleware = cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  app.use(corsMiddleware);
  app.options('*', corsMiddleware);

  // Stripe signs the raw request body, so this route must stay above express.json().
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripewebhook);

  app.use(express.json({ limit: '1mb' }));
  app.use('/api', authenticate);

  app.get('/', (_req, res) => {
    res.json({
      name: 'Tedbus REST API',
      status: 'running',
      health: '/api/health',
      routes: '/api/routes',
    });
  });

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
  app.use('/api/community', communityroutes);
  app.use('/api/notifications', notificationroutes);
  app.use('/api/reviews', reviewroutes);
  app.use('/api/saved-routes', savedroutes);
  app.use('/api/admin', adminroutes);
  app.use('/api/support', supportroutes);

  app.use(notfound);
  app.use(errorhandler);

  return app;
}
