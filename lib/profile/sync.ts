'use client';
// Profile sync layer. localStorage is the working cache; when the user is signed
// in, everything mirrors to Supabase so the profile follows them across devices.
// When signed out (or before accounts are switched on) this behaves exactly like
// the old localStorage-only code — no behavior change for guests.
import { createClient, supabaseConfigured } from '@/lib/supabase/client';

export type Rating = 'love' | 'meh';
export interface AgreeStats {
  agree: number;
  total: number;
  streak: number;
}
export interface ProfileData {
  ratings: Record<string, Rating>;
  watchlist: string[];
  agree: AgreeStats;
}

const R_KEY = 'humor_index_ratings';
const W_KEY = 'humor_index_watchlist';
const A_KEY = 'humor_index_agree';

function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore, DB still has it when signed in */
  }
}

function readLocal(): ProfileData {
  return {
    ratings: lsGet<Record<string, Rating>>(R_KEY, {}),
    watchlist: lsGet<string[]>(W_KEY, []),
    agree: lsGet<AgreeStats>(A_KEY, { agree: 0, total: 0, streak: 0 }),
  };
}

/** Current signed-in user id, or null (also null when accounts aren't configured). */
export async function getUserId(): Promise<string | null> {
  if (!supabaseConfigured) return null;
  try {
    const { data } = await createClient().auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

interface RatingRow {
  show_slug: string;
  verdict: string;
}
interface WatchRow {
  show_slug: string;
}
interface ProfileRow {
  agree_agree: number;
  agree_total: number;
  agree_streak: number;
}

/**
 * Load the profile. If signed in, pull from the DB, merge with whatever is in
 * this browser, write the merge back to both, and return it. If signed out,
 * just return localStorage. Always resolves — DB errors fall back to local.
 */
export async function syncProfile(): Promise<{ uid: string | null; data: ProfileData }> {
  const local = readLocal();
  const uid = await getUserId();
  if (!uid) return { uid: null, data: local };

  try {
    const supabase = createClient();
    const [ratingsRes, watchRes, profileRes] = await Promise.all([
      supabase.from('ratings').select('show_slug, verdict').eq('user_id', uid),
      supabase.from('watchlist').select('show_slug').eq('user_id', uid),
      supabase.from('profiles').select('agree_agree, agree_total, agree_streak').eq('id', uid).maybeSingle(),
    ]);

    // --- merge ratings: union; DB wins on conflict ---
    const ratings: Record<string, Rating> = { ...local.ratings };
    for (const row of (ratingsRes.data ?? []) as RatingRow[]) {
      if (row.verdict === 'love' || row.verdict === 'meh') ratings[row.show_slug] = row.verdict;
    }

    // --- merge watchlist: union ---
    const watchSet = new Set<string>(local.watchlist);
    for (const row of (watchRes.data ?? []) as WatchRow[]) watchSet.add(row.show_slug);
    const watchlist = Array.from(watchSet);

    // --- merge agree: one-time additive merge per (user, device) ---
    const prof = (profileRes.data ?? null) as ProfileRow | null;
    let agree: AgreeStats = {
      agree: prof?.agree_agree ?? 0,
      total: prof?.agree_total ?? 0,
      streak: prof?.agree_streak ?? 0,
    };
    const mergeFlag = `humor_index_agree_merged_${uid}`;
    if (!lsGet<boolean>(mergeFlag, false) && local.agree.total > 0) {
      agree = {
        agree: agree.agree + local.agree.agree,
        total: agree.total + local.agree.total,
        streak: Math.max(agree.streak, local.agree.streak),
      };
      lsSet(mergeFlag, true);
    }

    // --- write the merged result back to the DB ---
    const ratingRows = Object.entries(ratings).map(([show_slug, verdict]) => ({
      user_id: uid,
      show_slug,
      verdict,
    }));
    const watchRows = watchlist.map((show_slug) => ({ user_id: uid, show_slug }));
    await Promise.all([
      ratingRows.length ? supabase.from('ratings').upsert(ratingRows) : Promise.resolve(),
      watchRows.length ? supabase.from('watchlist').upsert(watchRows) : Promise.resolve(),
      supabase.from('profiles').upsert({
        id: uid,
        agree_agree: agree.agree,
        agree_total: agree.total,
        agree_streak: agree.streak,
      }),
    ]);

    // --- update the local cache to the merged truth ---
    lsSet(R_KEY, ratings);
    lsSet(W_KEY, watchlist);
    lsSet(A_KEY, agree);

    return { uid, data: { ratings, watchlist, agree } };
  } catch {
    return { uid, data: local };
  }
}

/** Persist a single rating (verdict=null clears it). Writes local always, DB when signed in. */
export async function saveRating(uid: string | null, slug: string, verdict: Rating | null): Promise<void> {
  const ratings = lsGet<Record<string, Rating>>(R_KEY, {});
  if (verdict === null) delete ratings[slug];
  else ratings[slug] = verdict;
  lsSet(R_KEY, ratings);
  if (!uid || !supabaseConfigured) return;
  try {
    const supabase = createClient();
    if (verdict === null) {
      await supabase.from('ratings').delete().eq('user_id', uid).eq('show_slug', slug);
    } else {
      await supabase.from('ratings').upsert({ user_id: uid, show_slug: slug, verdict });
    }
  } catch {
    /* keep the local write; next syncProfile reconciles */
  }
}

/** Persist a watchlist toggle. onList = the resulting state. */
export async function saveWatch(uid: string | null, slug: string, onList: boolean): Promise<void> {
  const watch = lsGet<string[]>(W_KEY, []);
  const next = onList ? Array.from(new Set(watch.concat(slug))) : watch.filter((s) => s !== slug);
  lsSet(W_KEY, next);
  if (!uid || !supabaseConfigured) return;
  try {
    const supabase = createClient();
    if (onList) await supabase.from('watchlist').upsert({ user_id: uid, show_slug: slug });
    else await supabase.from('watchlist').delete().eq('user_id', uid).eq('show_slug', slug);
  } catch {
    /* keep the local write */
  }
}

/** Persist the agree tally after a pick. */
export async function saveAgree(uid: string | null, stats: AgreeStats): Promise<void> {
  lsSet(A_KEY, stats);
  if (!uid || !supabaseConfigured) return;
  try {
    await createClient()
      .from('profiles')
      .upsert({ id: uid, agree_agree: stats.agree, agree_total: stats.total, agree_streak: stats.streak });
  } catch {
    /* keep the local write */
  }
}
