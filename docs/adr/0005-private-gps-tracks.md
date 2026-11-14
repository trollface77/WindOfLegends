# ADR 0005 — GPS tracks stored privately, metrics only in the database

**Status:** Proposed · 2026-11-14

## Context

GPS data is personal data (LGPD in Brazil, GDPR abroad). The design requires
tracks to be private by default and never published as live locations.

## Decision

- Recording requires explicit consent (`rider_preferences.gps_consent` + timestamp).
- Raw tracks are stored compressed in a private Storage bucket under the
  rider's folder; only the owner can read them.
- The `sessions` table keeps derived metrics only (duration, distance, spot).
- Riders can delete tracks at any time without losing verified XP.
- No live location is stored or broadcast.

## Consequences

Moderators review suspicious sessions through a restricted function that
returns check results, not raw coordinates, unless escalation is justified
and logged in `audit_logs`.
