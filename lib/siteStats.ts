import { cache } from 'react';
import { getAllShows, getEpisodes } from './data';
import { ShowScore } from './types';
import { formatIndex } from './scoring';
import { rankable } from './scale';

export interface SiteStats {
  showCount: number;        // scored shows, current model + awaiting rescore
  totalEpisodes: number;    // scored episodes, all shows
  totalJokes: number;       // scored TV jokes, all shows
  rankedShowCount: number;  // shows on the current model (the leaderboard)
  legacyShowCount: number;  // scored on the earlier model, awaiting rescore
  rankedEpisodes: number;
  rankedJokes: number;
  movieCount: number;
  movieJokes: number;
  allJokes: number;         // TV, all shows, plus movies
  leaderboard: ShowScore[]; // scored shows, ranked desc
  topShow: ShowScore | undefined;
}

/**
 * Single source of truth for the "how big is the dataset" numbers that copy
 * keeps hardcoding (and that keep going stale). Compute once from the data;
 * render everywhere. `cache()` dedupes within a render.
 */
export const getSiteStats = cache(async (): Promise<SiteStats> => {
  const all = await getAllShows();
  // Counts cover every scored show; the ranked leaderboard only those on the current scale.
  const scored = all.filter(s => s.humor_index > 0);
  const leaderboard = rankable(all).sort((a, b) => b.humor_index - a.humor_index);

  let totalEpisodes = 0;
  for (const s of scored) {
    try { totalEpisodes += (await getEpisodes(s.slug)).length; } catch { /* none */ }
  }
  const totalJokes = scored.reduce((sum, s) => sum + (s.total_jokes_analyzed || 0), 0);
  let rankedEpisodes = 0;
  for (const s of leaderboard) {
    try { rankedEpisodes += (await getEpisodes(s.slug)).length; } catch { /* none */ }
  }
  const rankedJokes = leaderboard.reduce((sum, s) => sum + (s.total_jokes_analyzed || 0), 0);
  const { getMovies } = await import('./movies');
  const movies = await getMovies();
  const movieJokes = movies.reduce((n, m) => n + m.total_jokes, 0);

  return {
    showCount: scored.length,
    totalEpisodes,
    totalJokes,
    rankedShowCount: leaderboard.length,
    legacyShowCount: scored.length - leaderboard.length,
    rankedEpisodes,
    rankedJokes,
    movieCount: movies.length,
    movieJokes,
    allJokes: totalJokes + movieJokes,
    leaderboard,
    topShow: leaderboard[0],
  };
});

/** A ready-made "#1 show / current order" sentence, generated from live data. */
export async function leaderboardSentence(): Promise<string> {
  const { leaderboard, showCount, totalEpisodes, totalJokes, legacyShowCount } = await getSiteStats();
  if (leaderboard.length === 0) return 'No shows scored yet.';
  const [first, second, ...rest] = leaderboard;
  const order = leaderboard.map(s => `${s.name} (${formatIndex(s.humor_index)})`).join(', ');
  return `${first.name} sits at the top of the Humor Index at ${formatIndex(first.humor_index)}` +
    (second ? `, with ${second.name} (${formatIndex(second.humor_index)}) close behind` : '') +
    `. Full current order: ${order}. We've fully scored ${showCount} shows so far, about ` +
    `${totalEpisodes.toLocaleString()} episodes and ${totalJokes.toLocaleString()} jokes. ${leaderboard.length} are ranked on our current model` +
    (legacyShowCount ? `; the other ${legacyShowCount} were scored on an earlier model and are being rescored before they rejoin the ranking.` : '.') +
    (rest.length ? '' : '');
}

/** Every episode score on the current model, ascending, for percentile lines. */
export const getRankedEpisodeScores = cache(async (): Promise<number[]> => {
  const { leaderboard } = await getSiteStats();
  const out: number[] = [];
  for (const s of leaderboard) {
    try { for (const e of await getEpisodes(s.slug)) if (e.humor_index > 0) out.push(e.humor_index); } catch { /* none */ }
  }
  return out.sort((a, b) => a - b);
});

/** "top 4%" style phrase for a score among all ranked episodes. */
export function topShare(score: number, all: number[]): string {
  if (!all.length) return '';
  const above = all.filter(v => v > score).length;
  const pct = Math.max(1, Math.ceil(((above + 1) / all.length) * 100));
  return pct <= 50 ? `top ${pct}%` : `bottom ${Math.max(1, 101 - pct)}%`;
}
