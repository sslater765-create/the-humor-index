import { EpisodeScore } from './types';

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

/**
 * The Humor Index of a selected Explorer cut, sourced from the show's OFFICIAL
 * precomputed scores wherever one exists, so the Explorer agrees with the rest
 * of the site:
 *   - the full series   → the show's official Humor Index (a best-season-weighted
 *                         composite, NOT a plain episode average)
 *   - a whole season    → that season's official Humor Index
 *   - a single episode  → that episode's own score
 *   - any other mix     → the plain average of the selected episodes' scores
 *
 * The headline show score is a composite (0.40 × best season + 0.60 × mean of
 * seasons, with per-season consistency weighting), so an arbitrary mixed cut
 * cannot reproduce it — those custom cuts fall back to the episode-mean, which
 * is the only well-defined number for an ad-hoc slice.
 */
export function cutHumorIndex(
  selected: EpisodeScore[],
  allEpisodes: EpisodeScore[],
  seriesIndex?: number | null,
  seasonIndex?: Record<number, number>,
): number {
  if (selected.length === 0) return 0;

  // Full series → official show score.
  if (seriesIndex != null && selected.length === allEpisodes.length) return seriesIndex;

  // Whole single season → official season score.
  const seasons = new Set(selected.map(e => e.season));
  if (seasons.size === 1) {
    const s = selected[0].season;
    const seasonTotal = allEpisodes.filter(e => e.season === s).length;
    if (selected.length === seasonTotal && seasonIndex && seasonIndex[s] != null) {
      return seasonIndex[s];
    }
  }

  // Single episode → its own (already official) score.
  if (selected.length === 1) return selected[0].humor_index;

  // Custom mixed cut → plain average of the selected episodes.
  return mean(selected.map(e => e.humor_index));
}
