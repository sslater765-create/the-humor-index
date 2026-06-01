import Link from 'next/link';
import { getAllShows, getComedyDna } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import CompareClient from './CompareClient';

export const metadata = {
  title: 'Compare Shows — The Humor Index',
  description: 'Head-to-head comparison of comedy show Humor Index scores.',
  alternates: {
    canonical: 'https://thehumorindex.com/compare/',
  },
  openGraph: {
    title: 'Compare Shows — The Humor Index',
    description: 'Head-to-head comparison of comedy show Humor Index scores.',
    images: ['/og-image.png'],
  },
};

export const dynamic = 'force-static';

export default async function ComparePage() {
  const shows = await getAllShows();

  // Pre-fetch Comedy DNA for every show so the client component doesn't rely on mocks.
  const dnaBySlug: Record<string, Record<string, number>> = {};
  for (const s of shows) {
    const dna = await getComedyDna(s.slug);
    if (dna && Object.keys(dna).length > 0) dnaBySlug[s.slug] = dna;
  }

  return (
    <div>
      {/* Editorial hero */}
      <section className="relative border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-gold mb-4">Head to Head</p>
          <h1 className="font-serif italic text-4xl sm:text-6xl text-brand-text-primary leading-[1.05] mb-4 max-w-3xl">
            Pick two shows.<br />
            <span className="text-brand-text-secondary">See who&apos;s actually funnier.</span>
          </h1>
          <p className="text-base sm:text-lg text-brand-text-secondary max-w-2xl leading-relaxed">
            Every two-show matchup, scored across Humor Index, jokes-per-minute, craft, and impact —
            plus a full breakdown of each show&apos;s comedy DNA. No vibes. Just numbers.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/compare/characters"
              className="text-xs px-4 py-2 rounded-full bg-brand-surface border border-brand-border hover:border-brand-gold/40 text-brand-text-secondary hover:text-brand-gold transition-colors"
            >
              Compare characters →
            </Link>
            <Link
              href="/rankings"
              className="text-xs px-4 py-2 rounded-full bg-brand-surface border border-brand-border hover:border-brand-gold/40 text-brand-text-secondary hover:text-brand-gold transition-colors"
            >
              Full rankings →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <CompareClient shows={shows} dnaBySlug={dnaBySlug} />

        {/* Static matchup grid for SEO + direct navigation */}
        <section className="mt-20 pt-12 border-t border-brand-border">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-text-muted mb-3">The Tale of the Tape</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary leading-tight mb-4 max-w-3xl">
            Every head-to-head on the index.
          </h2>
          <p className="text-base text-brand-text-secondary mb-8 max-w-2xl leading-relaxed">
            Every two-show comparison, scored across Humor Index, craft, impact, peak density, and comedy DNA. Pick your fight.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(() => {
              const scored = shows.filter(s => s.humor_index > 0);
              const pairs: Array<{ a: typeof scored[0]; b: typeof scored[0] }> = [];
              for (let i = 0; i < scored.length; i++) {
                for (let j = i + 1; j < scored.length; j++) {
                  const [a, b] = [scored[i], scored[j]].sort((x, y) => x.slug.localeCompare(y.slug));
                  pairs.push({ a, b });
                }
              }
              return pairs.map(({ a, b }) => {
                const aWins = a.humor_index >= b.humor_index;
                return (
                  <Link
                    key={`${a.slug}-${b.slug}`}
                    href={`/compare/${a.slug}-vs-${b.slug}`}
                    className="block p-4 rounded-xl bg-brand-card border border-brand-border hover:border-brand-gold/40 hover:bg-brand-surface transition-colors group"
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <span className={`font-serif italic text-base truncate mr-2 ${aWins ? 'text-brand-gold' : 'text-brand-text-secondary'} group-hover:text-brand-gold transition-colors`}>
                        {a.name}
                      </span>
                      <span className={`font-mono text-sm ${aWins ? 'text-brand-gold' : 'text-brand-text-muted'} flex-shrink-0`}>
                        {formatIndex(a.humor_index)}
                      </span>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-brand-text-muted text-center my-1">vs</div>
                    <div className="flex items-baseline justify-between">
                      <span className={`font-serif italic text-base truncate mr-2 ${!aWins ? 'text-brand-gold' : 'text-brand-text-secondary'} group-hover:text-brand-gold transition-colors`}>
                        {b.name}
                      </span>
                      <span className={`font-mono text-sm ${!aWins ? 'text-brand-gold' : 'text-brand-text-muted'} flex-shrink-0`}>
                        {formatIndex(b.humor_index)}
                      </span>
                    </div>
                  </Link>
                );
              });
            })()}
          </div>
        </section>
      </div>
    </div>
  );
}
