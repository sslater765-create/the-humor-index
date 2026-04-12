import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getShow, getEpisodes, getEpisodeDetail } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import { SHOW_SLUGS } from '@/lib/constants';
import ScoreCard from '@/components/ui/ScoreCard';
import ScoreGauge from '@/components/ui/ScoreGauge';
import JokeRow from '@/components/ui/JokeRow';
import SocialShare from '@/components/ui/SocialShare';
import StreamingLinks from '@/components/ui/StreamingLinks';
import StickyEpisodeBar from '@/components/ui/StickyEpisodeBar';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const params: { slug: string; season: string; episode: string }[] = [];
  for (const slug of SHOW_SLUGS) {
    try {
      const episodes = await getEpisodes(slug);
      for (const ep of episodes) {
        params.push({
          slug,
          season: String(ep.season),
          episode: String(ep.episode_number),
        });
      }
    } catch {
      // No episode data for this show yet
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; season: string; episode: string };
}) {
  const show = await getShow(params.slug);
  const detail = await getEpisodeDetail(
    params.slug,
    parseInt(params.season),
    parseInt(params.episode)
  );
  if (!detail || !show) return {};
  const showName = show.name;
  return {
    title: `"${detail.title}" (S${detail.season}E${String(detail.episode_number).padStart(2, '0')}) — ${showName} Joke Analysis`,
    description: `Every joke in ${showName} "${detail.title}" analyzed and scored. ${detail.total_jokes} jokes, Humor Index: ${formatIndex(detail.humor_index)}. See the funniest moments ranked.`,
    openGraph: {
      title: `${showName} "${detail.title}" — ${detail.total_jokes} Jokes Scored`,
      description: `Humor Index: ${formatIndex(detail.humor_index)}. JPM: ${detail.jpm}. See every joke ranked.`,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `https://thehumorindex.com/shows/${params.slug}/${params.season}/${params.episode}`,
    },
  };
}

export default async function EpisodePage({
  params,
}: {
  params: { slug: string; season: string; episode: string };
}) {
  const seasonNum = parseInt(params.season);
  const episodeNum = parseInt(params.episode);

  const [show, episodes, detail] = await Promise.all([
    getShow(params.slug),
    getEpisodes(params.slug),
    getEpisodeDetail(params.slug, seasonNum, episodeNum),
  ]);

  if (!show || !detail) notFound();

  const allEpisodes = episodes.sort((a, b) => b.humor_index - a.humor_index);
  const rank = allEpisodes.findIndex(e => e.season === seasonNum && e.episode_number === episodeNum) + 1;

  // Find next/prev episodes in season order
  const seasonEpisodes = episodes
    .filter(e => e.season === seasonNum)
    .sort((a, b) => a.episode_number - b.episode_number);
  const currentIdx = seasonEpisodes.findIndex(e => e.episode_number === episodeNum);
  const prevEp = currentIdx > 0 ? seasonEpisodes[currentIdx - 1] : null;
  const nextEp = currentIdx < seasonEpisodes.length - 1 ? seasonEpisodes[currentIdx + 1] : null;

  const standoutJokes = detail.jokes.filter(j => detail.standout_joke_ids.includes(j.id));
  const regularJokes = detail.jokes.filter(j => !detail.standout_joke_ids.includes(j.id));

  // Top 5 episodes for "more from this show"
  const topEpisodes = allEpisodes
    .filter(e => !(e.season === seasonNum && e.episode_number === episodeNum))
    .slice(0, 5);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVEpisode',
    name: detail.title,
    episodeNumber: detail.episode_number,
    seasonNumber: detail.season,
    partOfSeries: { '@type': 'TVSeries', name: show.name },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: detail.humor_index,
      bestRating: 100,
      worstRating: 0,
      ratingCount: detail.total_jokes,
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StickyEpisodeBar
        title={detail.title}
        season={seasonNum}
        episode={episodeNum}
        humorIndex={detail.humor_index}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-brand-text-muted mb-6 -mx-1" aria-label="Breadcrumb">
        <Link href="/shows" className="hover:text-brand-text-secondary transition-colors px-1 py-1.5 rounded">Shows</Link>
        <span>/</span>
        <Link href={`/shows/${params.slug}`} className="hover:text-brand-text-secondary transition-colors px-1 py-1.5 rounded truncate max-w-[120px]">
          {show.name}
        </Link>
        <span>/</span>
        <span className="text-brand-text-secondary px-1 py-1.5 truncate max-w-[200px]">
          S{detail.season}E{String(detail.episode_number).padStart(2, '0')}: {detail.title}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">
          Season {detail.season}, Episode {detail.episode_number}
          {detail.air_date && ` · ${detail.air_date}`}
        </p>
        <h1 className="text-2xl sm:text-3xl font-medium text-brand-text-primary">{detail.title}</h1>
        {rank > 0 && (
          <p className="text-sm text-brand-text-muted mt-2">
            Ranked{' '}
            <span className="font-mono text-brand-gold">#{rank}</span>{' '}
            out of {episodes.length} episodes in {show.name}
          </p>
        )}
        <div className="mt-3">
          <StreamingLinks
            showSlug={params.slug}
            episodeLabel={`S${seasonNum}E${String(episodeNum).padStart(2, '0')}`}
          />
        </div>
        <div className="mt-3">
          <SocialShare
            title={`${show.name} "${detail.title}" — Humor Index: ${formatIndex(detail.humor_index)}`}
            text={`"${detail.title}" scored ${formatIndex(detail.humor_index)} on The Humor Index. ${detail.total_jokes} jokes analyzed.`}
            url={`/shows/${params.slug}/${params.season}/${params.episode}`}
          />
        </div>
      </div>

      {/* Score cards */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
        <ScoreGauge score={detail.humor_index} size={110} label="Humor Index" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 flex-1 w-full">
          <ScoreCard label="JPM" value={detail.jpm} />
          <ScoreCard label="Craft" value={detail.avg_craft} />
          <ScoreCard label="Impact" value={detail.avg_impact} />
          {detail.imdb_rating ? (
            <ScoreCard label="IMDb" value={detail.imdb_rating} sub={`${(detail.imdb_votes ?? 0).toLocaleString()} votes`} />
          ) : (
            <ScoreCard label="Total Jokes" value={detail.total_jokes} />
          )}
        </div>
      </div>

      {/* Standout moments */}
      {standoutJokes.length > 0 && (
        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">
            Standout Moments
          </p>
          <div className="space-y-3">
            {standoutJokes.map(joke => (
              <JokeRow key={joke.id} joke={joke} isStandout />
            ))}
          </div>
        </section>
      )}

      {/* All jokes */}
      <section>
        <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">
          All Jokes — {detail.jokes.length} analyzed
        </p>
        <div className="space-y-2">
          {regularJokes.map(joke => (
            <JokeRow key={joke.id} joke={joke} />
          ))}
        </div>
      </section>

      {/* Weakest section note */}
      {detail.weakest_section && (
        <div className="mt-8 p-4 border border-brand-border rounded-xl">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-1">Weakest Section</p>
          <p className="text-sm text-brand-text-secondary">{detail.weakest_section}</p>
        </div>
      )}

      {/* Next / Previous episode navigation */}
      <div className="mt-10 grid grid-cols-2 gap-3 border-t border-brand-border pt-6">
        {prevEp ? (
          <Link
            href={`/shows/${params.slug}/${prevEp.season}/${prevEp.episode_number}`}
            className="group flex flex-col p-3 rounded-xl hover:bg-brand-surface transition-colors"
          >
            <span className="text-xs text-brand-text-muted group-hover:text-brand-gold transition-colors">← Previous</span>
            <span className="text-sm text-brand-text-secondary group-hover:text-brand-text-primary transition-colors truncate">
              S{prevEp.season}E{String(prevEp.episode_number).padStart(2, '0')}: {prevEp.title}
            </span>
          </Link>
        ) : <div />}
        {nextEp ? (
          <Link
            href={`/shows/${params.slug}/${nextEp.season}/${nextEp.episode_number}`}
            className="group flex flex-col items-end p-3 rounded-xl hover:bg-brand-surface transition-colors"
          >
            <span className="text-xs text-brand-text-muted group-hover:text-brand-gold transition-colors">Next →</span>
            <span className="text-sm text-brand-text-secondary group-hover:text-brand-text-primary transition-colors truncate">
              S{nextEp.season}E{String(nextEp.episode_number).padStart(2, '0')}: {nextEp.title}
            </span>
          </Link>
        ) : <div />}
      </div>

      {/* Top episodes from this show */}
      {topEpisodes.length > 0 && (
        <section className="mt-10 border-t border-brand-border pt-6">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">
            Top Episodes — {show.name}
          </p>
          <div className="space-y-2">
            {topEpisodes.map((ep, i) => (
              <Link
                key={`${ep.season}-${ep.episode_number}`}
                href={`/shows/${params.slug}/${ep.season}/${ep.episode_number}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-brand-surface transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-brand-text-muted w-5">{i + 1}</span>
                  <div>
                    <span className="text-sm text-brand-text-primary group-hover:text-brand-gold transition-colors">
                      {ep.title}
                    </span>
                    <span className="text-xs text-brand-text-muted ml-2">
                      S{ep.season}E{String(ep.episode_number).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-sm text-brand-gold">{formatIndex(ep.humor_index)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
