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
  return (
    <Link href={`/shows/${show.slug}`}>
      <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden hover:border-brand-gold/40 transition-colors group">
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
        <div className="p-5">
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
          <div className="flex items-center gap-2 mb-4">
            <FormatBadge format={show.format} />
            {show.network && (
              <span className="text-xs text-brand-text-muted">{show.network}</span>
            )}
            {show.aired && (
              <span className="text-xs text-brand-text-muted">{show.aired}</span>
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
      </div>
    </Link>
  );
}
