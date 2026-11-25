-- ─────────────────────────────────────────────────────────────
-- The RSVP "wall of lamps". Run once in Supabase → SQL Editor (after 002_rsvps.sql).
-- Guests still can't read the RSVP table; this function returns only how many guests
-- have accepted and their FIRST names (latest 23), nothing else. Without it the website
-- simply doesn't show the wall of lamps.
-- ─────────────────────────────────────────────────────────────

create or replace function public.rsvp_lamp_wall(p_wedding_id text)
returns table (count integer, names text[])
language sql
stable
security definer
set search_path = public
as $$
  with latest as (
    select distinct on (respondent_id) name, attending, created_at
    from public.rsvps
    where wedding_id = p_wedding_id
    order by respondent_id, created_at desc
  ),
  yes as (
    select split_part(btrim(name), ' ', 1) as first_name, created_at
    from latest
    where attending
  )
  select
    (select count(*)::integer from yes),
    coalesce((select array_agg(first_name order by created_at desc) from (select * from yes order by created_at desc limit 23) l), '{}');
$$;

revoke all on function public.rsvp_lamp_wall(text) from public;
grant execute on function public.rsvp_lamp_wall(text) to anon, authenticated;
