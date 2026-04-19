/**
 * Tier system for Humor Index scores.
 *
 * Rationale: our published 95% credible intervals show show-level differences
 * of 1-2 points are within noise. Publishing decimals like "80.2 vs 79.1"
 * implies discrimination we can't defend. Tiers bucket shows into bands that
 * are defensible given our noise floor (~±1.2 points show-level CI).
 *
 * Tier thresholds chosen empirically from the current data (April 2026):
 * - Elite: top tier of scored shows (78+)
 * - Great: above-average comedy (74–78)
 * - Solid: competent (70–74)
 * - Mixed: uneven (65–70)
 * - Weak: below our replacement level (<65)
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
    min: 78,
    max: Infinity,
    badgeBg: 'bg-brand-gold/15',
    badgeText: 'text-brand-gold',
    badgeBorder: 'border-brand-gold/40',
    description: 'Canonical top-tier comedy. Consistently high craft, impact, and memorability.',
  },
  {
    key: 'great',
    label: 'Great',
    min: 74,
    max: 78,
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    description: 'Above-average comedy with strong peaks. Fewer weak stretches than Solid tier.',
  },
  {
    key: 'solid',
    label: 'Solid',
    min: 70,
    max: 74,
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/30',
    description: 'Competent comedy. Watchable throughout with some standout episodes.',
  },
  {
    key: 'mixed',
    label: 'Mixed',
    min: 65,
    max: 70,
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
    description: 'Uneven quality. Some episodes land, many don\u2019t.',
  },
  {
    key: 'weak',
    label: 'Weak',
    min: -Infinity,
    max: 65,
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/30',
    description: 'Below our replacement level. Rarely generates peak comedy moments.',
  },
];

export function getTier(score: number | null | undefined): Tier {
  if (score == null || Number.isNaN(score)) return TIERS[TIERS.length - 1];
  return TIERS.find(t => score >= t.min && score < t.max) ?? TIERS[TIERS.length - 1];
}

/**
 * Are two scores in the same tier? Used to decide if a ranking should be
 * shown as a differentiator or as a tie.
 */
export function sameTier(a: number, b: number): boolean {
  return getTier(a).key === getTier(b).key;
}

/**
 * Given a score + CI, does the CI cross a tier boundary?
 * If so, the tier assignment is fuzzy — we can surface that uncertainty.
 */
export function tierIsUncertain(score: number, ciLow?: number, ciHigh?: number): boolean {
  if (ciLow == null || ciHigh == null) return false;
  return getTier(ciLow).key !== getTier(ciHigh).key;
}
