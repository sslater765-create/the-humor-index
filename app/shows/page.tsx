import Image from 'next/image';
import Link from 'next/link';
import { getAllShows } from '@/lib/data';
import FormatBadge from '@/components/ui/FormatBadge';
import PageHeader from '@/components/layout/PageHeader';
import ShowsGrid from './ShowsGrid';

export const metadata = {
  title: 'All Shows — The Humor Index',
  description: 'Every analyzed show ranked by Humor Index score.',
  alternates: {
    canonical: 'https://thehumorindex.com/shows',
  },
  openGraph: {
    title: 'All Shows — The Humor Index',
    description: 'Every analyzed show ranked by Humor Index score.',
    images: ['/og-image.png'],
  },
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
        <ShowsGrid shows={scored} />

        {upcoming.length > 0 && (
          <div className="mt-12">
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-4">Coming Soon</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map(show => (
                <Link key={show.slug} href={`/shows/${show.slug}`} className="block group">
                  <div className="relative bg-brand-card border border-brand-border rounded-xl overflow-hidden hover:border-brand-border/80 transition-colors">
                    {show.backdrop_path && (
                      <div className="relative h-32 w-full">
                        <Image
                          src={`https://image.tmdb.org/t/p/w780${show.backdrop_path}`}
                          alt={show.name}
                          fill
                          className="object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-card to-transparent" />
                      </div>
                    )}
                    <div className="p-5">
                      <h2 className="text-base font-medium text-brand-text-primary mb-1 group-hover:text-brand-gold transition-colors">{show.name}</h2>
                      <p className="text-xs text-brand-text-muted mb-3 line-clamp-2">{show.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <FormatBadge format={show.format} />
                        {show.network && (
                          <span className="text-xs text-brand-text-muted">{show.network}</span>
                        )}
                        {show.aired && (
                          <span className="text-xs text-brand-text-muted">{show.aired}</span>
                        )}
                      </div>
                      {show.avg_imdb_rating && (
                        <p className="text-xs text-brand-text-muted">
                          <span className="bg-[#F5C518] text-black font-bold text-[10px] px-1.5 py-0.5 rounded mr-1">IMDb</span>
                          {show.avg_imdb_rating.toFixed(1)} avg
                        </p>
                      )}
                      <p className="text-xs text-brand-text-muted mt-2 pt-2 border-t border-brand-border">
                        Analysis in progress — {show.total_episodes} episodes queued
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
