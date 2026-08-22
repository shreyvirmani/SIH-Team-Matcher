# SIH Team Matcher

AI-powered teammate matching for SIH hackathon participants. Students build a
profile, browse teammates ranked by an explainable 0–100 compatibility score,
send/accept team requests, and manage their team's roster — including
detection of missing roles/skills with suggested teammates to fill the gap.

## Important: local dev database, not live Supabase/Vercel

The implementation brief specifies Supabase (Postgres + Auth) and Vercel.
**This build could not provision or reach those services** — the sandbox this
was built in only has network access to package registries (npm, GitHub),
not to supabase.co or vercel.com. Rather than fake the integration, the app
runs on a local SQLite database (`better-sqlite3`) and a self-rolled
JWT/bcrypt auth layer that mirror Supabase's exact data shape and contract:

- `src/db/schema.sqlite.sql` — the schema actually running locally.
- `src/db/schema.postgres.sql` — the **same** schema written for Postgres,
  including the Row Level Security policies described in the brief. Apply
  this directly in the Supabase SQL editor when you're ready to go live.
- `src/lib/auth.ts` — the only file that knows about sessions/passwords/JWTs.
  Swapping to Supabase Auth means replacing the internals of this one file;
  no other file (API routes, pages) needs to change, because they only call
  `requireSession()` / `getSessionFromRequest()`.
- `src/lib/db.ts` — the only file that opens a database connection. Swap this
  for a Supabase client and update the raw-SQL calls in `src/lib/profiles.ts`
  and the API routes to Supabase's query builder.

Everything else — every page, every API route, the matching engine, the
validation, the team logic — is real, working code, not a mockup.

## The "Existing HackMind AI/backend architecture"

The brief treats an external "HackMind AI" service as a given, but it's an
undefined black box — flagged as the #1 technical risk in the brief's own
judge report (Technical Feasibility scored 4/10 specifically because of this
undefined dependency). Rather than pretend to call a service that doesn't
exist, `src/lib/matching.ts` implements the compatibility scoring for real: a
transparent, explainable rule-based model (problem-statement overlap,
complementary skills/roles, availability, experience balance) exposed behind
`POST /api/match/compatibility` exactly per the API contract. A real
embeddings/LLM-based service can be swapped in later without touching any
caller — that's the whole reason it's isolated behind one module and one API
route.

## Setup

```bash
npm install
npm run seed   # creates data/app.db, seeds skills/roles/problem statements + admin account
npm run dev    # http://localhost:3000
```

Environment variables (see `.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `JWT_SECRET` | Yes | Signs session cookies. A dev default is provided in `.env.local`; **replace it in production.** |

Demo admin login (seeded automatically): `admin@sihmatcher.dev` / `Admin@123`
— change this password immediately in any real deployment.

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build (also type-checks and lints)
npm run start    # run the production build
npm run lint     # eslint
npm run seed     # (re)seed lookup tables + admin account (safe to re-run, uses INSERT OR IGNORE)
```

To reset all data: stop the server, delete `data/app.db*`, run `npm run seed` again.

## What's implemented (CORE MVP — all working end-to-end)

- Supabase-Auth-shaped signup/login/logout with bcrypt + JWT session cookies
- Profile onboarding: college, branch, year, skills, roles, experience, availability, bio, SIH problem statement(s)
- Discover Teammates: search, filter by college/availability/skills/roles/problem statement, pagination
- AI-powered 0–100 compatibility score with a plain-English "why recommended" rationale
- Send / accept / reject team requests, with notifications on both sides
- Team creation & auto-formation on request acceptance; leader-only member removal
- Missing role/skill detection per team, with suggested teammates who cover the gap
- Notifications list with read/unread state (polled every 15s to approximate realtime — see Known Limitations)
- Admin dashboard: platform stats, manage (add/activate/deactivate) problem statements, recent signups

I verified this flow directly against the running server (not just by reading
the code): signup → create profile → discover ranks by compatibility score →
send request → recipient gets a notification → accept → team is created →
missing-role/skill detection reflects the actual two members → sender gets an
acceptance notification. I also verified admin-only routes reject non-admins
(403), wrong passwords are rejected (401), and unauthenticated requests to
protected routes are rejected (401).

## Known limitations / what a real Supabase migration should add

1. **Not live Supabase/Vercel** — see above. `schema.postgres.sql` is ready to apply.
2. **Realtime notifications are polled, not pushed.** Supabase Realtime
   (WebSockets) would replace the 15s polling in `notifications/page.tsx`
   with an actual subscription — this was the brief's specified approach and
   is the natural next step once on real Supabase.
3. **No email notifications** (Twilio SendGrid in the brief's future scope)
   — in-app notifications only.
4. **Rate limiting** is not implemented — add it at the Vercel Edge/middleware
   layer before a real deployment, as the brief recommends.
5. **Missing-role/skill detection** uses a small fixed checklist
   (`IDEAL_ROLES` / `commonlyNeededSkills` in `src/app/api/teams/[id]/route.ts`)
   rather than a dynamic model of what the team's chosen problem statement
   actually needs — reasonable for an MVP, worth revisiting.
6. **No automated test suite** — verification here was manual/scripted
   end-to-end curl testing of the full user journey plus a clean production
   build. Adding Playwright/Vitest coverage is a natural next step.
7. **No file/image uploads** (profile pictures) — out of MVP scope per the brief.

## Recommended next steps

1. Stand up a Supabase project, run `schema.postgres.sql`, and swap `src/lib/db.ts` + `src/lib/auth.ts` for Supabase client/Auth calls.
2. Deploy to Vercel; move `JWT_SECRET` (or Supabase keys) into Vercel's environment variables.
3. Add Supabase Realtime subscriptions for notifications.
4. Add SendGrid for email fallback notifications.
5. Add rate limiting middleware.
6. Add automated tests (the manual E2E flow in this README is a good starting script to port to Playwright).
