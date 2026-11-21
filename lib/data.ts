import { applyCharacterOverride } from './characterOverrides';
import { cache } from 'react';
import { ShowScore, SeasonScore, EpisodeScore, EpisodeDetail, CharacterProfile } from './types';
import { DNA_TYPES, buildBaseline, type QuizData, type QuizJoke, type ShowFingerprint } from './comedyDna';
import { isAwaitingRescore } from './scale';
import path from 'path';
import fs from 'fs';

function readJson<T>(relativePath: string): T {
  const filePath = path.join(process.cwd(), 'public', 'data', relativePath);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

// `cache()` dedupes these reads within a single render — shows.json/episodes
// are read by many components per page (leaderboard, recs, siteStats, JSON-LD).
export const getAllShows = cache(async (): Promise<ShowScore[]> => {
  const data = readJson<ShowScore[]>('shows.json');
  return data
    .sort((a, b) => b.humor_index - a.humor_index)
    .map((s, i) => ({ ...s, rank: i + 1 }));
});

// Actual number of jokes in the search index (what's genuinely searchable).
export async function getSearchableJokeCount(): Promise<number> {
  try {
    // Search covers TV and film, so count both; same figure as siteStats.allJokes.
    const { getSiteStats } = await import('./siteStats');
    return (await getSiteStats()).allJokes;
  } catch {
    return 0;
  }
}

export async function getShow(slug: string): Promise<ShowScore | null> {
  const shows = await getAllShows();
  return shows.find(s => s.slug === slug) ?? null;
}

export async function getSeasons(slug: string): Promise<SeasonScore[]> {
  // Queued/unscored shows have no data dir — return [] instead of throwing a 500.
  try {
    return readJson<SeasonScore[]>(`${slug}/seasons.json`);
  } catch {
    return [];
  }
}

export const getEpisodes = cache(async (slug: string): Promise<EpisodeScore[]> => {
  try {
    return readJson<EpisodeScore[]>(`${slug}/episodes.json`);
  } catch {
    return [];
  }
});

export async function getEpisodeDetail(
  slug: string,
  season: number,
  episode: number
): Promise<EpisodeDetail | null> {
  const s = String(season).padStart(2, '0');
  const e = String(episode).padStart(2, '0');
  try {
    return readJson<EpisodeDetail>(`${slug}/s${s}e${e}.json`);
  } catch {
    return null;
  }
}

export async function getComedyDna(slug: string): Promise<Record<string, number>> {
  try {
    const all = readJson<Record<string, Record<string, number>>>('comedy-dna.json');
    return all[slug] || {};
  } catch {
    return {};
  }
}

export async function getRecommendations(slug: string): Promise<Array<{ slug: string; name: string; score: number }>> {
  try {
    const all = readJson<Record<string, Array<{ slug: string; name: string; score: number }>>>('recommendations.json');
    const raw = all[slug] || [];
    // Filter out recommendations pointing at shows that haven't been scored yet —
    // otherwise the card renders with a 0.0 Humor Index, which reads as broken.
    const shows = readJson<Array<{ slug: string; humor_index: number }>>('shows.json');
    const scored = new Set(shows.filter(s => s.humor_index > 0).map(s => s.slug));
    return raw.filter(r => scored.has(r.slug));
  } catch {
    return [];
  }
}

export const getCharacters = cache(async (slug: string): Promise<CharacterProfile[]> => {
  try {
    return readJson<CharacterProfile[]>(`${slug}/characters.json`).map(c => applyCharacterOverride(slug, c));
  } catch {
    return [];
  }
});

export async function getCharacterJokes(
  slug: string,
  characterName: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ character: CharacterProfile | null; jokes: Array<{ episode: string; season: number; episode_number: number; joke: any }> }> {
  const characters = await getCharacters(slug);
  const character = characters.find(c => c.name.toLowerCase() === characterName.toLowerCase()) ?? null;
  if (!character) return { character: null, jokes: [] };

  const episodes = await getEpisodes(slug);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allJokes: Array<{ episode: string; season: number; episode_number: number; joke: any }> = [];

  for (const ep of episodes) {
    const detail = await getEpisodeDetail(slug, ep.season, ep.episode_number);
    if (!detail) continue;
    for (const joke of detail.jokes) {
      if (joke.characters?.some((c: string) => c.toLowerCase() === characterName.toLowerCase())) {
        allJokes.push({
          episode: ep.title,
          season: ep.season,
          episode_number: ep.episode_number,
          joke,
        });
      }
    }
  }

  return { character, jokes: allJokes };
}

export interface TopJoke {
  show: string; show_slug: string; season: number; episode_number: number; episode_title: string;
  characters: string[]; text: string; craft: number; impact: number; combined: number; joke_types: string[];
}
export const getTopJokes = cache(async (): Promise<TopJoke[]> => {
  try { return readJson<TopJoke[]>('top-jokes.json'); } catch { return []; }
});

// ---- Agree game (human-vs-Index validation) ----

export interface AgreeJoke {
  id: number; t: string; s: number; c: number | null; q: number | null;
  who: string; show: string; slug: string; se: number; ep: number; et: string; jt: string | null;
}
export interface AgreePool { generated: string; count: number; metric: string; pool: AgreeJoke[]; }

export const getAgreePool = cache(async (): Promise<AgreeJoke[]> => {
  let pool: AgreeJoke[] = [];
  try { pool = readJson<AgreePool>('agree-pool.json').pool; } catch { /* none */ }
  // Movie lines join the blind test: up to 20 per film across the score range,
  // so a pairing can put a movie line against a sitcom line.
  const { getMovieGameJokes, filmTime } = await import('./movies');
  const byMovie = new Map<string, Awaited<ReturnType<typeof getMovieGameJokes>>>();
  for (const j of await getMovieGameJokes()) {
    const list = byMovie.get(j.slug) ?? [];
    list.push(j);
    byMovie.set(j.slug, list);
  }
  byMovie.forEach(list => {
    const sorted = [...list].sort((a, b) => b.impact - a.impact);
    const step = Math.max(1, Math.floor(sorted.length / 20));
    sorted.filter((_, i) => i % step === 0).slice(0, 20).forEach(j => {
      pool.push({
        id: 100000 + pool.length, t: j.text, s: j.impact, c: j.craft, q: j.quot, who: j.who,
        show: `${j.movie} (${j.year})`, slug: j.slug, se: 0, ep: 0, et: filmTime(j.t), jt: j.type,
      } as AgreeJoke);
    });
  });
  return pool;
});

// ---- Comedy DNA quiz ----

// The curated battle + recommendation joke pool (generated by comedy-dna-build).
export const getComedyDnaQuiz = cache(async (): Promise<QuizData> => {
  return readJson<QuizData>('comedy-dna-quiz.json');
});

// Per-show fingerprints for the quiz recommender. Reuses the existing
// comedy-dna.json (type → share) and includes only LIVE shows (humor_index > 0),
// so the quiz catalog grows automatically as shows are scored & launched.
export async function getComedyDnaFingerprints(): Promise<ShowFingerprint[]> {
  const dna = readJson<Record<string, Record<string, number>>>('comedy-dna.json');
  const shows = await getAllShows();
  const out: ShowFingerprint[] = [];
  for (const s of shows) {
    if (s.humor_index <= 0) continue;          // skip coming-soon shows
    if (isAwaitingRescore(s.slug)) continue;   // earlier-model shows are unranked, so no DNA match either
    const dist = dna[s.slug];
    if (!dist) continue;                        // needs a comedy-dna.json entry
    out.push({
      slug: s.slug,
      name: s.name,
      fp: DNA_TYPES.map(t => dist[t] || 0),
      n: s.total_jokes_analyzed || 1,
    });
  }
  // Movies join the recommender: same joke-type fingerprint, built from every
  // scored joke in the film, linking to the movie page.
  const { getMovies, getMovieDna, shortTitle } = await import('./movies');
  const movieDna = await getMovieDna();
  for (const m of await getMovies()) {
    const dist = movieDna[m.slug];
    if (!dist) continue;
    out.push({
      slug: m.slug,
      name: `${shortTitle(m.title)} (${m.year})`,
      fp: DNA_TYPES.map(t => dist[t] || 0),
      n: m.total_jokes || 1,
      href: `/movies/${m.slug}/`,
    });
  }
  return out;
}

// Mean joke-type vector of the battle pool. Every pick is centred on it.
export const getDnaBaseline = cache(async (): Promise<number[]> => {
  return buildBaseline((await getComedyDnaQuiz()).pool);
});

// Just what the one-tap face-off cards need (keeps page payloads small).
function slim(j: QuizJoke): QuizJoke {
  return { id: j.id, text: j.text, slug: j.slug, show: j.show, vec: j.vec, quot: j.quot, speaker: j.speaker, ep: j.ep, etitle: j.etitle };
}

/** The whole battle pool, slimmed, for the homepage and leaderboard cards. */
export const getQuickPickPool = cache(async (): Promise<QuizJoke[]> => {
  return (await getComedyDnaQuiz()).pool.map(slim);
});

/**
 * For a show page: that show's battle + recommendation jokes, plus a spread of
 * other shows' battle jokes to face them against. Empty for unranked shows.
 */
export async function getShowDnaJokes(slug: string): Promise<{ show: QuizJoke[]; others: QuizJoke[] }> {
  if (isAwaitingRescore(slug)) return { show: [], others: [] };
  try {
    const q = await getComedyDnaQuiz();
    const show = [...q.pool, ...q.reco].filter(j => j.slug === slug).map(slim);
    const others = q.pool.filter(j => j.slug !== slug).map(slim);
    return { show, others };
  } catch {
    return { show: [], others: [] };
  }
}

// ---- "More like this": episodes from other shows with the closest joke mix ----
interface DnaEpisode { slug: string; s: number; e: number; t: string; fp: number[] }
const getDnaEpisodes = cache(async (): Promise<DnaEpisode[]> => {
  try { return readJson<DnaEpisode[]>('comedy-dna-episodes.json'); } catch { return []; }
});

export async function getSimilarEpisodes(slug: string, season: number, episode: number, n = 4): Promise<Array<{ slug: string; show: string; season: number; episode: number; title: string; humor_index: number; backdrop_path?: string }>> {
  const all = await getDnaEpisodes();
  const me = all.find(x => x.slug === slug && x.s === season && x.e === episode);
  if (!me) return [];
  const mean = me.fp.map((_, d) => all.reduce((s, x) => s + x.fp[d], 0) / all.length);
  const c = (v: number[]) => v.map((x, d) => x - mean[d]);
  const a = c(me.fp);
  const na = Math.hypot(...a) || 1;
  const scored = all
    .filter(x => x.slug !== slug)
    .map(x => { const b = c(x.fp); return { x, s: a.reduce((t, v, d) => t + v * b[d], 0) / (na * (Math.hypot(...b) || 1)) }; })
    .sort((p, q) => q.s - p.s);
  const shows = await getAllShows();
  const out: Array<{ slug: string; show: string; season: number; episode: number; title: string; humor_index: number; backdrop_path?: string }> = [];
  const perShow: Record<string, number> = {};
  for (const { x } of scored) {
    if (out.length >= n) break;
    if ((perShow[x.slug] ?? 0) >= 1) continue;
    const show = shows.find(s => s.slug === x.slug);
    if (!show) continue;
    const ep = (await getEpisodes(x.slug)).find(e => e.season === x.s && e.episode_number === x.e);
    if (!ep) continue;
    perShow[x.slug] = 1;
    out.push({ slug: x.slug, show: show.name, season: x.s, episode: x.e, title: ep.title, humor_index: ep.humor_index, backdrop_path: show.backdrop_path });
  }
  return out;
}

export interface RouletteJoke { slug: string; show: string; text: string; who: string; score: number; s: number; e: number; t: string; movie?: boolean }
/** Clean single-speaker lines for the homepage "one more" roulette. */
export const getJokeRoulette = cache(async (): Promise<RouletteJoke[]> => {
  let pool: RouletteJoke[] = [];
  try { pool = readJson<RouletteJoke[]>('joke-roulette.json'); } catch { /* none */ }
  // Movies: their best clean single-speaker lines (8.2+), up to 12 a film.
  const { getMovieGameJokes, filmTime } = await import('./movies');
  const counts: Record<string, number> = {};
  const movieLines = (await getMovieGameJokes())
    .filter(j => !j.explicit && j.score >= 8.2)
    .sort((a, b) => b.score - a.score)
    .filter(j => (counts[j.slug] = (counts[j.slug] ?? 0) + 1) <= 12)
    .map(j => ({ slug: j.slug, show: `${j.movie} (${j.year})`, text: j.text, who: j.who, score: +j.score.toFixed(1), s: 0, e: 0, t: filmTime(j.t), movie: true }));
  return [...pool, ...movieLines];
});
