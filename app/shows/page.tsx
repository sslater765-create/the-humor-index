import Image from 'next/image';
import Link from 'next/link';
import { getAllShows } from '@/lib/data';
import FormatBadge from '@/components/ui/FormatBadge';
import ShowsGrid from './ShowsGrid';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: 'Every Sitcom Ranked by Humor Index Score',
  description:
    'Every sitcom we’ve scored, ranked by Humor Index — The Office, Seinfeld, Parks and Rec, Community, Arrested Development and more. AI-analyzed joke density, craft, and impact for each show.',
  alternates: {
    canonical: `${SITE_URL}/shows/`,
  },
  openGraph: {
    title: 'Every Sitcom Ranked by Humor Index Score',
    description: 'AI-scored comedy rankings: joke density, craft, and impact for every analyzed sitcom.',
    images: ['/og-image.png'],
  },
};

export const dynamic = 'force-static';

export default async function ShowsPage() {
  const shows = await getAllShows();
  const scored = shows.filter(s => s.humor_index > 0);
  const upcoming = shows.filter(s => s.humor_index === 0);
  const totalJokes = scored.reduce((s, show) => s + show.total_jokes_analyzed, 0);

  return (
    <div>
      {/* Editorial hero */}
      <section className="relative border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-gold mb-4">The Catalog</p>
          <h1 className="font-serif italic text-4xl sm:text-6xl text-brand-text-primary leading-[1.05] mb-5 max-w-3xl">
            Every sitcom, ranked.
          </h1>
          <p className="text-base sm:text-lg text-brand-text-secondary max-w-2xl leading-relaxed mb-8">
            The whole catalog, sortable by Humor Index, WAR, or pure joke count. Filter by format —
            single-cam, multi-cam, animation, hybrid — to compare like against like.
          </p>

          {/* 3-up cover stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl">
            <div>
              <p className="font-serif italic text-3xl sm:text-5xl text-brand-gold leading-none">
                {scored.length}
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-text-muted mt-2">Scored</p>
            </div>
            <div>
              <p className="font-serif italic text-3xl sm:text-5xl text-brand-blue leading-none">
                {upcoming.length}
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-text-muted mt-2">In the queue</p>
            </div>
            <div>
              <p className="font-serif italic text-3xl sm:text-5xl text-emerald-400 leading-none">
                {totalJokes.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-text-muted mt-2">Jokes scored</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <ShowsGrid shows={scored} />

        {upcoming.length > 0 && (
          <section className="mt-20 pt-12 border-t border-brand-border">
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Up Next on the Slate</p>
            <h2 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary leading-tight mb-2">
              Coming soon.
            </h2>
            <p className="text-sm text-brand-text-secondary max-w-xl mb-8 leading-relaxed">
              {upcoming.length} shows in the queue — transcripts collected, episodes counted, awaiting their three AI passes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map(show => (
                <Link key={show.slug} href={`/shows/${show.slug}`} className="block group">
                  <div className="relative bg-brand-card border border-brand-border rounded-2xl overflow-hidden hover:border-brand-gold/30 transition-colors">
                    {show.backdrop_path && (
                      <div className="relative h-36 w-full">
                        <Image
                          src={`https://image.tmdb.org/t/p/w780${show.backdrop_path}`}
                          alt={show.name}
                          fill
                          className="object-cover opacity-40 group-hover:opacity-55 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/60 to-transparent" />
                        <span className="absolute bottom-3 right-4 text-[10px] uppercase tracking-widest text-brand-gold/80">
                          Queued
                        </span>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-serif italic text-xl text-brand-text-primary mb-2 group-hover:text-brand-gold transition-colors leading-tight">
                        {show.name}
                      </h3>
                      <p className="text-xs text-brand-text-muted mb-3 line-clamp-2 leading-relaxed">{show.description}</p>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <FormatBadge format={show.format} />
                        {show.network && (
                          <span className="text-[10px] uppercase tracking-widest text-brand-text-muted">{show.network}</span>
                        )}
                        {show.aired && (
                          <span className="text-[10px] uppercase tracking-widest text-brand-text-muted">{show.aired}</span>
                        )}
                      </div>
                      {show.avg_imdb_rating && (
                        <p className="text-xs text-brand-text-muted">
                          <span className="bg-[#F5C518] text-black font-bold text-[10px] px-1.5 py-0.5 rounded mr-1">IMDb</span>
                          {show.avg_imdb_rating.toFixed(1)} avg
                        </p>
                      )}
                      <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-3 pt-3 border-t border-brand-border">
                        {show.total_episodes} episodes queued
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
