import Link from 'next/link';
import { getAllShows, getEpisodes } from '@/lib/data';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';
import EpisodesClient, { type RankedEpisode } from '../funniest-episodes/EpisodesClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The 50 Worst Sitcom Episodes of All Time, According to the Data',
  description:
    "Scott's Tots. The Seinfeld Chronicles. The One With Ross's Tan. Every lowest-scoring episode across The Office, Seinfeld, and Friends — ranked by our AI comedy analyst. See which episodes scored lowest on craft, impact, and joke density.",
  openGraph: {
    title: 'The 50 Worst Sitcom Episodes of All Time (Data-Driven)',
    description: "Every show has one. Here are the 50 episodes that dragged the averages down.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://thehumorindex.com/rankings/worst-episodes',
  },
};

export default async function WorstEpisodesPage() {
  const shows = await getAllShows();

  const allEpisodes: RankedEpisode[] = [];
  for (const show of shows) {
    try {
      const episodes = await getEpisodes(show.slug);
      for (const ep of episodes) {
        if (ep.humor_index <= 0) continue;
        allEpisodes.push({
          showName: show.name,
          showSlug: show.slug,
          showFormat: show.format,
          season: ep.season,
          episode_number: ep.episode_number,
          title: ep.title,
          humor_index: ep.humor_index,
          jpm: ep.jpm,
          avg_craft: ep.avg_craft,
          avg_impact: ep.avg_impact,
          total_jokes: ep.total_jokes,
          imdb_rating: ep.imdb_rating,
          percentile_in_show: ep.percentile_in_show,
          ci_95_low: ep.ci_95_low,
          ci_95_high: ep.ci_95_high,
        });
      }
    } catch {
      // Show doesn't have episode data yet
    }
  }

  // Sorted lowest-first.
  const sortedAsc = [...allEpisodes].sort((a, b) => a.humor_index - b.humor_index);

  // Main "worst overall" list — only episodes that score below 70 on display.
  // The dataset median is 75, so 70 represents a real bottom-quartile floor.
  // Anything above 70 isn't honestly "worst" — it's just below average.
  const ranked = sortedAsc.filter(ep => ep.humor_index < 70).slice(0, 50);

  // Per-show lowest — so every scored show appears even if its weakest
  // episode is above the global 70 floor.
  const worstPerShow = (() => {
    const seen = new Set<string>();
    const out: RankedEpisode[] = [];
    for (const ep of sortedAsc) {
      if (seen.has(ep.showSlug)) continue;
      seen.add(ep.showSlug);
      out.push(ep);
    }
    return out;
  })();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Worst Sitcom Episodes of All Time',
    description: 'Data-driven ranking of the lowest-scoring sitcom episodes.',
    numberOfItems: ranked.length,
    itemListElement: ranked.map((ep, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'TVEpisode',
        name: ep.title,
        episodeNumber: ep.episode_number,
        partOfSeason: { '@type': 'TVSeason', seasonNumber: ep.season },
        partOfSeries: { '@type': 'TVSeries', name: ep.showName },
      },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        label="Rankings"
        title="The Worst Sitcom Episodes of All Time"
        subtitle="The episodes that scored below the bottom-quartile floor — plus every show's individual lowest. Ranked by data, not spite."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SocialShare
            title="The 50 Worst Sitcom Episodes of All Time, Per Data"
            text="We ran every joke through an AI comedy analyst. These are the 50 lowest-scoring episodes — and #1 may hurt."
            url="/rankings/worst-episodes"
          />
        </div>

        <p className="text-sm text-brand-text-secondary mb-8 leading-relaxed max-w-2xl">
          &ldquo;Scott&rsquo;s Tots.&rdquo; &ldquo;The Seinfeld Chronicles.&rdquo; &ldquo;The One With
          Ross&rsquo;s Tan.&rdquo; Every show has episodes its own fandom would rather forget. We
          scored every joke across the canon and surfaced the ones below the bottom-quartile floor
          (display 70). The dataset median is 75, so a sub-70 score is genuinely &ldquo;dragged the
          average down&rdquo; territory. Some shows have many. A few have none.
        </p>

        <div className="mb-4 bg-brand-surface border border-brand-border rounded-lg p-4 text-xs text-brand-text-muted leading-relaxed">
          <strong className="text-brand-text-secondary">A note on fairness:</strong> Pilot episodes
          appear heavily in this list. Early episodes often establish the world before the comedy
          voice stabilizes &mdash; that&rsquo;s a structural fact of sitcoms, not a judgment of the
          show. We include them because the rankings are unfiltered; scroll the full list for
          context.
        </div>

        <EpisodesClient episodes={ranked} ascending />

        {/* Worst per show — every show represented, even those with no episode below 70 */}
        <section className="mt-16 border-t border-brand-border pt-8">
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Worst Episode Per Show</p>
          <p className="text-sm text-brand-text-secondary mb-6 leading-relaxed max-w-2xl">
            The lowest-scoring episode from every scored show, even if that episode is still above the
            global &ldquo;worst&rdquo; threshold. Notable: 30 Rock and Arrested Development have no
            episodes scoring below 70 &mdash; their floors are higher than other shows&rsquo; ceilings
            for &ldquo;bad.&rdquo;
          </p>
          <div className="space-y-2">
            {worstPerShow.map((ep, i) => (
              <Link
                key={`${ep.showSlug}-${ep.season}-${ep.episode_number}`}
                href={`/shows/${ep.showSlug}/${ep.season}/${ep.episode_number}`}
                className="flex items-center justify-between p-4 bg-brand-card border border-brand-border rounded-xl hover:border-brand-gold/40 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-xs text-brand-text-muted w-5 shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-brand-text-primary group-hover:text-brand-gold transition-colors">{ep.title}</span>
                      <span className="text-xs text-brand-text-muted">S{ep.season}E{String(ep.episode_number).padStart(2, '0')}</span>
                    </div>
                    <div className="text-xs text-brand-text-muted mt-0.5">
                      {ep.showName} &middot; {ep.total_jokes} jokes
                    </div>
                  </div>
                </div>
                <span className={`font-mono text-lg font-medium shrink-0 ml-3 ${ep.humor_index < 70 ? 'text-red-400' : 'text-brand-text-secondary'}`}>
                  {ep.humor_index.toFixed(1)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-12 border-t border-brand-border pt-8">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">Methodology</p>
          <p className="text-sm text-brand-text-secondary leading-relaxed max-w-2xl">
            Same scoring as our{' '}
            <Link href="/rankings/funniest-episodes" className="text-brand-gold hover:underline">
              funniest episodes ranking
            </Link>
            , reversed. The main &ldquo;worst overall&rdquo; list above caps at episodes scoring
            below 70 on display &mdash; the dataset median is 75, so the 70-floor represents a real
            bottom-quartile threshold. Episodes above 70 aren&rsquo;t honestly &ldquo;worst&rdquo;
            even if they&rsquo;re below their show&rsquo;s average. Low scores reflect thin joke
            density, weaker per-joke craft, or impact that didn&rsquo;t clear our replacement
            threshold.{' '}
            <Link href="/methodology" className="text-brand-gold hover:underline">
              Full methodology →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
