# ADR 0001 — Next.js + Supabase as the core stack

**Status:** Proposed · 2026-11-14

## Context

A small team (one developer working with Claude Code) needs auth, a relational
database, file storage, realtime chat and a mobile-friendly installable app,
with minimal operations work.

## Decision

Next.js (App Router, TypeScript strict, Tailwind) hosted on Vercel, and
Supabase (Postgres + PostGIS, Auth, Storage, Realtime, RLS) as the backend.
The app is delivered as a PWA rather than native apps.

## Consequences

- One language (TypeScript) on the front end and the server, SQL in the database.
- Postgres gives transactions and unique constraints, which the XP rules need.
- A PWA works on iOS and Android without app stores. Background GPS on iOS is
  limited, so recording must stay in the foreground (revisit native wrappers
  after the beta if needed).
