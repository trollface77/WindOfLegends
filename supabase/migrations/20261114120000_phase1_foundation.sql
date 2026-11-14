-- =============================================================================
-- Wind of Legend · Phase 1 · Foundation
-- Extensions, shared helpers, geography, identity, signup trigger, RLS,
-- and the avatars storage bucket.
-- Design reference: docs/03-initial-schema.sql
-- =============================================================================

create extension if not exists citext     with schema extensions;
create extension if not exists postgis    with schema extensions;
create extension if not exists btree_gist with schema extensions;

-- -----------------------------------------------------------------------------
-- Enums used in this phase
-- -----------------------------------------------------------------------------
create type public.app_role    as enum ('rider', 'moderator', 'admin');
create type public.spot_status as enum ('pending', 'approved', 'rejected');

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end $$;

create or replace function public.reject_ledger_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
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
  created_by  uuid,
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
  onboarded_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.spots add constraint spots_created_by_fk
  foreign key (created_by) references public.profiles(id) on delete set null;
alter table public.routes add constraint routes_published_by_fk
  foreign key (published_by) references public.profiles(id) on delete set null;

create table public.rider_preferences (
  rider_id             uuid primary key references public.profiles(id) on delete cascade,
  gps_consent          boolean not null default false,
  gps_consent_at       timestamptz,
  show_on_leaderboards boolean not null default true,
  locale               text not null default 'pt-BR' check (locale in ('pt-BR', 'en', 'es')),
  units                text not null default 'metric' check (units in ('metric', 'imperial')),
  updated_at           timestamptz not null default now(),
  check (gps_consent = false or gps_consent_at is not null)
);
create trigger rider_preferences_updated_at before update on public.rider_preferences
  for each row execute function public.set_updated_at();

-- Server-maintained cache of the XP ledger (ledger arrives in Phase 2).
-- Clients can read it but never write it.
create table public.rider_stats (
  rider_id    uuid primary key references public.profiles(id) on delete cascade,
  lifetime_xp bigint not null default 0 check (lifetime_xp >= 0),
  level       int    not null default 1 check (level between 1 and 50),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Role helper used by policies. 'admin' satisfies every role check.
-- -----------------------------------------------------------------------------
create or replace function public.has_role(required public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.app_role = required or p.app_role = 'admin')
  );
$$;

-- -----------------------------------------------------------------------------
-- Signup: create profile, preferences and stats. The username is a
-- placeholder until the rider completes onboarding.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    'rider_' || substr(replace(new.id::text, '-', ''), 1, 10),
    left(coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'New rider'), 60)
  );
  insert into public.rider_preferences (rider_id) values (new.id);
  insert into public.rider_stats (rider_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- PUBLIC VIEW: safe profile columns joined with stats
-- =============================================================================
create view public.rider_public_profiles
with (security_invoker = true) as
select p.id, p.username, p.display_name, p.avatar_url, p.bio,
       p.home_region_id, p.home_spot_id, p.created_at,
       s.lifetime_xp, s.level
from public.profiles p
join public.rider_stats s on s.rider_id = p.id
where p.onboarded_at is not null;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.regions           enable row level security;
alter table public.spots             enable row level security;
alter table public.routes            enable row level security;
alter table public.profiles          enable row level security;
alter table public.rider_preferences enable row level security;
alter table public.rider_stats       enable row level security;

-- Reference data
create policy "regions are readable"
  on public.regions for select to anon, authenticated using (is_active);

create policy "approved spots are readable"
  on public.spots for select to anon, authenticated
  using (status = 'approved'
         or created_by = (select auth.uid())
         or (select public.has_role('moderator')));

create policy "approved routes are readable"
  on public.routes for select to anon, authenticated
  using (status = 'approved'
         or published_by = (select auth.uid())
         or (select public.has_role('moderator')));

-- Profiles: everyone signed in can read; a rider updates only their own
-- display fields (column grants below). app_role is never client-writable.
create policy "profiles are readable"
  on public.profiles for select to authenticated using (true);

create policy "riders update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (username, display_name, avatar_url, bio, home_region_id, home_spot_id, onboarded_at)
  on public.profiles to authenticated;

-- Preferences: owner only
create policy "riders read their own preferences"
  on public.rider_preferences for select to authenticated
  using (rider_id = (select auth.uid()));

create policy "riders update their own preferences"
  on public.rider_preferences for update to authenticated
  using (rider_id = (select auth.uid()))
  with check (rider_id = (select auth.uid()));

revoke insert, delete on public.rider_preferences from anon, authenticated;

-- Stats: read-only for everyone signed in, no write policies at all
create policy "rider stats are readable"
  on public.rider_stats for select to authenticated using (true);

revoke insert, update, delete on public.rider_stats from anon, authenticated;

-- Reference tables are written only by migrations, seed and moderators (Phase 3)
revoke insert, update, delete on public.regions, public.spots, public.routes from anon, authenticated;

grant select on public.rider_public_profiles to authenticated;

-- =============================================================================
-- STORAGE: public avatars bucket, riders write only inside their own folder
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "avatars are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'avatars');

create policy "riders upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars'
              and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "riders replace their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars'
         and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "riders delete their own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars'
         and (storage.foldername(name))[1] = (select auth.uid())::text);
