# ⏱ Timesheet

Multi-client, multi-project time tracking app, built with **Next.js 15**, **Supabase**, and **TypeScript**.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + Tailwind CSS |
| Server state | TanStack React Query v5 |
| Local state | Zustand |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Language | TypeScript (strict) |

---

## Features

- **Marketing landing page** – public homepage at `/`, with SEO/GEO metadata (JSON-LD, sitemap, robots, llms.txt)
- **Authentication** – email sign-up / sign-in
- **Clients** – create, edit, delete
- **Projects** – create, edit, delete, hourly rate
- **Timer** – one-click start/stop, a single active timer at a time
- **Manual entry** – add an entry with a start and end time
- **Tags** – label time entries
- **CSV export & print/PDF** – pull entries out for invoicing
- **Analytics** – total hours per project for the current month
- **Realtime** – automatic sync via Supabase Realtime
- **PWA** – installable, offline fallback page (`public/manifest.webmanifest`, `public/sw.js`)
- **Browser extension** – quick timer start/stop from any tab (see `extension/`)

---

## Installation

### 1. Clone the repo

```bash
git clone git@github.com:Alwil17/timesheet.git
cd timesheet
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 4. Initialize the database

In your Supabase project's **SQL Editor**, run the migrations in `supabase/migrations/` in order (`001_initial.sql` first).

The initial migration creates:
- Tables (`users`, `clients`, `projects`, `time_entries`, `tags`, `time_entry_tags`)
- Indexes
- `updated_at` triggers
- Row Level Security policies
- The profile-creation trigger on sign-up

### 5. Start the dev server

```bash
npm run dev
```

The app is available at [http://localhost:3000](http://localhost:3000) — the marketing page is served at `/`, the app itself lives behind auth at `/dashboard`.

---

## Project structure

```
src/
├── app/                  # Pages (App Router)
│   ├── auth/             # Sign in / sign up
│   ├── clients/          # Clients page
│   ├── dashboard/        # Dashboard (timer, analytics, recent entries)
│   ├── projects/         # Projects page
│   ├── entries/          # Time entries page
│   ├── robots.ts         # /robots.txt
│   ├── sitemap.ts        # /sitemap.xml
│   ├── layout.tsx
│   └── page.tsx          # Public marketing landing page
├── components/
│   └── marketing/        # Marketing page sections (Hero, Features, FAQ, …)
├── hooks/                # React Query hooks (useClients, useProjects…)
├── services/             # Supabase calls (clients, projects, timeEntries, tags)
├── store/                # Zustand store (timer)
├── lib/                  # Utilities (Supabase client, formatting)
└── types/                # TypeScript types (DB schema)
supabase/
└── migrations/           # SQL migrations, applied in order
extension/                # Browser extension (Manifest V3)
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run type-check` | TypeScript check |
| `npm run lint` | ESLint |

CI (`.github/workflows/ci.yml`) runs lint, type-check, and build on every push/PR to `master`.

---

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, commit conventions, and code style, and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for community guidelines.

Found a security issue? See [SECURITY.md](./SECURITY.md) — please don't open a public issue.

## License

[MIT](./LICENSE)
