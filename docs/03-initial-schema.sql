-- =============================================================================
-- Wind of Legend — Initial database schema (PROPOSAL, awaiting approval)
-- =============================================================================
-- This file is the reviewed design. Once approved, it is split into
-- timestamped migrations under supabase/migrations/ (Phase 1: identity +
-- geography; Phase 2: progression; Phase 3: sessions + community; ...).
--
-- Conventions
--   * snake_case, plural table names, uuid primary keys (bigint for ledgers)
--   * every table has RLS enabled; nothing is readable unless a policy says so
--   * progression tables are written ONLY by SECURITY DEFINER functions
--   * timestamps are timestamptz, stored in UTC
-- =============================================================================

create extension if not exists citext     with schema extensions;
create extension if not exists postgis    with schema extensions;
create extension if not exists btree_gist with schema extensions;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.app_role           as enum ('rider', 'moderator', 'admin');
create type public.spot_status        as enum ('pending', 'approved', 'rejected');
create type public.session_type       as enum ('kite_session', 'downwind');
create type public.validation_status  as enum ('draft', 'submitted', 'under_review',
                                               'community_verified', 'gps_verified', 'rejected');
create type public.verification_method as enum ('gps', 'community', 'moderator');
create type public.downwind_status    as enum ('planned', 'open', 'full', 'in_progress',
                                               'completed', 'cancelled');
create type public.participant_status as enum ('interested', 'confirmed', 'completed',
                                               'no_show', 'withdrew');
create type public.passenger_status   as enum ('requested', 'accepted', 'declined', 'cancelled');
create type public.crew_role          as enum ('founder', 'captain', 'member');
create type public.reward_type        as enum (
  'verified_session',       -- 50 XP
  'verified_downwind',      -- 100 XP (replaces verified_session for that session)
  'spot_discovery',         -- 150 XP
  'group_downwind_bonus',   -- +40 XP
  'group_downwind_organizer', -- +75 XP
  'help_rider',             -- 30 XP
  'route_published',        -- 50 XP
  'first_spot_visit_bonus', -- +100 XP
  'first_route_bonus',      -- +50 XP
  'daily_mission',          -- 50-100 XP
  'weekly_mission',         -- 100-300 XP
  'adventure_mission',      -- 300-1000 XP
  'achievement',
  'admin_adjustment'
);
create type public.sp_category        as enum ('activity', 'exploration', 'community');
create type public.achievement_category as enum ('explorer', 'downwind', 'community',
                                                 'consistency', 'seasonal');
create type public.mission_cadence    as enum ('daily', 'weekly', 'adventure');
create type public.season_status      as enum ('announced', 'active', 'final_window',
                                               'closed', 'settled');
create type public.league_scope       as enum ('regional', 'global');
create type public.division           as enum ('bronze', 'silver', 'gold', 'platinum',
                                               'diamond', 'legend');
create type public.league_outcome     as enum ('promoted', 'stayed', 'relegated', 'provisional');
create type public.report_status      as enum ('open', 'in_review', 'resolved', 'dismissed');

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create or replace function public.reject_ledger_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'Ledger tables are append-only (% on %)', tg_op, tg_table_name;
end $$;

-- =============================================================================
-- GEOGRAPHY
-- =============================================================================
create table public.regions (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  country_code char(2) not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create table public.spots (
  id          uuid primary key default gen_random_uuid(),
  region_id   uuid not null references public.regions(id),
  slug        text not null unique,
  name        text not null,
  description text,
  location    extensions.geography(point, 4326) not null,
  status      public.spot_status not null default 'pending',
  created_by  uuid,                     -- FK added after profiles exists
  created_at  timestamptz not null default now()
);
create index spots_location_gix on public.spots using gist (location);
create index spots_region_idx   on public.spots (region_id);

create table public.routes (
  id            uuid primary key default gen_random_uuid(),
  region_id     uuid not null references public.regions(id),
  slug          text not null unique,
  name          text not null,
  start_spot_id uuid not null references public.spots(id),
  end_spot_id   uuid not null references public.spots(id),
  distance_km   numeric(6,2) check (distance_km > 0),
  path          extensions.geography(linestring, 4326),
  status        public.spot_status not null default 'pending',
  published_by  uuid,
  created_at    timestamptz not null default now(),
  check (start_spot_id <> end_spot_id)
);

-- =============================================================================
-- IDENTITY
-- =============================================================================
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  username       extensions.citext not null unique
                   check (username ~ '^[a-zA-Z0-9_]{3,24}$'),
  display_name   text not null check (char_length(display_name) between 1 and 60),
  avatar_url     text,
  bio            text check (char_length(bio) <= 280),
  home_region_id uuid references public.regions(id),
  home_spot_id   uuid references public.spots(id),
  app_role       public.app_role not null default 'rider',
  onboarded_at   timestamptz,                -- set when the rider finishes onboarding
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.spots  add constraint spots_created_by_fk
  foreign key (created_by)   references public.profiles(id) on delete set null;
alter table public.routes add constraint routes_published_by_fk
  foreign key (published_by) references public.profiles(id) on delete set null;

create table public.rider_preferences (
  rider_id             uuid primary key references public.profiles(id) on delete cascade,
  gps_consent          boolean not null default false,
  gps_consent_at       timestamptz,
  show_on_leaderboards boolean not null default true,
  locale               text not null default 'pt-BR',
  units                text not null default 'metric' check (units in ('metric', 'imperial')),
  updated_at           timestamptz not null default now(),
  check (gps_consent = false or gps_consent_at is not null)
);
create trigger rider_preferences_updated_at before update on public.rider_preferences
  for each row execute function public.set_updated_at();

-- Server-maintained cache of the ledger. Never written by clients.
create table public.rider_stats (
  rider_id    uuid primary key references public.profiles(id) on delete cascade,
  lifetime_xp bigint not null default 0 check (lifetime_xp >= 0),
  level       int    not null default 1,
  updated_at  timestamptz not null default now()
);

-- Role helpers (used by policies)
create or replace function public.has_role(required public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.app_role = required or p.app_role = 'admin')
  );
$$;

-- Create profile rows when a user signs up (username chosen in onboarding)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    'rider_' || substr(replace(new.id::text, '-', ''), 1, 10),
    coalesce(new.raw_user_meta_data->>'full_name', 'New rider')
  );
  insert into public.rider_preferences (rider_id) values (new.id);
  insert into public.rider_stats (rider_id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- COMMUNITY (downwinds first: sessions reference them)
-- =============================================================================
create table public.downwinds (
  id               uuid primary key default gen_random_uuid(),
  organizer_id     uuid not null references public.profiles(id),
  route_id         uuid not null references public.routes(id),
  region_id        uuid not null references public.regions(id),
  title            text not null check (char_length(title) between 3 and 80),
  description      text check (char_length(description) <= 1000),
  meeting_point    text,
  meeting_location extensions.geography(point, 4326),
  departure_at     timestamptz not null,
  max_participants int check (max_participants between 2 and 50),
  status           public.downwind_status not null default 'open',
  -- Product rule: community events are never presented as guided activities
  is_guided        boolean not null default false check (is_guided = false),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index downwinds_departure_idx on public.downwinds (region_id, departure_at);
create trigger downwinds_updated_at before update on public.downwinds
  for each row execute function public.set_updated_at();

create table public.downwind_participants (
  downwind_id uuid not null references public.downwinds(id) on delete cascade,
  rider_id    uuid not null references public.profiles(id) on delete cascade,
  status      public.participant_status not null default 'confirmed',
  joined_at   timestamptz not null default now(),
  primary key (downwind_id, rider_id)
);

create table public.vehicles (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  label        text not null,
  seats        int not null check (seats between 1 and 15),
  kite_capacity int check (kite_capacity >= 0),
  created_at   timestamptz not null default now()
);

create table public.ride_shares (
  id                  uuid primary key default gen_random_uuid(),
  downwind_id         uuid not null references public.downwinds(id) on delete cascade,
  vehicle_id          uuid not null references public.vehicles(id),
  driver_id           uuid not null references public.profiles(id),
  seats_offered       int not null check (seats_offered >= 1),
  cost_per_seat_cents int not null default 0 check (cost_per_seat_cents >= 0),
  currency            char(3) not null default 'BRL',
  pickup_point        text,
  departure_at        timestamptz not null,
  notes               text,
  created_at          timestamptz not null default now()
);

create table public.ride_share_passengers (
  ride_share_id uuid not null references public.ride_shares(id) on delete cascade,
  rider_id      uuid not null references public.profiles(id) on delete cascade,
  status        public.passenger_status not null default 'requested',
  created_at    timestamptz not null default now(),
  primary key (ride_share_id, rider_id)
);

create table public.crews (
  id             uuid primary key default gen_random_uuid(),
  slug           extensions.citext not null unique check (slug ~ '^[a-z0-9-]{3,32}$'),
  name           text not null check (char_length(name) between 3 and 40),
  description    text check (char_length(description) <= 500),
  logo_url       text,
  home_region_id uuid references public.regions(id),
  founder_id     uuid not null references public.profiles(id),
  created_at     timestamptz not null default now()
);

create table public.crew_members (
  crew_id   uuid not null references public.crews(id) on delete cascade,
  rider_id  uuid not null unique references public.profiles(id) on delete cascade, -- one crew per rider
  role      public.crew_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (crew_id, rider_id)
);

create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  crew_id     uuid references public.crews(id) on delete cascade,
  downwind_id uuid references public.downwinds(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 2000),
  created_at  timestamptz not null default now(),
  check (num_nonnulls(crew_id, downwind_id) = 1)
);
create index messages_crew_idx     on public.messages (crew_id, created_at);
create index messages_downwind_idx on public.messages (downwind_id, created_at);

-- =============================================================================
-- SESSIONS
-- =============================================================================
create table public.sessions (
  id                uuid primary key default gen_random_uuid(),
  rider_id          uuid not null references public.profiles(id) on delete cascade,
  client_session_id uuid not null,                -- generated offline on the device
  type              public.session_type not null,
  spot_id           uuid references public.spots(id),
  route_id          uuid references public.routes(id),
  downwind_id       uuid references public.downwinds(id),
  region_id         uuid not null references public.regions(id),
  started_at        timestamptz not null,
  ended_at          timestamptz not null,
  duration_s        int generated always as
                      (extract(epoch from (ended_at - started_at))::int) stored,
  distance_m        int check (distance_m >= 0),
  status            public.validation_status not null default 'draft',
  notes             text check (char_length(notes) <= 500),
  recorded_offline  boolean not null default false,
  submitted_at      timestamptz,
  verified_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (rider_id, client_session_id),
  check (ended_at > started_at),
  check (type <> 'downwind' or route_id is not null),
  check (type <> 'kite_session' or spot_id is not null)
);
create index sessions_rider_idx  on public.sessions (rider_id, started_at desc);
create index sessions_status_idx on public.sessions (status) where status in ('submitted', 'under_review');
create trigger sessions_updated_at before update on public.sessions
  for each row execute function public.set_updated_at();

-- Private: owner only. Raw points live in the private 'tracks' storage bucket.
create table public.session_tracks (
  session_id   uuid primary key references public.sessions(id) on delete cascade,
  storage_path text not null,
  point_count  int not null check (point_count >= 0),
  checksum     text not null,
  uploaded_at  timestamptz not null default now()
);

create table public.session_media (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.sessions(id) on delete cascade,
  storage_path text not null,
  media_type   text not null check (media_type in ('photo', 'video')),
  created_at   timestamptz not null default now()
);

create table public.session_verifications (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  method      public.verification_method not null,
  result      public.validation_status not null,
  details     jsonb not null default '{}',   -- check results, never raw coordinates
  decided_by  uuid references public.profiles(id),  -- null = automated
  created_at  timestamptz not null default now()
);

create table public.verification_votes (
  session_id uuid not null references public.sessions(id) on delete cascade,
  voter_id   uuid not null references public.profiles(id) on delete cascade,
  approve    boolean not null,
  created_at timestamptz not null default now(),
  primary key (session_id, voter_id)
);
create index verification_votes_voter_idx on public.verification_votes (voter_id, created_at);

-- =============================================================================
-- GAMIFICATION
-- =============================================================================
create table public.reward_rules (
  reward_type  public.reward_type primary key,
  base_xp      int not null check (base_xp >= 0),
  base_sp      numeric(8,2) not null default 0 check (base_sp >= 0),
  sp_category  public.sp_category,
  daily_cap    int,                      -- max rewarded occurrences per day (null = none)
  weekly_cap   int,
  diminishing  numeric(4,3)[] not null default '{1}',  -- e.g. {1,0.5,0.25,0}
  is_active    boolean not null default true,
  updated_at   timestamptz not null default now()
);

create table public.seasons (
  id         uuid primary key default gen_random_uuid(),
  number     int not null unique,
  name       text not null,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  status     public.season_status not null default 'announced',
  sp_weights jsonb not null default '{"activity":0.7,"exploration":0.2,"community":0.1}',
  check (ends_at > starts_at),
  exclude using gist (tstzrange(starts_at, ends_at) with &&)
);

create table public.xp_transactions (
  id              bigint generated always as identity primary key,
  rider_id        uuid not null references public.profiles(id) on delete cascade,
  reward_type     public.reward_type not null,
  source_id       uuid,                          -- session, downwind, mission, ...
  base_amount     int not null,
  multiplier      numeric(5,3) not null default 1,
  amount          int not null,                  -- negative only for admin_adjustment
  idempotency_key text not null unique,
  reason          text,
  season_id       uuid references public.seasons(id),
  created_by      uuid references public.profiles(id),  -- null = system
  created_at      timestamptz not null default now(),
  check (amount >= 0 or reward_type = 'admin_adjustment')
);
create index xp_tx_rider_idx on public.xp_transactions (rider_id, created_at desc);
create index xp_tx_caps_idx  on public.xp_transactions (rider_id, reward_type, created_at);
create trigger xp_tx_append_only before update or delete on public.xp_transactions
  for each row execute function public.reject_ledger_mutation();

create table public.season_point_transactions (
  id                bigint generated always as identity primary key,
  rider_id          uuid not null references public.profiles(id) on delete cascade,
  season_id         uuid not null references public.seasons(id),
  region_id         uuid not null references public.regions(id),
  category          public.sp_category not null,
  amount            numeric(10,2) not null,
  xp_transaction_id bigint references public.xp_transactions(id),
  idempotency_key   text not null unique,
  created_at        timestamptz not null default now()
);
create index sp_tx_season_region_idx on public.season_point_transactions (season_id, region_id, rider_id);
create index sp_tx_season_rider_idx  on public.season_point_transactions (season_id, rider_id);
create trigger sp_tx_append_only before update or delete on public.season_point_transactions
  for each row execute function public.reject_ledger_mutation();

create table public.rider_levels (
  level       int primary key check (level between 1 and 50),
  rank_title  text,                 -- only milestone levels have a new title
  xp_required int not null unique check (xp_required >= 0),
  rewards     jsonb not null default '[]',
  is_enabled  boolean not null default true
);

create table public.achievements (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  category    public.achievement_category not null,
  name        text not null,
  description text not null,
  icon        text not null,
  xp_reward   int not null default 0 check (xp_reward >= 0),
  criteria    jsonb not null,       -- evaluated server-side, e.g. {"type":"spots_discovered","count":5}
  is_seasonal boolean not null default false,
  is_active   boolean not null default true
);

create table public.rider_achievements (
  id             uuid primary key default gen_random_uuid(),
  rider_id       uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id),
  season_id      uuid references public.seasons(id),
  unlocked_at    timestamptz not null default now()
);
create unique index rider_achievements_once
  on public.rider_achievements (rider_id, achievement_id,
     coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid));

create table public.challenges (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  cadence     public.mission_cadence not null,
  title       text not null,
  description text not null,
  criteria    jsonb not null,       -- e.g. {"type":"downwinds_completed","count":2}
  target      int not null check (target > 0),
  xp_reward   int not null check (xp_reward between 0 and 1000),
  region_id   uuid references public.regions(id),
  is_crew     boolean not null default false,
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.challenge_progress (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  rider_id     uuid not null references public.profiles(id) on delete cascade,
  period_key   text not null,       -- '2026-11-14' (daily), '2026-W46' (weekly), 'all' (adventure)
  progress     int not null default 0 check (progress >= 0),
  completed_at timestamptz,
  primary key (challenge_id, rider_id, period_key)
);

create table public.leagues (
  id        uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  scope     public.league_scope not null,
  region_id uuid references public.regions(id),
  division  public.division not null,
  check ((scope = 'regional') = (region_id is not null))
);
create unique index leagues_unique
  on public.leagues (season_id, scope,
     coalesce(region_id, '00000000-0000-0000-0000-000000000000'::uuid), division);

create table public.league_scores (
  league_id   uuid not null references public.leagues(id) on delete cascade,
  rider_id    uuid not null references public.profiles(id) on delete cascade,
  points      numeric(12,2) not null default 0,
  rank        int,
  provisional boolean not null default true,
  outcome     public.league_outcome,
  updated_at  timestamptz not null default now(),
  primary key (league_id, rider_id)
);
create index league_scores_rank_idx on public.league_scores (league_id, points desc);

create table public.crew_scores (
  season_id  uuid not null references public.seasons(id) on delete cascade,
  crew_id    uuid not null references public.crews(id) on delete cascade,
  points     numeric(12,2) not null default 0,
  rank       int,
  updated_at timestamptz not null default now(),
  primary key (season_id, crew_id)
);

-- =============================================================================
-- MODERATION
-- =============================================================================
create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('profile', 'session', 'downwind',
                                                    'crew', 'message', 'spot', 'route')),
  target_id   uuid not null,
  reason      text not null check (char_length(reason) between 3 and 1000),
  status      public.report_status not null default 'open',
  created_at  timestamptz not null default now()
);

create table public.moderation_actions (
  id           uuid primary key default gen_random_uuid(),
  report_id    uuid references public.reports(id),
  moderator_id uuid not null references public.profiles(id),
  action       text not null,      -- 'reject_session', 'hide_message', 'xp_adjustment', ...
  target_type  text not null,
  target_id    uuid not null,
  notes        text,
  created_at   timestamptz not null default now()
);

create table public.audit_logs (
  id         bigint generated always as identity primary key,
  actor_id   uuid references public.profiles(id),
  action     text not null,
  entity     text not null,
  entity_id  text,
  before     jsonb,
  after      jsonb,
  created_at timestamptz not null default now()
);
create trigger audit_logs_append_only before update or delete on public.audit_logs
  for each row execute function public.reject_ledger_mutation();

-- =============================================================================
-- PUBLIC VIEWS (expose only safe columns)
-- =============================================================================
create view public.rider_public_profiles with (security_invoker = false) as
select p.id, p.username, p.display_name, p.avatar_url, p.bio, p.home_region_id,
       s.lifetime_xp, s.level, l.rank_title
from public.profiles p
join public.rider_stats s on s.rider_id = p.id
left join lateral (
  select rank_title from public.rider_levels
  where level <= s.level and rank_title is not null
  order by level desc limit 1
) l on true;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'regions','spots','routes','profiles','rider_preferences','rider_stats',
    'downwinds','downwind_participants','vehicles','ride_shares','ride_share_passengers',
    'crews','crew_members','messages','sessions','session_tracks','session_media',
    'session_verifications','verification_votes','reward_rules','seasons',
    'xp_transactions','season_point_transactions','rider_levels','achievements',
    'rider_achievements','challenges','challenge_progress','leagues','league_scores',
    'crew_scores','reports','moderation_actions','audit_logs'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Reference data: readable by everyone signed in
create policy "read regions"      on public.regions      for select to authenticated using (true);
create policy "read levels"       on public.rider_levels for select to authenticated using (true);
create policy "read achievements" on public.achievements for select to authenticated using (is_active);
create policy "read challenges"   on public.challenges   for select to authenticated using (is_active);
create policy "read seasons"      on public.seasons      for select to authenticated using (true);
create policy "read leagues"      on public.leagues      for select to authenticated using (true);
create policy "read reward rules" on public.reward_rules for select to authenticated using (true);

-- Spots and routes: approved ones public; riders see their own pending submissions
create policy "read spots" on public.spots for select to authenticated
  using (status = 'approved' or created_by = auth.uid() or public.has_role('moderator'));
create policy "read routes" on public.routes for select to authenticated
  using (status = 'approved' or published_by = auth.uid() or public.has_role('moderator'));

-- Profiles: readable; only own display fields writable (column grants below)
create policy "read profiles"       on public.profiles for select to authenticated using (true);
create policy "update own profile"  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant  update (username, display_name, avatar_url, bio, home_region_id, home_spot_id)
  on public.profiles to authenticated;

create policy "own preferences" on public.rider_preferences for all to authenticated
  using (rider_id = auth.uid()) with check (rider_id = auth.uid());

-- Progression: read-only for clients, NO insert/update/delete policies
create policy "read stats"           on public.rider_stats for select to authenticated using (true);
create policy "read own xp"          on public.xp_transactions for select to authenticated
  using (rider_id = auth.uid() or public.has_role('moderator'));
create policy "read own sp"          on public.season_point_transactions for select to authenticated
  using (rider_id = auth.uid() or public.has_role('moderator'));
create policy "read achievements unlocked" on public.rider_achievements for select to authenticated using (true);
create policy "read own challenge progress" on public.challenge_progress for select to authenticated
  using (rider_id = auth.uid());
create policy "read league scores"   on public.league_scores for select to authenticated using (true);
create policy "read crew scores"     on public.crew_scores   for select to authenticated using (true);

-- Sessions: owner reads/writes drafts; downwind co-participants can read for verification
create policy "read own sessions" on public.sessions for select to authenticated
  using (
    rider_id = auth.uid()
    or public.has_role('moderator')
    or (downwind_id is not null and exists (
          select 1 from public.downwind_participants dp
          where dp.downwind_id = sessions.downwind_id and dp.rider_id = auth.uid()))
  );
create policy "insert own draft session" on public.sessions for insert to authenticated
  with check (rider_id = auth.uid() and status in ('draft', 'submitted'));
create policy "edit own draft session" on public.sessions for update to authenticated
  using (rider_id = auth.uid() and status = 'draft')
  with check (rider_id = auth.uid() and status in ('draft', 'submitted'));

-- GPS tracks: owner only, never other riders (moderators use a SECURITY DEFINER review function)
create policy "own tracks" on public.session_tracks for all to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.rider_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = session_id and s.rider_id = auth.uid()));
create policy "own media" on public.session_media for all to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.rider_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = session_id and s.rider_id = auth.uid()));
create policy "read own verifications" on public.session_verifications for select to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.rider_id = auth.uid())
         or public.has_role('moderator'));
-- Votes are cast only through cast_verification_vote() (Phase 3): read-only here
create policy "read votes on visible sessions" on public.verification_votes for select to authenticated
  using (voter_id = auth.uid()
         or exists (select 1 from public.sessions s where s.id = session_id and s.rider_id = auth.uid()));

-- Downwinds
create policy "read downwinds"   on public.downwinds for select to authenticated using (true);
create policy "create downwind"  on public.downwinds for insert to authenticated
  with check (organizer_id = auth.uid());
create policy "organizer edits"  on public.downwinds for update to authenticated
  using (organizer_id = auth.uid()) with check (organizer_id = auth.uid());
create policy "read participants" on public.downwind_participants for select to authenticated using (true);
create policy "join or leave self" on public.downwind_participants for all to authenticated
  using (rider_id = auth.uid()) with check (rider_id = auth.uid() and status in ('interested', 'confirmed', 'withdrew'));

-- Transport
create policy "own vehicles" on public.vehicles for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "read ride shares" on public.ride_shares for select to authenticated using (true);
create policy "driver manages ride share" on public.ride_shares for all to authenticated
  using (driver_id = auth.uid()) with check (driver_id = auth.uid());
create policy "passenger or driver reads" on public.ride_share_passengers for select to authenticated
  using (rider_id = auth.uid()
         or exists (select 1 from public.ride_shares r where r.id = ride_share_id and r.driver_id = auth.uid()));
create policy "passenger requests" on public.ride_share_passengers for insert to authenticated
  with check (rider_id = auth.uid() and status = 'requested');

-- Crews (membership changes go through functions in Phase 4)
create policy "read crews"        on public.crews        for select to authenticated using (true);
create policy "read crew members" on public.crew_members for select to authenticated using (true);

-- Messages: only members of the crew / participants of the downwind
create policy "read messages" on public.messages for select to authenticated
  using (
    (crew_id is not null and exists (select 1 from public.crew_members m
       where m.crew_id = messages.crew_id and m.rider_id = auth.uid()))
    or (downwind_id is not null and exists (select 1 from public.downwind_participants p
       where p.downwind_id = messages.downwind_id and p.rider_id = auth.uid()))
  );
create policy "send messages" on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid() and (
      (crew_id is not null and exists (select 1 from public.crew_members m
         where m.crew_id = messages.crew_id and m.rider_id = auth.uid()))
      or (downwind_id is not null and exists (select 1 from public.downwind_participants p
         where p.downwind_id = messages.downwind_id and p.rider_id = auth.uid()))
    )
  );

-- Moderation
create policy "file report"      on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "read own reports" on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.has_role('moderator'));
create policy "moderators read actions" on public.moderation_actions for select to authenticated
  using (public.has_role('moderator'));
create policy "admins read audit" on public.audit_logs for select to authenticated
  using (public.has_role('admin'));

-- =============================================================================
-- SERVER FUNCTIONS (signatures only; implemented in later phases)
-- =============================================================================
-- Phase 2: award_reward(p_rider uuid, p_type reward_type, p_source uuid,
--                       p_idempotency_key text, p_region uuid) returns jsonb
--          level_for_xp(p_xp bigint) returns int
--          evaluate_achievements(p_rider uuid) returns setof uuid
--          admin_adjust_xp(p_rider uuid, p_amount int, p_reason text)  -- admin only, audited
-- Phase 3: submit_session(...) / verify_session(p_session uuid)
--          cast_verification_vote(p_session uuid, p_approve boolean)
--          complete_downwind(p_downwind uuid)
-- Phase 4: join_crew(...), leave_crew(...), record_challenge_progress(...)
-- Phase 5: refresh_league_scores(p_season uuid), settle_season(p_season uuid)
--
-- All are SECURITY DEFINER with `set search_path = public`, check auth.uid()
-- themselves, and are the only code paths that write progression tables.

-- =============================================================================
-- SEED (excerpt; full seed in supabase/seed.sql)
-- =============================================================================
insert into public.reward_rules (reward_type, base_xp, base_sp, sp_category, daily_cap, weekly_cap, diminishing) values
  ('verified_session',         50,  50, 'activity',    3,  null, '{1,0.5,0.25}'),
  ('verified_downwind',        100, 100, 'activity',   2,  null, '{1,0.5}'),
  ('spot_discovery',           150, 150, 'exploration', null, 3, '{1}'),
  ('group_downwind_bonus',     40,  40, 'community',   2,  null, '{1,0.5}'),
  ('group_downwind_organizer', 75,  75, 'community',   1,  3,    '{1}'),
  ('help_rider',               30,  30, 'community',   3,  10,   '{1,0.5,0.25}'),
  ('route_published',          50,  50, 'exploration', 1,  3,    '{1}'),
  ('first_spot_visit_bonus',   100, 0,  null,          null, null, '{1}'),
  ('first_route_bonus',        50,  0,  null,          null, null, '{1}'),
  ('daily_mission',            0,   0,  'activity',    3,  null, '{1}'),   -- amount from challenge
  ('weekly_mission',           0,   0,  'activity',    null, 5,  '{1}'),
  ('adventure_mission',        0,   0,  'exploration', null, null, '{1}'),
  ('achievement',              0,   0,  null,          null, null, '{1}'),
  ('admin_adjustment',         0,   0,  null,          null, null, '{1}');

insert into public.rider_levels (level, rank_title, xp_required, is_enabled) values
  (1,'Rookie',0,true),(2,'Apprentice',100,true),(3,'Rider',250,true),(4,null,420,true),
  (5,'Explorer',700,true),(6,null,860,true),(7,null,1070,true),(8,null,1310,true),
  (9,null,1620,true),(10,'Adventurer',2000,true),
  (11,null,2350,false),(12,null,2770,false),(13,null,3250,false),(14,null,3830,false),
  (15,'Wind Chaser',4500,false),(16,null,5050,false),(17,null,5660,false),(18,null,6360,false),
  (19,null,7130,false),(20,'Wave Hunter',8000,false),(21,null,8820,false),(22,null,9710,false),
  (23,null,10710,false),(24,null,11800,false),(25,'Pro Rider',13000,false),(26,null,14170,false),
  (27,null,15440,false),(28,null,16830,false),(29,null,18350,false),(30,'Elite',20000,false),
  (31,null,21690,false),(32,null,23520,false),(33,null,25510,false),(34,null,27660,false),
  (35,'Master Rider',30000,false),(36,null,32530,false),(37,null,35280,false),(38,null,38260,false),
  (39,null,41490,false),(40,'Legend',45000,false),(41,null,48430,false),(42,null,52130,false),
  (43,null,56110,false),(44,null,60390,false),(45,'Wind Master',65000,false),(46,null,70850,false),
  (47,null,77220,false),(48,null,84170,false),(49,null,91750,false),(50,'Icon',100000,false);

insert into public.regions (slug, name, country_code) values ('ceara', 'Ceará', 'BR');
