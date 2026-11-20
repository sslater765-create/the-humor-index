import { cache } from 'react';
import { getAllShows, getCharacters } from './data';
import { getMovies, getMovie, shortTitle } from './movies';
import { rankable } from './scale';

/**
 * Where TV and film meet: the same actor in a scored show and a scored movie.
 * Built from each show's character file (actor per character) plus its billed
 * stars, against each movie's TMDB cast. Drives the "same cast" links that
 * move people between the two halves of the site.
 */
export interface Crossover {
  actor: string;
  profile_path?: string | null;
  show_slug: string;
  show_name: string;
  show_score: number;
  show_backdrop?: string;
  tv_character?: string;
  movie_slug: string;
  movie_title: string;
  movie_year: number;
  movie_score: number;
  movie_backdrop?: string | null;
  movie_character?: string;
}

export const getCrossovers = cache(async (): Promise<Crossover[]> => {
  const movies = await getMovies();
  if (!movies.length) return [];
  const shows = rankable(await getAllShows());
  const tvByActor = new Map<string, Array<{ slug: string; character?: string; profile?: string | null }>>();
  for (const s of shows) {
    const seen = new Set<string>();
    let chars: Awaited<ReturnType<typeof getCharacters>> = [];
    try { chars = await getCharacters(s.slug); } catch { /* none */ }
    for (const c of chars) {
      const actor = (c as { actor?: string }).actor;
      if (!actor || seen.has(actor)) continue;
      seen.add(actor);
      const list = tvByActor.get(actor) ?? [];
      list.push({ slug: s.slug, character: c.character_full_name || c.name, profile: (c as { profile_path?: string }).profile_path });
      tvByActor.set(actor, list);
    }
    for (const actor of s.stars ?? []) {
      if (seen.has(actor)) continue;
      seen.add(actor);
      const list = tvByActor.get(actor) ?? [];
      list.push({ slug: s.slug });
      tvByActor.set(actor, list);
    }
  }
  const showBySlug = new Map(shows.map(s => [s.slug, s]));
  const out: Crossover[] = [];
  for (const summary of movies) {
    const m = await getMovie(summary.slug);
    if (!m) continue;
    for (const c of m.cast) {
      for (const tv of tvByActor.get(c.name) ?? []) {
        const s = showBySlug.get(tv.slug)!;
        out.push({
          actor: c.name,
          profile_path: c.profile_path ?? tv.profile,
          show_slug: s.slug,
          show_name: s.name,
          show_score: s.humor_index,
          show_backdrop: s.backdrop_path,
          tv_character: tv.character,
          movie_slug: m.slug,
          movie_title: shortTitle(m.title),
          movie_year: m.year,
          movie_score: m.humor_index,
          movie_backdrop: m.backdrop_path,
          movie_character: c.character || undefined,
        });
      }
    }
  }
  return out;
});

export async function crossoversForShow(slug: string): Promise<Crossover[]> {
  return (await getCrossovers()).filter(x => x.show_slug === slug);
}

export async function crossoversForMovie(slug: string): Promise<Crossover[]> {
  return (await getCrossovers()).filter(x => x.movie_slug === slug);
}

/** Share (0-100) of each joke type in a set of jokes; first type of each joke counts. */
export function typeMix(jokes: Array<{ joke_types: string[] }>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const j of jokes) {
    const t = j.joke_types[0];
    if (t) counts[t] = (counts[t] ?? 0) + 1;
  }
  const n = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, (v / n) * 100]));
}

function cosine(a: Record<string, number>, b: Record<string, number>): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, na = 0, nb = 0;
  keys.forEach(k => { const x = a[k] ?? 0, y = b[k] ?? 0; dot += x * y; na += x * x; nb += y * y; });
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/**
 * TV shows whose mix of joke types is closest to a movie's, best first.
 * Every comedy is mostly character comedy, so raw mixes all look alike (95%+).
 * Comparing each mix's difference from the average show separates them; the
 * match is that centered cosine mapped onto 0-100.
 */
export async function showsLikeMovie(movieSlug: string, n = 3) {
  const m = await getMovie(movieSlug);
  if (!m) return [];
  const { getComedyDna } = await import('./data');
  const shows = rankable(await getAllShows());
  const mixes = await Promise.all(shows.map(async s => ({ show: s, mix: await getComedyDna(s.slug) })));
  const usable = mixes.filter(x => Object.keys(x.mix).length);
  const keys = new Set<string>();
  usable.forEach(x => Object.keys(x.mix).forEach(k => keys.add(k)));
  const mean: Record<string, number> = {};
  keys.forEach(k => { mean[k] = usable.reduce((t, x) => t + (x.mix[k] ?? 0), 0) / (usable.length || 1); });
  const centered = (mix: Record<string, number>) =>
    Object.fromEntries(Array.from(keys).map(k => [k, (mix[k] ?? 0) - mean[k]]));
  const movie = centered(typeMix(m.jokes));
  return usable
    .map(x => ({ show: x.show, sim: cosine(movie, centered(x.mix)) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, n)
    .map(x => ({ ...x, match: Math.round(50 + 50 * x.sim) }));
}
