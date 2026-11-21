import Link from 'next/link';
import Image from 'next/image';
import { getMovies, getMovieQueue, getMovie, bestLine, jokeLines, lineSpeaker, shortTitle, filmTime, laughMapNotes, TMDB_IMG, type MovieJoke } from '@/lib/movies';
import MiniLaughMap from '@/components/movies/MiniLaughMap';
import type { MovieRowExtra } from '@/components/movies/MoviesTable';
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
  const details = await Promise.all(movies.map(m => getMovie(m.slug)));
  // Each film's headline line: its best-scoring joke that reads as a spoken line.
  const lead = (jokes: MovieJoke[]) => {
    const sorted = [...jokes].sort((a, b) => b.score - a.score);
    const j = sorted.find(x => jokeLines(x.text, x.characters).some(l => !l.note && l.speaker)) ?? sorted[0];
    return j;
  };
  const extras: Record<string, MovieRowExtra & { peak?: string }> = {};
  movies.forEach((m, i) => {
    const d = details[i];
    if (!d) return;
    const j = lead(d.jokes);
    const notes = laughMapNotes(d.laugh_map, d.jokes);
    extras[m.slug] = { line: j ? bestLine(j) : '', who: j ? lineSpeaker(bestLine(j), j.characters) : undefined, bins: d.laugh_map, peak: notes.peak ? `${filmTime(notes.peak.start)} to ${filmTime(notes.peak.end)}` : undefined };
  });
  const totalJokes = movies.reduce((s, m) => s + m.total_jokes, 0);
  // Records across every scored film.
  let topJoke: { j: MovieJoke; slug: string; name: string } | null = null;
  movies.forEach((m, i) => {
    const d = details[i];
    if (!d) return;
    const j = lead(d.jokes);
    if (j && (!topJoke || j.score > topJoke.j.score)) topJoke = { j, slug: m.slug, name: shortTitle(m.title) };
  });
  const densest = [...movies].sort((a, b) => b.avg_jpm - a.avg_jpm)[0];
  const crafted = [...movies].sort((a, b) => b.avg_craft - a.avg_craft)[0];
  const tj = topJoke as { j: MovieJoke; slug: string; name: string } | null;

  return (
    <div>
      <section className="relative border-b border-brand-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(232,185,49,0.14),transparent_55%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-gold mb-3">Movies</p>
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
              className="group relative rounded-2xl overflow-hidden border border-brand-border bg-brand-card min-h-[320px] flex">
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
                {extras[m.slug]?.line && <p className="mt-3 text-sm text-brand-text-secondary italic line-clamp-2">&ldquo;{extras[m.slug].line}&rdquo;</p>}
                {extras[m.slug]?.bins && (
                  <div className="mt-4">
                    <MiniLaughMap bins={extras[m.slug].bins} className="h-9" />
                    <p className="mt-1 text-[10px] text-brand-text-muted">Funniest stretch {extras[m.slug].peak}</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </section>

        {movies.length >= 3 && (
          <section className="grid gap-3 sm:grid-cols-3">
            {tj && (
              <Link href={`/movies/${tj.slug}`} className="rounded-xl border border-brand-border bg-brand-card p-4 hover:border-brand-gold/40 transition-colors">
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold">Funniest movie line so far</p>
                <p className="mt-2 text-sm text-brand-text-primary italic line-clamp-3">&ldquo;{bestLine(tj.j)}&rdquo;</p>
                <p className="mt-2 text-xs text-brand-text-muted">{lineSpeaker(bestLine(tj.j), tj.j.characters) ? `${lineSpeaker(bestLine(tj.j), tj.j.characters)}, ` : ''}{tj.name} · {tj.j.score.toFixed(1)}</p>
              </Link>
            )}
            <Link href={`/movies/${densest.slug}`} className="rounded-xl border border-brand-border bg-brand-card p-4 hover:border-brand-gold/40 transition-colors">
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold">Most jokes per minute</p>
              <p className="mt-2 font-mono text-3xl text-brand-text-primary">{densest.avg_jpm.toFixed(2)}</p>
              <p className="mt-1 text-xs text-brand-text-muted">{shortTitle(densest.title)} ({densest.year}) · {densest.total_jokes} jokes</p>
            </Link>
            <Link href={`/movies/${crafted.slug}`} className="rounded-xl border border-brand-border bg-brand-card p-4 hover:border-brand-gold/40 transition-colors">
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold">Best-built jokes</p>
              <p className="mt-2 font-mono text-3xl text-brand-text-primary">{crafted.avg_craft.toFixed(2)}</p>
              <p className="mt-1 text-xs text-brand-text-muted">{shortTitle(crafted.title)} ({crafted.year}) · average craft per joke</p>
            </Link>
          </section>
        )}

        {movies.length > 3 && <MoviesTable movies={movies} extras={extras} />}

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
