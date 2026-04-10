import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getShow, getEpisodes, getEpisodeDetail } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import { SHOW_SLUGS } from '@/lib/constants';
import ScoreCard from '@/components/ui/ScoreCard';
import JokeRow from '@/components/ui/JokeRow';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const params: { slug: string; season: string; episode: string }[] = [];
  for (const slug of SHOW_SLUGS) {
    // Only generate the one episode detail we have mock data for
    if (slug === 'the-office') {
      params.push({ slug, season: '4', episode: '13' });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; season: string; episode: string };
}) {
  const detail = await getEpisodeDetail(
    params.slug,
    parseInt(params.season),
    parseInt(params.episode)
  );
  if (!detail) return {};
  return {
    title: `${detail.title} — The Humor Index`,
    description: `S${detail.season}E${detail.episode_number} scores ${formatIndex(detail.humor_index)} on the Humor Index.`,
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

  const standoutJokes = detail.jokes.filter(j => detail.standout_joke_ids.includes(j.id));
  const regularJokes = detail.jokes.filter(j => !detail.standout_joke_ids.includes(j.id));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-brand-text-muted mb-6">
        <Link href="/shows" className="hover:text-brand-text-secondary transition-colors">Shows</Link>
        <span>/</span>
        <Link href={`/shows/${params.slug}`} className="hover:text-brand-text-secondary transition-colors">
          {show.name}
        </Link>
        <span>/</span>
        <span className="text-brand-text-secondary">
          S{detail.season}E{String(detail.episode_number).padStart(2, '0')}
        </span>
      </div>

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
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
        <ScoreCard label="Humor Index" value={detail.humor_index} highlight />
        <ScoreCard label="JPM" value={detail.jpm} />
        <ScoreCard label="Craft" value={detail.avg_craft} />
        <ScoreCard label="Impact" value={detail.avg_impact} />
        <ScoreCard label="Total Jokes" value={detail.total_jokes} />
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
    </div>
  );
}
