# 02 — Database Entity Relationship Diagram

**Status:** Proposal — awaiting approval

The schema is split into six domains. The full DDL is in
[03-initial-schema.sql](03-initial-schema.sql). GitHub renders the Mermaid
diagrams below automatically.

---

## Overview by domain

```mermaid
flowchart TB
  subgraph Identity
    profiles --- rider_preferences
    profiles --- rider_stats
  end
  subgraph Geography
    regions --- spots
    regions --- routes
    spots --- routes
  end
  subgraph Sessions
    sessions --- session_tracks
    sessions --- session_media
    sessions --- session_verifications
    sessions --- verification_votes
  end
  subgraph Community
    downwinds --- downwind_participants
    downwinds --- ride_shares
    vehicles --- ride_shares
    ride_shares --- ride_share_passengers
    crews --- crew_members
    messages
  end
  subgraph Gamification
    reward_rules --- xp_transactions
    xp_transactions --- season_point_transactions
    rider_levels
    achievements --- rider_achievements
    challenges --- challenge_progress
    seasons --- leagues --- league_scores
    seasons --- crew_scores
  end
  subgraph Moderation
    reports --- moderation_actions
    audit_logs
  end

  Identity --> Sessions
  Geography --> Sessions
  Sessions --> Gamification
  Community --> Gamification
  Identity --> Community
  Moderation -.-> Sessions
```

---

## Identity, geography and sessions

```mermaid
erDiagram
  profiles ||--|| rider_preferences : has
  profiles ||--|| rider_stats : "has (server-only)"
  regions ||--o{ spots : contains
  regions ||--o{ routes : contains
  spots ||--o{ routes : "start / end"
  profiles }o--o| regions : "home region"

  profiles ||--o{ sessions : records
  spots ||--o{ sessions : "at"
  routes ||--o{ sessions : "follows"
  regions ||--o{ sessions : "counts for"
  downwinds ||--o{ sessions : "part of"
  sessions ||--o| session_tracks : "private GPS track"
  sessions ||--o{ session_media : "proof"
  sessions ||--o{ session_verifications : "checked by"
  sessions ||--o{ verification_votes : "confirmed by"
  profiles ||--o{ verification_votes : casts

  profiles {
    uuid id PK "= auth.users.id"
    citext username UK
    text display_name
    text avatar_url
    uuid home_region_id FK
    app_role app_role "rider | moderator | admin"
  }
  rider_stats {
    uuid rider_id PK
    bigint lifetime_xp "never resets"
    int level
  }
  rider_preferences {
    uuid rider_id PK
    bool gps_consent
    timestamptz gps_consent_at
    bool show_on_leaderboards
  }
  regions {
    uuid id PK
    text slug UK
    text name
    char country_code
  }
  spots {
    uuid id PK
    uuid region_id FK
    text name
    geography location "PostGIS point"
    spot_status status
  }
  routes {
    uuid id PK
    uuid region_id FK
    uuid start_spot_id FK
    uuid end_spot_id FK
    numeric distance_km
    geography path "PostGIS line"
  }
  sessions {
    uuid id PK
    uuid rider_id FK
    uuid client_session_id "offline idempotency"
    session_type type "kite_session | downwind"
    uuid spot_id FK
    uuid route_id FK
    uuid downwind_id FK
    uuid region_id FK
    timestamptz started_at
    int duration_s
    int distance_m
    validation_status status
  }
  session_tracks {
    uuid session_id PK
    text storage_path "private bucket"
    int point_count
  }
  verification_votes {
    uuid session_id FK
    uuid voter_id FK
    bool approve
  }
```

---

## Community

```mermaid
erDiagram
  profiles ||--o{ downwinds : organizes
  routes ||--o{ downwinds : "planned on"
  downwinds ||--o{ downwind_participants : has
  profiles ||--o{ downwind_participants : joins
  profiles ||--o{ vehicles : owns
  downwinds ||--o{ ride_shares : "transport for"
  vehicles ||--o{ ride_shares : "used in"
  ride_shares ||--o{ ride_share_passengers : carries
  profiles ||--o{ ride_share_passengers : rides
  crews ||--o{ crew_members : has
  profiles ||--o| crew_members : "member of (one crew)"
  crews ||--o{ messages : "crew chat"
  downwinds ||--o{ messages : "event chat"

  downwinds {
    uuid id PK
    uuid organizer_id FK
    uuid route_id FK
    timestamptz departure_at
    int max_participants
    downwind_status status
  }
  downwind_participants {
    uuid downwind_id PK
    uuid rider_id PK
    participant_status status
  }
  ride_shares {
    uuid id PK
    uuid downwind_id FK
    uuid vehicle_id FK
    int seats_offered
    int cost_per_seat_cents
  }
  crews {
    uuid id PK
    citext slug UK
    text name
    uuid founder_id FK
  }
  crew_members {
    uuid crew_id PK
    uuid rider_id PK "unique: one crew"
    crew_role role "founder | captain | member"
  }
  messages {
    uuid id PK
    uuid crew_id FK "one of"
    uuid downwind_id FK "one of"
    uuid sender_id FK
    text body
  }
```

---

## Gamification and competition

```mermaid
erDiagram
  reward_rules ||--o{ xp_transactions : "priced by"
  profiles ||--o{ xp_transactions : earns
  xp_transactions ||--o| season_point_transactions : "also counts as"
  seasons ||--o{ season_point_transactions : "within"
  regions ||--o{ season_point_transactions : "regional scope"
  rider_levels ||..o{ rider_stats : "level lookup"
  achievements ||--o{ rider_achievements : unlocked
  profiles ||--o{ rider_achievements : owns
  challenges ||--o{ challenge_progress : tracked
  profiles ||--o{ challenge_progress : progresses
  seasons ||--o{ leagues : "has brackets"
  leagues ||--o{ league_scores : ranks
  profiles ||--o{ league_scores : "placed in"
  seasons ||--o{ crew_scores : ranks
  crews ||--o{ crew_scores : "placed in"

  xp_transactions {
    bigint id PK
    uuid rider_id FK
    reward_type reward_type
    uuid source_id
    int base_amount
    numeric multiplier
    int amount "may be negative (admin correction)"
    text idempotency_key UK
    uuid created_by "null = system"
  }
  season_point_transactions {
    bigint id PK
    uuid rider_id FK
    uuid season_id FK
    uuid region_id FK
    sp_category category "activity | exploration | community"
    numeric amount
    text idempotency_key UK
  }
  reward_rules {
    reward_type reward_type PK
    int base_xp
    numeric base_sp
    sp_category sp_category
    int daily_cap
    int weekly_cap
    numeric_array diminishing
  }
  rider_levels {
    int level PK
    text rank_title
    int xp_required UK
    bool is_enabled
  }
  seasons {
    uuid id PK
    int number UK
    timestamptz starts_at
    timestamptz ends_at
    season_status status
    jsonb sp_weights
  }
  leagues {
    uuid id PK
    uuid season_id FK
    league_scope scope "regional | global"
    uuid region_id FK
    division division
  }
  league_scores {
    uuid league_id FK
    uuid rider_id FK
    numeric points
    int rank
    bool provisional
    league_outcome outcome
  }
```

---

## Key constraints at a glance

| Constraint                                                        | Purpose                               |
| ----------------------------------------------------------------- | ------------------------------------- |
| `xp_transactions.idempotency_key UNIQUE`                          | No duplicate XP                       |
| `season_point_transactions.idempotency_key UNIQUE`                | No duplicate SP                       |
| `sessions (rider_id, client_session_id) UNIQUE`                   | Offline re-sync is safe               |
| `verification_votes (session_id, voter_id) PK`                    | One vote per voter                    |
| `crew_members.rider_id UNIQUE`                                    | One crew per rider (pending approval) |
| `seasons` exclusion constraint on `tstzrange(starts_at, ends_at)` | Seasons never overlap                 |
| `league_scores (league_id, rider_id) PK`                          | One placement per bracket             |
| Trigger on `xp_transactions` and `season_point_transactions`      | Append-only ledger                    |
