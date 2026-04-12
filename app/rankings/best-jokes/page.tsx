import Link from 'next/link';
import { getAllShows, getEpisodes, getEpisodeDetail } from '@/lib/data';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';
import { Joke } from '@/lib/types';

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

interface RankedJoke extends Joke {
  showName: string;
  showSlug: string;
  season: number;
  episodeNumber: number;
  episodeTitle: string;
}

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

  const ranked = allJokes
    .sort((a, b) => (b.craft_total + b.impact_score) - (a.craft_total + a.impact_score))
    .slice(0, 100);

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

        <div className="space-y-4">
          {ranked.map((joke, i) => (
            <div
              key={`${joke.showSlug}-${joke.season}-${joke.episodeNumber}-${joke.id}`}
              className="bg-brand-card border border-brand-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-sm w-8 text-center ${
                      i < 3 ? 'text-brand-gold font-bold text-lg' : i < 10 ? 'text-brand-gold' : 'text-brand-text-muted'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <Link
                      href={`/shows/${joke.showSlug}/${joke.season}/${joke.episodeNumber}`}
                      className="text-xs text-brand-text-muted hover:text-brand-gold transition-colors"
                    >
                      {joke.showName} · S{joke.season}E{String(joke.episodeNumber).padStart(2, '0')} {'\u201C'}{joke.episodeTitle}{'\u201D'}
                    </Link>
                  </div>
                </div>
                <div className="flex gap-3 font-mono text-sm">
                  <span className="text-brand-blue" title="Craft score">C:{joke.craft_total.toFixed(1)}</span>
                  <span className="text-brand-teal" title="Impact score">I:{joke.impact_score.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-brand-text-primary leading-relaxed mb-2">
                {'\u201C'}{joke.text}{'\u201D'}
              </p>

              {joke.explanation && (
                <p className="text-xs text-brand-text-muted italic">
                  {joke.explanation}
                </p>
              )}

              <div className="flex gap-2 mt-3 flex-wrap">
                {joke.joke_types.map(t => (
                  <span
                    key={t}
                    className="text-xs bg-brand-surface border border-brand-border rounded-full px-2 py-0.5 text-brand-text-muted"
                  >
                    {t.replace(/_/g, ' ')}
                  </span>
                ))}
                {joke.quotability >= 7 && (
                  <span className="text-xs bg-brand-gold/10 border border-brand-gold/30 rounded-full px-2 py-0.5 text-brand-gold">
                    highly quotable
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {ranked.length === 0 && (
          <p className="text-brand-text-muted text-center py-12">
            No joke data available yet. Check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
