import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getShow, getSeasons, getEpisodes } from '@/lib/data';
import { SHOW_SLUGS } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import ArcClient from './ArcClient';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return SHOW_SLUGS.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) return {};
  return {
    title: `${show.name} Seasons Ranked — Which Is the Best Season?`,
    description: `Which is the best season of ${show.name}? We ranked all ${show.total_seasons} seasons by Humor Index and tracked exactly when the show peaked and declined. See the season-by-season data.`,
    alternates: {
      canonical: `https://www.thehumorindex.com/shows/${params.slug}/arc/`,
    },
  };
}

export default async function ArcPage({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) notFound();

  let seasons: Awaited<ReturnType<typeof getSeasons>> = [];
  let episodes: Awaited<ReturnType<typeof getEpisodes>> = [];
  try {
    seasons = await getSeasons(params.slug);
    episodes = await getEpisodes(params.slug);
  } catch {
    // No data yet for this show
  }

  return (
    <div>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Shows', path: '/shows' },
          { name: show.name, path: `/shows/${params.slug}` },
          { name: 'Seasons Ranked', path: `/shows/${params.slug}/arc` },
        ]}
      />
      <PageHeader
        label="Seasons Ranked"
        title={`${show.name} Seasons, Ranked`}
        subtitle={`All ${show.total_seasons} seasons ranked by Humor Index — see which is the best season of ${show.name} and exactly where it peaked.`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-brand-text-muted mb-6">
          <Link href="/shows" className="hover:text-brand-text-secondary transition-colors">Shows</Link>
          <span>/</span>
          <Link href={`/shows/${params.slug}`} className="hover:text-brand-text-secondary transition-colors">{show.name}</Link>
          <span>/</span>
          <span className="text-brand-text-secondary">Season Arc</span>
        </div>

        {seasons.length > 0 ? (
          <ArcClient show={show} seasons={seasons} episodes={episodes} />
        ) : (
          <div className="text-center py-16">
            <p className="text-brand-text-muted">Season data not yet available for {show.name}.</p>
            <p className="text-xs text-brand-text-muted mt-2">Check back once more episodes are analyzed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
