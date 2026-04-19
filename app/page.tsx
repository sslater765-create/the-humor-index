import Link from 'next/link';
import { getAllShows, getEpisodes } from '@/lib/data';
import LeaderboardClient from './LeaderboardClient';
import WhatsNewPersonalized from '@/components/ui/WhatsNewPersonalized';

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
      {/* Hero — the leaderboard IS the hero */}
      <section className="border-b border-brand-border bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-text-muted mb-3">
            Comedy Analytics
          </p>
          <h1 className="text-2xl sm:text-4xl font-medium text-brand-text-primary max-w-3xl leading-tight text-balance mb-3">
            The science of what&apos;s funny.
          </h1>
          <p className="text-brand-text-secondary text-sm sm:text-base max-w-xl mb-8">
            <span className="font-mono text-brand-gold">{totalEpisodesAnalyzed.toLocaleString()}</span> episodes,{' '}
            <span className="font-mono text-brand-gold">{totalJokes.toLocaleString()}</span> jokes, scored by AI.{' '}
            <Link href="/methodology" className="text-brand-text-muted hover:text-brand-gold underline underline-offset-2 decoration-brand-border decoration-1">
              How we score
            </Link>
            .
          </p>
          {/* Leaderboard moved into hero */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-4 sm:p-6">
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-gold mb-0.5">Rankings</p>
                <h2 className="text-lg sm:text-xl font-medium text-brand-text-primary">Top Shows</h2>
              </div>
              <Link href="/shows" className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors">
                All shows →
              </Link>
            </div>
            <LeaderboardClient shows={shows.filter(s => s.humor_index > 0)} />
          </div>
        </div>
      </section>

      {/* Latest analysis callouts */}
      {analyzedShows.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analyzedShows.map(show => (
              <Link
                key={show.slug}
                href={`/shows/${show.slug}`}
                className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-5 hover:border-brand-gold/40 transition-colors group block"
              >
                <p className="text-xs uppercase tracking-widest text-brand-gold mb-1">Fully Analyzed</p>
                <h3 className="text-lg font-medium text-brand-text-primary mb-1 group-hover:text-brand-gold transition-colors">{show.name}</h3>
                <p className="text-sm text-brand-text-secondary mb-2 line-clamp-2">{show.description}</p>
                <span className="text-sm text-brand-gold">
                  View full breakdown →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* What's New — personalized for return visitors */}
      <WhatsNewPersonalized />

      {/* Featured insight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-3">Featured Insight</p>
          <h3 className="text-xl sm:text-2xl font-medium text-brand-text-primary mb-3">
            Better jokes don&apos;t always mean a funnier show.
          </h3>
          <p className="text-sm text-brand-text-secondary leading-relaxed mb-4 max-w-2xl">
            Seinfeld beats The Office on per-joke craft and on impact.
            But The Office edges ahead on our Humor Index. Why? Because the Humor Index
            rewards consistency and peak density — reaching elite comedy without dropping
            below average. A show with fewer weak episodes beats one with higher highs
            but more clunkers. The gap is small: the top three shows cluster within
            1.5 points, well inside each other&apos;s 95% credible intervals.
          </p>
          <div className="flex flex-wrap gap-6 mb-5">
            <div>
              <p className="text-xs text-brand-text-muted mb-1">The Office</p>
              <p className="font-mono text-2xl text-brand-gold">80.2</p>
              <p className="text-[10px] text-brand-text-muted">Craft 6.91 · Impact 6.72</p>
            </div>
            <div>
              <p className="text-xs text-brand-text-muted mb-1">Seinfeld</p>
              <p className="font-mono text-2xl text-brand-text-primary">79.1</p>
              <p className="text-[10px] text-brand-text-muted">Craft 7.15 · Impact 6.44</p>
            </div>
            <div>
              <p className="text-xs text-brand-text-muted mb-1">Craft Gap</p>
              <p className="font-mono text-2xl text-blue-400">+0.24</p>
              <p className="text-[10px] text-brand-text-muted">Seinfeld higher per joke</p>
            </div>
          </div>
          <Link href="/blog/seinfeld-vs-the-office" className="text-sm text-brand-gold hover:underline">
            Read the full analysis →
          </Link>
        </div>
      </section>

      {/* Methodology teaser */}
      <section className="border-t border-brand-border bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-6">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                abbr: 'JPM',
                label: 'Jokes Per Minute',
                desc: 'Raw comedic density — how many distinct jokes land per minute of runtime. Weighted by episode length.',
                color: '#E8B931',
              },
              {
                abbr: 'Craft',
                label: 'Craft Score',
                desc: 'Five-dimension rubric: setup quality, misdirection, subversion, character fit, and timing. Scored 1–10.',
                color: '#378ADD',
              },
              {
                abbr: 'Impact',
                label: 'Impact Score',
                desc: 'Audience resonance — quotability, rewatch value, cultural staying power, and callback payoff.',
                color: '#1D9E75',
              },
            ].map(p => (
              <div key={p.abbr} className="bg-brand-card border border-brand-border rounded-xl p-5">
                <p className="font-mono text-2xl mb-2" style={{ color: p.color }}>{p.abbr}</p>
                <p className="text-sm font-medium text-brand-text-primary mb-2">{p.label}</p>
                <p className="text-xs text-brand-text-secondary leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/methodology" className="text-sm text-brand-text-muted hover:text-brand-gold transition-colors">
              Full methodology →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
