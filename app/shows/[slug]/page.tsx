import { notFound } from 'next/navigation';
import { getShow, getSeasons, getEpisodes } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import { MOCK_CHARACTER_DATA, SHOW_SLUGS } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import ScoreCard from '@/components/ui/ScoreCard';
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
    title: `${show.name} — The Humor Index`,
    description: `${show.name} scores ${formatIndex(show.humor_index)} on the Humor Index. ${show.description}`,
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

  return (
    <div>
      <PageHeader label="Show Analysis" title={show.name} subtitle={show.description}>
        <FormatBadge format={show.format} />
      </PageHeader>

      {/* Score cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <ScoreCard label="Humor Index" value={show.humor_index} highlight />
          <ScoreCard label="JPM" value={show.avg_jpm} sub="Jokes per minute" />
          <ScoreCard label="Craft" value={show.avg_craft} sub="Avg craft score" />
          <ScoreCard label="Impact" value={show.avg_impact} sub="Avg impact score" />
          <ScoreCard
            label="Jokes Analyzed"
            value={show.total_jokes_analyzed.toLocaleString()}
            sub={`${show.total_episodes} episodes`}
          />
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
