import Link from 'next/link';
import Image from 'next/image';
import { ShowScore } from '@/lib/types';
import { scoreToGrade, formatIndex } from '@/lib/scoring';
import FormatBadge from './FormatBadge';
import RankBadge from './RankBadge';
import TierBadge from './TierBadge';

interface Props {
  show: ShowScore;
}

export default function ShowCard({ show }: Props) {
  return (
    <div className="relative bg-brand-card border border-brand-border rounded-xl overflow-hidden hover:border-brand-gold/40 transition-colors group">
      <Link href={`/shows/${show.slug}`} className="block">
        {show.backdrop_path && (
          <div className="relative h-36 w-full">
            <Image
              src={`https://image.tmdb.org/t/p/w780${show.backdrop_path}`}
              alt={show.name}
              fill
              className="object-cover opacity-50 group-hover:opacity-60 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-card to-transparent" />
            <div className="absolute top-3 left-3">
              {show.rank && <RankBadge rank={show.rank} />}
            </div>
            <div className="absolute top-3 right-3">
              <span className="font-mono text-3xl text-brand-gold drop-shadow-lg">{scoreToGrade(show.humor_index)}</span>
            </div>
          </div>
        )}
        <div className="p-5 pb-3">
          {!show.backdrop_path && (
            <div className="flex items-start justify-between mb-3">
              {show.rank && <RankBadge rank={show.rank} />}
              <span className="font-mono text-3xl text-brand-gold">{scoreToGrade(show.humor_index)}</span>
            </div>
          )}
          <h2 className="text-base font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mb-1">
            {show.name}
          </h2>
          <p className="text-xs text-brand-text-muted mb-3 line-clamp-2">{show.description}</p>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <TierBadge score={show.humor_index} ciLow={show.ci_95_low} ciHigh={show.ci_95_high} size="sm" />
            <FormatBadge format={show.format} />
            {show.network && (
              <span className="text-xs text-brand-text-muted">{show.network}</span>
            )}
            {show.aired && (
              <span className="text-xs text-brand-text-muted">{show.aired}</span>
            )}
            {show.aired && (
              parseInt(show.aired.split('\u2013')[1] || '9999') >= 2025
                ? <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">On Air</span>
                : <span className="text-[10px] bg-brand-surface text-brand-text-muted border border-brand-border rounded-full px-2 py-0.5">Ended</span>
            )}
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
      <div className="px-5 pb-4">
        <Link
          href={`/compare?show=${show.slug}`}
          className="flex items-center justify-center gap-1.5 w-full text-xs text-brand-text-muted hover:text-brand-gold border border-brand-border hover:border-brand-gold/40 rounded-lg py-1.5 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Compare
        </Link>
      </div>
    </div>
  );
}
