# SIH Team Matcher

AI-powered teammate matching for SIH hackathon participants, on a real
Supabase (Postgres + Auth + Realtime + Storage) backend, with a 3D
glassmorphic UI.

## What's new since the demo build

This started as a working local demo (SQLite + custom JWT auth). It has
since been rebuilt for real deployment:

**Backend**
- Real Supabase Auth (email/password, session cookies via `@supabase/ssr`)
- Real Postgres with Row Level Security on every table (`src/db/schema.postgres.sql`)
- Supabase Realtime for live notifications and team chat (no more polling)
- Supabase Storage for profile picture uploads
- Rate limiting + session-refresh middleware (`middleware.ts`)

**New features**
- Avatar upload
- GitHub profile verification (real `api.github.com` lookup + public repo count)
- Team chat (realtime, per-team, RLS-restricted to members)
- Saved/bookmarked profiles (`/saved`)
- Live unread-notification badge in the header

**UI**
- Full dark, glassmorphic redesign with a 3D mouse-tracked tilt-card component
  used throughout (landing page, Discover), animated gradient mesh background,
  glow shadows, and 3D-feeling button presses

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project. Note your project's
   **Project URL**, **anon public key**, and **service_role key** (Project
   Settings → API).
2. Open the SQL Editor and run **`src/db/schema.postgres.sql`** — this creates
   every table, index, RLS policy, the Realtime publication entries, and the
   `avatars` Storage bucket in one shot. (`src/db/migrations/` has the same
   thing split into two files if you'd rather apply it incrementally.)
3. Auth → Providers: email/password is on by default. Decide whether you want
   **email confirmation** required (Auth → Settings) — the signup page already
   handles both cases.

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-only, never commit or expose to the browser
```

## 3. Install, seed, run

```bash
npm install
npm run seed   # seeds skills/roles/problem statements + a demo admin account into YOUR Supabase project
npm run dev    # http://localhost:3000
```

Demo admin login (created by the seed script): `admin@sihmatcher.dev` /
`Admin@123` — **change this password immediately**, this is a real account in
your real project.

## 4. Deploy to Vercel

```bash
npm i -g vercel   # if you don't have it
vercel
```

Or connect the GitHub repo (see below) to Vercel directly from their
dashboard for automatic CI/CD on every push to `main`. Either way, add the
same three environment variables from `.env.local` in Vercel's Project
Settings → Environment Variables (all three, including the service role key
— Vercel env vars are encrypted server-side and never shipped to the client
unless prefixed `NEXT_PUBLIC_`).

## Applying the patch files

If you're applying this as patches on top of the previous demo build instead
of using this zip directly:

```bash
# apply every patch in the folder, in order (0001, 0002, 0003, ...):
git am patches/*.patch
```

(`git am` preserves the commit messages/authorship; use `git apply` instead
if you just want the file changes without creating commits.) Then follow
steps 1–3 above — the patches change code, not your Supabase project, so you
still need to run the schema and seed script yourself.

## Pushing this to GitHub

You'll need to do the actual push yourself (this was built in a sandbox with
no access to your GitHub account), but it's four commands:

```bash
# from inside the project folder, if not already a git repo:
git init
git add -A
git commit -m "Initial commit"

# create a new repo at https://github.com/new (don't initialize it with a
# README/gitignore — you already have those), then:
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

If this zip already has git history (it does, if you applied the patches
with `git am`), skip straight to the `git remote add` step.

Authentication: GitHub removed password-over-HTTPS support, so `git push`
will prompt you to either sign in via browser (if using a recent Git version)
or use a [Personal Access Token](https://github.com/settings/tokens) as your
password. The GitHub CLI (`gh auth login` then `gh repo create`) is the
easiest path if you have it installed — it handles both repo creation and
auth in one step.

## Security notes for going live

- **Never** commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to the
  client — it bypasses every RLS policy. It's used server-side only, in
  `src/lib/supabase/admin.ts` and its handful of callers.
- Change the seeded admin password immediately.
- The in-memory rate limiter in `middleware.ts` is single-instance only. For
  real multi-instance production traffic, swap it for `@upstash/ratelimit` +
  `@upstash/redis` (same call shape, different backing store) — see the
  comment at the top of that file.
- Unauthenticated GitHub API calls are capped at 60/hour per IP. Add a
  `GITHUB_TOKEN` (see `.env.example`) if you expect meaningful signup volume.
- Enable email confirmation in Supabase Auth settings before going live
  publicly, to prevent throwaway/spam signups.

## Known limitations / good next steps

- No automated test suite yet — this was verified by a clean production
  build (`npm run build`) plus manual end-to-end testing against a live
  local server in the earlier demo phase; the Supabase-backed version
  hasn't been re-verified against a real project from this environment
  (no network access to supabase.co from this sandbox — see below).
- No email notifications (SendGrid) — in-app + realtime only.
- Missing-role/skill detection in My Team uses a small fixed checklist
  rather than a dynamic model of what the team's problem statement needs.
- No mobile app — this is a responsive web app only.

## Important: not yet run against a live Supabase project

This sandbox's network access is limited to package registries (npm, GitHub)
— it cannot reach `*.supabase.co`. Every file compiles and type-checks
(`npm run build` passes clean), and the Supabase query patterns used
throughout follow the standard `@supabase/supabase-js` / `@supabase/ssr` APIs,
but **you should smoke-test the core flow yourself** after connecting your
own project: sign up → onboarding → discover → send request → accept →
team formed → chat → notifications arrive live. If anything doesn't line up
with your specific Supabase project settings (e.g. email confirmation on/off
changes the signup redirect logic), the relevant code is in
`src/app/api/auth/*` and `src/app/(auth)/signup/page.tsx`.
