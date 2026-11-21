import Link from 'next/link';
import { getAllShows, getEpisodes, getQuickPickPool, getTopJokes, getJokeRoulette } from '@/lib/data';
import JokeRoulette from '@/components/home/JokeRoulette';
import Image from 'next/image';
import { isAwaitingRescore } from '@/lib/scale';
import QuickPick from '@/components/comedy-dna/QuickPick';
import LeaderboardClient from './LeaderboardClient';
import WhatsNewPersonalized from '@/components/ui/WhatsNewPersonalized';
import { POSTS } from '@/app/blog/posts';
import HeroLoop from '@/components/HeroLoop';
import MovieSpotlight from '@/components/movies/MovieSpotlight';
import { getMovies } from '@/lib/movies';
import { SITE_URL } from '@/lib/site';
import { rankable, awaitingRescore } from '@/lib/scale';

export const dynamic = 'force-static';

// "Fleabag · Fleabag" and "Unknown Aide" read as glitches; drop those speakers.
function speakerLabel(name: string | undefined, show: string): string {
  if (!name || /^unknown/i.test(name) || name.toLowerCase() === show.toLowerCase()) return '';
  return `${name} · `;
}

export default async function HomePage() {
  const shows = await getAllShows();
  const movies = await getMovies();
  const quickPool = await getQuickPickPool();
  const rankedCount = rankable(shows).length;
  // Each ranked show's best line, for the "funniest lines" strip.
  const roulette = await getJokeRoulette();
  const topLines = (await getTopJokes()).filter(j => !isAwaitingRescore(j.show_slug)).slice(0, 6)
    .map(j => ({ ...j, backdrop: shows.find(s => s.slug === j.show_slug)?.backdrop_path }));

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
                Every comedy joke,<br />
                <span className="text-brand-text-secondary">scored and ranked.</span>
              </h1>
              <p className="text-base sm:text-xl text-brand-text-secondary max-w-2xl leading-relaxed">
                Comedy arguments run on nostalgia and fan votes. This is the box score: every joke in
                every script, graded on the same five-part rubric, receipts published.{' '}
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
              <p className="hidden sm:block text-base sm:text-lg text-brand-text-muted max-w-2xl leading-relaxed mt-4">
                No laugh tracks, no nostalgia, no &ldquo;you had to be there.&rdquo; Browse the rankings,
                settle an argument between two shows, or find out which episode you should actually rewatch.
              </p>

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

          {/* The fastest proof the site is about funny things: a real top line, and a button for another. */}
          <div className="mb-12">
            <JokeRoulette pool={roulette} />
          </div>

          <p className="text-[11px] sm:text-xs uppercase tracking-widest text-brand-text-muted mb-6 pt-10 border-t border-brand-border">
            As of {asOf} ·{' '}
            <Link href="/methodology" className="text-brand-gold hover:underline">
              How we score
            </Link>
          </p>

          {/* Leaderboard */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-7">
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-1">The Index</p>
                <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary leading-tight">
                  The TV leaderboard.
                </h2>
              </div>
              <Link href="/rankings" className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors shrink-0 ml-3">
                Full rankings →
              </Link>
            </div>
            <LeaderboardClient shows={rankable(shows)} pending={awaitingRescore(shows)} quickPool={quickPool} />
            <div className="mt-6 pt-5 border-t border-brand-border flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link href="/shows" className="text-xs uppercase tracking-widest text-brand-gold hover:underline">
                Browse all {analyzedShows.length} shows →
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

      {/* Funniest lines: each ranked show's highest-scoring line, with its show's art */}
      {topLines.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-1">The best lines on the index</p>
              <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary leading-tight">Six of the best lines on the board.</h2>
            </div>
            <Link href="/rankings/best-jokes" className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors shrink-0">Top 100 jokes →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topLines.map(j => (
              <Link key={j.show_slug} href={`/shows/${j.show_slug}/${j.season}/${j.episode_number}`}
                className="group relative flex flex-col justify-end min-h-[220px] rounded-2xl overflow-hidden border border-brand-border hover:border-brand-gold/50 transition-colors">
                {j.backdrop && (
                  <Image src={`https://image.tmdb.org/t/p/w780${j.backdrop}`} alt="" fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover opacity-50 group-hover:opacity-65 group-hover:scale-105 transition-all duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/75 to-brand-dark/10" />
                <div className="relative p-5">
                  <p className="font-serif italic text-lg sm:text-xl text-brand-text-primary leading-snug mb-3 line-clamp-4">
                    <span className="text-brand-gold">&ldquo;</span>{j.text}<span className="text-brand-gold">&rdquo;</span>
                  </p>
                  <p className="text-[11px] uppercase tracking-widest text-brand-text-muted">
                    {speakerLabel(j.characters?.[0], j.show)}{j.show} · S{j.season}E{j.episode_number}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* What's New — personalized for return visitors */}
      <WhatsNewPersonalized latestPosts={Object.entries(POSTS).map(([slug, p]) => ({ slug, title: p.title, date: p.date })).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3)} />

      {/* Featured insight — magazine pull-quote */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="relative bg-gradient-to-b from-brand-card to-brand-surface border border-brand-border rounded-2xl px-6 sm:px-12 py-10 sm:py-14 overflow-hidden">
          <div className="absolute top-4 left-6 font-serif italic text-brand-gold/15 text-9xl leading-none select-none">&ldquo;</div>
          <div className="relative max-w-3xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-5 text-center">Featured Insight</p>
            <h3 className="font-serif italic text-3xl sm:text-5xl text-brand-text-primary leading-[1.1] mb-6 text-center">
              Same joke rate.<br />Ten points apart.
            </h3>
            <p className="text-base text-brand-text-secondary leading-relaxed mb-8 text-center">
              30 Rock and Broad City tell jokes at the same pace, about three and a half a minute.
              They finish more than ten points apart on the Humor Index. Across the shows on our
              current model, how well the jokes are written predicts 88% of the score. How many
              there are predicts a quarter, and nearly all of that comes from one show.
            </p>
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto mb-8 pb-8 border-b border-brand-border">
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-widest text-brand-text-muted mb-2">30 Rock</p>
                <p className="font-serif italic text-3xl sm:text-4xl text-brand-gold leading-none">97.5</p>
                <p className="text-[11px] text-brand-text-muted mt-2">3.53 jokes/min · Craft 7.68</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-widest text-brand-text-muted mb-2">Broad City</p>
                <p className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary leading-none">86.9</p>
                <p className="text-[11px] text-brand-text-muted mt-2">3.52 jokes/min · Craft 7.16</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-widest text-brand-text-muted mb-2">Gap</p>
                <p className="font-serif italic text-3xl sm:text-4xl text-brand-blue leading-none">10.6</p>
                <p className="text-[11px] text-brand-text-muted mt-2">Humor Index points</p>
              </div>
            </div>
            <div className="text-center">
              <Link href="/blog/density-vs-craft" className="text-xs uppercase tracking-widest text-brand-gold hover:underline">
                Read the analysis →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology teaser */}
      <section className="border-t border-brand-border bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-3">The Three Pillars</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary leading-tight mb-2">
            How a joke becomes a number.
          </h2>
          <p className="text-sm text-brand-text-secondary max-w-xl mb-8 leading-relaxed">
            Every score on this site is a weighted composite of three dimensions, each rated by AI on a per-joke basis.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                weight: '25%',
                label: 'Density',
                desc: 'Jokes per minute, plus the peak density of the episode’s best stretches. Rewards sustained pace and elite-tier runs.',
                color: 'text-brand-gold',
                weightColor: 'text-brand-gold',
              },
              {
                weight: '40%',
                label: 'Craft',
                desc: 'Originality, structure, character fit, economy, and earned versus cheap. Five dimensions scored 1–10, originality and structure weighted most.',
                color: 'text-brand-blue',
                weightColor: 'text-brand-blue',
              },
              {
                weight: '35%',
                label: 'Impact',
                desc: 'Quotability, rewatch value, cultural footprint, callback payoff. What turns a joke into a catchphrase.',
                color: 'text-emerald-400',
                weightColor: 'text-emerald-400',
              },
            ].map(p => (
              <div key={p.label} className="bg-brand-card border border-brand-border rounded-2xl p-6">
                <div className="flex items-baseline justify-between mb-4">
                  <p className={`font-serif italic text-2xl ${p.color}`}>{p.label}</p>
                  <p className={`font-serif italic text-3xl ${p.weightColor} leading-none`}>{p.weight}</p>
                </div>
                <p className="text-sm text-brand-text-secondary leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/methodology" className="text-xs uppercase tracking-widest text-brand-gold hover:underline">
              Full methodology →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
