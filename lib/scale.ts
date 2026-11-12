/**
 * Which scoring scale a show's published numbers are on.
 *
 * Every show was first scored on the pre-2026 model. Shows are being rescored
 * one at a time on the current model, which finds more jokes and rates craft
 * and impact higher, so a rescored show typically gains 9 to 15 points. Until
 * a show has been rescored its Humor Index is not comparable with the rest of
 * the board, and it is listed unranked.
 *
 * When a show's rescore is published, delete its slug from this set. That is
 * the only change needed: the leaderboard, show pages and catalog all read it.
 */
export const AWAITING_RESCORE: ReadonlySet<string> = new Set([
  'curb-your-enthusiasm',
  'its-always-sunny',
  'the-simpsons',
  'community',
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
