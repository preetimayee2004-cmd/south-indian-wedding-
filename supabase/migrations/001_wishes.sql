-- ─────────────────────────────────────────────────────────────
-- Wishing Wall. Run once in Supabase → SQL Editor.
-- Guests (anon key) may ADD a wish and READ visible wishes.
-- Nobody but you (dashboard / service role) can edit, hide or delete.
-- To hide a wish: set hidden = true in the Table Editor.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.wishes (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  text not null check (char_length(wedding_id) between 1 and 64),
  name        text not null check (char_length(btrim(name)) between 1 and 60),
  message     text not null check (char_length(btrim(message)) between 2 and 280),
  hidden      boolean not null default false,
  created_at  timestamptz not null default now(),
  -- no links in wishes (spam)
  constraint wishes_no_links check (
    message !~* '(https?://|www\.|\.(com|net|org|in|xyz|ru)\b)'
    and name !~* '(https?://|www\.)'
  )
);

create index if not exists wishes_wedding_created_idx on public.wishes (wedding_id, created_at desc);

alter table public.wishes enable row level security;

drop policy if exists "read visible wishes" on public.wishes;
create policy "read visible wishes" on public.wishes
  for select to anon, authenticated
  using (hidden = false);

drop policy if exists "add a wish" on public.wishes;
create policy "add a wish" on public.wishes
  for insert to anon, authenticated
  with check (hidden = false);

-- Column-level rights: guests can only write these three columns.
revoke all on public.wishes from anon, authenticated;
grant select (id, wedding_id, name, message, hidden, created_at) on public.wishes to anon, authenticated;
grant insert (wedding_id, name, message) on public.wishes to anon, authenticated;

-- Live updates on the wall.
do $$ begin
  alter publication supabase_realtime add table public.wishes;
exception when duplicate_object then null; end $$;
