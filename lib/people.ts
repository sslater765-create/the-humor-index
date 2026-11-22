import { cache } from 'react';
import { getAllShows, getEpisodes, getEpisodeDetail } from './data';
import { rankable } from './scale';

/**
 * Writers and directors across every ranked show, built from the crew credits
 * on each episode. A person's average is over the episodes they're credited
 * on; a co-written episode counts fully for each writer.
 *
 * `plus` is the ranking number: the average of (episode score - that show's
 * average episode score). Raw averages mostly say which show someone wrote for
 * (30 Rock's writers all sit high because 30 Rock does); plus says how their
 * episodes did against the rest of the same show.
 */
export interface PersonEpisode {
  show: string; showSlug: string; season: number; episode: number; title: string; hi: number;
  role: 'writer' | 'director';
}
export interface Person {
  slug: string; name: string; episodes: PersonEpisode[];
  writerCount: number; directorCount: number; avg: number; plus: number; shows: string[];
  /** Half-width of the 95% interval on plus, from the spread of the margins. */
  plusCi: number;
}

export const personSlug = (name: string) =>
  name.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const getPeople = cache(async (): Promise<Person[]> => {
  const shows = rankable(await getAllShows());
  const map = new Map<string, Person>();
  const showMean = new Map<string, number>();
  for (const s of shows) {
    let eps;
    try { eps = await getEpisodes(s.slug); } catch { continue; }
    const scored = eps.filter(e => e.humor_index > 0);
    showMean.set(s.slug, scored.reduce((a, e) => a + e.humor_index, 0) / Math.max(scored.length, 1));
    for (const e of eps) {
      if (!(e.humor_index > 0)) continue;
      const d = await getEpisodeDetail(s.slug, e.season, e.episode_number).catch(() => null) as
        ({ director?: string[]; writers?: string[] } | null);
      if (!d) continue;
      const credit = (name: string, role: 'writer' | 'director') => {
        const slug = personSlug(name);
        if (!slug) return;
        const p = map.get(slug) ?? { slug, name, episodes: [], writerCount: 0, directorCount: 0, avg: 0, plus: 0, plusCi: 0, shows: [] };
        if (p.episodes.some(x => x.showSlug === s.slug && x.season === e.season && x.episode === e.episode_number && x.role === role)) return;
        p.episodes.push({ show: s.name, showSlug: s.slug, season: e.season, episode: e.episode_number, title: e.title, hi: e.humor_index, role });
        if (role === 'writer') p.writerCount++; else p.directorCount++;
        if (!p.shows.includes(s.name)) p.shows.push(s.name);
        map.set(slug, p);
      };
      (d.writers ?? []).forEach(w => credit(w, 'writer'));
      (d.director ?? []).forEach(w => credit(w, 'director'));
    }
  }
  const people = Array.from(map.values());
  for (const p of people) {
    const uniq = new Map(p.episodes.map(x => [`${x.showSlug}:${x.season}:${x.episode}`, x]));
    const eps = Array.from(uniq.values());
    p.avg = eps.reduce((a, x) => a + x.hi, 0) / Math.max(eps.length, 1);
    const margins = eps.map(x => x.hi - (showMean.get(x.showSlug) ?? x.hi));
    p.plus = margins.reduce((a, b) => a + b, 0) / Math.max(margins.length, 1);
    const sd = margins.length > 1 ? Math.sqrt(margins.reduce((a, b) => a + (b - p.plus) ** 2, 0) / (margins.length - 1)) : 0;
    p.plusCi = margins.length > 1 ? 1.96 * sd / Math.sqrt(margins.length) : 0;
    p.episodes.sort((a, b) => b.hi - a.hi);
  }
  return people.sort((a, b) => b.plus - a.plus);
});

export const getPerson = cache(async (slug: string) => (await getPeople()).find(p => p.slug === slug) ?? null);
