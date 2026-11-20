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
