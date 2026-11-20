-- The Humor Index: save each signed-in user's Comedy DNA profile (Nov 2026).
-- Run once in Supabase -> SQL Editor -> New query -> Run. Safe to re-run.
--
-- The profile is a small JSON object written by lib/dnaStore.ts:
--   { v: 2, pref: number[18], wins: number[18], sw: { slug: [wins, losses] },
--     picks: number, seen: number[], updated: iso-date }
-- Until this runs, the site keeps the profile in the browser only; nothing breaks.

alter table public.profiles add column if not exists dna jsonb;
