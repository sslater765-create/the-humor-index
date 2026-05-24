import { getAllShows, getEpisodes, getEpisodeDetail } from '@/lib/data';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';
import BestJokesClient, { RankedJoke } from './BestJokesClient';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The 100 Best Sitcom Jokes Ever Written, Scored by AI',
  description:
    'We scored every joke in sitcom history on craft, impact, and quotability. These are the 100 highest-scoring jokes across all analyzed shows.',
  openGraph: {
    title: 'The 100 Best Sitcom Jokes, Ranked by AI Comedy Analysis',
    description: 'Every joke scored on craft, impact, and quotability. See the best of the best.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://thehumorindex.com/rankings/best-jokes',
  },
};

export default async function BestJokesPage() {
  const shows = await getAllShows();

  const allJokes: RankedJoke[] = [];
  for (const show of shows) {
    try {
      const episodes = await getEpisodes(show.slug);
      for (const ep of episodes) {
        try {
          const detail = await getEpisodeDetail(show.slug, ep.season, ep.episode_number);
          if (detail) {
            for (const joke of detail.jokes) {
              allJokes.push({
                ...joke,
                showName: show.name,
                showSlug: show.slug,
                season: ep.season,
                episodeNumber: ep.episode_number,
                episodeTitle: ep.title,
              });
            }
          }
        } catch {
          // No detail for this episode
        }
      }
    } catch {
      // No episodes for this show
    }
  }

  // Pool: top 40 jokes per show, so filtering by a single show always has content.
  const byShow = new Map<string, RankedJoke[]>();
  for (const j of allJokes) {
    const arr = byShow.get(j.showSlug) ?? [];
    arr.push(j);
    byShow.set(j.showSlug, arr);
  }
  const pool: RankedJoke[] = [];
  for (const arr of Array.from(byShow.values())) {
    arr.sort((a, b) => (b.craft_total + b.impact_score) - (a.craft_total + a.impact_score));
    pool.push(...arr.slice(0, 40));
  }

  return (
    <div>
      <PageHeader
        label="Rankings"
        title="The Best Sitcom Jokes Ever Written"
        subtitle="Scored by AI on craft, impact, and quotability. The cream of the crop."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SocialShare
            title="The 100 Best Sitcom Jokes, Scored by AI"
            text="We scored every joke in sitcom history. These are the 100 highest-scoring jokes of all time."
            url="/rankings/best-jokes"
          />
        </div>

        <BestJokesClient jokes={pool} />
      </div>
    </div>
  );
}
