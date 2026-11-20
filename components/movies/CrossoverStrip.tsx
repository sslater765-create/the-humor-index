import Link from 'next/link';
import Image from 'next/image';
import type { Crossover } from '@/lib/crossover';
import { formatIndex } from '@/lib/scoring';
import { TMDB_IMG } from '@/lib/movies';

/**
 * "Same actor, other half of the site." On a show page it points at the
 * movies; on a movie page it points at the shows. One card per actor pairing.
 */
export default function CrossoverStrip({ items, side, title, subtitle }: {
  items: Crossover[];
  side: 'show' | 'movie';
  title: string;
  subtitle?: string;
}) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-semibold text-brand-text-primary">{title}</h2>
      {subtitle && <p className="text-sm text-brand-text-secondary mt-1">{subtitle}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {items.slice(0, 6).map(x => {
          const href = side === 'show' ? `/movies/${x.movie_slug}` : `/shows/${x.show_slug}`;
          const target = side === 'show' ? `${x.movie_title} (${x.movie_year})` : x.show_name;
          const score = side === 'show' ? x.movie_score : x.show_score;
          const here = side === 'show' ? x.tv_character : x.movie_character;
          const there = side === 'show' ? x.movie_character : x.tv_character;
          return (
            <Link key={`${x.actor}-${x.show_slug}-${x.movie_slug}`} href={href}
              className="group flex gap-3 rounded-xl border border-brand-border bg-brand-card p-3 hover:border-brand-gold/40 transition-colors">
              <span className="relative w-14 h-14 rounded-full overflow-hidden bg-brand-surface border border-brand-border shrink-0">
                {x.profile_path
                  ? <Image src={`${TMDB_IMG}/w185${x.profile_path}`} alt={x.actor} fill sizes="56px" className="object-cover" />
                  : <span className="absolute inset-0 flex items-center justify-center text-brand-text-muted">{x.actor[0]}</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-brand-text-primary font-medium truncate">{x.actor}</span>
                {here && <span className="block text-xs text-brand-text-muted truncate">{here} here</span>}
                <span className="block text-sm text-brand-text-secondary mt-1 group-hover:text-brand-gold transition-colors truncate">
                  {there ? `${there} in ` : ''}{target} <span className="font-mono text-brand-gold">{formatIndex(score)}</span> →
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
