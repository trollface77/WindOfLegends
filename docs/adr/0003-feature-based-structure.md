# ADR 0003 — Feature-based code structure

**Status:** Proposed · 2026-11-14

## Context

The product has many domains (profiles, sessions, downwinds, crews, leagues)
that will be built in phases.

## Decision

Organize code under `src/features/<domain>/` with `components/`, `server/`,
`lib/`, `schemas.ts` and a public `index.ts`. Routes in `src/app` stay thin.
Shared primitives live in `src/components/ui` and `src/components/game`.

## Consequences

Each phase adds or extends features without touching unrelated code, and
features import each other only through their public `index.ts`.
