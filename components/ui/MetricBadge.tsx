/**
 * Metric label. Was a rainbow of colored chips (cyan JPM, blue Craft, green
 * Impact, purple jokes...), which drowned out the gold that marks a score.
 * Now one quiet style for every metric; the number carries the emphasis.
 */
interface Props {
  label: string;
}

const NAMES: Record<string, string> = {
  JPM: 'Jokes / min',
  'WAR/E': 'WAR / ep',
};

export default function MetricBadge({ label }: Props) {
  return (
    <span className="text-[11px] uppercase tracking-wider text-brand-text-muted font-medium">
      {NAMES[label] ?? label}
    </span>
  );
}
