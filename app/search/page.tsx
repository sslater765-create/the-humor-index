import PageHeader from '@/components/layout/PageHeader';
import SearchClient from './SearchClient';
import { getAllShows } from '@/lib/data';
import { getMovies } from '@/lib/movies';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: 'Search Every Joke: Find Any Moment in TV and Movie Comedy',
  description: 'Search every scored joke from sitcoms and comedy movies. Find a line, a character, a joke type or a moment across every show and movie we have scored.',
  alternates: {
    canonical: `${SITE_URL}/search/`,
  },
  openGraph: {
    title: 'Search Every Joke: Find Any Moment in TV and Movie Comedy',
    description: 'Search every scored joke from sitcoms and comedy movies. Find a line, a character, a joke type or a moment across every show and movie we have scored.',
    images: ['/og-image.png'],
  },
};

export const dynamic = 'force-static';

export default async function SearchPage() {
  // Page renders only the shell + an approximate count.
  // The full joke index is fetched client-side from /data/search-index.json
  // — keeps the RSC payload small enough to fit Vercel's 19MB ISR limit while
  // the search index itself can grow without bound as a normal static asset.
  const shows = await getAllShows();
  const scoredShows = shows.filter(s => s.humor_index > 0);
  const movies = await getMovies();

  return (
    <div>
      <PageHeader
        label="Search"
        title="Search Every Joke"
        subtitle={`Every scored line from ${scoredShows.length} shows${movies.length ? ` and ${movies.length} ${movies.length === 1 ? 'movie' : 'movies'}` : ''}. Find any moment.`}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <SearchClient />
      </div>
    </div>
  );
}
