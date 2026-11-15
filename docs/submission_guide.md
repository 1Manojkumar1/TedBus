# Internship Task Submission Guide

### Field 1: Live Hosted Website URL
- **Value to Enter:** `https://ted-bus-two.vercel.app`
- **Details:** Live production frontend hosted on Vercel connected to the Render backend, featuring all 6 completed tasks.

---

### Field 2: GitHub Repository Link
- **Value to Enter:** `https://github.com/1Manojkumar1/TedBus`
- **Details:** Public GitHub repository containing the full Angular frontend, Node.js backend, and complete commit history.

---

### Field 3: WhatsApp Number with Country Code
- **Value to Enter:** `+91XXXXXXXXXX` *(Replace with your 10-digit mobile number, prefixed with country code `+91`)*
- **Details:** Used exclusively by your assigned mentor for technical evaluation coordination and feedback.

---

### Field 4: Demo Video
- **Value to Enter:** Upload a 2–5 minute screen recording (`.mp4`, `.webm`, or `.mov`) showing the working features.
- **Details:** Demonstrate the navbar controls, route planner, bus booking, community forum, notifications, and reviews.

---

### Field 5: Project Report

```markdown
# TedBus - Next-Generation Intercity Bus Mobility Platform
## Internship Capstone Technical Project Report

### 1. Executive Summary
TedBus is an enterprise-grade intercity bus ticketing and community platform engineered to deliver seamless travel planning, verified passenger reviews, multilingual accessibility, and multi-channel communication. Built on modern web architecture (Angular 19 with reactive signals, Tailwind CSS, Node.js/Express, and MongoDB Atlas), the platform provides travelers with transparent route comparison, interactive real-time traffic updates, a community ecosystem, and automated customer notifications.

---

### 2. System Architecture & Tech Stack
* **Frontend Framework:** Angular 19 (Standalone Components, Reactive Signals, Control Flow syntax `@if`/`@for`).
* **Styling & Theming:** Tailwind CSS 4, Google Material Icons, FontAwesome, custom Dark/Light design tokens.
* **Backend API:** Node.js, Express.js REST API with CORS isolation and unified error handling.
* **Database & Persistence:** MongoDB Atlas with Mongoose ODM, utilizing compound indexing for sub-second query latency.
* **Mapping Engine:** Leaflet.js with OpenStreetMap live geospatial tiles and custom SVG route overlays.
* **Email Gateway:** Dedicated Google Apps Script Web App gateway providing isolated branded delivery with zero external SMTP dependencies.
* **Authentication:** Google Identity Services (GIS) OAuth 2.0 with backend token verification and customer profile auto-provisioning.
* **Hosting & Deployment:** Frontend deployed on Vercel (`https://ted-bus-two.vercel.app`), Backend deployed on Render (`https://tedbus-api-klsp.onrender.com`).

---

### 3. Detailed Implementation of the 6 Internship Tasks

#### Task 1: User-Generated Content & Travel Community Ecosystem
* **Journey Stories & Tips:** Travelers can compose and publish rich stories, travel tips, and route recommendations with photo attachments and route tags.
* **Social Engagement:** Real-time optimistic like toggling and nested comment discussions with live reply counters.
* **Categorized Forums:** Dedicated discussion boards organized by topics (*All Stories*, *Routes*, *Destinations*, and *Travel Advice*) with keyword filtering.
* **Verified Contributor Protection:** Backend security enforces that only verified registered customers in the database can publish content; anonymous guest attempts receive HTTP 403 Forbidden.
* **Content Moderation Console:** Multi-category reporting workflow (spam, harassment, inappropriate, misinformation) integrated with an Admin Moderation Portal (`/admin`) for review, dismiss, or deletion actions.
* **Social Media Sharing:** Native Web Share API integration alongside direct one-click sharing to WhatsApp, Twitter/X, Facebook, and LinkedIn with platform backlinks.
* **Traveler Profiles & Badging:** Dedicated "Community Stories" profile tab showcasing story counts, likes, comments, and trust badges (`Verified Traveler`, `Top Contributor`). Popular content is highlighted with `🔥 Trending` badges.

#### Task 2: Advanced Multi-Channel Real-Time Notification System
* **Tri-Channel Delivery:** In-App notification feed, browser Web Push notifications, and real-time email delivery.
* **Dedicated Email Gateway:** Outbound emails dispatch exclusively under official **TedBus** branding via a dedicated Google Apps Script Web App, isolating sender identity from third-party apps.
* **Automated Event Triggers:** Automated dispatches for:
  1. Booking Confirmations (ticket details, seat allocations, boarding points)
  2. Cancellations & Refund updates
  3. Schedule & Delay Changes
  4. Upcoming Journey Reminders (24 hours and 2 hours prior to departure)
  5. Promotional Discounts & Community Engagement Alerts
* **Preference Management:** User-controlled preferences at `/notifications` for toggling channels (In-App, Email, Push) and opting in/out of specific event categories.
* **Reliability & Retry Engine:** Persistent logging with `deliveryStatus` (`delivered`, `pending`, `failed`), tracking delivery attempts and timestamping last attempt. Automatic background worker executes exponential backoff retries (`2^attempts * 60s`).
* **Localization & History Log:** Messages translate dynamically into the user's selected regional language. Full audit trail accessible at `/notifications` with category filters, unread badges, mark-all-as-read, and deletion capabilities.
* **Dummy Email Shield:** Rigorous outbound regex filter drops synthetic/seeded email accounts (`@tedbus.test`), ensuring notifications deliver exclusively to authenticated Google accounts.

#### Task 3: Comprehensive Internationalization (i18n) & Localization
* **Dedicated Navbar Selector:** Globe selector permanently accessible in the sticky navbar displaying native language scripts alongside English names.
* **6 Supported Languages:** Complete translation coverage across **English (en)**, **Hindi (hi)**, **Telugu (te)**, **Tamil (ta)**, **Kannada (kn)**, and **Malayalam (ml)**.
* **Full UI Localization:** 100% translation of navigation menus, bus search filters, date selectors, booking forms, validation errors, payment options, and FAQs.
* **Cross-Session & Cross-Device Persistence:** Chosen language persists locally in `localStorage` (`tb_language`) and synchronizes bidirectionally with the user's MongoDB profile (`NotificationPreference`), restoring their language on any device upon sign-in.
* **Dynamic Reload-Free Switching:** Powered by reactive Angular Signals; switching languages re-renders text tokens across all active components instantaneously without reloading the page.
* **Graceful Fallback:** Missing translation keys automatically fall back to English without throwing template exceptions or rendering blank spaces.

#### Task 4: Interactive Route Planning & Real-Time Traffic Analysis
* **Origin, Destination & Waypoints:** Interactive route builder supporting 34 major Indian transit hubs with instant city swapping and up to 3 intermediate waypoints.
* **Geospatial Mapping Integration:** Leaflet and OpenStreetMap rendering smooth interpolated road paths, custom start pins (Green 'A'), destination pins (Red 'B'), and numbered waypoint badges.
* **Real-Time Traffic & Congestion Telemetry:** Each corridor displays real-time congestion levels (`Low Congestion`, `Moderate Congestion`, `Heavy Congestion`), quantified traffic delays (e.g., `+0m`, `+8m`, `+25m`, `+35m delay`), and traffic-adjusted travel durations.
* **Automated Alternative Suggestions:** When primary highways experience congestion, the system detects delays and surfaces an `AI Auto-Suggested Alternative` badge recommending bypass routes.
* **3-Way Route Comparison:** Interactive comparison selector allowing travelers to rank corridors:
  * **⏱️ By Time:** Prioritizes the fastest duration (annotated with `#1 Fastest`).
  * **📏 By Distance:** Prioritizes the shortest kilometer route (annotated with `#1 Shortest`).
  * **🚦 By Traffic:** Prioritizes routes with minimal congestion delay (annotated with `#1 Least Traffic`).
* **Frequent Route Bookmarking:** Authenticated users can save frequent transit corridors with custom titles and stops to their MongoDB profile (`/api/saved-routes`) for one-click re-plotting and direct bus availability lookups.
* **Dynamic Traffic Polling & Alerts:** Background monitoring updates traffic status dynamically; when conditions shift during planning, an animated **Live Traffic Alert Banner** notifies the user and adjusts recommendations in real time.

#### Task 5: Dark Mode & Theme Persistence
* **Seamless Instant Toggle:** Ergonomic sun/moon switch in the sticky navigation bar accessible across every page.
* **Reload-Free Instant Preview:** Reactive theme signals immediately toggle `.dark` class and `data-theme="dark"` on `document.documentElement` with smooth CSS transitions.
* **Dual-Tier Persistence:** Preference is saved in browser `localStorage` (`tb_theme`) and synced to the user's remote MongoDB profile (`NotificationPreference.preferredTheme`), ensuring the user's theme preference applies whenever they log back in from any device.
* **Consistent Component Theming:** Universal Dark Mode styling applied across surfaces, cards, modals, form inputs, Material menus, dialog containers, and data tables (`mat-table`).
* **System-Aware Fallback:** Automatically respects system `prefers-color-scheme` if no stored preference exists, defaulting gracefully to light mode.

#### Task 6: Post-Journey Route Ratings & Verified Reviews
* **Post-Journey Verification Gate:** Reviews are strictly restricted to confirmed bookings with completed travel dates. Upcoming and cancelled journeys are blocked from review submission.
* **Multi-Aspect Rating Structure:** 1 to 5 star overall rating combined with 4 specific quality aspects: Punctuality, Cleanliness, Comfort, and Staff Behaviour, alongside detailed text feedback.
* **Route Details Page Aggregation:** Bus cards and the Route Details tab calculate and display the aggregate average rating (`★ 4.x / 5.0`), total review volume, aspect breakdowns, and recent verified passenger feedback.
* **Single Review Constraint:** Database enforces unique `bookingId` indexing (`unique: true`), preventing multiple reviews per journey.
* **Minimum Character Limit:** Enforces a minimum 15-character feedback requirement with a live counter (`X / 15 chars min`) to eliminate low-effort submissions.
* **24-Hour Edit Window:** Travelers can edit their review within 24 hours of submission; after 24 hours, ratings are permanently locked against modification.
* **Automated Moderation & Rating Protection:** Users can report inappropriate reviews. When reported multiple times or for offensive content, the review is automatically marked `status: 'hidden'` and **instantly excluded from the average rating calculation and public review feed**.
* **Trusted Reviewer Highlighting:** Reviewers who submit helpful, upvoted feedback are badged with a prominent `⭐ Trusted Reviewer` tag on route pages.

---

### 4. Verification & Quality Assurance Results
* **Frontend Compilation:** Verified with `ng build` producing 0 errors.
* **Backend Automated Test Suite:** Verified via end-to-end test execution covering theme persistence, post-journey review validation, 24-hour edit locks, and automated hidden review exclusion from ratings.
* **Production Health:** Verified on live Render backend (`https://tedbus-api-klsp.onrender.com/api/health`) returning `status: "ok"`, `database: "connected"`.
* **Cross-Browser Verification:** Tested and responsive across Chrome, Firefox, Edge, and mobile viewports.

---

### 5. Conclusion
All six project specifications have been thoroughly implemented, tested, and deployed to production. The platform exceeds requirements in performance, accessibility, security, and user experience, providing a complete, production-ready bus travel platform.
```
