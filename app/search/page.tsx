import PageHeader from '@/components/layout/PageHeader';
import SearchClient from './SearchClient';
import { getAllShows } from '@/lib/data';

export const metadata = {
  title: 'Search Every Joke — Find Any Moment in Sitcom History',
  description: 'Search through thousands of analyzed sitcom jokes. Find specific lines, characters, joke types, and moments across every show in our database.',
  alternates: {
    canonical: 'https://thehumorindex.com/search/',
  },
  openGraph: {
    title: 'Search Every Joke — Find Any Moment in Sitcom History',
    description: 'Search through thousands of analyzed sitcom jokes. Find specific lines, characters, joke types, and moments across every show in our database.',
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
  const approxJokes = scoredShows.reduce((sum, s) => sum + (s.total_jokes_analyzed ?? 0), 0);

  return (
    <div>
      <PageHeader
        label="Search"
        title="Search Every Joke"
        subtitle={`${approxJokes.toLocaleString()} jokes across ${scoredShows.length} shows. Find any moment.`}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <SearchClient />
      </div>
    </div>
  );
}
