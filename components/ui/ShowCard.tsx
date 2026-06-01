import Link from 'next/link';
import Image from 'next/image';
import { ShowScore } from '@/lib/types';
import { scoreToGrade, formatIndex } from '@/lib/scoring';
import FormatBadge from './FormatBadge';
import RankBadge from './RankBadge';

interface Props {
  show: ShowScore;
}

export default function ShowCard({ show }: Props) {
  const onAir = !!show.aired && parseInt(show.aired.split('\u2013')[1] || '9999') >= 2025;
  return (
    <div className="relative bg-brand-card border border-brand-border rounded-2xl overflow-hidden hover:border-brand-gold/40 transition-colors group">
      <Link href={`/shows/${show.slug}`} className="block">
        {show.backdrop_path && (
          <div className="relative h-40 w-full">
            <Image
              src={`https://image.tmdb.org/t/p/w780${show.backdrop_path}`}
              alt={show.name}
              fill
              className="object-cover opacity-55 group-hover:opacity-70 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/40 to-transparent" />
            <div className="absolute top-3 left-3">
              {show.rank && <RankBadge rank={show.rank} />}
            </div>
            <div className="absolute bottom-3 right-4 text-right">
              <p className="font-serif italic text-4xl text-brand-gold drop-shadow-md leading-none">
                {formatIndex(show.humor_index)}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-1">
                Humor Index \u00b7 {scoreToGrade(show.humor_index)}
              </p>
            </div>
          </div>
        )}
        <div className="p-5 pb-3">
          {!show.backdrop_path && (
            <div className="flex items-start justify-between mb-4">
              {show.rank && <RankBadge rank={show.rank} />}
              <div className="text-right">
                <p className="font-serif italic text-4xl text-brand-gold leading-none">{formatIndex(show.humor_index)}</p>
                <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-1">
                  Humor Index \u00b7 {scoreToGrade(show.humor_index)}
                </p>
              </div>
            </div>
          )}
          <h2 className="font-serif italic text-2xl text-brand-text-primary group-hover:text-brand-gold transition-colors leading-tight mb-2">
            {show.name}
          </h2>
          <p className="text-xs text-brand-text-muted mb-4 line-clamp-2 leading-relaxed">{show.description}</p>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <FormatBadge format={show.format} />
            {show.network && (
              <span className="text-[10px] uppercase tracking-widest text-brand-text-muted">{show.network}</span>
            )}
            {show.aired && (
              <span className="text-[10px] uppercase tracking-widest text-brand-text-muted">{show.aired}</span>
            )}
            {show.aired && (
              onAir
                ? <span className="text-[10px] uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">On Air</span>
                : <span className="text-[10px] uppercase tracking-widest bg-brand-surface text-brand-text-muted border border-brand-border rounded-full px-2 py-0.5">Ended</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-brand-border">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-1">JPM</p>
              <p className="font-serif italic text-xl text-brand-text-primary leading-none">{show.avg_jpm.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-1">Craft</p>
              <p className="font-serif italic text-xl text-brand-text-primary leading-none">{show.avg_craft.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-1">Impact</p>
              <p className="font-serif italic text-xl text-brand-text-primary leading-none">{show.avg_impact.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </Link>
      <div className="px-5 pb-4">
        <Link
          href={`/compare?show=${show.slug}`}
          className="flex items-center justify-center gap-1.5 w-full text-[10px] uppercase tracking-widest text-brand-text-muted hover:text-brand-gold border border-brand-border hover:border-brand-gold/40 rounded-full py-2 transition-colors"
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
