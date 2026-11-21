-- The Humor Index: diary logs, lists and public profiles (Nov 2026).
-- Run once in Supabase -> SQL Editor -> New query -> Run. Safe to re-run.
--
-- Until this runs, the Log button and the diary on /my show a friendly
-- "not switched on yet" note and nothing else breaks.

-- =========================================================
-- profiles: public handle, short bio, opt-in public flag
-- =========================================================
alter table public.profiles add column if not exists handle    text;
alter table public.profiles add column if not exists bio       text;
alter table public.profiles add column if not exists is_public boolean not null default false;

do $$ begin
  alter table public.profiles add constraint profiles_handle_format
    check (handle is null or handle ~ '^[a-z0-9_]{3,20}$');
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.profiles add constraint profiles_bio_length
    check (bio is null or char_length(bio) <= 280);
exception when duplicate_object then null; end $$;

create unique index if not exists profiles_handle_key on public.profiles (handle);

-- True when the user has opted into a public profile. SECURITY DEFINER so the
-- policies below can ask without giving anonymous visitors read access to
-- profiles (which holds email addresses).
create or replace function public.is_public_user(uid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select is_public and handle is not null from public.profiles where id = uid), false);
$$;

-- What a visitor may see about a public profile. No email.
create or replace view public.public_profiles as
  select id, handle, display_name, bio, created_at
  from public.profiles
  where is_public and handle is not null;

grant select on public.public_profiles to anon, authenticated;

-- =========================================================
-- logs: one row per watch (episode, movie or whole show)
-- =========================================================
create table if not exists public.logs (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       text not null check (kind in ('episode','movie','show')),
  ref        text not null,                 -- 'the-office/2/5', 'anchorman', 'veep'
  title      text not null,
  subtitle   text,
  href       text not null,
  hi         numeric(4,1),                  -- Humor Index at the time of logging
  stars      numeric(2,1) check (stars is null or (stars between 0.5 and 5 and stars * 2 = floor(stars * 2))),
  watched_on date not null default current_date,
  rewatch    boolean not null default false,
  note       text check (note is null or char_length(note) <= 2000),
  created_at timestamptz not null default now()
);
create index if not exists logs_user_date on public.logs (user_id, watched_on desc, id desc);
create index if not exists logs_user_ref  on public.logs (user_id, kind, ref);

alter table public.logs enable row level security;
drop policy if exists "own logs" on public.logs;
drop policy if exists "public logs readable" on public.logs;
create policy "own logs" on public.logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "public logs readable" on public.logs for select
  using (public.is_public_user(user_id));

-- =========================================================
-- lists + list_items
-- =========================================================
create table if not exists public.lists (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 80),
  description text check (description is null or char_length(description) <= 500),
  is_public   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists lists_user on public.lists (user_id, updated_at desc);

create table if not exists public.list_items (
  list_id  bigint not null references public.lists(id) on delete cascade,
  kind     text not null check (kind in ('episode','movie','show')),
  ref      text not null,
  title    text not null,
  subtitle text,
  href     text not null,
  hi       numeric(4,1),
  note     text check (note is null or char_length(note) <= 500),
  position integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (list_id, kind, ref)
);

create or replace function public.list_owner(lid bigint)
returns uuid
language sql stable security definer set search_path = public
as $$ select user_id from public.lists where id = lid; $$;

create or replace function public.list_is_visible(lid bigint)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select l.is_public and public.is_public_user(l.user_id) from public.lists l where l.id = lid), false);
$$;

alter table public.lists      enable row level security;
alter table public.list_items enable row level security;

drop policy if exists "own lists" on public.lists;
drop policy if exists "public lists readable" on public.lists;
create policy "own lists" on public.lists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "public lists readable" on public.lists for select
  using (is_public and public.is_public_user(user_id));

drop policy if exists "own list items" on public.list_items;
drop policy if exists "public list items readable" on public.list_items;
create policy "own list items" on public.list_items for all
  using (public.list_owner(list_id) = auth.uid())
  with check (public.list_owner(list_id) = auth.uid());
create policy "public list items readable" on public.list_items for select
  using (public.list_is_visible(list_id));
