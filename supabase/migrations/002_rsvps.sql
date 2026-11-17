-- ─────────────────────────────────────────────────────────────
-- RSVPs. Run once in Supabase → SQL Editor (after 001_wishes.sql).
-- Guests (anon key) can only INSERT. Nobody can read RSVPs from the
-- website — view them in the dashboard (Table Editor → rsvp_latest).
-- A guest who changes their answer adds a new row; rsvp_latest keeps
-- only their most recent one.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.rsvps (
  id             uuid primary key default gen_random_uuid(),
  wedding_id     text not null check (char_length(wedding_id) between 1 and 64),
  respondent_id  uuid not null,                       -- one per guest browser
  name           text not null check (char_length(btrim(name)) between 1 and 80),
  attending      boolean not null,
  guests         smallint not null check (guests between 0 and 20),
  message        text check (message is null or char_length(message) <= 500),
  created_at     timestamptz not null default now(),
  constraint rsvps_guest_count check ((attending and guests >= 1) or (not attending and guests = 0))
);

create index if not exists rsvps_wedding_idx on public.rsvps (wedding_id, respondent_id, created_at desc);

alter table public.rsvps enable row level security;

drop policy if exists "submit an rsvp" on public.rsvps;
create policy "submit an rsvp" on public.rsvps
  for insert to anon, authenticated
  with check (true);
-- (no select/update/delete policies → guests can't read or change anything)

revoke all on public.rsvps from anon, authenticated;
grant insert (wedding_id, respondent_id, name, attending, guests, message) on public.rsvps to anon, authenticated;

-- Latest answer per guest, for the couple. Not exposed to guests.
create or replace view public.rsvp_latest with (security_invoker = true) as
select distinct on (wedding_id, respondent_id)
  wedding_id, name, attending, guests, message, created_at
from public.rsvps
order by wedding_id, respondent_id, created_at desc;

revoke all on public.rsvp_latest from anon, authenticated;
