import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getShow, getEpisodes, getSeasons } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import { SHOW_SLUGS } from '@/lib/constants';
import { getExplorerConfig } from '@/lib/explorerPresets';
import { cutHumorIndex } from '@/lib/explorerScore';
import { EpisodeScore } from '@/lib/types';
import PageHeader from '@/components/layout/PageHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import HumorIndexExplorer from '@/components/explorer/HumorIndexExplorer';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const out: { slug: string }[] = [];
  for (const slug of SHOW_SLUGS) {
    try {
      const eps = await getEpisodes(slug);
      if (eps.length > 0) out.push({ slug });
    } catch {
      /* no data */
    }
  }
  return out;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) return {};
  return {
    title: `${show.name} Humor Index Explorer — Score Any Season or Episode Cut`,
    description: `Pick any seasons or episodes of ${show.name} and see the average Humor Index of that cut, with 95% confidence intervals. Compare eras, isolate a hot streak, or drop a weak season — every episode scored by AI.`,
    alternates: { canonical: `${SITE_URL}/shows/${params.slug}/explore/` },
    openGraph: {
      title: `${show.name} Humor Index Explorer`,
      description: `Build any cut of ${show.name} and see how funny it scores.`,
      images: ['/og-image.png'],
    },
  };
}

export default async function ExplorePage({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) notFound();

  let episodes: EpisodeScore[] = [];
  try {
    episodes = await getEpisodes(params.slug);
  } catch {
    /* none */
  }
  if (episodes.length === 0) notFound();

  const config = getExplorerConfig(params.slug);

  // Official per-season Humor Index, so the Explorer agrees with the rest of
  // the site (the full series and whole-season cuts read the canonical scores;
  // only custom mixed cuts use a plain episode average).
  let seasonIndex: Record<number, number> = {};
  try {
    const seasons = await getSeasons(params.slug);
    seasonIndex = Object.fromEntries(seasons.map(s => [s.season, s.humor_index]));
  } catch {
    /* no season data */
  }
  const seriesIndex = show.humor_index;
  const seriesAvg = seriesIndex;
  const ranked = [...episodes].sort((a, b) => b.humor_index - a.humor_index);

  // Server-rendered, crawlable summaries of each story preset (SEO + AEO).
  const presetFacts = (config.storyPresets ?? []).map(p => {
    const picked = episodes.filter(p.pick);
    const avg = cutHumorIndex(picked, episodes, seriesIndex, seasonIndex);
    return { label: p.label, blurb: p.blurb, avg, n: picked.length, delta: avg - seriesAvg };
  });

  const datasetLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${show.name} — per-episode Humor Index scores`,
    description: `AI-scored comedy ratings (Humor Index, 0–100) for all ${episodes.length} episodes of ${show.name}, with IMDb audience ratings and joke counts.`,
    creator: { '@type': 'Organization', name: 'The Humor Index', url: `${SITE_URL}` },
    url: `${SITE_URL}/shows/${params.slug}/explore`,
    variableMeasured: ['Humor Index', 'IMDb rating', 'jokes per minute', 'total jokes'],
    isAccessibleForFree: true,
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }} />
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Shows', path: '/shows' },
          { name: show.name, path: `/shows/${params.slug}` },
          { name: 'Explorer', path: `/shows/${params.slug}/explore` },
        ]}
      />
      <PageHeader
        label="Humor Index Explorer"
        title={`Build Any Cut of ${show.name}`}
        subtitle={`Select seasons or episodes and see the average Humor Index of that slice — with 95% confidence intervals. Every episode scored by AI.`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-xs text-brand-text-muted mb-6">
          <Link href="/explore" className="hover:text-brand-text-secondary transition-colors">Explore</Link>
          <span>/</span>
          <Link href={`/shows/${params.slug}`} className="hover:text-brand-text-secondary transition-colors">{show.name}</Link>
          <span>/</span>
          <span className="text-brand-text-secondary">Explorer</span>
        </div>

        <HumorIndexExplorer slug={params.slug} showName={show.name} episodes={episodes} seriesIndex={seriesIndex} seasonIndex={seasonIndex} />

        <p className="text-xs text-brand-text-muted mt-4 leading-relaxed">
          Cut scores use {show.name}&apos;s official Humor Index for the full series and for
          whole seasons; a custom mix of episodes shows the average of those episodes&apos; scores.
          A show&apos;s headline score weights its best season, so a custom cut can differ slightly.
        </p>

        {/* Notable cuts — server-rendered prose for SEO/AEO */}
        {presetFacts.length > 0 && (
          <section className="mt-12 border-t border-brand-border pt-8">
            <h2 className="text-lg font-semibold text-brand-text-primary mb-3">Notable {show.name} cuts</h2>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              The full series of {show.name} averages a Humor Index of {formatIndex(seriesAvg)}.{' '}
              {presetFacts.map((f, i) => (
                <span key={i}>
                  {f.label}: <span className="text-brand-gold font-medium">{formatIndex(f.avg)}</span>{' '}
                  ({f.n} episodes, {f.delta >= 0 ? '+' : ''}{f.delta.toFixed(1)} vs the full series).{' '}
                </span>
              ))}
            </p>
          </section>
        )}

        {/* Crawlable episode table — also the no-JavaScript fallback */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-brand-text-primary mb-3">Every {show.name} episode, scored</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-brand-text-muted">
                  <th className="text-left font-medium py-2 px-2 border-b border-brand-border">#</th>
                  <th className="text-left font-medium py-2 px-2 border-b border-brand-border">Episode</th>
                  <th className="text-left font-medium py-2 px-2 border-b border-brand-border">Season</th>
                  <th className="text-right font-medium py-2 px-2 border-b border-brand-border">Humor Index</th>
                  <th className="text-right font-medium py-2 px-2 border-b border-brand-border">IMDb</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((ep, i) => (
                  <tr key={`${ep.season}-${ep.episode_number}`}>
                    <td className="py-1.5 px-2 border-b border-brand-border text-brand-text-muted">{i + 1}</td>
                    <td className="py-1.5 px-2 border-b border-brand-border">
                      <Link href={`/shows/${params.slug}/${ep.season}/${ep.episode_number}`} className="text-brand-gold hover:underline">{ep.title}</Link>
                    </td>
                    <td className="py-1.5 px-2 border-b border-brand-border text-brand-text-muted">S{ep.season}E{ep.episode_number}</td>
                    <td className="py-1.5 px-2 border-b border-brand-border text-right font-mono">{formatIndex(ep.humor_index)}</td>
                    <td className="py-1.5 px-2 border-b border-brand-border text-right font-mono text-brand-text-muted">{ep.imdb_rating ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 border-t border-brand-border pt-6 text-sm text-brand-text-muted">
          See also the{' '}
          <Link href={`/shows/${params.slug}`} className="text-brand-gold hover:underline">{show.name} breakdown</Link>,{' '}
          <Link href={`/shows/${params.slug}/episodes-ranked`} className="text-brand-gold hover:underline">every episode ranked</Link>, and the{' '}
          <Link href="/explore" className="text-brand-gold hover:underline">Explorer for other shows</Link>.
        </div>
      </div>
    </div>
  );
}
