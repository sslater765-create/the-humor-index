-- The Humor Index — accounts schema (Phase 2)
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run (idempotent: IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).

-- =========================================================
-- profiles: one row per user, plus the agree blind-test tally
-- =========================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  agree_agree  integer not null default 0,
  agree_total  integer not null default 0,
  agree_streak integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- =========================================================
-- ratings: love/meh per show
-- =========================================================
create table if not exists public.ratings (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  show_slug  text not null,
  verdict    text not null check (verdict in ('love','meh')),
  updated_at timestamptz not null default now(),
  primary key (user_id, show_slug)
);

-- =========================================================
-- watchlist: saved shows
-- =========================================================
create table if not exists public.watchlist (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  show_slug text not null,
  added_at  timestamptz not null default now(),
  primary key (user_id, show_slug)
);

-- =========================================================
-- Row-Level Security: a user can only touch their own rows
-- =========================================================
alter table public.profiles  enable row level security;
alter table public.ratings   enable row level security;
alter table public.watchlist enable row level security;

drop policy if exists "own profile select" on public.profiles;
drop policy if exists "own profile upsert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile upsert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "own ratings" on public.ratings;
create policy "own ratings" on public.ratings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own watchlist" on public.watchlist;
create policy "own watchlist" on public.watchlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- Auto-create a profile row when a user signs up
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
