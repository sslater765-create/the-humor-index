import PageHeader from '@/components/layout/PageHeader';
import SearchClient from './SearchClient';
import { getAllShows, getEpisodes, getEpisodeDetail } from '@/lib/data';
import { Joke } from '@/lib/types';

export const metadata = {
  title: 'Search Every Joke — Find Any Moment in Sitcom History',
  description: 'Search through thousands of analyzed sitcom jokes. Find specific lines, characters, joke types, and moments across every show in our database.',
  alternates: {
    canonical: 'https://thehumorindex.com/search',
  },
  openGraph: {
    title: 'Search Every Joke — Find Any Moment in Sitcom History',
    description: 'Search through thousands of analyzed sitcom jokes. Find specific lines, characters, joke types, and moments across every show in our database.',
    images: ['/og-image.png'],
  },
};

export const dynamic = 'force-static';

interface SearchableJoke extends Joke {
  showName: string;
  showSlug: string;
  season: number;
  episodeNumber: number;
  episodeTitle: string;
}

export default async function SearchPage() {
  const shows = await getAllShows();

  const allJokes: SearchableJoke[] = [];
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
        } catch { /* no detail */ }
      }
    } catch { /* no episodes */ }
  }

  return (
    <div>
      <PageHeader
        label="Search"
        title="Search Every Joke"
        subtitle={`${allJokes.length.toLocaleString()} jokes across ${shows.length} shows. Find any moment.`}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <SearchClient jokes={allJokes} />
      </div>
    </div>
  );
}
