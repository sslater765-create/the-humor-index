import { withIntervals } from '@/lib/siteStats';
import Link from 'next/link';
import { getAllShows, getEpisodes, getQuickPickPool, getJokeRoulette } from '@/lib/data';
import JokeRoulette from '@/components/home/JokeRoulette';
import Image from 'next/image';
import { isAwaitingRescore } from '@/lib/scale';
import QuickPick from '@/components/comedy-dna/QuickPick';
import LeaderboardClient from './LeaderboardClient';
import ThisWeek from '@/components/home/ThisWeek';
import HeroLoop from '@/components/HeroLoop';
import MovieSpotlight from '@/components/movies/MovieSpotlight';
import { getMovies, getMovieBoard } from '@/lib/movies';
import { SITE_URL } from '@/lib/site';
import { rankable, awaitingRescore, adjustedEstimates } from '@/lib/scale';

export const dynamic = 'force-static';

export default async function HomePage() {
  const shows = await getAllShows();
  const movies = await getMovies();
  const quickPool = await getQuickPickPool();
  const rankedCount = rankable(shows).length;
  const roulette = await getJokeRoulette();

  const analyzedShows = shows.filter(s => s.humor_index > 0);
  const rankedCountHero = analyzedShows.filter(s => !isAwaitingRescore(s.slug)).length;
  let totalEpisodesAnalyzed = 0;
  for (const show of analyzedShows) {
    try {
      const eps = await getEpisodes(show.slug);
      totalEpisodesAnalyzed += eps.length;
    } catch { /* no episodes yet */ }
  }
  const totalJokes = shows.reduce((s, show) => s + show.total_jokes_analyzed, 0);
  const asOf = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Humor Index',
    url: `${SITE_URL}`,
    description: 'AI-powered comedy analytics ranking every joke in TV and movie comedy.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/shows?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Editorial hero — the leaderboard IS the hero */}
      <section className="border-b border-brand-border bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10">
          {/* Two-column hero: copy left, "how it works" loop right */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-14 mb-12">
            <div className="flex flex-col">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-brand-gold mb-5">
                Comedy, Quantified
              </p>
              <h1 className="font-serif italic text-4xl sm:text-7xl text-brand-text-primary leading-[1.02] mb-5">
                Every joke in {analyzedShows.length} sitcoms<br className="hidden sm:block" />{' '}
                <span className="text-brand-text-secondary">and {movies.length} comedy films, scored and ranked.</span>
              </h1>
              <p className="text-base sm:text-xl text-brand-text-secondary max-w-2xl leading-relaxed">
                Comedy arguments run on nostalgia and fan votes. This is the box score: every joke in
                every script, graded by one AI model on the same five-part rubric, receipts published.{' '}
                <Link href="/why/" className="text-brand-gold hover:underline whitespace-nowrap">Why it works →</Link>
              </p>
              {/* Phones: show the board right away, before the counters */}
              <div className="sm:hidden mt-6 grid grid-cols-4 gap-2">
                {[...shows].filter(s => s.humor_index > 0 && !isAwaitingRescore(s.slug)).sort((a, b) => b.humor_index - a.humor_index).slice(0, 4).map((s, i) => (
                  <Link key={s.slug} href={`/shows/${s.slug}/`} className="block">
                    <span className="relative block aspect-[2/3] rounded-lg overflow-hidden border border-brand-border bg-brand-card">
                      {s.poster_path && <Image src={`https://image.tmdb.org/t/p/w185${s.poster_path}`} alt={`${s.name} poster`} fill sizes="25vw" className="object-cover" />}
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-1.5 pb-1 pt-4">
                        <span className="block text-[11px] text-brand-text-muted font-mono">#{i + 1}</span>
                        <span className="block font-mono text-sm text-brand-gold leading-none">{s.humor_index.toFixed(1)}</span>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>

              {/* Big numbers — magazine cover stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6 sm:gap-8 max-w-2xl mt-10 lg:mt-auto lg:pt-8">
                <div>
                  <p className="font-serif italic text-3xl sm:text-5xl text-brand-gold leading-none">
                    {analyzedShows.length}
                  </p>
                  <p className="text-[11px] sm:text-xs uppercase tracking-widest text-brand-text-muted mt-2">TV shows scored{analyzedShows.length > rankedCountHero ? ` · ${rankedCountHero} ranked` : ''}</p>
                </div>
                <Link href="/movies" className="group">
                  <p className="font-serif italic text-3xl sm:text-5xl text-brand-gold leading-none group-hover:underline decoration-1 underline-offset-4">
                    {movies.length}
                  </p>
                  <p className="text-[11px] sm:text-xs uppercase tracking-widest text-brand-text-muted mt-2 group-hover:text-brand-gold">{movies.length === 1 ? 'Movie' : 'Movies'} scored</p>
                </Link>
                <div>
                  <p className="font-serif italic text-3xl sm:text-5xl text-brand-gold leading-none">
                    {totalEpisodesAnalyzed.toLocaleString()}
                  </p>
                  <p className="text-[11px] sm:text-xs uppercase tracking-widest text-brand-text-muted mt-2">TV episodes scored</p>
                </div>
                <div>
                  <p className="font-serif italic text-3xl sm:text-5xl text-brand-gold leading-none">
                    {(totalJokes + movies.reduce((n, m) => n + m.total_jokes, 0)).toLocaleString()}
                  </p>
                  <p className="text-[11px] sm:text-xs uppercase tracking-widest text-brand-text-muted mt-2">Jokes scored, TV and film</p>
                </div>
              </div>
            </div>
            <HeroLoop className="w-full max-w-[380px] mx-auto lg:mx-0" />
          </div>

          <p className="text-[11px] sm:text-xs uppercase tracking-widest text-brand-text-muted mb-6">
            As of {asOf} ·{' '}
            <Link href="/methodology" className="text-brand-gold hover:underline">
              How we score
            </Link>
          </p>

          {/* Leaderboard */}
          <div id="leaderboard" className="scroll-mt-20 bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-7">
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-1">The Index</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-brand-text-primary leading-tight">
                  The leaderboard.
                </h2>
              </div>
              <Link href="/rankings" className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors shrink-0 ml-3">
                Full rankings →
              </Link>
            </div>
            <LeaderboardClient shows={await withIntervals(rankable(shows))} movies={await getMovieBoard()} pending={awaitingRescore(shows)} adjusted={adjustedEstimates(shows)} quickPool={quickPool} />
            <div className="mt-6 pt-5 border-t border-brand-border flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link href="/shows" className="text-xs uppercase tracking-widest text-brand-gold hover:underline">
                Browse all {analyzedShows.length} shows →
              </Link>
              <Link href="/request" className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors">
                Not here yet: Brooklyn Nine-Nine, Modern Family, The Good Place. Vote on what’s next
              </Link>
              <Link href="/rankings/best-seasons" className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors">
                Best seasons
              </Link>
              <Link href="/rankings/jokes-per-minute" className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors">
                Jokes per minute
              </Link>
              <Link href="/rankings/best-christmas-episodes" className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors">
                Best Christmas episodes
              </Link>
              {movies.length > 0 && (
                <Link href="/movies" className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors">
                  Movie rankings
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* The week: bracket round, newest column, fan favorites. */}
      <ThisWeek />

      {/* The fastest proof the site is about funny things: a real top line, and a button for another. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <JokeRoulette pool={roulette} />
      </section>

      <MovieSpotlight />

      {/* Comedy DNA, one tap: a pick right here is the quickest way into a personal
          match % on the leaderboard and show pages. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <QuickPick
          jokes={quickPool}
          source="home"
          title="Which joke is funnier?"
          subtitle={`Real lines from the ${rankedCount} shows we rank. Pick the one that lands harder for you. A few picks give you a match % for every show on the leaderboard above.`}
        />
        <p className="text-xs text-brand-text-muted mt-3 px-1">
          Want the whole read in two minutes?{' '}
          <Link href="/comedy-dna" className="text-brand-gold hover:underline">Take the full Comedy DNA quiz →</Link>
        </p>
      </section>

      <p className="max-w-7xl mx-auto px-4 sm:px-6 py-14 text-sm text-brand-text-muted">
        How a joke becomes a number: density, craft and impact, weighted 25, 40 and 35.{' '}
        <Link href="/methodology" className="text-brand-gold hover:underline">The methodology</Link> ·{' '}
        <Link href="/rankings/best-jokes" className="text-brand-gold hover:underline">The top 100 jokes</Link> ·{' '}
        <Link href="/blog" className="text-brand-gold hover:underline">The blog</Link>
      </p>
    </div>
  );
}
