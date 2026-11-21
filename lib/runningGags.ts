import fs from 'fs';
import path from 'path';

/** One running gag and its stat line. Built by running_gags.py in the pipeline. */
export interface RunningGag {
  name: string;
  summary: string;
  phrases: string[];
  /** Episodes it appears in. */
  gp: number;
  /** Jokes that carry it. */
  j: number;
  /** Mean joke score of those jokes, 0-10 (craft and impact averaged). */
  avg: number;
  /** Share of those jokes above the show's median joke. */
  hit: number;
  /** Laughs Above Replacement: summed margin over the show's median joke. */
  lar: number;
  /** Later-half avg minus earlier-half avg. */
  trend: number | null;
  seasons: [number, number];
  n_seasons: number;
  first: { season: number; episode: number; title: string };
  best: { season: number; episode: number; title: string; text: string; score: number };
}

interface File {
  generated: string;
  model: string;
  shows: Record<string, { name: string; gags: RunningGag[] }>;
}

let cache: File | null = null;

function load(): File {
  if (cache) return cache;
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'running-gags.json');
    cache = JSON.parse(fs.readFileSync(p, 'utf-8')) as File;
  } catch {
    cache = { generated: '', model: '', shows: {} };
  }
  return cache;
}

export function runningGagsFor(slug: string): RunningGag[] {
  return load().shows[slug]?.gags ?? [];
}

export function allRunningGags(): (RunningGag & { slug: string; show: string })[] {
  const f = load();
  return Object.entries(f.shows).flatMap(([slug, s]) => s.gags.map((g) => ({ ...g, slug, show: s.name })));
}

export function runningGagsMeta() {
  const f = load();
  return { generated: f.generated, model: f.model };
}

export function seasonSpan(g: RunningGag): string {
  return g.seasons[0] === g.seasons[1] ? `Season ${g.seasons[0]}` : `Seasons ${g.seasons[0]}–${g.seasons[1]}`;
}

export function fmtLar(v: number): string {
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}`;
}
