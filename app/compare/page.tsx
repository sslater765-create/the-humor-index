import Link from 'next/link';
import { getAllShows, getComedyDna } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import PageHeader from '@/components/layout/PageHeader';
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
      <PageHeader
        label="Head-to-Head"
        title="Compare Shows"
        subtitle="Select two shows to compare across every dimension."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-xs uppercase tracking-widest text-brand-text-muted">Also:</span>
          <Link
            href="/compare/characters"
            className="text-xs px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border hover:border-brand-gold/40 text-brand-text-secondary hover:text-brand-gold transition-colors"
          >
            Compare characters →
          </Link>
        </div>
        <CompareClient shows={shows} dnaBySlug={dnaBySlug} />

        {/* Static matchup grid for SEO + direct navigation */}
        <section className="mt-16 pt-10 border-t border-brand-border">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-4">
            Every Head-to-Head Matchup
          </p>
          <p className="text-sm text-brand-text-secondary mb-6">
            Direct links to every two-show comparison. Each page scores the matchup across Humor Index, craft, impact, peak density, and comedy DNA.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(() => {
              const scored = shows.filter(s => s.humor_index > 0);
              const pairs: Array<{ a: typeof scored[0]; b: typeof scored[0] }> = [];
              for (let i = 0; i < scored.length; i++) {
                for (let j = i + 1; j < scored.length; j++) {
                  const [a, b] = [scored[i], scored[j]].sort((x, y) => x.slug.localeCompare(y.slug));
                  pairs.push({ a, b });
                }
              }
              return pairs.map(({ a, b }) => (
                <Link
                  key={`${a.slug}-${b.slug}`}
                  href={`/compare/${a.slug}-vs-${b.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-brand-surface border border-brand-border hover:border-brand-gold/40 hover:bg-brand-card transition-colors group"
                >
                  <span className="text-sm text-brand-text-primary group-hover:text-brand-gold transition-colors truncate">
                    {a.name} vs {b.name}
                  </span>
                  <span className="font-mono text-xs text-brand-text-muted ml-2 flex-shrink-0">
                    {formatIndex(a.humor_index)} · {formatIndex(b.humor_index)}
                  </span>
                </Link>
              ));
            })()}
          </div>
        </section>
      </div>
    </div>
  );
}
