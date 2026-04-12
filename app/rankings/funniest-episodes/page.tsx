import Link from 'next/link';
import { getAllShows, getEpisodes } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';

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

interface RankedEpisode {
  showName: string;
  showSlug: string;
  season: number;
  episode_number: number;
  title: string;
  humor_index: number;
  jpm: number;
  avg_craft: number;
  avg_impact: number;
  total_jokes: number;
}

export default async function FunniestEpisodesPage() {
  const shows = await getAllShows();

  const allEpisodes: RankedEpisode[] = [];
  for (const show of shows) {
    try {
      const episodes = await getEpisodes(show.slug);
      for (const ep of episodes) {
        allEpisodes.push({
          showName: show.name,
          showSlug: show.slug,
          ...ep,
        });
      }
    } catch {
      // Show doesn't have episode data yet
    }
  }

  const ranked = allEpisodes
    .filter(e => e.humor_index > 0)
    .sort((a, b) => b.humor_index - a.humor_index)
    .slice(0, 50);

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

        <div className="space-y-1">
          {ranked.map((ep, i) => (
            <Link
              key={`${ep.showSlug}-${ep.season}-${ep.episode_number}`}
              href={`/shows/${ep.showSlug}/${ep.season}/${ep.episode_number}`}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-brand-surface transition-colors group border-b border-brand-border/30"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`font-mono text-sm w-8 text-right ${
                    i < 3 ? 'text-brand-gold font-medium' : 'text-brand-text-muted'
                  }`}
                >
                  {i + 1}
                </span>
                <div>
                  <span className="text-brand-text-primary group-hover:text-brand-gold transition-colors font-medium">
                    {ep.title}
                  </span>
                  <span className="text-xs text-brand-text-muted ml-2">
                    {ep.showName} · S{ep.season}E{String(ep.episode_number).padStart(2, '0')}
                  </span>
                  <div className="flex gap-3 mt-1 text-xs text-brand-text-muted">
                    <span>{ep.total_jokes} jokes</span>
                    <span>JPM {ep.jpm.toFixed(1)}</span>
                    <span>Craft {ep.avg_craft.toFixed(1)}</span>
                    <span>Impact {ep.avg_impact.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <span
                className="font-mono text-lg font-medium"
                style={{ color: ep.humor_index >= 7.2 ? '#E8B931' : ep.humor_index >= 6.5 ? '#378ADD' : '#888780' }}
              >
                {formatIndex(ep.humor_index)}
              </span>
            </Link>
          ))}
        </div>

        {ranked.length === 0 && (
          <p className="text-brand-text-muted text-center py-12">
            No episode data available yet. Check back soon.
          </p>
        )}

        <div className="mt-12 border-t border-brand-border pt-8">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">Methodology</p>
          <p className="text-sm text-brand-text-secondary leading-relaxed max-w-2xl">
            Episodes are ranked by the Humor Index, which weights peak joke density (15%),
            effective craft score (40%), format-adjusted impact (35%), weighted jokes-per-minute (10%),
            plus a memorability bonus for highly quotable moments.{' '}
            <Link href="/methodology" className="text-brand-gold hover:underline">
              Full methodology →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
