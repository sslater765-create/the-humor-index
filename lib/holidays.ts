import { getAllShows, getEpisodes, getEpisodeDetail } from './data';
import { isAwaitingRescore } from './scale';
import { byHumorIndexDesc } from './scoring';
import { cleanJokeText } from './quotes';

/**
 * Hand-picked holiday episodes. Every entry was checked against the episode
 * description; a passing mention of the holiday does not qualify, the episode
 * has to be set at or built around it.
 */
type Pick = [slug: string, season: number, episode: number];

export const CHRISTMAS: Pick[] = [
  ['30-rock', 2, 9], ['30-rock', 3, 6], ['30-rock', 4, 8], ['30-rock', 5, 10],
  ['veep', 5, 7], ['veep', 5, 8],
  ['arrested-development', 2, 6],
  ['seinfeld', 3, 12], ['seinfeld', 4, 13], ['seinfeld', 6, 10], ['seinfeld', 9, 10],
  ['parks-and-recreation', 2, 12], ['parks-and-recreation', 4, 10],
  ['schitts-creek', 4, 13],
  ['the-office', 2, 10], ['the-office', 3, 10], ['the-office', 5, 10], ['the-office', 6, 12],
  ['the-office', 7, 11], ['the-office', 8, 10], ['the-office', 9, 9],
  ['friends', 2, 9], ['friends', 3, 10], ['friends', 4, 10], ['friends', 5, 10],
  ['friends', 6, 10], ['friends', 7, 10], ['friends', 9, 10],
  ['curb-your-enthusiasm', 3, 9],
  ['its-always-sunny', 6, 13],
  ['the-simpsons', 1, 1], ['the-simpsons', 7, 11], ['the-simpsons', 9, 10], ['the-simpsons', 11, 9],
  ['the-simpsons', 15, 7], ['the-simpsons', 17, 9], ['the-simpsons', 18, 9], ['the-simpsons', 22, 8],
  ['the-simpsons', 23, 9], ['the-simpsons', 25, 8],
  ['community', 1, 12], ['community', 2, 11], ['community', 3, 10],
  ['futurama', 2, 8], ['futurama', 4, 2], ['futurama', 6, 13], ['futurama', 8, 6],
  ['taxi', 1, 11], ['taxi', 5, 12],
  ['the-fresh-prince-of-bel-air', 1, 15], ['the-fresh-prince-of-bel-air', 2, 13], ['the-fresh-prince-of-bel-air', 4, 13],
];

export const THANKSGIVING: Pick[] = [
  ['friends', 1, 9], ['friends', 2, 8], ['friends', 3, 9], ['friends', 4, 8], ['friends', 5, 8],
  ['friends', 6, 9], ['friends', 7, 8], ['friends', 8, 9], ['friends', 9, 8], ['friends', 10, 8],
  ['veep', 5, 5],
  ['seinfeld', 6, 8],
  ['the-simpsons', 2, 7],
  ['its-always-sunny', 9, 10],
  ['community', 4, 5],
  ['the-fresh-prince-of-bel-air', 1, 12], ['the-fresh-prince-of-bel-air', 6, 9], ['the-fresh-prince-of-bel-air', 6, 10],
];

export interface HolidayEpisode {
  showSlug: string;
  showName: string;
  season: number;
  episode: number;
  title: string;
  humorIndex: number;
  jpm: number;
  avgCraft: number;
  avgImpact: number;
  totalJokes: number;
  /** 1 = best episode of its show. */
  rankInShow: number;
  showEpisodes: number;
  /** Share of the show's episodes this one beats, 0 to 100. */
  beatsPct: number;
  overview: string;
  bestJoke: { text: string; characters: string[] } | null;
  awaitingRescore: boolean;
}

export async function getHolidayEpisodes(picks: Pick[]): Promise<HolidayEpisode[]> {
  const shows = await getAllShows();
  const out: HolidayEpisode[] = [];
  for (const [slug, season, episode] of picks) {
    const show = shows.find(s => s.slug === slug);
    if (!show) continue;
    const eps = await getEpisodes(slug);
    const ranked = [...eps].sort(byHumorIndexDesc);
    const idx = ranked.findIndex(e => e.season === season && e.episode_number === episode);
    if (idx < 0) continue;
    const ep = ranked[idx];
    const detail = await getEpisodeDetail(slug, season, episode);
    let bestJoke: HolidayEpisode['bestJoke'] = null;
    if (detail && detail.jokes.length > 0) {
      const j = [...detail.jokes].sort(
        (a, b) => (b.craft_total + b.impact_score) - (a.craft_total + a.impact_score),
      )[0];
      bestJoke = { text: cleanJokeText(j.text), characters: j.characters ?? [] };
    }
    out.push({
      showSlug: slug,
      showName: show.name,
      season,
      episode,
      title: ep.title,
      humorIndex: ep.humor_index,
      jpm: ep.jpm,
      avgCraft: ep.avg_craft,
      avgImpact: ep.avg_impact,
      totalJokes: ep.total_jokes,
      rankInShow: idx + 1,
      showEpisodes: ranked.length,
      beatsPct: ranked.length > 1 ? Math.round(((ranked.length - 1 - idx) / (ranked.length - 1)) * 100) : 100,
      overview: (detail as { tmdb_overview?: string } | null)?.tmdb_overview ?? '',
      bestJoke,
      awaitingRescore: isAwaitingRescore(slug),
    });
  }
  return out;
}
