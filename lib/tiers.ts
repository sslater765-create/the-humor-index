/**
 * Tier system for Humor Index scores.
 *
 * Rationale: our published 95% credible intervals show show-level differences
 * of 1-2 points are within noise. Publishing decimals like "80.2 vs 79.1"
 * implies discrimination we can't defend. Tiers bucket shows into bands that
 * are defensible given our noise floor (~±1.2 points show-level CI).
 *
 * Two threshold sets, because the site carries two scoring scales (lib/scale.ts):
 *
 * - 'current' (default): shows scored on the current model. Cut-offs 97 / 92 /
 *   87 / 82 split the 1,057 current-model episodes roughly 18 / 33 / 29 / 17 /
 *   4 percent (November 2026). The April thresholds below put 99% of these
 *   episodes in Elite, which made the label meaningless.
 * - 'legacy': shows still awaiting a rescore. The original April 2026
 *   thresholds (78 / 74 / 70 / 65), which were tuned on that scale.
 *
 * A tier is therefore a statement about where a score sits on its own scale.
 * When the last show is rescored, delete LEGACY_MINS and the scale argument.
 */

export type TierKey = 'elite' | 'great' | 'solid' | 'mixed' | 'weak';

export interface Tier {
  key: TierKey;
  label: string;
  min: number; // inclusive
  max: number; // exclusive (except for Elite which is open-ended)
  /** Tailwind color classes — tuned to the brand-* palette */
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  /** Short descriptor used in tooltips / hover cards */
  description: string;
}

export const TIERS: Tier[] = [
  {
    key: 'elite',
    label: 'Elite',
    min: 97,
    max: Infinity,
    badgeBg: 'bg-brand-gold/15',
    badgeText: 'text-brand-gold',
    badgeBorder: 'border-brand-gold/40',
    description: 'Canonical top-tier comedy. Consistently high craft, impact, and memorability.',
  },
  {
    key: 'great',
    label: 'Great',
    min: 92,
    max: 97,
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    description: 'Above-average comedy with strong peaks. Fewer weak stretches than Solid tier.',
  },
  {
    key: 'solid',
    label: 'Solid',
    min: 87,
    max: 92,
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/30',
    description: 'Competent comedy. Watchable throughout with some standout episodes.',
  },
  {
    key: 'mixed',
    label: 'Mixed',
    min: 82,
    max: 87,
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
    description: 'Below the middle of its scale. Some stretches land, others do not.',
  },
  {
    key: 'weak',
    label: 'Weak',
    min: -Infinity,
    max: 82,
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/30',
    description: 'Near the bottom of its scale. Few peak comedy moments.',
  },
];

export type TierScale = 'current' | 'legacy';

/** Lower bounds on the pre-2026 scale, in the same order as TIERS. */
const LEGACY_MINS = [78, 74, 70, 65, -Infinity];
const LEGACY_TIERS: Tier[] = TIERS.map((t, i) => ({
  ...t,
  min: LEGACY_MINS[i],
  max: i === 0 ? Infinity : LEGACY_MINS[i - 1],
}));

export function getTier(score: number | null | undefined, scale: TierScale = 'current'): Tier {
  const tiers = scale === 'legacy' ? LEGACY_TIERS : TIERS;
  if (score == null || Number.isNaN(score)) return tiers[tiers.length - 1];
  return tiers.find(t => score >= t.min && score < t.max) ?? tiers[tiers.length - 1];
}

/**
 * Are two scores in the same tier? Used to decide if a ranking should be
 * shown as a differentiator or as a tie.
 */
export function sameTier(a: number, b: number, scale: TierScale = 'current'): boolean {
  return getTier(a, scale).key === getTier(b, scale).key;
}

/**
 * Given a score + CI, does the CI cross a tier boundary?
 * If so, the tier assignment is fuzzy — we can surface that uncertainty.
 */
export function tierIsUncertain(_score: number, ciLow?: number, ciHigh?: number, scale: TierScale = 'current'): boolean {
  if (ciLow == null || ciHigh == null) return false;
  return getTier(ciLow, scale).key !== getTier(ciHigh, scale).key;
}
