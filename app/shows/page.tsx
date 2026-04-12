import { getAllShows } from '@/lib/data';
import ShowCard from '@/components/ui/ShowCard';
import FormatBadge from '@/components/ui/FormatBadge';
import PageHeader from '@/components/layout/PageHeader';

export const metadata = {
  title: 'All Shows — The Humor Index',
  description: 'Every analyzed show ranked by Humor Index score.',
};

export const dynamic = 'force-static';

export default async function ShowsPage() {
  const shows = await getAllShows();
  const scored = shows.filter(s => s.humor_index > 0);
  const upcoming = shows.filter(s => s.humor_index === 0);

  return (
    <div>
      <PageHeader
        label="Comedy Rankings"
        title="All Shows"
        subtitle={`${scored.length} show${scored.length !== 1 ? 's' : ''} scored${upcoming.length > 0 ? `, ${upcoming.length} coming soon` : ''}`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scored.map(show => (
            <ShowCard key={show.slug} show={show} />
          ))}
        </div>

        {upcoming.length > 0 && (
          <div className="mt-12">
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-4">Coming Soon</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map(show => (
                <div key={show.slug} className="bg-brand-card border border-brand-border rounded-xl p-5 opacity-60">
                  <h2 className="text-base font-medium text-brand-text-primary mb-1">{show.name}</h2>
                  <p className="text-xs text-brand-text-muted mb-3 line-clamp-2">{show.description}</p>
                  <FormatBadge format={show.format} />
                  <p className="text-xs text-brand-text-muted mt-3 pt-3 border-t border-brand-border">
                    Analysis in progress — {show.total_episodes} episodes queued
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
