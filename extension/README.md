# Timesheet — Browser Extension (v1, timer only)

Chrome MV3 extension for quick timer start/stop without opening the web app.
Uses the same Supabase project/RLS as the web app; auth is separate (own popup
login, not session-shared with the web tab).

## Setup

```
cd extension
npm install
cp .env.local.example .env.local   # fill in your Supabase project URL/anon key
npm run dev
```

Load unpacked in Chrome: `chrome://extensions` → Developer mode → Load unpacked → select `extension/dist`.

## Scope (v1)

View running timer, start (project + optional description), stop. No manual
entries, client/project management, or analytics — those stay web-only.

Toolbar badge updates roughly once a minute via `chrome.alarms` (MV3 service
workers can't hold a live `setInterval`).

Idle detection uses the native `chrome.idle` API — a background service
worker has no DOM to attach activity listeners to, unlike the web app's
tab-based guard. On idle→active it shows a notification (pattern borrowed
from Clockify's open-source extension, BSD-3) letting the user discard the
idle time or discard-and-keep-tracking, rather than silently auto-stopping.

Icons in `public/` are placeholder generated art — swap for a proper
rasterization of `../public/icon.svg` before shipping.
