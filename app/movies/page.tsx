import Link from 'next/link';
import Image from 'next/image';
import { getMovies, getMovieQueue, getMovie, bestLine, shortTitle, TMDB_IMG } from '@/lib/movies';
import { formatIndex } from '@/lib/scoring';
import MoviesTable from '@/components/movies/MoviesTable';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export async function generateMetadata() {
  const movies = await getMovies();
  const lead = movies[0];
  return {
    title: `The Funniest Comedy Movies, Ranked by Every Joke | The Humor Index`,
    description: `We score every joke in a comedy movie for craft and impact, then map where it's funniest.${lead ? ` ${shortTitle(lead.title)} leads at ${formatIndex(lead.humor_index)}.` : ''} ${movies.length} scored so far, more every week.`,
    alternates: { canonical: `${SITE_URL}/movies/` },
  };
}

export default async function MoviesPage() {
  const movies = await getMovies();
  const queue = await getMovieQueue();
  const top3 = movies.slice(0, 3);
  const best = await Promise.all(top3.map(async m => {
    const d = await getMovie(m.slug);
    const j = d ? [...d.jokes].sort((a, b) => b.score - a.score)[0] : undefined;
    return j ? bestLine(j) : '';
  }));
  const totalJokes = movies.reduce((s, m) => s + m.total_jokes, 0);

  return (
    <div>
      <section className="relative border-b border-brand-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(232,185,49,0.14),transparent_55%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-gold mb-3">New: Movies</p>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-brand-text-primary max-w-3xl">
            The funniest comedy movies, ranked by every joke in them
          </h1>
          <p className="mt-4 max-w-2xl text-brand-text-secondary leading-relaxed">
            Same scoring as our TV rankings: every joke rated for how well it&rsquo;s built and how hard it lands.
            Then we map each one across the runtime, so you can see exactly where a movie is funniest and where it drags.
          </p>
          <p className="mt-4 text-sm text-brand-text-muted">
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'} scored · {totalJokes.toLocaleString()} jokes · new movies every week
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <section className={`grid gap-4 ${top3.length >= 3 ? 'md:grid-cols-3' : top3.length === 2 ? 'md:grid-cols-2' : 'max-w-2xl'}`}>
          {top3.map((m, i) => (
            <Link key={m.slug} href={`/movies/${m.slug}`}
              className="group relative rounded-2xl overflow-hidden border border-brand-border bg-brand-card min-h-[260px] flex">
              {m.backdrop_path && (
                <Image src={`${TMDB_IMG}/w780${m.backdrop_path}`} alt="" fill sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover opacity-40 group-hover:opacity-55 transition-opacity" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent" />
              <div className="relative mt-auto p-5 w-full">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-brand-gold">#{i + 1}</p>
                    <h2 className="text-xl sm:text-2xl font-semibold text-brand-text-primary">{shortTitle(m.title)}</h2>
                    <p className="text-xs text-brand-text-secondary">{m.year} · {m.director}</p>
                  </div>
                  <span className="font-mono text-3xl text-brand-gold">{formatIndex(m.humor_index)}</span>
                </div>
                {best[i] && <p className="mt-3 text-sm text-brand-text-secondary line-clamp-2">&ldquo;{best[i]}&rdquo;</p>}
              </div>
            </Link>
          ))}
        </section>

        {movies.length > 3 && <MoviesTable movies={movies} />}

        {queue.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-brand-text-primary mb-3">Being scored next</h2>
            <div className="flex flex-wrap gap-2">
              {queue.map(q => (
                <span key={q.slug} className="text-sm rounded-full border border-brand-border px-3 py-1 text-brand-text-secondary">
                  {shortTitle(q.title)} <span className="text-brand-text-muted">({q.year})</span>
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-brand-border bg-brand-surface p-6">
          <h2 className="text-lg font-semibold text-brand-text-primary">Why movies have their own ranking</h2>
          <p className="mt-2 text-sm text-brand-text-secondary leading-relaxed max-w-3xl">
            A sitcom episode is 22 minutes of jokes. A movie has to spend time on plot, so it will always look sparser by the minute.
            Movies are ranked against movies only, and a movie&rsquo;s score isn&rsquo;t directly comparable with a TV show&rsquo;s.
            Looking for TV? <Link href="/shows" className="text-brand-gold hover:underline">See the TV leaderboard</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
