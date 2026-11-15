# TedBus Internship Task Demo Video Script (3 to 4 Minutes)

**Target Video Duration:** 3 Minutes 30 Seconds to 4 Minutes (Recommended Range: 2–5 minutes)  
**Video Resolution:** 1080p (Full Screen Recording)  
**Audio:** Clear microphone voiceover without background noise  

---

## Pre-Recording Checklist (Setup Before You Press Record)
1. Open your browser at: `https://ted-bus-two.vercel.app` in full screen (F11 or maximized window).
2. Ensure you are signed in with your Google account so your name and avatar appear in the top right.
3. Have two browser tabs ready:
   - **Tab 1:** TedBus Live Application (`https://ted-bus-two.vercel.app`)
   - **Tab 2:** Your Gmail inbox (to show the real-time TedBus confirmation/notification email)
4. Set browser zoom to 100% so all text, icons, and buttons are crisp.

---

## Segment-by-Segment Recording & Speaking Guide

```
+----------------------------------------------------------------------------------------------------+
| SEGMENT 1: Introduction & Project Objective [0:00 - 0:25]                                          |
+----------------------------------------------------------------------------------------------------+
```
* **Screen Action:** Start on the homepage (`https://ted-bus-two.vercel.app`) with the mouse resting near the top logo.
* **What to Say (Word-for-Word):**
  > *"Hello everyone! Today I am presenting my internship capstone project: **TedBus**, an advanced intercity bus ticketing and travel community platform. In this video, I will demonstrate the live implementation of all six assigned tasks: Dark Mode, Internationalization, Interactive Route Planning with live traffic, Travel Community, Post-Journey Verified Reviews, and the Multi-Channel Notification system. Let's walk through them step by step."*

---

```
+----------------------------------------------------------------------------------------------------+
| SEGMENT 2: Task 5 (Dark Mode) & Task 3 (Internationalization) [0:25 - 0:55]                       |
+----------------------------------------------------------------------------------------------------+
```
* **Screen Action:**
  1. Move the mouse to the top navbar.
  2. Click the **Sun/Moon theme toggle switch**. Watch the page switch from Light to Dark mode. Click it again to show instant transition.
  3. Click the **Language selector dropdown** (`EN ▾`).
  4. Select **हिन्दी (Hindi)**. Point out that the navigation links (*बस टिकट, कम्युनिटी, रूट प्लानर*) and banners translate instantly without any page reload.
  5. Select **తెలుగు (Telugu)** or another language, then switch back to **English**.
* **What to Say (Word-for-Word):**
  > *"First, in the top navigation bar, we have the **Dark Mode toggle**. Using reactive Angular Signals and CSS design tokens, it provides an instant preview without requiring a page reload. This preference is saved both in local storage and synced to the user's MongoDB profile for cross-device persistence.*
  >
  > *Next is **Internationalization (i18n)**. From this dedicated globe selector, users can choose from 6 Indian languages including Hindi, Telugu, Tamil, Kannada, and Malayalam. The entire UI—labels, buttons, validation messages, and notifications—translates dynamically with zero page reloads, falling back gracefully to English if needed."*

---

```
+----------------------------------------------------------------------------------------------------+
| SEGMENT 3: Task 4 (Interactive Route Planning & Real-Time Traffic) [0:55 - 1:40]                   |
+----------------------------------------------------------------------------------------------------+
```
* **Screen Action:**
  1. Click on **Route Planner** in the navigation bar (`/route-planner`).
  2. Show the Leaflet / OpenStreetMap view.
  3. Select **Origin:** `Hyderabad`, **Destination:** `Bangalore`.
  4. Click **+ Add Intermediate Stop** and select a city like `Kurnool`. Point to the numbered pin appearing on the map.
  5. Click the comparison tabs: **By Time**, **By Distance**, and **By Traffic**.
  6. Click **Refresh Traffic** button and highlight the **Live Traffic Alert Banner** and the **AI Auto-Suggested Alternative** badge.
* **What to Say (Word-for-Word):**
  > *"Now moving to Task 4: the **Interactive Route Planning Tool**. Integrated with Leaflet and OpenStreetMap, users can select an origin, destination, and add up to 3 intermediate waypoints.*
  >
  > *The tool provides real-time traffic updates, including congestion levels, delays in minutes, and estimated travel times. Notice our **3-way comparison engine**: travelers can sort corridors By Time, By Distance, or By Traffic Impact. Based on live conditions, the system automatically suggests alternative bypass routes to avoid congestion, and users can save their favorite routes to their profile for one-click access."*

---

```
+----------------------------------------------------------------------------------------------------+
| SEGMENT 4: Task 1 (Travel Community & Content Moderation) [1:40 - 2:25]                            |
+----------------------------------------------------------------------------------------------------+
```
* **Screen Action:**
  1. Click **Community** in the navigation bar (`/community`).
  2. Click across topic filters: **Routes**, **Destinations**, **Travel Advice**.
  3. Click **Share Travel Story** to show the story creation modal with category selector and photo attachment.
  4. On an existing post, click the **Like** heart icon (counter increases), then click **Comment** and **Share** (showing WhatsApp, Twitter, Copy Link options).
  5. Click the three-dots or flag icon to show the **Report Post** moderation modal.
* **What to Say (Word-for-Word):**
  > *"Next is Task 1: the **Travel Community**. Here, travelers share journey stories, tips, and photos. Discussion boards are organized into topic forums such as Routes, Destinations, and Travel Advice.*
  >
  > *To maintain safety and quality, only verified registered users are allowed to publish posts. Travelers can like, comment, and share stories externally via WhatsApp, Twitter, and LinkedIn with automated platform backlinks. We also have a complete moderation reporting pipeline where users can report inappropriate content for administrative review."*

---

```
+----------------------------------------------------------------------------------------------------+
| SEGMENT 5: Task 6 (Post-Journey Verified Route Reviews) [2:25 - 3:05]                              |
+----------------------------------------------------------------------------------------------------+
```
* **Screen Action:**
  1. Click on the user profile / avatar in the top right and select **My Profile** (`/profile`).
  2. Scroll to the **My Trips** section.
  3. Point out an **Upcoming** trip showing the locked badge: *"Review unlocks after journey completion"*.
  4. Point out a **Completed** trip with the **Rate & Review Journey** button. Click it.
  5. Show the modal: select 5 stars, aspect ratings, and start typing a comment. Show the **15 characters minimum** live counter (`X / 15 chars min`).
  6. Point out the note explaining the **24-hour edit window**, then click **Cancel** or **Post Review**.
* **What to Say (Word-for-Word):**
  > *"For Task 6: **Route Ratings & Reviews**. To guarantee feedback comes from genuine travel experiences, reviews are strictly locked until a journey is successfully completed—upcoming and cancelled trips cannot be reviewed.*
  >
  > *Each passenger can review a route only once per journey. The system enforces a 15-character minimum limit to eliminate low-effort spam. Users have a 24-hour edit window; after 24 hours, ratings are permanently locked. On the route details page, average ratings, aspect breakdowns, and trusted reviewer badges are calculated dynamically, and reported reviews are automatically removed from calculations."*

---

```
+----------------------------------------------------------------------------------------------------+
| SEGMENT 6: Task 2 (Multi-Channel Notifications & Conclusion) [3:05 - 3:45]                          |
+----------------------------------------------------------------------------------------------------+
```
* **Screen Action:**
  1. Click the **Notification Bell** in the top navbar (`/notifications`).
  2. Show the **Notifications tab** with filters (Booking, Reminders, Schedule, Promos).
  3. Click the **Preferences tab**: toggle channels (In-App, Email, Push) and event categories.
  4. Quickly switch to **Tab 2 (Gmail Inbox)** and show an official email received with subject `TedBus 🚌 • Booking Confirmation` and purple TedBus branding.
  5. Return to TedBus and show the homepage.
* **What to Say (Word-for-Word):**
  > *"Finally, Task 2: our **Advanced Multi-Channel Notification System**. Notifications are delivered via In-App, browser Web Push, and live email.*
  >
  > *In the Preferences tab, users can configure their delivery channels and opt in or out of promotional alerts. All notifications are logged with delivery status tracking and exponential retry mechanisms.*
  >
  > *Notice in my Gmail inbox that outgoing emails send exclusively under official **TedBus** branding via our dedicated Google Apps Script Web App gateway, with dummy emails safely blocked.*
  >
  > *In conclusion, all six tasks are thoroughly implemented, responsive, and deployed live on Vercel and Render. Thank you for watching!"*

---

## Quick Summary Table for Video Recording

| Time | Target Screen | Core Feature Demonstrated |
| :--- | :--- | :--- |
| **0:00 - 0:25** | Homepage | Project introduction and overview of the 6 tasks |
| **0:25 - 0:55** | Navbar | **Task 5 (Dark Mode)** + **Task 3 (i18n 6 Languages)** |
| **0:55 - 1:40** | `/route-planner` | **Task 4 (Leaflet map, traffic delays, 3-way compare, bypass)** |
| **1:40 - 2:25** | `/community` | **Task 1 (Forums, like/comment, social share, report)** |
| **2:25 - 3:05** | `/profile` (My Trips) | **Task 6 (Post-journey gate, 15 char min, 24h edit lock)** |
| **3:05 - 3:45** | `/notifications` + Gmail | **Task 2 (Multi-channel prefs, TedBus live email, wrap-up)** |
