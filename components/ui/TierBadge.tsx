import { getTier, tierIsUncertain } from '@/lib/tiers';

interface TierBadgeProps {
  score: number | null | undefined;
  ciLow?: number;
  ciHigh?: number;
  /** Show the numeric score after the tier label, e.g. "Elite · 80.2" */
  showNumber?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Primary ranking display — bucket the score into a defensible tier.
 * Use this on the homepage leaderboard, shows grid, and top of show pages.
 * Use the raw decimal only in detail cards where precision is earned
 * (e.g. the ScoreGauge on an episode page).
 */
export default function TierBadge({
  score,
  ciLow,
  ciHigh,
  showNumber = false,
  size = 'md',
  className = '',
}: TierBadgeProps) {
  const tier = getTier(score);
  const uncertain = tierIsUncertain(score ?? 0, ciLow, ciHigh);

  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2.5 py-1';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  const title = uncertain
    ? `${tier.description} (tier boundary is inside this show's 95% CI)`
    : tier.description;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${tier.badgeBg} ${tier.badgeText} ${tier.badgeBorder} ${padding} ${textSize} font-medium uppercase tracking-wider ${className}`}
      title={title}
    >
      {tier.label}
      {uncertain && <span className="opacity-60" aria-label="tier boundary inside CI">~</span>}
      {showNumber && score != null && (
        <span className="text-brand-text-muted normal-case font-normal tracking-normal ml-0.5">
          · {score.toFixed(1)}
        </span>
      )}
    </span>
  );
}
