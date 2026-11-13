# Deployment guide — Render (API) + Vercel (frontend)

This project deploys as two services plus a managed database:

| Piece | Where | URL |
|---|---|---|
| Angular frontend | Vercel (static build) | `https://ted-bus-two.vercel.app` |
| Express API | Render (Node web service) | `https://tedbus-api-klsp.onrender.com` |
| MongoDB | MongoDB Atlas (M0 free tier) | `mongodb+srv://…` |

The repository already contains the deployment config:

- `render.yaml` — Render Blueprint for the API, with the health check and env vars.
- `frontend/vercel.json` — build command, output directory, SPA rewrites and cache headers.
- `frontend/src/environments/environment.prod.ts` — production API URL, swapped in by `angular.json` during `ng build`.
- `backend/package.json` / `frontend/package.json` — `engines` restricting Node to 22.12+.

Deploy in this order: **Atlas → Render → Vercel → connect the two → Google OAuth → (optional) Stripe**.

---

## 0. Prerequisites

- The repository pushed to GitHub (`1Manojkumar1/TedBus`).
- Accounts: [Render](https://render.com), [Vercel](https://vercel.com), [MongoDB Atlas](https://cloud.mongodb.com) — all have free tiers.
- The Google OAuth client ID already used locally.
- `mongosh` installed locally (for the one-time seed of Atlas).

---

## 1. MongoDB Atlas

1. Create a free **M0** cluster (any cloud/region; pick the one closest to your Render region, usually `Oregon (us-west-2)` or `Frankfurt`).
2. **Database Access → Add New Database User**
   - Authentication: password
   - Username: `tedbus`
   - Password: generate a strong one and store it — it goes into the connection string.
   - Role: `Atlas admin` is more than needed; use **Read and write to any database**.
3. **Network Access → Add IP Address**
   - Render's free tier has no static outbound IPs, so add `0.0.0.0/0`.
   - This is acceptable for a demo, but it means the database is reachable from anywhere, so the password must be strong. For a stricter setup, use a paid Render plan with static IPs and allowlist those only.
4. **Database → Connect → Drivers**, copy the SRV string and add the database name:

```
mongodb+srv://tedbus:<PASSWORD>@cluster0.xxxxx.mongodb.net/tedbus?retryWrites=true&w=majority
```

If your password contains `@`, `:`, `/` or `?`, URL-encode it (`@` → `%40`).

5. Seed the remote database from your machine (the seed script creates its own `tedbus` database handle, so run it against any database in the cluster):

```bash
mongosh "mongodb+srv://tedbus:<PASSWORD>@cluster0.xxxxx.mongodb.net/tedbus" tedbus-seed.js
```

Expected output ends with the inserted counts (12 routes, 26 buses, 1 customer, 2 bookings). Verify:

```bash
mongosh "mongodb+srv://…/tedbus" --quiet --eval 'db.routes.countDocuments()'
```

---

## 2. Render — the API

### 2a. Blueprint deploy (recommended)

1. Render Dashboard → **New → Blueprint**.
2. Connect the GitHub repository and select the `main` branch. Render reads `render.yaml` from the repo root.
3. Review the service `tedbus-api`:
   - Root directory `backend`
   - Build `npm ci`, start `npm start`
   - Health check `/api/health`
   - Plan **Free**
4. Render prompts for every `sync: false` variable:

| Variable | Value |
|---|---|
| `MONGODB_URI` | the Atlas SRV string from step 1 |
| `CORS_ORIGIN` | your Vercel URL (you can fill a temporary value now and correct it after step 3) |
| `APP_URL` | same Vercel URL |
| `GOOGLE_CLIENT_ID` | `885582649344-l65klot6nncg7vbn7jnc9i1gacfeqk9e.apps.googleusercontent.com` |
| `STRIPE_SECRET_KEY` | leave empty unless using Stripe |
| `STRIPE_WEBHOOK_SECRET` | leave empty unless using Stripe |

`AUTH_REQUIRED=false`, `PAYMENT_MODE=auto`, `NODE_VERSION=22.12.0` and `NODE_ENV=production` come from the blueprint.

5. **Apply** and wait for the first deploy. The logs should show `MongoDB connected: tedbus` and `Tedbus API listening on http://localhost:<PORT>` — Render's `PORT` is injected automatically, and Express binds it on all interfaces.

### 2b. Manual service (alternative)

**New → Web Service** → same repo → Root Directory `backend` → Runtime **Node** → Build `npm ci` → Start `npm start` → Health Check Path `/api/health` → add the same env vars by hand.

### 2c. Verify the API

```bash
curl https://tedbus-api-klsp.onrender.com/api/health
# {"status":"ok","database":"connected","payments":"mock","auth":"optional"}

curl "https://tedbus-api-klsp.onrender.com/api/routes/Hyderabad/Bengaluru/2026-12-01" | head -c 200
```

If health reports `"database":"disconnected"`, the Atlas URI or the IP allowlist is wrong — check the Render logs.

> **Free plan behaviour:** the service sleeps after ~15 minutes without traffic and takes 30–60 s to wake on the next request. The first page load after idle can therefore look slow or time out in the browser; this is expected, not a bug. Any paid instance type removes it.

### 2d. Note the URL

If the service name `tedbus-api` was already taken, Render appends a suffix (e.g. `tedbus-api-klsp.onrender.com`). The frontend has the URL hardcoded at build time, so either rename the service or update `frontend/src/environments/environment.prod.ts` and redeploy the frontend. This deployment already uses `https://tedbus-api-klsp.onrender.com`.

---

## 3. Vercel — the frontend

1. Vercel Dashboard → **Add New → Project** → import the same GitHub repository.
2. Configure the project:
   - **Root Directory:** `frontend` (important — this is where `vercel.json` and `package.json` live)
   - **Framework Preset:** Angular (auto-detected)
   - Build Command: `npm run build` (from `vercel.json`)
   - Output Directory: `dist/frontend/browser` (from `vercel.json`)
   - Install Command: `npm ci` (from `vercel.json`)
   - Environment variables: none needed. The API URL is compiled in from `environment.prod.ts` via `fileReplacements` in `angular.json`; `vercel.json` rewrites deep links such as `/selectbus` and `/profile` to `index.html`.
3. **Deploy**, then open the production URL (`https://ted-bus-two.vercel.app`). `/`, `/selectbus`, `/profile`, `/help` and `/cancellation` must all load directly (that proves the SPA rewrite works).
4. Copy the production domain (`https://ted-bus-two.vercel.app`, without a trailing slash).

### Preview deployments

Every branch/PR gets its own `*.vercel.app` URL. The API backend automatically accepts any `*.vercel.app` domain by default.

---

## 4. Connect the two

In Render → `tedbus-api` → **Environment**:

```
CORS_ORIGIN = https://ted-bus-two.vercel.app
APP_URL     = https://ted-bus-two.vercel.app
```

- No trailing slash, no wildcard, exact scheme (`https://`).
- Multiple allowed origins are comma separated.
- Render restarts the service automatically when you save.

Then hard-refresh the Vercel site and run a search. If the browser console shows a CORS error, the origin string does not match exactly (a common cause is `http://` vs `https://` or `localhost` vs the deployed domain).

---

## 5. Google OAuth for production

1. Google Cloud Console → **Google Auth Platform → Clients** → your Web application client.
2. Under **Authorized JavaScript origins**, add:

```
https://ted-bus-two.vercel.app
```

Keep `http://localhost:4200` and `http://127.0.0.1:4200` for local development.
3. No redirect URI is required — the Google button uses the postMessage flow.
4. Google Auth Platform → **Audience**: while the app is in *Testing*, only listed **test users** can sign in; add every account you will demo with. Publishing the app (Branding → Publish) removes the test-user limit; the basic `openid`, `email` and `profile` scopes do not require verification.
5. The **backend** must have the same client ID in `GOOGLE_CLIENT_ID`, otherwise token verification fails with 401 (`audience` mismatch).
6. Clear the old session and sign in again on the deployed site. A successful sign-in creates/updates the customer in Atlas.

The client **secret is not used or needed**. Do not put it in Vercel or Render.

---

## 6. Stripe (optional)

Skip this to stay in mock mode.

1. Stripe Dashboard → Developers → API keys → copy the **secret** key.
2. Render env: `STRIPE_SECRET_KEY=sk_...`, `PAYMENT_MODE=auto` (or `stripe`).
3. Stripe → Developers → Webhooks → **Add endpoint**:
   - URL: `https://tedbus-api-klsp.onrender.com/api/payments/webhook`
   - Event: `checkout.session.completed`
4. Copy the **signing secret** (`whsec_...`) into Render as `STRIPE_WEBHOOK_SECRET`.
5. Ensure `APP_URL` is the Vercel URL so Stripe redirects back to `/profile?payment=success`.

`GET /api/payments/config` should now return `{"mode":"stripe","stripeConfigured":true,"currency":"INR"}`.

---

## 7. Post-deploy verification checklist

Run through this once after both services are live:

- [ ] `GET /api/health` → `status: ok`, `database: connected`.
- [ ] Render logs show no Mongo errors and no repeated restarts.
- [ ] Vercel production URL loads the landing page with images and fonts.
- [ ] Deep links load when opened cold: `/selectbus?from=Hyderabad&to=Bengaluru&date=<future>`.
- [ ] Search returns buses (this exercises CORS and the API from the browser).
- [ ] Filters and sorting change the results.
- [ ] Google sign-in completes; the navbar shows your name and Google avatar.
- [ ] A booking can be created and appears under `/profile`.
- [ ] Cancelling a booking updates the status and refund amount.
- [ ] Restart/shutdown resilience: after the Render instance sleeps, the next request wakes it within a minute.
- [ ] MongoDB Atlas shows the new `customers` / `bookings` documents.

---

## 8. Custom domains (optional)

1. Vercel → Project → Settings → Domains → add `tedbus.example.com` and follow the DNS instructions.
2. Update, in this order:
   - Google OAuth **Authorized JavaScript origins**: add `https://tedbus.example.com`.
   - Render `CORS_ORIGIN` and `APP_URL`: set to the custom domain (keep the `*.vercel.app` origin too if you still use it).
3. Redeploy the frontend only if `environment.prod.ts` changes (the API URL, not the site URL).

---

## 9. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Access to fetch ... blocked by CORS policy` | `CORS_ORIGIN` doesn't match the page origin exactly. No trailing slash; include `https://`; add comma-separated extra origins. |
| API returns 401 on sign-in | `GOOGLE_CLIENT_ID` missing/different on Render, or the client ID in `environment.prod.ts` differs. They must match. |
| API returns 503 on every call after sign-in | Old behaviour, already fixed: the API now ignores unverifiable tokens when `GOOGLE_CLIENT_ID` is unset. Ensure the env var is actually set. |
| `"database":"disconnected"` / server exits at boot | Wrong `MONGODB_URI`, unencoded password characters, or Atlas IP allowlist missing `0.0.0.0/0`. |
| Vercel build fails: "Could not find dist/frontend/browser" | Root Directory wasn't set to `frontend`, or a custom build command/output path overrode `vercel.json`. |
| Vercel build fails on Node version | Project Settings → General → Node.js Version → 22.x (matches `engines`). |
| Direct visit to `/profile` gives 404 | SPA rewrite not applied — `vercel.json` must be in the configured Root Directory (`frontend`). |
| First request takes ~1 minute | Render free instance waking from sleep. |
| Google popup opens then closes instantly | The account isn't a test user while the OAuth app is in Testing. |
| Login works locally but not on Vercel | The Vercel origin is missing from the OAuth client's authorized JavaScript origins. |

---

## 10. Ongoing deploys and rollback

- **Render:** `autoDeploy: true` in `render.yaml` — every push to `main` under `backend/` triggers a build. Roll back via Render → Deploys → **Rollback**.
- **Vercel:** pushes to `main` deploy to production, other branches create previews. Roll back via Deployments → **Promote to Production** on an earlier build.
- **Frontend/backend contract:** the API URL is compiled into the frontend. If the Render URL changes, update `environment.prod.ts`, commit and push.
- Changing env vars on Render restarts the service; changing env vars on Vercel requires a redeploy to take effect (the Angular build has no runtime env).

## 11. Free-tier limits to expect

| Service | Limit that matters here |
|---|---|
| Render Free | Sleeps after ~15 min idle; 512 MB RAM; cold starts |
| Vercel Hobby | 100 GB bandwidth/month; serverless-free static hosting is effectively unlimited for this app |
| Atlas M0 | 512 MB storage; shared CPU; may throttle |
| Google OAuth | Test users capped (100) while unverified |
