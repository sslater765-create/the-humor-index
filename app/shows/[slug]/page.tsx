import { notFound } from 'next/navigation';
import { getShow, getSeasons, getEpisodes } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import { MOCK_CHARACTER_DATA, SHOW_SLUGS } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import ScoreCard from '@/components/ui/ScoreCard';
import ScoreGauge from '@/components/ui/ScoreGauge';
import FormatBadge from '@/components/ui/FormatBadge';
import ShowPageClient from './ShowPageClient';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return SHOW_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) return {};
  return {
    title: `${show.name} Comedy Analysis — Humor Score ${formatIndex(show.humor_index)}/100`,
    description: `Is ${show.name} actually funny? We analyzed ${show.total_jokes_analyzed.toLocaleString()} jokes across ${show.total_seasons} seasons. Humor Index: ${formatIndex(show.humor_index)}. ${show.description}`,
    openGraph: {
      title: `${show.name} — Humor Index: ${formatIndex(show.humor_index)}`,
      description: `${show.total_jokes_analyzed.toLocaleString()} jokes analyzed across ${show.total_seasons} seasons. See the data.`,
      images: [`/api/og?title=${encodeURIComponent(show.name)}&score=${formatIndex(show.humor_index)}&subtitle=${encodeURIComponent(`${show.total_jokes_analyzed.toLocaleString()} jokes analyzed`)}`],
    },
    alternates: {
      canonical: `https://thehumorindex.com/shows/${params.slug}`,
    },
  };
}

export default async function ShowPage({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) notFound();

  const [seasons, episodes] = await Promise.all([
    getSeasons(params.slug),
    getEpisodes(params.slug),
  ]);

  const characters = MOCK_CHARACTER_DATA[params.slug as keyof typeof MOCK_CHARACTER_DATA] ?? [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: show.name,
    url: `https://thehumorindex.com/shows/${params.slug}`,
    description: show.description,
    numberOfSeasons: show.total_seasons,
    numberOfEpisodes: show.total_episodes,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: show.humor_index,
      bestRating: 100,
      worstRating: 0,
      ratingCount: show.total_jokes_analyzed,
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader label="Show Analysis" title={show.name} subtitle={show.description}>
        <FormatBadge format={show.format} />
      </PageHeader>

      {/* Score cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreGauge score={show.humor_index} size={130} label="Humor Index" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1 w-full">
            <ScoreCard label="JPM" value={show.avg_jpm} sub="Jokes per minute" />
            <ScoreCard label="Craft" value={show.avg_craft} sub="Avg craft score" />
            <ScoreCard label="Impact" value={show.avg_impact} sub="Avg impact score" />
            {show.avg_imdb_rating && (
              <ScoreCard label="IMDb" value={show.avg_imdb_rating} sub="Avg episode rating" />
            )}
            <ScoreCard
              label="Jokes Analyzed"
              value={show.total_jokes_analyzed.toLocaleString()}
              sub={`${episodes.length} episodes`}
            />
          </div>
        </div>
      </div>

      <ShowPageClient
        show={show}
        seasons={seasons}
        episodes={episodes}
        characters={characters}
      />
    </div>
  );
}
