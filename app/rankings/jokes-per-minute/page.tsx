import Link from 'next/link';
import { getAllShows } from '@/lib/data';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Jokes Per Minute: Every Sitcom Ranked by Joke Density',
  description:
    'Which sitcom has the most jokes per minute? We counted and scored every joke across 9 shows. See the full jokes-per-minute ranking — from Friends and 30 Rock down to Arrested Development.',
  openGraph: {
    title: 'Jokes Per Minute — Every Sitcom Ranked by Joke Density',
    description: 'We counted every joke in 9 sitcoms. Here is the definitive jokes-per-minute ranking.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://thehumorindex.com/rankings/jokes-per-minute/',
  },
};

export default async function JokesPerMinutePage() {
  const shows = (await getAllShows())
    .filter(s => (s.humor_index || 0) > 0 && (s.avg_jpm || 0) > 0)
    .sort((a, b) => (b.avg_jpm || 0) - (a.avg_jpm || 0));

  const leader = shows[0];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Sitcoms Ranked by Jokes Per Minute',
      description: 'Sitcoms ranked by average jokes per minute, measured by scoring every joke.',
      itemListElement: shows.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${s.name} — ${s.avg_jpm} jokes per minute`,
        url: `https://thehumorindex.com/shows/${s.slug}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Which sitcom has the most jokes per minute?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Of the shows we've fully scored, ${leader?.name} has the highest joke density at ${leader?.avg_jpm} jokes per minute — counting distinct, identifiable jokes rather than every laugh-track beat.`,
          },
        },
        {
          '@type': 'Question',
          name: 'How many jokes per minute does 30 Rock have?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '30 Rock averages 2.86 distinct scored jokes per minute on the Humor Index. The widely-cited "7.44 jokes per minute" figure counts every comedic line and reaction; we count separable, gradeable jokes, which is a stricter and more comparable measure.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is jokes per minute measured?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We run every episode transcript through an AI comedy analyst that detects each distinct joke, then divide total jokes by runtime. The same method is applied to every show so the numbers are directly comparable.',
          },
        },
      ],
    },
  ];

  const maxJpm = leader?.avg_jpm || 1;

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Rankings', path: '/rankings' },
          { name: 'Jokes Per Minute', path: '/rankings/jokes-per-minute' },
        ]}
      />
      <PageHeader
        label="Rankings"
        title="Jokes Per Minute, Ranked"
        subtitle="Which sitcom packs the most jokes into every minute? We scored every joke across 9 shows and measured the density. Here's the ranking."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SocialShare
            title="Sitcoms Ranked by Jokes Per Minute"
            text="We counted every joke in 9 sitcoms. Here's the definitive jokes-per-minute ranking."
            url="/rankings/jokes-per-minute"
          />
        </div>

        <p className="text-sm text-brand-text-secondary mb-8 leading-relaxed max-w-2xl">
          Jokes per minute (JPM) is the simplest measure of comedy density: how many distinct jokes a
          show lands in each minute of runtime. We detected and scored every joke across{' '}
          {shows.length} fully-analyzed sitcoms — {leader?.name} comes out on top at{' '}
          <strong className="text-brand-text-primary">{leader?.avg_jpm} jokes per minute</strong>.
          Density isn&rsquo;t the same as quality (our <Link href="/rankings" className="text-brand-gold hover:underline">Humor Index</Link>{' '}
          weighs craft and impact too), but it&rsquo;s the stat people argue about most.
        </p>

        <div className="space-y-2">
          {shows.map((s, i) => (
            <Link
              key={s.slug}
              href={`/shows/${s.slug}`}
              className="flex items-center gap-4 p-4 bg-brand-card border border-brand-border rounded-xl hover:border-brand-gold/40 transition-colors group"
            >
              <span className={`font-mono text-sm w-8 text-right ${i < 3 ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-brand-text-primary font-medium group-hover:text-brand-gold transition-colors">
                  {s.name}
                </div>
                <div className="text-xs text-brand-text-muted mt-0.5">
                  {s.total_jokes_analyzed.toLocaleString()} jokes across {s.total_episodes} episodes
                </div>
                <div className="relative h-1.5 mt-2 bg-brand-surface rounded-full overflow-hidden max-w-md">
                  <div className="absolute h-full rounded-full bg-brand-gold/70" style={{ width: `${((s.avg_jpm || 0) / maxJpm) * 100}%` }} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-lg text-brand-gold font-medium">{s.avg_jpm}</span>
                <div className="text-[10px] text-brand-text-muted uppercase tracking-widest">jokes / min</div>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-12 border-t border-brand-border pt-8 space-y-4 max-w-2xl">
          <div>
            <h2 className="text-lg font-medium text-brand-text-primary mb-2">Why our numbers are lower than the famous &ldquo;7.44&rdquo;</h2>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              You may have seen the figure that 30 Rock runs at 7.44 jokes per minute. That count
              (popularized by a 2014 Atlantic piece) tallies every comedic line, reaction, and
              background gag. We count something stricter: distinct, separable jokes a viewer could
              point to and grade. Our 30 Rock number is <strong className="text-brand-text-primary">2.86</strong> — lower, but
              applied identically to every show, which is what makes the ranking a fair comparison
              rather than a pile of incompatible counts. Read more on{' '}
              <Link href="/methodology" className="text-brand-gold hover:underline">our methodology</Link>.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-brand-text-primary mb-2">Density vs. quality</h2>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              The densest show isn&rsquo;t automatically the funniest. Arrested Development has the
              lowest JPM here yet ranks near the top of our overall{' '}
              <Link href="/rankings" className="text-brand-gold hover:underline">Humor Index</Link> — it
              tells fewer jokes, but each one is doing far more work. Joke density is one axis; craft
              and impact are the others.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
