import { getAllShows } from '@/lib/data';
import ShowCard from '@/components/ui/ShowCard';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = {
  title: 'All Shows — The Humor Index',
  description: 'Every analyzed show ranked by Humor Index score.',
};

export const dynamic = 'force-static';

export default async function ShowsPage() {
  const shows = await getAllShows();

  return (
    <div>
      <PageHeader
        label="Comedy Rankings"
        title="All Shows"
        subtitle={`${shows.length} shows analyzed`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shows.map(show => (
            <ShowCard key={show.slug} show={show} />
          ))}
        </div>
      </div>
    </div>
  );
}
