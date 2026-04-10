import Link from 'next/link';
import { ShowScore } from '@/lib/types';
import { scoreToGrade, formatIndex } from '@/lib/scoring';
import FormatBadge from './FormatBadge';
import RankBadge from './RankBadge';

interface Props {
  show: ShowScore;
}

export default function ShowCard({ show }: Props) {
  return (
    <Link href={`/shows/${show.slug}`}>
      <div className="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-brand-gold/40 transition-colors group">
        <div className="flex items-start justify-between mb-3">
          {show.rank && <RankBadge rank={show.rank} />}
          <span className="font-mono text-3xl text-brand-gold">{scoreToGrade(show.humor_index)}</span>
        </div>
        <h2 className="text-base font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mb-1">
          {show.name}
        </h2>
        <p className="text-xs text-brand-text-muted mb-3 line-clamp-2">{show.description}</p>
        <div className="flex items-center gap-2 mb-4">
          <FormatBadge format={show.format} />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-brand-border">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-0.5">Index</p>
            <p className="font-mono text-sm text-brand-gold">{formatIndex(show.humor_index)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-0.5">JPM</p>
            <p className="font-mono text-sm text-brand-text-primary">{show.avg_jpm.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-0.5">Craft</p>
            <p className="font-mono text-sm text-brand-text-primary">{show.avg_craft.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
