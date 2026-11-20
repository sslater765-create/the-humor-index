import Link from 'next/link';
import Image from 'next/image';
import { getMovies, getMovie, getMovieQueue, bestLine, filmTime, shortTitle, laughMapNotes, TMDB_IMG } from '@/lib/movies';
import { formatIndex } from '@/lib/scoring';
import MiniLaughMap from './MiniLaughMap';

/**
 * Homepage entry point to the movies section: the top-ranked film with its
 * Laugh Map thumbnail, best line and what's being scored next. Renders nothing
 * until at least one film is published.
 */
export default async function MovieSpotlight() {
  const movies = await getMovies();
  if (!movies.length) return null;
  const m = await getMovie(movies[0].slug);
  if (!m) return null;
  const queue = await getMovieQueue();
  const name = shortTitle(m.title);
  const top = [...m.jokes].sort((a, b) => b.score - a.score)[0];
  const notes = laughMapNotes(m.laugh_map, m.jokes);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
      <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-card">
        {m.backdrop_path && (
          <Image src={`${TMDB_IMG}/w1280${m.backdrop_path}`} alt="" fill sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover object-[center_30%] opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-card via-brand-card/90 to-brand-card/60" />
        <div className="relative grid lg:grid-cols-[1fr_1.1fr] gap-8 p-5 sm:p-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-1">New · Movies</p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary leading-tight">
              Now scoring comedy movies.
            </h2>
            <p className="mt-2 text-sm text-brand-text-secondary max-w-md leading-relaxed">
              Every joke in the film, scored the same way as TV, then mapped across the runtime so you can see where it&rsquo;s funniest.
              {movies.length === 1 ? ' First up:' : ` ${movies.length} scored so far. The leader:`}
            </p>
            <Link href={`/movies/${m.slug}`} className="group mt-5 flex items-center gap-4">
              {m.poster_path && (
                <span className="relative w-16 aspect-[2/3] rounded-md overflow-hidden border border-brand-border shrink-0">
                  <Image src={`${TMDB_IMG}/w185${m.poster_path}`} alt={`${m.title} poster`} fill sizes="64px" className="object-cover" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block text-lg text-brand-text-primary group-hover:text-brand-gold transition-colors">{name} <span className="text-brand-text-muted">({m.year})</span></span>
                <span className="block font-mono text-2xl text-brand-gold">{formatIndex(m.humor_index)}</span>
              </span>
            </Link>
            {top && <p className="mt-4 text-sm text-brand-text-secondary italic line-clamp-2">&ldquo;{bestLine(top)}&rdquo;</p>}
          </div>
          <div className="flex flex-col">
            <Link href={`/movies/${m.slug}`} className="block rounded-xl border border-brand-border bg-brand-dark/60 p-4 hover:border-brand-gold/40 transition-colors">
              <div className="flex items-baseline justify-between text-xs mb-3">
                <span className="text-brand-text-secondary">The Laugh Map</span>
                <span className="text-brand-gold">Funniest: {filmTime(notes.peak.start)} to {filmTime(notes.peak.end)}</span>
              </div>
              <MiniLaughMap bins={m.laugh_map} className="h-24" />
              <div className="flex justify-between text-[10px] text-brand-text-muted mt-1.5">
                <span>0m</span><span>{m.runtime_minutes}m</span>
              </div>
            </Link>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href={`/movies/${m.slug}`} className="text-xs px-3.5 py-2 rounded-full bg-brand-gold text-brand-dark font-medium hover:brightness-110">See the Laugh Map</Link>
              <Link href={`/movies/${m.slug}/quotes`} className="text-xs px-3.5 py-2 rounded-full border border-brand-border text-brand-text-secondary hover:text-brand-gold hover:border-brand-gold/50">Every {name} quote, ranked</Link>
              <Link href="/movies" className="text-xs px-3.5 py-2 rounded-full border border-brand-border text-brand-text-secondary hover:text-brand-gold hover:border-brand-gold/50">All movies</Link>
            </div>
            {queue.length > 0 && (
              <p className="mt-auto pt-4 text-xs text-brand-text-muted">
                Being scored next: {queue.slice(0, 4).map(q => shortTitle(q.title)).join(', ')}{queue.length > 4 ? ` and ${queue.length - 4} more` : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
