# Contributing to Timesheet

Thanks for considering a contribution. This project is a Next.js 15 + Supabase timesheet app, with a companion browser extension in `extension/`.

## Getting started

1. Fork and clone the repo.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the env template and fill in your own Supabase project's credentials:
   ```bash
   cp .env.local.example .env.local
   ```
4. Run the initial migration (`supabase/migrations/001_initial.sql` and any later ones in that folder, in order) in your Supabase project's SQL editor.
5. Start the dev server:
   ```bash
   npm run dev
   ```

For extension changes, see `extension/README.md`.

## Before opening a PR

Run these and make sure they pass:

```bash
npm run lint
npm run type-check
npm run build
```

CI runs the same three checks on every PR (`.github/workflows/ci.yml`).

There is no automated test suite yet — if you're adding non-trivial logic, manual verification steps in the PR description are appreciated.

## Commit style

- Imperative, present tense, no prefix: `Add CSV export`, not `Added CSV export` or `feat: add CSV export`.
- One logical change per commit. Keep unrelated cleanups out of feature commits.
- No `Co-Authored-By` trailers.

## Code style

- No comments unless they explain a non-obvious *why* (a workaround, a hidden constraint). Don't restate what the code already says.
- Match existing patterns before introducing new ones — check how a similar component/hook/service already does it.
- Don't add abstractions, config options, or error handling for cases that can't happen. Keep changes scoped to what the task needs.
- Loading / error / empty states and i18n (`src/i18n/en.ts`, `src/i18n/fr.ts`) are expected on any user-facing component that fetches data — follow the pattern in `TimeEntryList.tsx` or `ClientList.tsx`.

## Reporting bugs / requesting features

Use the issue templates. Include repro steps for bugs; for features, explain the use case, not just the desired implementation.

## Security

Found a vulnerability? Don't open a public issue — see [SECURITY.md](./SECURITY.md).
