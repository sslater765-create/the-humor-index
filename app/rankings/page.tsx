import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = {
  title: 'Comedy Rankings — Funniest Episodes, Best Jokes, Show Comparisons',
  description:
    'Data-driven comedy rankings: the funniest sitcom episodes ever, the best jokes scored by AI, and head-to-head show comparisons. All based on our Humor Index methodology.',
  alternates: {
    canonical: 'https://thehumorindex.com/rankings',
  },
};

const RANKINGS = [
  {
    href: '/rankings/funniest-episodes',
    title: 'The Funniest Episodes of All Time',
    description: 'Every analyzed episode ranked by Humor Index score. The definitive list.',
    stat: 'Episodes ranked',
  },
  {
    href: '/rankings/best-jokes',
    title: 'The Best Jokes Ever Written',
    description: 'The highest-scoring individual jokes across all shows, ranked by craft + impact.',
    stat: 'Jokes scored',
  },
  {
    href: '/rankings/funniest-characters',
    title: 'The Funniest Characters of All Time',
    description: 'Which characters deliver the best jokes? Ranked by average craft + impact across all appearances.',
    stat: 'Characters ranked',
  },
  {
    href: '/compare/the-office-vs-seinfeld',
    title: 'The Office vs Seinfeld',
    description: 'The two most debated sitcoms go head-to-head. Which one is actually funnier?',
    stat: 'Head-to-head',
  },
  {
    href: '/search',
    title: 'Search Every Joke',
    description: 'Find any joke, character, or moment across every analyzed episode. Full-text search with type filtering.',
    stat: 'Search',
  },
];

export default function RankingsPage() {
  return (
    <div>
      <PageHeader
        label="Rankings"
        title="Comedy Rankings"
        subtitle="Every list is generated from real data. No opinions, no fan votes — just analyzed jokes."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="space-y-4">
          {RANKINGS.map(r => (
            <Link
              key={r.href}
              href={r.href}
              className="block bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-gold transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">{r.stat}</p>
                  <h2 className="text-lg font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mb-1">
                    {r.title}
                  </h2>
                  <p className="text-sm text-brand-text-secondary">{r.description}</p>
                </div>
                <span className="text-brand-text-muted group-hover:text-brand-gold transition-colors text-xl">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
