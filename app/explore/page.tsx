import Link from 'next/link';
import { getAllShows, getEpisodes } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import { getExplorerConfig } from '@/lib/explorerPresets';
import PageHeader from '@/components/layout/PageHeader';

export const dynamic = 'force-static';

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

export async function generateMetadata() {
  return {
    title: 'Humor Index Explorer — Score Any Cut of Any Sitcom',
    description: 'Pick any seasons or episodes of a sitcom and see the average Humor Index of that cut. Compare eras — like Community with vs without Dan Harmon, or Seinfeld with vs without Larry David — every episode scored by AI.',
    alternates: { canonical: 'https://thehumorindex.com/explore/' },
  };
}

interface Teaser {
  slug: string;
  name: string;
  backdrop_path?: string;
  humor_index: number;
  line: string;
}

export default async function ExploreHub() {
  const shows = (await getAllShows()).filter(s => s.humor_index > 0);

  const teasers: Teaser[] = [];
  for (const show of shows) {
    let episodes: Awaited<ReturnType<typeof getEpisodes>> = [];
    try {
      episodes = await getEpisodes(show.slug);
    } catch {
      continue;
    }
    if (episodes.length === 0) continue;

    const config = getExplorerConfig(show.slug);
    const seriesAvg = mean(episodes.map(e => e.humor_index));
    let line = 'Build your own cut — isolate a hot streak or drop a weak season.';

    const sig = config.storyPresets?.find(p => p.id === config.signature);
    if (sig) {
      const v = episodes.filter(sig.pick).map(e => e.humor_index);
      const avg = mean(v);
      const delta = avg - seriesAvg;
      line = `${sig.label}: ${formatIndex(avg)} (${delta >= 0 ? '+' : ''}${delta.toFixed(1)} vs the full series).`;
    }
    teasers.push({ slug: show.slug, name: show.name, backdrop_path: show.backdrop_path, humor_index: show.humor_index, line });
  }

  return (
    <div>
      <PageHeader
        label="Explorer"
        title="Score Any Cut of Any Sitcom"
        subtitle="Pick any seasons or episodes and see the average Humor Index of that slice — with 95% confidence intervals. Compare eras, isolate a hot streak, or drop a weak season."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid sm:grid-cols-2 gap-4">
          {teasers.map(t => (
            <Link
              key={t.slug}
              href={`/shows/${t.slug}/explore`}
              className="relative block bg-brand-card border border-brand-border rounded-2xl overflow-hidden hover:border-brand-gold/40 transition-colors group"
            >
              {t.backdrop_path && (
                <div className="relative h-24 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://image.tmdb.org/t/p/w780${t.backdrop_path}`} alt="" className="w-full h-full object-cover opacity-30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-card to-transparent" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors">{t.name}</span>
                  <span className="font-mono text-sm text-brand-gold shrink-0">{formatIndex(t.humor_index)}</span>
                </div>
                <p className="text-sm text-brand-text-secondary mt-1.5 leading-snug">{t.line}</p>
                <span className="inline-block text-xs text-brand-gold mt-3">Open the explorer →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
