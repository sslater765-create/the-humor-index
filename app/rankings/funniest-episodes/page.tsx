import Link from 'next/link';
import { getAllShows, getEpisodes } from '@/lib/data';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';
import EpisodesClient, { type RankedEpisode } from './EpisodesClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The 50 Funniest Sitcom Episodes of All Time, Ranked by Data',
  description:
    'We analyzed thousands of jokes across dozens of shows to rank the funniest sitcom episodes ever made. No opinions — just data. See which episodes scored highest on craft, impact, and joke density.',
  openGraph: {
    title: 'The 50 Funniest Sitcom Episodes, Ranked by AI Analysis',
    description: 'Every joke scored. Every episode ranked. The definitive list.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://thehumorindex.com/rankings/funniest-episodes',
  },
};

export default async function FunniestEpisodesPage() {
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

  const ranked = [...allEpisodes].sort((a, b) => b.humor_index - a.humor_index).slice(0, 50);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Funniest Sitcom Episodes of All Time',
    description: 'Data-driven ranking of the funniest sitcom episodes.',
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
        title="The Funniest Sitcom Episodes of All Time"
        subtitle="Every joke analyzed. Every episode ranked. No opinions — just data."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SocialShare
            title="The 50 Funniest Sitcom Episodes, Ranked by Data"
            text="We analyzed thousands of jokes to rank the funniest sitcom episodes ever. #1 might surprise you."
            url="/rankings/funniest-episodes"
          />
        </div>

        <p className="text-sm text-brand-text-secondary mb-8 leading-relaxed max-w-2xl">
          We fed every line of dialogue through our AI comedy analyst, which scored each joke on
          craft (originality, structure, character integration) and impact (audience reaction).
          The Humor Index combines joke density, craft quality, peak moments, and memorability
          into a single score. Here are the episodes that came out on top.
        </p>

        <EpisodesClient episodes={ranked} />

        <div className="mt-12 border-t border-brand-border pt-8">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">Methodology</p>
          <p className="text-sm text-brand-text-secondary leading-relaxed max-w-2xl">
            Episodes are ranked by the Humor Index, which weights peak joke density (15%),
            effective craft score (40%), raw impact (35%), weighted jokes-per-minute (10%),
            plus a memorability bonus for highly quotable moments. Scores include a 95% bootstrap
            confidence interval (±) and a show-relative percentile.{' '}
            <Link href="/methodology" className="text-brand-gold hover:underline">
              Full methodology →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
