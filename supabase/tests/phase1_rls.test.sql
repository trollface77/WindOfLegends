-- pgTAP tests for Phase 1 security rules.
-- Run with: npx supabase test db   (needs a local stack via Docker, or CI)
begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

-- Two riders created through the real signup trigger
insert into auth.users (id, email, raw_user_meta_data)
values ('11111111-1111-1111-1111-111111111111', 'a@test.local', '{"full_name":"Rider A"}'),
       ('22222222-2222-2222-2222-222222222222', 'b@test.local', '{}');

select is((select count(*)::int from public.profiles), 2, 'signup trigger creates profiles');
select is((select count(*)::int from public.rider_preferences), 2, 'signup trigger creates preferences');
select is((select count(*)::int from public.rider_stats), 2, 'signup trigger creates stats');
select is((select display_name from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
          'New rider', 'missing name falls back to "New rider"');

-- Act as rider A
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$ update public.profiles set display_name = 'Kite A' where id = '11111111-1111-1111-1111-111111111111' $$,
  'rider can update own display name');

update public.profiles set display_name = 'Hacked' where id = '22222222-2222-2222-2222-222222222222';
reset role;
select is((select display_name from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
          'New rider', 'rider cannot update another profile');
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select throws_ok(
  $$ update public.profiles set app_role = 'admin' where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', null, 'rider cannot change own role');

select throws_ok(
  $$ update public.rider_stats set lifetime_xp = 999999 where rider_id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', null, 'rider cannot write XP');

select throws_ok(
  $$ insert into public.profiles (id, username, display_name) values (gen_random_uuid(), 'sneaky', 'x') $$,
  '42501', null, 'rider cannot insert profiles');

select is((select count(*)::int from public.rider_preferences), 1, 'rider sees only own preferences');

select throws_ok(
  $$ insert into public.spots (region_id, slug, name, location)
     values ((select id from public.regions limit 1), 'x', 'x', 'POINT(0 0)') $$,
  '42501', null, 'rider cannot insert spots directly');

select throws_ok(
  $$ update public.profiles set username = 'no spaces allowed' where id = '11111111-1111-1111-1111-111111111111' $$,
  '23514', null, 'username format is enforced');

select * from finish();
rollback;
