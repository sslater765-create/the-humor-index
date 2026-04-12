import Link from 'next/link';
import { getAllShows, getEpisodes } from '@/lib/data';
import LeaderboardClient from './LeaderboardClient';

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
  const totalSeasons = analyzedShows.reduce((s, show) => s + (show.humor_index > 0 ? show.total_seasons : 0), 0);

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
      {/* Hero */}
      <section className="border-b border-brand-border bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-24">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-text-muted mb-3 sm:mb-4">
            Comedy Analytics
          </p>
          <h1 className="text-2xl sm:text-5xl font-medium text-brand-text-primary max-w-2xl leading-tight text-balance">
            The definitive science of what&apos;s funny.
          </h1>
          <p className="mt-3 sm:mt-4 text-brand-text-secondary text-sm sm:text-lg max-w-xl">
            We analyzed{' '}
            <span className="font-mono text-brand-gold">{totalEpisodesAnalyzed.toLocaleString()}</span>{' '}
            episodes,{' '}
            <span className="font-mono text-brand-gold">{totalJokes.toLocaleString()}</span>{' '}
            jokes, and{' '}
            <span className="font-mono text-brand-gold">{totalSeasons}</span>{' '}
            seasons so you don&apos;t have to argue blindly.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/shows"
              className="bg-brand-gold text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-brand-gold-dim transition-colors"
            >
              Explore all shows →
            </Link>
            <Link
              href="/methodology"
              className="border border-brand-border text-brand-text-secondary text-sm px-5 py-2.5 rounded-lg hover:border-brand-text-muted transition-colors"
            >
              How we score
            </Link>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Rankings</p>
          <h2 className="text-xl font-medium text-brand-text-primary">Top Shows</h2>
        </div>
        <LeaderboardClient shows={shows.filter(s => s.humor_index > 0)} />
      </section>

      {/* Latest analysis callouts */}
      {analyzedShows.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analyzedShows.map(show => (
              <Link
                key={show.slug}
                href={`/shows/${show.slug}`}
                className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-6 hover:border-brand-gold/40 transition-colors group block"
              >
                <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Fully Analyzed</p>
                <h3 className="text-lg font-medium text-brand-text-primary mb-1 group-hover:text-brand-gold transition-colors">{show.name}</h3>
                <p className="text-sm text-brand-text-secondary mb-3 line-clamp-2">{show.description}</p>
                <span className="text-sm text-brand-gold">
                  View full breakdown →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

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
