# Wind of Legend

**A real-world kiteboarding adventure game.** Riders record real sessions,
complete downwinds, discover spots, join crews and compete in regional and
global leagues. Starting in Preá, Ceará, Brazil.

> The ocean is the playground. The riders are the community. Every session is progress.

## Status

🏗️ **Phase 1 — Foundation.** Sign-up with magic link, onboarding, rider
profiles and the mobile app shell. See the [roadmap](docs/04-roadmap.md).

## Getting started

Requirements: Node.js 24+, a [Supabase](https://supabase.com) project for development.

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL and publishable key
npx supabase login
npx supabase link --project-ref <your-dev-project-ref>
npx supabase db push          # apply migrations
# then run supabase/seed.sql once in the Supabase SQL editor
npm run dev                   # http://localhost:3000
```

In the Supabase dashboard (Authentication → URL Configuration) add
`http://localhost:3000/auth/callback` to the redirect URLs.

| Script                                            | Purpose                                              |
| ------------------------------------------------- | ---------------------------------------------------- |
| `npm run dev`                                     | Development server                                   |
| `npm run lint` · `npm run typecheck` · `npm test` | Quality checks (also run in CI)                      |
| `npm run build`                                   | Production build                                     |
| `npm run db:push`                                 | Apply migrations to the linked Supabase project      |
| `npm run db:types`                                | Regenerate `src/types/database.ts` from the database |
| `npm run db:test`                                 | pgTAP tests (needs Docker locally; runs in CI)       |

## Documentation

| Document                                           | Contents                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| [01 · Architecture](docs/01-architecture.md)       | Stack, system overview, progression engine, security, environments |
| [02 · ERD](docs/02-erd.md)                         | Entity relationship diagrams by domain                             |
| [03 · Initial schema](docs/03-initial-schema.sql)  | PostgreSQL DDL, RLS policies, seed excerpt                         |
| [04 · Roadmap](docs/04-roadmap.md)                 | Phases, gates and MVP coverage                                     |
| [05 · UI architecture](docs/05-ui-architecture.md) | Design tokens, component layers, screens                           |
| [ADRs](docs/adr/README.md)                         | Architecture decision records                                      |

## Tech stack

Next.js · React · TypeScript · Tailwind CSS · Supabase (Postgres, PostGIS,
Auth, Storage, Realtime) · PWA · Vercel · Mapbox (later)

## Product principles

- Reward real experiences, not engagement farming.
- No rewards for dangerous riding. No paid competitive advantage.
- GPS data is private by default.
- Lifetime XP never resets; Season Points reset every season.
