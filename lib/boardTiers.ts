/** Tier names, top down. Tiers past the list fall back to a number. */
export const TIER_NAMES = ['The Pantheon', 'The Second Floor', 'The Rotation', 'The Bench', 'The Waiver Wire'];

export const tierName = (t: number) => TIER_NAMES[t - 1] ?? `Tier ${t}`;

/**
 * Group a board (sorted best first) into tiers of statistical ties: a show
 * joins the current tier while its 95% interval reaches the tier leader's.
 * Measuring against the leader, not the row above, stops ties chaining down
 * the whole board. Returns slug -> tier number (1-based) and each tier's size.
 */
export function boardTiers(sorted: { slug: string; ci_95_low?: number; ci_95_high?: number }[]) {
  const tierOf = new Map<string, number>();
  const sizes: number[] = [];
  let leaderLow: number | null = null;
  for (const s of sorted) {
    if (s.ci_95_low === undefined || s.ci_95_high === undefined) continue;
    if (leaderLow === null || s.ci_95_high < leaderLow) { leaderLow = s.ci_95_low; sizes.push(0); }
    tierOf.set(s.slug, sizes.length);
    sizes[sizes.length - 1]++;
  }
  return { tierOf, sizes };
}
