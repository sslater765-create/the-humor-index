import { cache } from 'react';
import { getAllShows, getEpisodes } from './data';
import { ShowScore } from './types';
import { formatIndex } from './scoring';
import { rankable } from './scale';

export interface SiteStats {
  showCount: number;        // scored shows
  totalEpisodes: number;    // scored episodes
  totalJokes: number;
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

  return {
    showCount: scored.length,
    totalEpisodes,
    totalJokes,
    leaderboard,
    topShow: leaderboard[0],
  };
});

/** A ready-made "#1 show / current order" sentence, generated from live data. */
export async function leaderboardSentence(): Promise<string> {
  const { leaderboard, showCount, totalEpisodes, totalJokes } = await getSiteStats();
  if (leaderboard.length === 0) return 'No shows scored yet.';
  const [first, second, ...rest] = leaderboard;
  const order = leaderboard.map(s => `${s.name} (${formatIndex(s.humor_index)})`).join(', ');
  return `${first.name} sits at the top of the Humor Index at ${formatIndex(first.humor_index)}` +
    (second ? `, with ${second.name} (${formatIndex(second.humor_index)}) close behind` : '') +
    `. Full current order: ${order}. We've fully scored ${showCount} shows so far — about ` +
    `${totalEpisodes.toLocaleString()} episodes and ${totalJokes.toLocaleString()} jokes — with more in the queue.` +
    (rest.length ? '' : '');
}
