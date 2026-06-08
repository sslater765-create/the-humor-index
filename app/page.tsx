import Link from 'next/link';
import Image from 'next/image';
import { getAllShows, getEpisodes } from '@/lib/data';
import LeaderboardClient from './LeaderboardClient';
import WhatsNewPersonalized from '@/components/ui/WhatsNewPersonalized';
import HeroLoop from '@/components/HeroLoop';

export const dynamic = 'force-static';

export default async function HomePage() {
  const shows = await getAllShows();

  const analyzedShows = shows.filter(s => s.humor_index > 0);
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
    url: 'https://thehumorindex.com',
    description: 'AI-powered comedy analytics ranking every joke in television history.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://thehumorindex.com/shows?q={search_term_string}',
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
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-brand-gold mb-5">
                Comedy, Quantified
              </p>
              <h1 className="font-serif italic text-4xl sm:text-7xl text-brand-text-primary leading-[1.02] mb-5">
                Every sitcom joke,<br />
                <span className="text-brand-text-secondary">scored and ranked.</span>
              </h1>
              <p className="text-base sm:text-xl text-brand-text-secondary max-w-2xl leading-relaxed">
                The science of what&apos;s funny — AI reads every transcript, rates every laugh on a five-axis rubric,
                and we publish the receipts.
              </p>
              <p className="text-base sm:text-lg text-brand-text-muted max-w-2xl leading-relaxed mt-4">
                No laugh tracks, no nostalgia — every show measured the same way, so the comparisons are fair.
                Browse the rankings, compare any two shows, or dig into a single episode&apos;s funniest moments.
              </p>

              {/* Big numbers — magazine cover stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mt-10 lg:mt-auto lg:pt-8">
                <div>
                  <p className="font-serif italic text-3xl sm:text-5xl text-brand-gold leading-none">
                    {analyzedShows.length}
                  </p>
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-text-muted mt-2">Shows scored</p>
                </div>
                <div>
                  <p className="font-serif italic text-3xl sm:text-5xl text-brand-gold leading-none">
                    {totalEpisodesAnalyzed.toLocaleString()}
                  </p>
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-text-muted mt-2">Episodes analyzed</p>
                </div>
                <div>
                  <p className="font-serif italic text-3xl sm:text-5xl text-brand-gold leading-none">
                    {totalJokes.toLocaleString()}
                  </p>
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-text-muted mt-2">Jokes rated</p>
                </div>
              </div>
            </div>
            <HeroLoop className="w-full max-w-[380px] mx-auto lg:mx-0" />
          </div>

          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-text-muted mb-6 pt-10 border-t border-brand-border">
            As of {asOf} ·{' '}
            <Link href="/methodology" className="text-brand-gold hover:underline">
              How we score
            </Link>
          </p>

          {/* Leaderboard */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-7">
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-1">The Index</p>
                <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary leading-tight">
                  Top shows on the leaderboard.
                </h2>
              </div>
              <Link href="/rankings" className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors shrink-0 ml-3">
                Full rankings →
              </Link>
            </div>
            <LeaderboardClient shows={shows.filter(s => s.humor_index > 0)} />
          </div>
        </div>
      </section>

      {/* Comedy DNA teaser — flagship interactive, magazine cover treatment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <Link
          href="/comedy-dna"
          className="group block relative bg-gradient-to-br from-brand-gold/10 via-brand-card to-brand-card border border-brand-gold/30 rounded-2xl px-6 sm:px-10 py-8 sm:py-12 hover:border-brand-gold/60 transition-colors overflow-hidden"
        >
          <div className="absolute top-5 right-7 font-serif italic text-brand-gold/15 text-8xl leading-none select-none">&ldquo;</div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Editor&apos;s Pick · Interactive</p>
              <h2 className="font-serif italic text-3xl sm:text-5xl text-brand-text-primary leading-tight mb-3 group-hover:text-brand-gold transition-colors">
                What&apos;s your<br className="hidden sm:block" /> Comedy DNA?
              </h2>
              <p className="text-sm sm:text-base text-brand-text-secondary leading-relaxed">
                Pick which joke is funnier — about 18 times. We&apos;ll map your comedy archetype
                and the shows built for your taste, drawn from{' '}
                <span className="text-brand-text-primary font-medium">{totalJokes.toLocaleString()} scored jokes</span>.
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-brand-gold text-brand-dark font-medium px-6 py-3.5 text-sm hover:bg-brand-gold-dim transition-colors">
              Find your type →
            </span>
          </div>
        </Link>
      </section>

      {/* Latest analysis callouts */}
      {analyzedShows.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">The Catalog</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary leading-tight mb-2">
            Every show, fully analyzed.
          </h2>
          <p className="text-sm text-brand-text-secondary max-w-xl mb-8 leading-relaxed">
            {analyzedShows.length} shows scored end-to-end. Tap in for the full breakdown — every episode, every joke, every character.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {analyzedShows.map(show => (
              <Link
                key={show.slug}
                href={`/shows/${show.slug}`}
                className="relative bg-brand-card border border-brand-border rounded-2xl overflow-hidden hover:border-brand-gold/40 transition-colors group block"
              >
                {show.backdrop_path && (
                  <div className="relative h-36 w-full">
                    <Image
                      src={`https://image.tmdb.org/t/p/w780${show.backdrop_path}`}
                      alt={show.name}
                      fill
                      className="object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/60 to-transparent" />
                    <div className="absolute bottom-3 right-4 font-serif italic text-2xl text-brand-gold drop-shadow-md">
                      {show.humor_index.toFixed(1)}
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-2">Fully Scored</p>
                  <h3 className="font-serif italic text-xl text-brand-text-primary mb-2 group-hover:text-brand-gold transition-colors leading-tight">{show.name}</h3>
                  <p className="text-sm text-brand-text-secondary mb-3 line-clamp-2 leading-relaxed">{show.description}</p>
                  <span className="text-xs uppercase tracking-widest text-brand-gold">
                    Full breakdown →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* What's New — personalized for return visitors */}
      <WhatsNewPersonalized />

      {/* Featured insight — magazine pull-quote */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="relative bg-gradient-to-b from-brand-card to-brand-surface border border-brand-border rounded-2xl px-6 sm:px-12 py-10 sm:py-14 overflow-hidden">
          <div className="absolute top-4 left-6 font-serif italic text-brand-gold/15 text-9xl leading-none select-none">&ldquo;</div>
          <div className="relative max-w-3xl mx-auto">
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-5 text-center">Featured Insight</p>
            <h3 className="font-serif italic text-3xl sm:text-5xl text-brand-text-primary leading-[1.1] mb-6 text-center">
              Better jokes don&apos;t always<br />mean a funnier show.
            </h3>
            <p className="text-base text-brand-text-secondary leading-relaxed mb-8 text-center">
              Seinfeld beats The Office on per-joke craft and on impact.
              But The Office edges ahead on our Humor Index — because the index rewards
              consistency and peak density. A show with fewer weak episodes beats one with
              higher highs but more clunkers. And the gap that matters is small: from The Office
              down, the chasing pack sits inside each other&apos;s 95% intervals.
            </p>
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto mb-8 pb-8 border-b border-brand-border">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-2">The Office</p>
                <p className="font-serif italic text-3xl sm:text-4xl text-brand-gold leading-none">79.2</p>
                <p className="text-[10px] text-brand-text-muted mt-2">Craft 6.87 · Impact 6.67</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-2">Seinfeld</p>
                <p className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary leading-none">77.0</p>
                <p className="text-[10px] text-brand-text-muted mt-2">Craft 7.15 · Impact 6.44</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mb-2">Craft Gap</p>
                <p className="font-serif italic text-3xl sm:text-4xl text-brand-blue leading-none">+0.28</p>
                <p className="text-[10px] text-brand-text-muted mt-2">Seinfeld higher per joke</p>
              </div>
            </div>
            <div className="text-center">
              <Link href="/blog/seinfeld-vs-the-office" className="text-xs uppercase tracking-widest text-brand-gold hover:underline">
                Read the full analysis →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology teaser */}
      <section className="border-t border-brand-border bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">The Three Pillars</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary leading-tight mb-2">
            How a joke becomes a number.
          </h2>
          <p className="text-sm text-brand-text-secondary max-w-xl mb-8 leading-relaxed">
            Every score on this site is a weighted composite of three dimensions, each rated by Claude on a per-joke basis.
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
                desc: 'Setup quality, misdirection, subversion, character fit, timing. Five dimensions, equally weighted, scored 1–10.',
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
