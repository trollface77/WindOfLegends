# ADR 0007 — Defaults for open product questions

**Status:** Accepted (revisable) · 2026-11-14

The architecture proposal left five questions open. Phase 1 started with
these defaults, each cheap to change later:

| Question        | Default applied                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product name    | **Wind of Legend**                                                                                                                                                        |
| Login methods   | Email magic link. Google is built in but hidden behind `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` until the provider is configured                                                 |
| Crews per rider | One (`crew_members.rider_id` unique, Phase 4)                                                                                                                             |
| Languages       | Portuguese (Brazil) by default, plus English and Spanish, chosen from a cookie or the browser language. Lightweight typed dictionaries in `src/i18n` instead of a library |
| Brand assets    | Proposed palette and placeholder kite-wing logo from docs/05                                                                                                              |
