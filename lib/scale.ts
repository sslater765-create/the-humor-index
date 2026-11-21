/**
 * Which scoring scale a show's published numbers are on.
 *
 * Every show was first scored on the pre-2026 model. Shows are being rescored
 * one at a time on the current model, which finds more jokes and rates craft
 * and impact higher, so a rescored show typically gains 8 to 15 points. Until
 * a show has been rescored its Humor Index is not comparable with the rest of
 * the board, and it is listed unranked.
 *
 * When a show's rescore is published, delete its slug from this set. That is
 * the only change needed: the leaderboard, show pages and catalog all read it.
 * Until then each one shows an estimated current-model range (estimateCurrent).
 */
export const AWAITING_RESCORE: ReadonlySet<string> = new Set([
  'curb-your-enthusiasm',
  'the-simpsons',
  'futurama',
  'taxi',
  'the-fresh-prince-of-bel-air',
]);

export function isAwaitingRescore(slug: string): boolean {
  return AWAITING_RESCORE.has(slug);
}

/** Scored shows whose numbers are on the current scale, i.e. rankable. */
export function rankable<T extends { slug: string; humor_index: number }>(shows: T[]): T[] {
  return shows.filter(s => s.humor_index > 0 && !AWAITING_RESCORE.has(s.slug));
}

/** Scored shows still on the pre-2026 scale. */
export function awaitingRescore<T extends { slug: string; humor_index: number }>(shows: T[]): T[] {
  return shows.filter(s => s.humor_index > 0 && AWAITING_RESCORE.has(s.slug));
}

/**
 * Where an earlier-model show would probably land on the current model, without
 * re-scoring it. Three shows have been rescored under the same display formula
 * the five earlier-model shows still use; their gains set the range. Wide on
 * purpose: three data points, and the gain clearly depends on the show.
 */
export const RESCORE_GAINS: ReadonlyArray<{ slug: string; name: string; from: number; to: number }> = [
  { slug: 'friends', name: 'Friends', from: 73.2, to: 87.1 },
  { slug: 'its-always-sunny', name: "It's Always Sunny", from: 79.2, to: 87.5 },
  { slug: 'community', name: 'Community', from: 77.9, to: 91.9 },
];

export function estimateCurrent(legacyScore: number): { low: number; mid: number; high: number } {
  const gains = RESCORE_GAINS.map(g => g.to - g.from);
  const lo = Math.min(...gains), hi = Math.max(...gains);
  const mean = gains.reduce((a, b) => a + b, 0) / gains.length;
  const cap = (v: number) => Math.min(99.9, v);
  return { low: cap(legacyScore + lo), mid: cap(legacyScore + mean), high: cap(legacyScore + hi) };
}

export function estimateText(legacyScore: number): string {
  const e = estimateCurrent(legacyScore);
  return `${e.low.toFixed(1)} to ${e.high.toFixed(1)}`;
}
