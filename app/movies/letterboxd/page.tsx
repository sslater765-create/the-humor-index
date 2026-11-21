import PageHeader from '@/components/layout/PageHeader';
import { getMovies, shortTitle } from '@/lib/movies';
import { SITE_URL } from '@/lib/site';
import LetterboxdImport from './LetterboxdImport';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Your Letterboxd Ratings vs the Humor Index',
  description: 'Drop in your Letterboxd export and see how your star ratings for comedy movies compare with our joke-by-joke scores. Nothing is uploaded.',
  alternates: { canonical: `${SITE_URL}/movies/letterboxd/` },
};

export default async function LetterboxdPage() {
  const movies = (await getMovies()).map(m => ({ slug: m.slug, title: m.title, short: shortTitle(m.title), year: m.year, hi: m.humor_index, rank: m.rank }));
  return (
    <div>
      <PageHeader label="Movies" title="You vs the Index"
        subtitle="Drop in your Letterboxd ratings and see where your stars and our joke-by-joke scores agree. The file is read in your browser and never uploaded." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <LetterboxdImport movies={movies} />
      </div>
    </div>
  );
}
