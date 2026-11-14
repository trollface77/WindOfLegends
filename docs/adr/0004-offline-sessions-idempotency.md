# ADR 0004 — Offline sessions keyed by a client UUID

**Status:** Proposed · 2026-11-14

## Context

Kite spots often have poor connectivity. Sessions must be recordable offline
and synced later, and retries must never create duplicate sessions or rewards.

## Decision

The device generates `client_session_id` (UUID v4) when recording starts and
stores the session in IndexedDB. The server upserts on
`(rider_id, client_session_id)`. Reward keys derive from the server session
id (`session_base:{session_id}`).

## Consequences

Syncing is safe to repeat any number of times. Device clock skew is handled
by server-side plausibility checks on `started_at` and `ended_at`.
