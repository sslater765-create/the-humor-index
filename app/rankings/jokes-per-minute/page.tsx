import Link from 'next/link';
import { getAllShows } from '@/lib/data';
import { getMovies, shortTitle } from '@/lib/movies';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { SITE_URL } from '@/lib/site';
import { rankable } from '@/lib/scale';
import ScaleNote from '@/components/ui/ScaleNote';

export const dynamic = 'force-static';

async function rankedByJpm() {
  return rankable(await getAllShows())
    .filter(s => (s.humor_index || 0) > 0 && (s.avg_jpm || 0) > 0)
    .sort((a, b) => (b.avg_jpm || 0) - (a.avg_jpm || 0));
}

// Built from live data so the snippet Google shows never goes stale
// (it said "9 shows" long after the board had grown).
function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export async function generateMetadata() {
  const shows = await rankedByJpm();
  const first = shows[0];
  const last = shows[shows.length - 1];
  const description = `Which sitcom has the most jokes per minute? We counted and scored every joke across ${shows.length} shows. ${first ? `${first.name} leads at ${(first.avg_jpm || 0).toFixed(2)} a minute` : ''}${last && last !== first ? `; ${last.name} is last at ${(last.avg_jpm || 0).toFixed(2)}` : ''}. See the full ranking.`;
  return {
    title: 'Jokes Per Minute: Every Sitcom Ranked by Joke Density',
    description,
    openGraph: {
      title: 'Jokes Per Minute: Every Sitcom Ranked by Joke Density',
      description: `We counted every joke in ${shows.length} sitcoms. Here is the jokes-per-minute ranking.`,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `${SITE_URL}/rankings/jokes-per-minute/`,
    },
  };
}

export default async function JokesPerMinutePage() {
  const movies = await getMovies();
  const shows = await rankedByJpm();

  const leader = shows[0];
  const rock30Jpm = (shows.find(s => s.slug === '30-rock')?.avg_jpm ?? 0).toFixed(2);
  // The show whose overall rank most outruns its joke density: the live example
  // for "density isn't quality".
  const byHi = [...shows].sort((a, b) => b.humor_index - a.humor_index);
  const hiRankOf = (slug: string) => byHi.findIndex(s => s.slug === slug) + 1;
  const sparse = shows
    .map((s, i) => ({ ...s, jpmRank: i + 1, hiRank: hiRankOf(s.slug) }))
    .sort((a, b) => (b.jpmRank - b.hiRank) - (a.jpmRank - a.hiRank))[0];
  const leaderHiRank = leader ? hiRankOf(leader.slug) : 0;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Sitcoms Ranked by Jokes Per Minute',
      description: 'Sitcoms ranked by average jokes per minute, measured by scoring every joke.',
      itemListElement: shows.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${s.name}: ${(s.avg_jpm || 0).toFixed(2)} jokes per minute`,
        url: `${SITE_URL}/shows/${s.slug}`,
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
            text: `Of the shows we've fully scored, ${leader?.name} has the highest joke density at ${(leader?.avg_jpm || 0).toFixed(2)} jokes per minute — counting distinct, identifiable jokes rather than every laugh-track beat.`,
          },
        },
        {
          '@type': 'Question',
          name: 'How many jokes per minute does 30 Rock have?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: `30 Rock averages ${rock30Jpm} distinct scored jokes per minute on the Humor Index. The widely-cited "7.44 jokes per minute" figure counts every comedic line and reaction; we count separable, gradeable jokes, which is a stricter and more comparable measure.`,
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
        subtitle={`Which sitcom packs the most jokes into every minute? We scored every joke across ${shows.length} shows and measured the density. Here's the ranking.`}
      />
      <ScaleNote narrow />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SocialShare
            title="Sitcoms Ranked by Jokes Per Minute"
            text={`We counted every joke in ${shows.length} sitcoms. Here's the jokes-per-minute ranking.`}
            url="/rankings/jokes-per-minute"
          />
        </div>

        <p className="text-sm text-brand-text-secondary mb-8 leading-relaxed max-w-2xl">
          Jokes per minute (JPM) is the simplest measure of comedy density: how many distinct jokes a
          show lands in each minute of runtime. We detected and scored every joke across{' '}
          {shows.length} fully-analyzed sitcoms — {leader?.name} comes out on top at{' '}
          <strong className="text-brand-text-primary">{(leader?.avg_jpm || 0).toFixed(2)} jokes per minute</strong>.
          Density isn&rsquo;t the same as quality (our <Link href="/rankings" className="text-brand-gold hover:underline">Humor Index</Link>{' '}
          weighs craft and impact too), but it&rsquo;s the stat people argue about most.
        </p>

        <div className="space-y-2">
          {shows.map((s, i) => (
            <div
              key={s.slug}
              className="flex items-center gap-4 p-4 bg-brand-card border border-brand-border rounded-xl hover:border-brand-gold/40 transition-colors group"
            >
              <span className={`font-mono text-sm w-8 text-right ${i < 3 ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <Link href={`/shows/${s.slug}`} className="text-brand-text-primary font-medium hover:text-brand-gold transition-colors">
                  {s.name}
                </Link>
                <div className="text-xs text-brand-text-muted mt-0.5">
                  {s.total_jokes_analyzed.toLocaleString()} jokes across {s.total_episodes} episodes
                  {' · '}
                  <Link href={`/shows/${s.slug}/best-jokes`} className="text-brand-text-secondary hover:text-brand-gold transition-colors">
                    funniest quotes
                  </Link>
                  {' · '}
                  <Link href={`/shows/${s.slug}/episodes-ranked`} className="text-brand-text-secondary hover:text-brand-gold transition-colors">
                    episodes ranked
                  </Link>
                </div>
                <div className="relative h-1.5 mt-2 bg-brand-surface rounded-full overflow-hidden max-w-md">
                  <div className="absolute h-full rounded-full bg-brand-gold/70" style={{ width: `${((s.avg_jpm || 0) / maxJpm) * 100}%` }} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-lg text-brand-gold font-medium">{(s.avg_jpm || 0).toFixed(2)}</span>
                <div className="text-[11px] text-brand-text-muted uppercase tracking-widest">jokes / min</div>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-12 border-t border-brand-border pt-8 space-y-4 max-w-2xl">
          <div>
            <h2 className="text-lg font-medium text-brand-text-primary mb-2">Why our numbers are lower than the famous &ldquo;7.44&rdquo;</h2>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              You may have seen the figure that 30 Rock runs at 7.44 jokes per minute. That count
              (popularized by a 2014 Atlantic piece) tallies every comedic line, reaction, and
              background gag. We count something stricter: distinct, separable jokes a viewer could
              point to and grade. Our 30 Rock number is <strong className="text-brand-text-primary">{rock30Jpm}</strong> — lower, but
              applied identically to every show, which is what makes the ranking a fair comparison
              rather than a pile of incompatible counts. Read more on{' '}
              <Link href="/methodology" className="text-brand-gold hover:underline">our methodology</Link>.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-brand-text-primary mb-2">Density vs. quality</h2>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              The densest show isn&rsquo;t automatically the funniest. {sparse.name} is{' '}
              {ordinal(sparse.jpmRank)} of {shows.length} for jokes per minute ({(sparse.avg_jpm || 0).toFixed(2)}) yet{' '}
              {ordinal(sparse.hiRank)} on the overall{' '}
              <Link href="/rankings" className="text-brand-gold hover:underline">Humor Index</Link> — it
              tells fewer jokes, but each one is doing more work. {leader?.name} tells the most and ranks{' '}
              {ordinal(leaderHiRank)}. Joke density is one axis; craft and impact are the others.
            </p>
          </div>
        </section>

        {movies.length > 0 && (
          <section className="mt-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-1">Movies</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-brand-text-primary">Jokes per minute in comedy movies</h2>
            <p className="text-sm text-brand-text-secondary mt-1 mb-4 max-w-2xl">
              Counted the same way, over each film&rsquo;s real running time. Movies spend minutes on plot, so they run sparser than sitcoms and are ranked on their own.
            </p>
            <div className="rounded-2xl border border-brand-border overflow-hidden">
              {[...movies].sort((a, b) => b.avg_jpm - a.avg_jpm).map((m, i) => (
                <Link key={m.slug} href={`/movies/${m.slug}`} className="flex items-center gap-4 px-4 py-3 border-b border-brand-border last:border-0 bg-brand-card hover:bg-brand-surface transition-colors">
                  <span className="font-mono text-sm text-brand-text-muted w-6">{i + 1}</span>
                  <span className="flex-1 text-brand-text-primary truncate">{shortTitle(m.title)} <span className="text-brand-text-muted">({m.year})</span></span>
                  <span className="text-xs text-brand-text-muted hidden sm:block">{m.total_jokes} jokes in {m.runtime_minutes} min</span>
                  <span className="font-mono text-lg text-brand-gold w-14 text-right">{m.avg_jpm.toFixed(2)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
