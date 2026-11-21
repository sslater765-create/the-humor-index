import Link from 'next/link';
import Image from 'next/image';
import { getMovies, getMovie, getMovieQueue, bestLine, jokeLines, lineSpeaker, shortTitle, TMDB_IMG } from '@/lib/movies';
import { formatIndex } from '@/lib/scoring';
import MiniLaughMap from './MiniLaughMap';

/**
 * Homepage entry point to the movies section: the top five films as poster
 * cards with their Laugh Maps, the leader's best line, and what's next.
 * Renders nothing until at least one film is published.
 */
export default async function MovieSpotlight() {
  const movies = await getMovies();
  if (!movies.length) return null;
  const top = movies.slice(0, 5);
  const details = await Promise.all(top.map(m => getMovie(m.slug)));
  const queue = await getMovieQueue();
  const leader = details[0];
  const leadJoke = leader
    ? [...leader.jokes].sort((a, b) => b.score - a.score).find(j => jokeLines(j.text, j.characters).some(l => !l.note && l.speaker))
    : undefined;
  const totalJokes = movies.reduce((s, m) => s + m.total_jokes, 0);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
      <div className="rounded-2xl border border-brand-border bg-brand-card p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-1">Movies</p>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary leading-tight">
              The funniest comedy movies.
            </h2>
            <p className="mt-2 text-sm text-brand-text-secondary max-w-xl leading-relaxed">
              {movies.length} films, {totalJokes.toLocaleString()} jokes, scored the same way as TV and mapped across the runtime.
              Movies rank against movies.
            </p>
          </div>
          <Link href="/movies" className="text-xs px-3.5 py-2 rounded-full bg-brand-gold text-brand-dark font-medium hover:brightness-110">
            All {movies.length} movies →
          </Link>
        </div>

        <ol className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {top.map((m, i) => {
            const d = details[i];
            return (
              <li key={m.slug} className={i >= 4 ? 'hidden lg:block' : i === 3 ? 'sm:hidden lg:block' : ''}>
                <Link href={`/movies/${m.slug}`} className="group block">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-brand-border bg-brand-surface group-hover:border-brand-gold/50 transition-colors">
                    {m.poster_path && (
                      <Image src={`${TMDB_IMG}/w342${m.poster_path}`} alt={`${m.title} poster`} fill sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <span className="absolute top-2 left-2 font-mono text-xs px-2 py-0.5 rounded-full bg-black/70 text-brand-gold border border-brand-gold/40">#{i + 1}</span>
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="font-mono text-2xl text-brand-gold leading-none">{formatIndex(m.humor_index)}</p>
                      {d && <MiniLaughMap bins={d.laugh_map} className="h-6 mt-2 opacity-90" />}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-brand-text-primary group-hover:text-brand-gold transition-colors truncate">{shortTitle(m.title)}</p>
                  <p className="text-xs text-brand-text-muted">{m.year} · {m.total_jokes} jokes</p>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-5">
          {leadJoke && leader ? (
            <Link href={`/movies/${leader.slug}`} className="group min-w-0 flex-1">
              <p className="text-sm sm:text-base text-brand-text-primary italic line-clamp-2 group-hover:text-brand-gold transition-colors">
                &ldquo;{bestLine(leadJoke)}&rdquo;
              </p>
              <p className="text-xs text-brand-text-muted mt-1">
                {lineSpeaker(bestLine(leadJoke), leadJoke.characters) ? `${lineSpeaker(bestLine(leadJoke), leadJoke.characters)}, ` : ''}{shortTitle(leader.title)} · the No. 1 movie&rsquo;s best line
              </p>
            </Link>
          ) : <span />}
          {queue.length > 0 && (
            <p className="text-xs text-brand-text-muted">
              Scoring next: {queue.slice(0, 3).map(q => shortTitle(q.title)).join(', ')}{queue.length > 3 ? ` and ${queue.length - 3} more` : ''}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
