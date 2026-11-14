-- =============================================================================
-- Wind of Legend · seed data (Phase 1)
-- Coordinates are approximate and must be checked with local riders before
-- the beta. Spots are inserted as 'approved' reference data.
-- =============================================================================

insert into public.regions (slug, name, country_code)
values ('ceara', 'Ceará', 'BR')
on conflict (slug) do nothing;

with r as (select id from public.regions where slug = 'ceara')
insert into public.spots (region_id, slug, name, description, location, status)
select r.id, s.slug, s.name, s.description,
       extensions.st_setsrid(extensions.st_makepoint(s.lng, s.lat), 4326)::extensions.geography,
       'approved'
from r, (values
  ('prea',            'Preá',             'Home spot of the beta. Flat-to-chop, steady trade winds.', -40.4260, -2.8170),
  ('jericoacoara',    'Jericoacoara',     'Iconic dune village and downwind waypoint.',               -40.5137, -2.7956),
  ('guriu',           'Guriú',            'River mouth and lagoon, classic downwind finish.',          -40.5864, -2.8467),
  ('tatajuba',        'Tatajuba',         'Remote lagoon region west of Guriú.',                       -40.6747, -2.8706),
  ('ilha-do-guajiru', 'Ilha do Guajiru',  'Flat-water lagoon near Itarema.',                           -39.9350, -2.9220),
  ('cumbuco',         'Cumbuco',          'Busy spot close to Fortaleza.',                             -38.7290, -3.6280)
) as s(slug, name, description, lng, lat)
on conflict (slug) do nothing;

insert into public.routes (region_id, slug, name, start_spot_id, end_spot_id, distance_km, status)
select r.id, v.slug, v.name, a.id, b.id, v.km, 'approved'
from public.regions r
cross join (values
  ('prea-guriu',      'Preá → Guriú',      'prea',  'guriu',    22.0),
  ('prea-jeri',       'Preá → Jericoacoara','prea', 'jericoacoara', 11.0),
  ('guriu-tatajuba',  'Guriú → Tatajuba',  'guriu', 'tatajuba', 11.0)
) as v(slug, name, from_slug, to_slug, km)
join public.spots a on a.slug = v.from_slug
join public.spots b on b.slug = v.to_slug
where r.slug = 'ceara'
on conflict (slug) do nothing;
