import { cache } from 'react';
import path from 'path';
import fs from 'fs';

/**
 * Movies live beside TV, never inside it: their own leaderboard, their own
 * pages under /movies/, and their own data under public/data/movies/
 * (written by export_films.py in the pipeline). A film is scored as ~22-minute
 * reels with the normal scorer, so every joke has a real film-time timestamp.
 */

export interface MovieCastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
}

export interface MovieSummary {
  slug: string;
  title: string;
  year: number;
  director: string;
  logline: string;
  humor_index: number;
  raw_humor_index: number;
  avg_jpm: number;
  avg_craft: number;
  avg_impact: number;
  total_jokes: number;
  runtime_minutes: number;
  tmdb_id?: number;
  imdb_id?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string | null;
  tagline?: string | null;
  release_date?: string | null;
  genres?: string[] | null;
  stars: string[];
  rank: number;
}

export interface MovieJoke {
  id: number;
  reel: number;
  t: number | null;
  text: string;
  characters: string[];
  joke_types: string[];
  setup?: string | null;
  punchline?: string | null;
  craft: number;
  impact: number;
  score: number;
  quotability?: number | null;
  callback: boolean;
  explanation?: string | null;
}

export interface LaughBin {
  start: number;
  end: number;
  count: number;
  total: number;
  best: number | null;
}

export interface MovieCharacter {
  name: string;
  jokes: number;
  total: number;
  best: number;
  actor?: string;
  actor_id?: number;
  profile_path?: string | null;
}

export interface MovieDetail extends Omit<MovieSummary, 'rank'> {
  rank?: number;
  reels: Array<{ n: number; start: number; end: number; jokes: number; humor_index: number }>;
  laugh_map: LaughBin[];
  characters: MovieCharacter[];
  cast: MovieCastMember[];
  watch: Record<string, Array<{ name: string; logo_path?: string | null }>>;
  watch_link?: string | null;
  jokes: MovieJoke[];
}

function read<T>(rel: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'movies', rel), 'utf-8')) as T;
  } catch {
    return null;
  }
}

export const getMovies = cache(async (): Promise<MovieSummary[]> => {
  const list = read<MovieSummary[]>('index.json') ?? [];
  return [...list].sort((a, b) => b.humor_index - a.humor_index).map((m, i) => ({ ...m, rank: i + 1 }));
});

export const getMovie = cache(async (slug: string): Promise<MovieDetail | null> => {
  const d = read<MovieDetail>(`${slug}.json`);
  if (!d) return null;
  const rank = (await getMovies()).find(m => m.slug === slug)?.rank;
  return { ...d, rank };
});

/** "1:02:15" or "22:50" for a film-time offset in seconds. */
export function filmTime(t: number | null | undefined): string {
  if (t == null) return '';
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

/** Short title for headings: "Anchorman" rather than the full subtitle. */
export function shortTitle(title: string): string {
  const t = title.split(':')[0].trim();
  return t.length >= 4 ? t : title;
}

export { jokeLines, bestLine, type Line } from './movieText';

export interface LaughMapNotes {
  peak: LaughBin;
  slump: { start: number; end: number } | null;
  closer: { delta: number; avg10: number; avgAll: number };
}

/** The three annotations drawn on every Laugh Map. */
export function laughMapNotes(bins: LaughBin[], jokes: MovieJoke[]): LaughMapNotes {
  const scored = bins.filter(b => b.end - b.start >= 120);
  const peak = scored.reduce((a, b) => (b.total > a.total ? b : a), scored[0]);
  const sorted = [...scored].map(b => b.total).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  // The slump: the run of clearly quiet bins (under 85% of the median) that
  // falls furthest short of the median, at least ten minutes long. The first
  // and last bins (titles, credits) are ignored.
  type Run = { start: number; end: number; len: number; deficit: number };
  const runs: Run[] = [];
  let open = false;
  for (const b of scored.slice(1, -1)) {
    if (b.total < median * 0.85) {
      const cur = open ? runs[runs.length - 1] : undefined;
      if (cur) {
        cur.end = b.end;
        cur.len += 1;
        cur.deficit += median - b.total;
      } else {
        runs.push({ start: b.start, end: b.end, len: 1, deficit: median - b.total });
      }
      open = true;
    } else {
      open = false;
    }
  }
  const deepest = runs.filter(r => r.len >= 2).sort((x, y) => y.deficit - x.deficit)[0];
  const slump = deepest ? { start: deepest.start, end: deepest.end } : null;
  const endT = bins[bins.length - 1]?.end ?? 0;
  const last = jokes.filter(j => j.t != null && j.t >= endT - 600);
  const avg = (xs: MovieJoke[]) => (xs.length ? xs.reduce((s, j) => s + j.score, 0) / xs.length : 0);
  const avg10 = avg(last);
  const avgAll = avg(jokes);
  return { peak, slump, closer: { delta: avg10 - avgAll, avg10, avgAll } };
}

export const TMDB_IMG = 'https://image.tmdb.org/t/p';

export const getMovieQueue = cache(async (): Promise<Array<{ slug: string; title: string; year: number }>> =>
  read<Array<{ slug: string; title: string; year: number }>>('queue.json') ?? []);

/**
 * A movie in the ShowScore shape, so components built for shows (compare,
 * radar charts, DNA) can take one. kind/href mark it as a movie.
 */
export function movieAsShow(m: MovieSummary): import('./types').ShowScore {
  return {
    kind: 'movie',
    href: `/movies/${m.slug}/`,
    show_id: 0,
    slug: m.slug,
    name: `${shortTitle(m.title)} (${m.year})`,
    format: 'single_camera',
    total_seasons: 1,
    total_episodes: 1,
    humor_index: m.humor_index,
    best_season: 1,
    avg_jpm: m.avg_jpm,
    avg_craft: m.avg_craft,
    avg_impact: m.avg_impact,
    total_jokes_analyzed: m.total_jokes,
    description: m.logline,
    backdrop_path: m.backdrop_path ?? undefined,
    poster_path: m.poster_path ?? undefined,
    stars: m.stars,
    rank: m.rank,
  };
}

/** Joke-type mix (percent by first type) for every published movie, keyed by slug. */
export const getMovieDna = cache(async (): Promise<Record<string, Record<string, number>>> => {
  const out: Record<string, Record<string, number>> = {};
  for (const s of await getMovies()) {
    const d = await getMovie(s.slug);
    if (!d) continue;
    const counts: Record<string, number> = {};
    for (const j of d.jokes) { const t = j.joke_types[0]; if (t) counts[t] = (counts[t] ?? 0) + 1; }
    const n = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    out[s.slug] = Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, +((v / n) * 100).toFixed(1)]));
  }
  return out;
});

const EXPLICIT = /\b(fuck|shit|cunt|pussy|cock|bitch|dick|whore|slut|nigg|fag|retard|rape|cum|tits?|titty|aids|suicide|penis|vagina|dildo|porn|molest)/i;

export interface MovieGameJoke {
  id: number; slug: string; movie: string; year: number; who: string; text: string;
  t: number | null; impact: number; craft: number; score: number; quot: number | null; type: string | null; explicit: boolean;
}

/**
 * One clean, single-speaker line per joke, for the games and the homepage
 * roulette: lines that are only stage directions, or that need two speakers to
 * make sense, are left out.
 */
export const getMovieGameJokes = cache(async (): Promise<MovieGameJoke[]> => {
  const { jokeLines } = await import('./movieText');
  const out: MovieGameJoke[] = [];
  for (const s of await getMovies()) {
    const d = await getMovie(s.slug);
    if (!d) continue;
    for (const j of d.jokes) {
      const lines = jokeLines(j.text, j.characters).filter(l => !l.note);
      if (lines.length !== 1 || !lines[0].speaker) continue;
      const text = lines[0].line.replace(/\s+/g, ' ').trim();
      if (text.length < 12 || text.length > 160) continue;
      out.push({
        id: j.id, slug: s.slug, movie: shortTitle(s.title), year: s.year, who: lines[0].speaker,
        text, t: j.t, impact: j.impact, craft: j.craft, score: j.score, quot: j.quotability ?? null,
        type: j.joke_types[0] ?? null, explicit: EXPLICIT.test(text),
      });
    }
  }
  return out;
});
