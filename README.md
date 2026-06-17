# विहीर सुरक्षा — Open Well Safety

A **public hazard reporting & resolution platform** for dangerous open wells, borewells
and construction pits in Maharashtra. Citizens report a hazard in under 30 seconds
(**no login, no signup** — just a photo + location). Authorities track, assign and
resolve hazards from a password-protected dashboard.

The citizen experience is **entirely in Marathi**; the admin dashboard is in English.

## Features (MVP)

- 📷 **Effortless reporting** — only a photo + location are required; everything else is
  optional and tucked inside a collapsible "अधिक माहिती" section.
- 📍 **Location made easy** — auto GPS + draggable map pin + auto-filled district/taluka/village
  (reverse geocoding).
- 🗺️ **Public map** — every report as a colour-coded marker (red = critical … green = resolved),
  with risk/status/district filters.
- 🔁 **Duplicate detection** — a new report within 20 m of an existing one offers to
  "support" it instead of creating a duplicate.
- 🆔 **Human-readable IDs + QR** — e.g. `MH-PUN-2026-000123`, with a QR code per report.
- 🧮 **Auto risk scoring** — Low / Medium / High / Critical from the hazard details.
- 🏛️ **Authority suggestions** — relevant offices auto-attached from the report's district.
- 🛠️ **Admin dashboard** — metrics, district breakdown, status tracking, authority assignment.
- 📲 **PWA** — installable, cached app shell, basic offline submit queue.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · MongoDB Atlas (Mongoose) ·
Cloudinary (direct browser upload) · Leaflet + OpenStreetMap · Nominatim geocoding ·
`jose` (admin cookie). All free-tier; **no paid API keys required**.

## Getting started

1. **Install**

   ```bash
   npm install
   ```

2. **Configure** — copy `.env.example` to `.env.local` and fill in:

   - `MONGODB_URI` — a free MongoDB Atlas M0 cluster. In Atlas → Network Access,
     allow `0.0.0.0/0` so serverless functions can connect.
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` + `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` —
     create a free Cloudinary account and an **unsigned** upload preset
     (Settings → Upload → Add upload preset → Signing mode: *Unsigned*).
   - `ADMIN_PASSWORD` — the shared password for `/admin`.
   - `ADMIN_SESSION_SECRET` — any long random string (≥16 chars).

3. **Run**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 (report form at `/report`, map at `/map`,
   admin at `/admin`).

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Add the same environment variables in **Project → Settings → Environment Variables**.
3. Deploy. (MongoDB Atlas network access must allow `0.0.0.0/0`.)

## Project structure

```
src/
  app/
    page.tsx                 landing (Marathi)
    report/page.tsx          the report form
    well/[reportId]/page.tsx public report detail + QR
    map/page.tsx             public map
    admin/                   login, dashboard, per-report manage
    api/                     reports, geocode, admin auth
  components/                PhotoUpload, MapPicker, PublicMap, Badges, ...
  lib/                       mongoose, risk, reportId, authorities, auth, i18n/mr, ...
  models/                    Report, Counter (Mongoose)
  data/authorities.json      starter district → authority mapping (extend as needed)
  middleware.ts              guards /admin
```

## Phase 2 (not built yet — data model leaves room)

Verification levels, time-based escalation (7/15/30/60 days), WhatsApp bot intake,
AI image risk scoring, accident records, public leaderboard, Hindi/English toggle.
