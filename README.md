# TedBus

A RedBus-style bus ticket booking app: an Angular 21 single-page frontend backed by an Express + MongoDB API. Search routes, compare buses, pick seats, book and pay (mock or Stripe), then manage trips and cancellations from a profile page.

## Features

- **Search** routes by departure, arrival and date, with past dates rejected.
- **Results** with live filtering (operator, bus type, departure window, amenities) and sorting by fare, departure or rating.
- **Seat selection** with per-bus seat maps and live availability.
- **Booking** with passenger details, contact info, insurance/business-travel toggles.
- **Payments** through Stripe Checkout when configured, or a built-in mock gateway otherwise.
- **Google sign-in** using Google Identity Services; ID tokens are verified server-side.
- **Profile** with upcoming/completed trips, booking details, cancellation and refund quotes, and a wallet summary.
- **Help/Cancellation** information pages.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21 (standalone components, signals), Angular Material, Tailwind CSS |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB |
| Auth | Google Identity Services + `google-auth-library` |
| Payments | Stripe Checkout (optional) or mock mode |
| Tests | Vitest via the Angular test builder |

## Repository layout

```
.
├── backend/            Express API
│   ├── src/
│   │   ├── config/     MongoDB connection
│   │   ├── controllers/ request handlers
│   │   ├── middleware/ auth, errors
│   │   ├── models/     Mongoose schemas
│   │   ├── routes/     API routers
│   │   ├── services/   booking and access helpers
│   │   └── server.js   entry point
│   └── .env.example    environment template
├── frontend/           Angular app
│   └── src/app/
│       ├── Component/  pages and UI components
│       ├── model/      domain types and fare/time helpers
│       └── service/    API clients, auth, shared search state
└── tedbus-seed.js      demo data seed script
```

## Prerequisites

- Node.js 22 or newer (developed on Node 24)
- npm
- MongoDB running locally on `mongodb://127.0.0.1:27017`
- `mongosh` for seeding
- (Optional) a Google Cloud OAuth client ID for sign-in
- (Optional) Stripe keys for real payments

## Quick start

### 1. Start MongoDB

```bash
mongosh --quiet --eval 'db.runCommand({ping:1}).ok'   # prints 1 when reachable
```

### 2. Seed the database (first run only)

```bash
mongosh "mongodb://127.0.0.1:27017/tedbus" tedbus-seed.js
```

Creates 12 routes, 26 buses, one demo customer and two demo bookings. Re-running replaces only the demo records.

### 3. Start the API

```bash
cd backend
npm install
cp .env.example .env      # then edit the values you need
npm run dev               # or: npm start
```

The API listens on <http://localhost:3000>. Verify:

```bash
curl http://localhost:3000/api/health
# {"status":"ok","database":"connected","payments":"mock","auth":"optional"}
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm start
```

Open <http://localhost:4200>. The frontend calls `http://localhost:3000/api`, so keep the API on port 3000 or update `apiUrl` in `frontend/src/environments/environment.ts`.

## Configuration

### `backend/.env`

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | API port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/tedbus` | MongoDB connection string |
| `CORS_ORIGIN` | `http://localhost:4200` | Allowed origins, comma separated |
| `APP_URL` | `http://localhost:4200` | Frontend URL used for Stripe redirects |
| `GOOGLE_CLIENT_ID` | empty | Enables Google ID-token verification |
| `AUTH_REQUIRED` | `false` | `true` blocks anonymous booking/customer writes |
| `PAYMENT_MODE` | `auto` | `auto`, `stripe` or `mock` |
| `STRIPE_SECRET_KEY` | empty | Enables Stripe Checkout when `PAYMENT_MODE` allows it |
| `STRIPE_WEBHOOK_SECRET` | empty | Verifies `/api/payments/webhook` signatures |

`backend/.env` is gitignored. Commit only `.env.example`.

### `frontend/src/environments/environment.ts`

| Field | Purpose |
|---|---|
| `production` | Build flag |
| `apiUrl` | Base URL of the API |
| `googleClientId` | OAuth **Web application** client ID |

## Google sign-in setup

1. In Google Cloud Console create a project, then configure **Google Auth Platform → Audience** as *External* and add your Gmail under **Test users**.
2. Create an OAuth client of type **Web application** with authorized JavaScript origins `http://localhost:4200` and `http://127.0.0.1:4200`. No redirect URI is needed.
3. Put the **client ID** in both places below, using the identical value:
   - `frontend/src/environments/environment.ts` → `googleClientId`
   - `backend/.env` → `GOOGLE_CLIENT_ID`
4. Restart the API (env is read at startup).
5. Optionally set `AUTH_REQUIRED=true` to require a verified token on protected endpoints.

The client **secret is not used**: the browser receives an ID token directly from Google and the API verifies its signature and audience. Never ship a client secret in the frontend.

Without a client ID the app still runs: the navbar shows a "Sign in" explanation and the API treats every request as anonymous.

## Payments

- `PAYMENT_MODE=auto` (default) uses Stripe when `STRIPE_SECRET_KEY` is set, otherwise mock mode.
- `PAYMENT_MODE=mock` always uses the simulated gateway: the booking is created immediately and the user is sent to the profile page.
- `PAYMENT_MODE=stripe` requires a key; `POST /api/payments/checkout` creates a Checkout Session and the frontend redirects to it.
- Webhook: `POST /api/payments/webhook` (mounted before `express.json()` because signatures need the raw body).

## API reference

| Method | Endpoint | Auth* | Description |
|---|---|---|---|
| GET | `/api/health` | – | Status, database and mode information |
| GET | `/api/routes` | – | All routes |
| POST | `/api/routes` | ✓ | Create a route |
| GET | `/api/routes/:departure/:arrival/:date` | – | Buses for a route and date |
| GET | `/api/buses` | – | All buses |
| GET | `/api/buses/:id` | – | One bus |
| POST | `/api/buses` | ✓ | Create a bus |
| POST | `/api/customers` | ✓ | Upsert a customer by email |
| GET | `/api/customers/:id` | – | Look up by id or email |
| GET | `/api/bookings/:customerId` | ✓ | Bookings for a customer |
| GET | `/api/bookings/id/:id` | ✓ | One booking |
| POST | `/api/bookings` | ✓ | Create a booking |
| GET | `/api/bookings/:id/refund-quote` | ✓ | Refund preview before cancelling |
| PATCH | `/api/bookings/:id/cancel` | ✓ | Cancel and record the refund |
| GET | `/api/payments/config` | – | Payment mode for the UI |
| POST | `/api/payments/checkout` | – | Start a Stripe Checkout session |
| POST | `/api/payments/webhook` | signature | Stripe webhook receiver |

\* `✓` means a valid Google ID token is required **only** when `AUTH_REQUIRED=true`; tokens are always verified when one is sent.

## Scripts

| Location | Command | What it does |
|---|---|---|
| `backend/` | `npm start` | Run the API |
| `backend/` | `npm run dev` | Run with file watching |
| `frontend/` | `npm start` | Dev server on :4200 |
| `frontend/` | `npm run build` | Production build into `dist/` |
| `frontend/` | `npm test` | Unit tests (watch mode) |
| `frontend/` | `npx ng test --watch=false` | Unit tests, single run |

## Testing and build status

- `npx ng test --watch=false` — 19 spec files, 26 tests passing.
- `npm run build` — succeeds; the only warning is the default 500 kB initial-bundle budget.

## Demo data

- Customer: `Demo Traveller <demo@tedbus.test>` (used by the seeded bookings; sign-in is Google-only, so this record is not a login).
- Routes include Hyderabad↔Bengaluru, Mumbai↔Pune, Delhi↔Jaipur, Chennai↔Bengaluru, Hyderabad↔Vijayawada and Mumbai↔Goa.
- Example search: `Hyderabad` → `Bengaluru`, any date from today onward.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| API exits with "Could not connect to MongoDB" | MongoDB is not running or `MONGODB_URI` is wrong |
| Browser console CORS errors | Page origin ≠ `CORS_ORIGIN` (note `localhost` and `127.0.0.1` differ) |
| Google button missing | No `googleClientId` configured; a "Sign in" explanation is shown instead |
| Sign-in popup closes, no session | Account is not listed under test users, or origin is not authorized |
| API returns 401 on writes | `AUTH_REQUIRED=true` and no/invalid token |
| `.env` changes ignored | The API reads env at startup — restart it |

## Known limitations

- The project targets local development: no Docker images, CI pipeline or production deployment config.
- Stripe integration is implemented but has only been exercised in mock mode.
- Fares, buses and operators are demo data from `tedbus-seed.js`.
- There is no admin UI; routes and buses are managed through the API.
