import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getShow, getEpisodes } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import { SHOW_SLUGS } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const out: { slug: string }[] = [];
  for (const slug of SHOW_SLUGS) {
    try {
      const eps = await getEpisodes(slug);
      if (eps.length > 0) out.push({ slug });
    } catch {
      // no episode data
    }
  }
  return out;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) return {};
  let count = 0;
  try {
    count = (await getEpisodes(params.slug)).length;
  } catch { /* none */ }
  return {
    title: `All ${count} ${show.name} Episodes, Ranked Best to Worst`,
    description: `Every ${show.name} episode ranked from funniest to worst by the Humor Index — joke density, craft, and impact scored across all ${count} episodes. See the best ${show.name} episodes and the ones to skip.`,
    alternates: {
      canonical: `https://www.thehumorindex.com/shows/${params.slug}/episodes-ranked/`,
    },
    openGraph: {
      title: `${show.name} Episodes Ranked by Humor Index`,
      description: `All ${count} ${show.name} episodes, ranked best to worst by AI.`,
      images: ['/og-image.png'],
    },
  };
}

export default async function EpisodesRankedPage({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) notFound();

  let episodes: Awaited<ReturnType<typeof getEpisodes>> = [];
  try {
    episodes = await getEpisodes(params.slug);
  } catch { /* none */ }
  if (episodes.length === 0) notFound();

  const ranked = [...episodes].sort((a, b) => b.humor_index - a.humor_index);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${show.name} Episodes Ranked by Humor Index`,
    numberOfItems: ranked.length,
    itemListElement: ranked.map((ep, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'TVEpisode',
        name: ep.title,
        episodeNumber: ep.episode_number,
        partOfSeason: { '@type': 'TVSeason', seasonNumber: ep.season },
        partOfSeries: { '@type': 'TVSeries', name: show.name },
        url: `https://www.thehumorindex.com/shows/${params.slug}/${ep.season}/${ep.episode_number}/`,
      },
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Shows', path: '/shows' },
          { name: show.name, path: `/shows/${params.slug}` },
          { name: 'Episodes Ranked', path: `/shows/${params.slug}/episodes-ranked` },
        ]}
      />
      <PageHeader
        label="Episode Rankings"
        title={`All ${show.name} Episodes, Ranked`}
        subtitle={`Every ${ranked.length} ${show.name} episode scored by the Humor Index — joke density, craft, and impact. Best to worst.`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-brand-text-muted mb-6">
          <Link href="/shows" className="hover:text-brand-text-secondary transition-colors">Shows</Link>
          <span>/</span>
          <Link href={`/shows/${params.slug}`} className="hover:text-brand-text-secondary transition-colors">{show.name}</Link>
          <span>/</span>
          <span className="text-brand-text-secondary">Episodes Ranked</span>
        </div>

        <div className="mb-6">
          <SocialShare
            title={`All ${show.name} Episodes, Ranked by Humor Index`}
            text={`Every ${show.name} episode ranked best to worst by AI. #1: "${best.title}".`}
            url={`/shows/${params.slug}/episodes-ranked`}
          />
        </div>

        <p className="text-sm text-brand-text-secondary leading-relaxed mb-8 max-w-2xl">
          We scored every joke in all {ranked.length} episodes of {show.name} and ranked them by
          Humor Index. The best {show.name} episode is{' '}
          <Link href={`/shows/${params.slug}/${best.season}/${best.episode_number}`} className="text-brand-gold hover:underline">
            &ldquo;{best.title}&rdquo;
          </Link>{' '}
          ({formatIndex(best.humor_index)}); the lowest-scoring is{' '}
          <Link href={`/shows/${params.slug}/${worst.season}/${worst.episode_number}`} className="text-brand-gold hover:underline">
            &ldquo;{worst.title}&rdquo;
          </Link>{' '}
          ({formatIndex(worst.humor_index)}). Tap any episode for its full joke-by-joke breakdown.
        </p>

        <div className="space-y-2">
          {ranked.map((ep, i) => (
            <Link
              key={`${ep.season}-${ep.episode_number}`}
              href={`/shows/${params.slug}/${ep.season}/${ep.episode_number}`}
              className="flex items-center gap-4 p-4 bg-brand-card border border-brand-border rounded-xl hover:border-brand-gold/40 transition-colors group"
            >
              <span className={`font-mono text-sm w-8 text-right ${i < 3 ? 'text-brand-gold font-medium' : 'text-brand-text-muted'}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-brand-text-primary group-hover:text-brand-gold transition-colors">{ep.title}</span>
                  <span className="text-xs text-brand-text-muted">S{ep.season}E{String(ep.episode_number).padStart(2, '0')}</span>
                </div>
                <div className="text-xs text-brand-text-muted mt-0.5">{ep.total_jokes} jokes · {ep.jpm.toFixed(1)} JPM</div>
              </div>
              <span className="font-mono text-lg text-brand-gold font-medium shrink-0">{formatIndex(ep.humor_index)}</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 border-t border-brand-border pt-6 text-sm text-brand-text-muted">
          See also the{' '}
          <Link href={`/shows/${params.slug}`} className="text-brand-gold hover:underline">{show.name} show breakdown</Link>,{' '}
          <Link href={`/shows/${params.slug}/arc`} className="text-brand-gold hover:underline">season-by-season arc</Link>, and the{' '}
          <Link href="/rankings/funniest-episodes" className="text-brand-gold hover:underline">funniest episodes across all shows</Link>.
        </div>
      </div>
    </div>
  );
}
