const METRIC_STYLES: Record<string, string> = {
  JPM: 'bg-brand-gold text-black',
  Craft: 'bg-blue-500 text-white',
  Impact: 'bg-emerald-500 text-white',
  IMDb: 'bg-[#F5C518] text-black',
  'Jokes Analyzed': 'bg-purple-500 text-white',
  'Total Jokes': 'bg-purple-500 text-white',
  'Comedy Style': 'bg-orange-500 text-white',
  'Avg Craft': 'bg-blue-500 text-white',
  'Avg Impact': 'bg-emerald-500 text-white',
  'Episode Mean': 'bg-gray-500 text-white',
};

interface Props {
  label: string;
}

export default function MetricBadge({ label }: Props) {
  const style = METRIC_STYLES[label] || 'bg-brand-surface text-brand-text-secondary';
  return (
    <span className={`${style} font-bold text-[10px] px-1.5 py-0.5 rounded normal-case tracking-normal`}>
      {label}
    </span>
  );
}
