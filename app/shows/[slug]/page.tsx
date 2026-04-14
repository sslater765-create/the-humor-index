import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getShow, getSeasons, getEpisodes, getCharacters, getRecommendations, getAllShows, getComedyDna } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import { SHOW_SLUGS } from '@/lib/constants';
import ScoreCard from '@/components/ui/ScoreCard';
import ScoreGauge from '@/components/ui/ScoreGauge';
import FormatBadge from '@/components/ui/FormatBadge';
import InlineNewsletterCTA from '@/components/ui/InlineNewsletterCTA';
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

  const [seasons, episodes, realCharacters, recommendations, allShows, comedyDna] = await Promise.all([
    getSeasons(params.slug),
    getEpisodes(params.slug),
    getCharacters(params.slug),
    getRecommendations(params.slug),
    getAllShows(),
    getComedyDna(params.slug),
  ]);

  // Map real character data to CharacterStats format for charts
  const characters = realCharacters.slice(0, 15).map(c => ({
    name: c.name,
    total_jokes: c.total_jokes,
    avg_craft: c.avg_craft,
    avg_impact: c.avg_impact,
    jpm: c.avg_impact,
    screen_time_minutes: Math.round(Math.sqrt(c.total_jokes) * 5),
    dominant_types: c.dominant_types,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: show.name,
    url: `https://thehumorindex.com/shows/${params.slug}`,
    description: show.description,
    image: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : undefined,
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
      <div className="relative w-full aspect-video max-h-[70vh] overflow-hidden">
        {show.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
            alt={`${show.name} backdrop`}
            fill
            className="object-contain object-top"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-surface" />
        )}
        {/* Gradient overlay — keeps text readable, lets image breathe */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgb(15,15,15) 10%, rgba(15,15,15,0.6) 25%, rgba(15,15,15,0.1) 40%, transparent 60%)' }} />

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
          <div className="relative flex-1 w-full">
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 sm:pb-0 sm:grid sm:grid-cols-5 sm:overflow-visible">
              <div className="min-w-[140px] snap-start sm:min-w-0"><ScoreCard label="JPM" value={show.avg_jpm} sub="Jokes per minute" /></div>
              <div className="min-w-[140px] snap-start sm:min-w-0"><ScoreCard label="Craft" value={show.avg_craft} sub="Avg craft score" /></div>
              <div className="min-w-[140px] snap-start sm:min-w-0"><ScoreCard label="Impact" value={show.avg_impact} sub="Avg impact score" /></div>
              {show.avg_imdb_rating && (
                <div className="min-w-[140px] snap-start sm:min-w-0"><ScoreCard label="IMDb" value={show.avg_imdb_rating} sub="Avg episode rating" /></div>
              )}
              <div className="min-w-[140px] snap-start sm:min-w-0">
                <ScoreCard
                  label="Jokes Analyzed"
                  value={show.total_jokes_analyzed.toLocaleString()}
                  sub={`${episodes.length} episodes`}
                />
              </div>
            </div>
            {/* Fade indicator for mobile scroll */}
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-brand-dark to-transparent pointer-events-none sm:hidden" />
          </div>
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <InlineNewsletterCTA />
      </div>

      <ShowPageClient
        show={show}
        seasons={seasons}
        episodes={episodes}
        characters={characters}
        characterProfiles={realCharacters}
        comedyDna={comedyDna}
      />

      {/* If you liked this show */}
      {recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-brand-border">
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">If You Liked {show.name}</p>
          <p className="text-lg font-medium text-brand-text-primary mb-6">You might also enjoy</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recommendations.map(rec => {
              const recShow = allShows.find(s => s.slug === rec.slug);
              if (!recShow) return null;
              return (
                <Link
                  key={rec.slug}
                  href={`/shows/${rec.slug}`}
                  className="group block"
                >
                  <div className="relative bg-brand-card border border-brand-border rounded-xl overflow-hidden hover:border-brand-gold/40 transition-colors">
                    {recShow.backdrop_path && (
                      <div className="relative h-32 w-full">
                        <Image
                          src={`https://image.tmdb.org/t/p/w1280${recShow.backdrop_path}`}
                          alt={recShow.name}
                          fill
                          className="object-cover opacity-40 group-hover:opacity-55 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-card to-transparent" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-base font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mb-1">
                        {recShow.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-brand-text-muted mb-2">
                        {recShow.network && <span>{recShow.network}</span>}
                        {recShow.aired && <span>{recShow.aired}</span>}
                        <FormatBadge format={recShow.format} />
                      </div>
                      {recShow.humor_index > 0 ? (
                        <p className="font-mono text-sm text-brand-gold">
                          Humor Index: {formatIndex(recShow.humor_index)}
                        </p>
                      ) : recShow.avg_imdb_rating ? (
                        <p className="text-xs text-brand-text-muted">
                          <span className="bg-[#F5C518] text-black font-bold text-[10px] px-1.5 py-0.5 rounded mr-1">IMDb</span>
                          {recShow.avg_imdb_rating.toFixed(1)} avg
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
