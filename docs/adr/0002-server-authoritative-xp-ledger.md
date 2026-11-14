# ADR 0002 — Server-authoritative, append-only XP ledger

**Status:** Proposed · 2026-11-14

## Context

XP and Season Points are the core of the game and the most likely target
for cheating. The design requires auditability, no duplicates, caps and
diminishing returns.

## Decision

- All rewards go through `SECURITY DEFINER` Postgres functions. Clients have
  no write access to `xp_transactions`, `season_point_transactions` or
  `rider_stats`.
- Ledgers are append-only (enforced by trigger). Corrections are new rows.
- Every reward has a deterministic `idempotency_key` with a `UNIQUE` constraint.
- Per-rider advisory locks make cap checks safe under concurrency.
- `rider_stats` and `league_scores` are caches that can be rebuilt from the ledgers.

## Consequences

- Business rules live in SQL and are tested with pgTAP; pure helper logic is
  mirrored in TypeScript and tested with Vitest.
- Changing rewards means editing the `reward_rules` table, not deploying code.
