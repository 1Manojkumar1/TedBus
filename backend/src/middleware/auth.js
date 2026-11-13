import { OAuth2Client } from 'google-auth-library';

const clientid = process.env.GOOGLE_CLIENT_ID?.trim();
const authrequired = process.env.AUTH_REQUIRED === 'true';
const client = clientid ? new OAuth2Client(clientid) : null;
let warnedaboutignoredtoken = false;

if (authrequired && !clientid) {
  console.warn(
    'AUTH_REQUIRED=true but GOOGLE_CLIENT_ID is not set: every protected request will be rejected.'
  );
}

/**
 * Verifies a Google ID token when one is sent. Requests without a token keep
 * working while AUTH_REQUIRED is false so the seeded demo stays usable.
 */
export async function authenticate(req, _res, next) {
  req.auth = null;

  const header = req.get('authorization') ?? '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    return next();
  }

  if (!client) {
    // The browser sends a token but this API has no client ID to verify it
    // against. Treat the request as anonymous instead of breaking every call
    // for a signed-in user; with AUTH_REQUIRED=true requireauth rejects it.
    if (!warnedaboutignoredtoken) {
      warnedaboutignoredtoken = true;
      console.warn(
        'Ignoring bearer tokens: GOOGLE_CLIENT_ID is not set, so Google sign-in cannot be verified here.'
      );
    }
    return next();
  }

  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: clientid });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      if (authrequired) {
        const error = new Error('Google token did not include an email address');
        error.status = 401;
        return next(error);
      }
      return next();
    }

    req.auth = {
      email: payload.email,
      emailverified: payload.email_verified === true,
      sub: payload.sub,
      name: payload.name,
    };
    return next();
  } catch {
    if (authrequired) {
      const error = new Error('Google token is invalid or expired');
      error.status = 401;
      return next(error);
    }
    // With optional auth, fall back to anonymous request instead of breaking public endpoints
    return next();
  }
}

/** Rejects anonymous requests, but only when AUTH_REQUIRED is enabled. */
export function requireauth(req, _res, next) {
  if (!authrequired || req.auth) {
    return next();
  }

  const error = new Error('sign in with Google to use this endpoint');
  error.status = 401;
  return next(error);
}
