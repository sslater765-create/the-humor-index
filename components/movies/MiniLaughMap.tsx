import type { LaughBin } from '@/lib/movies';

// Static thumbnail of a film's Laugh Map: bars only, no labels. Used on cards.
export default function MiniLaughMap({ bins, className = '' }: { bins: LaughBin[]; className?: string }) {
  const max = Math.max(...bins.map(b => b.total), 1);
  const peak = bins.reduce((a, b, i) => (b.total > bins[a].total ? i : a), 0);
  return (
    <div className={`flex items-end gap-[2px] ${className}`} aria-hidden="true">
      {bins.map((b, i) => {
        const share = b.total / max;
        const bg = i === peak ? '#E8B931' : share >= 0.75 ? '#D9A12A' : share >= 0.6 ? '#BA7517' : share >= 0.45 ? '#8A5A1C' : '#4A3A22';
        return <span key={b.start} className="flex-1 rounded-[2px]" style={{ height: `${Math.max(share * 100, 4)}%`, background: bg }} />;
      })}
    </div>
  );
}
