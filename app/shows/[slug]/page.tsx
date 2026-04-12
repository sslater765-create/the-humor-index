import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getShow, getSeasons, getEpisodes, getCharacters } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import { SHOW_SLUGS } from '@/lib/constants';
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

  const [seasons, episodes, realCharacters] = await Promise.all([
    getSeasons(params.slug),
    getEpisodes(params.slug),
    getCharacters(params.slug),
  ]);

  // Map real character data to CharacterStats format for charts
  const characters = realCharacters.slice(0, 15).map(c => ({
    name: c.name,
    total_jokes: c.total_jokes,
    avg_craft: c.avg_craft,
    avg_impact: c.avg_impact,
    jpm: 0,
    screen_time_minutes: c.episodes_appeared * 22,
    dominant_types: c.dominant_types,
  }));

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
      {/* Hero section with backdrop */}
      <div className="relative w-full h-[280px] sm:h-[360px] overflow-hidden">
        {show.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w1280${show.backdrop_path}`}
            alt={`${show.name} backdrop`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-brand-surface" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-dark/30" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 pb-6">
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Show Analysis</p>
          <h1 className="text-3xl sm:text-4xl font-medium text-brand-text-primary mb-2">{show.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <FormatBadge format={show.format} />
            {show.network && (
              <span className="text-xs bg-brand-surface/80 border border-brand-border rounded-full px-2.5 py-0.5 text-brand-text-secondary">
                {show.network}
              </span>
            )}
            {show.aired && (
              <span className="text-xs text-brand-text-muted">{show.aired}</span>
            )}
            {show.genres?.map(g => (
              <span key={g} className="text-xs text-brand-text-muted bg-brand-surface/60 rounded px-1.5 py-0.5">
                {g}
              </span>
            ))}
          </div>
          {show.created_by && show.created_by.length > 0 && (
            <p className="text-xs text-brand-text-muted mb-1">
              Created by <span className="text-brand-text-secondary">{show.created_by.join(', ')}</span>
            </p>
          )}
          {show.stars && show.stars.length > 0 && (
            <p className="text-xs text-brand-text-muted">
              Starring <span className="text-brand-text-secondary">{show.stars.join(', ')}</span>
            </p>
          )}
        </div>
      </div>

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
        characterProfiles={realCharacters}
      />
    </div>
  );
}
