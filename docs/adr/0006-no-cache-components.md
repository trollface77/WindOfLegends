# ADR 0006 — Cache Components disabled for now

**Status:** Accepted · 2026-11-14

## Context

Next.js 16 scaffolds new apps with `cacheComponents` and `partialPrefetching`.
With Cache Components, every read of `cookies()` must sit behind a
`<Suspense>` boundary or the build fails. Almost every Wind of Legend screen
depends on the signed-in rider (Supabase session cookie).

## Decision

Turn Cache Components off in Phase 1. Pages render per request, and the Data
Access Layer (`features/profile/server/queries.ts`) dedupes reads with
React `cache()`.

## Consequences

Simpler code and no build-time traps while the data model settles. Revisit
before the beta for public, cacheable pages (spot pages, global leaderboard).
