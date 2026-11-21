import { cache } from 'react';
import { getAllShows, getEpisodes, getEpisodeDetail } from './data';
import { rankable } from './scale';

/**
 * Writers and directors across every ranked show, built from the crew credits
 * on each episode. A person's average is over the episodes they're credited
 * on; a co-written episode counts fully for each writer.
 */
export interface PersonEpisode {
  show: string; showSlug: string; season: number; episode: number; title: string; hi: number;
  role: 'writer' | 'director';
}
export interface Person {
  slug: string; name: string; episodes: PersonEpisode[];
  writerCount: number; directorCount: number; avg: number; shows: string[];
}

export const personSlug = (name: string) =>
  name.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const getPeople = cache(async (): Promise<Person[]> => {
  const shows = rankable(await getAllShows());
  const map = new Map<string, Person>();
  for (const s of shows) {
    let eps;
    try { eps = await getEpisodes(s.slug); } catch { continue; }
    for (const e of eps) {
      if (!(e.humor_index > 0)) continue;
      const d = await getEpisodeDetail(s.slug, e.season, e.episode_number).catch(() => null) as
        ({ director?: string[]; writers?: string[] } | null);
      if (!d) continue;
      const credit = (name: string, role: 'writer' | 'director') => {
        const slug = personSlug(name);
        if (!slug) return;
        const p = map.get(slug) ?? { slug, name, episodes: [], writerCount: 0, directorCount: 0, avg: 0, shows: [] };
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
    const uniq = new Map(p.episodes.map(x => [`${x.showSlug}:${x.season}:${x.episode}`, x.hi]));
    const vals = Array.from(uniq.values());
    p.avg = vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1);
    p.episodes.sort((a, b) => b.hi - a.hi);
  }
  return people.sort((a, b) => b.avg - a.avg);
});

export const getPerson = cache(async (slug: string) => (await getPeople()).find(p => p.slug === slug) ?? null);
