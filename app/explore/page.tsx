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
  // For ranking the hero pick.
  signatureLabel?: string;
  signatureAvg?: number;
  delta?: number;
  signaturePresetId?: string;
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
    let signatureLabel: string | undefined;
    let signatureAvg: number | undefined;
    let delta: number | undefined;
    let signaturePresetId: string | undefined;

    const sig = config.storyPresets?.find(p => p.id === config.signature);
    if (sig) {
      const v = episodes.filter(sig.pick).map(e => e.humor_index);
      const avg = mean(v);
      delta = avg - seriesAvg;
      line = `${sig.label}: ${formatIndex(avg)} (${delta >= 0 ? '+' : ''}${delta.toFixed(1)} vs the full series).`;
      signatureLabel = sig.label;
      signatureAvg = avg;
      signaturePresetId = sig.id;
    }
    teasers.push({
      slug: show.slug,
      name: show.name,
      backdrop_path: show.backdrop_path,
      humor_index: show.humor_index,
      line,
      signatureLabel,
      signatureAvg,
      delta,
      signaturePresetId,
    });
  }

  // Hero pick: the largest absolute delta — the most dramatic cut on the site.
  const withDelta = teasers.filter(t => t.delta != null && t.signatureLabel);
  withDelta.sort((a, b) => Math.abs((b.delta ?? 0)) - Math.abs((a.delta ?? 0)));
  const hero = withDelta[0];

  // Sort the rest by |delta| desc so the strongest stories come first; shows with
  // no preset configured fall to the end with stable name order.
  const rest = teasers
    .filter(t => !hero || t.slug !== hero.slug)
    .sort((a, b) => {
      const da = a.delta == null ? -1 : Math.abs(a.delta);
      const db = b.delta == null ? -1 : Math.abs(b.delta);
      if (db !== da) return db - da;
      return a.name.localeCompare(b.name);
    });

  return (
    <div>
      <PageHeader
        label="Explorer"
        title="What's the funniest cut of your favorite sitcom?"
        subtitle="Drop a weak season. Isolate a hot streak. Compare eras. Every episode scored by AI — pick your cut and see the Humor Index, with 95% confidence intervals."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {hero && hero.delta != null && hero.signatureAvg != null && (
          <Link
            href={`/shows/${hero.slug}/explore`}
            className="relative block bg-brand-card border border-brand-gold/40 rounded-2xl overflow-hidden mb-6 hover:border-brand-gold transition-colors group"
          >
            {hero.backdrop_path && (
              <div className="relative h-32 sm:h-40 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://image.tmdb.org/t/p/w1280${hero.backdrop_path}`} alt="" className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/70 to-transparent" />
              </div>
            )}
            <div className="p-5 sm:p-6">
              <div className="text-[11px] uppercase tracking-wider text-brand-gold/80 mb-1.5">Most dramatic cut on the site</div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-xl sm:text-2xl font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors">{hero.name}: {hero.signatureLabel}</span>
                <span className="font-mono text-base sm:text-lg text-brand-gold">{formatIndex(hero.signatureAvg)}</span>
                <span className={`font-mono text-sm ${hero.delta >= 0 ? 'text-brand-teal' : 'text-brand-text-muted'}`}>
                  {hero.delta >= 0 ? '+' : ''}{hero.delta.toFixed(1)} vs full series
                </span>
              </div>
              <p className="text-sm text-brand-text-secondary mt-2 leading-snug">
                See how this cut was built — then build your own.
              </p>
              <span className="inline-block text-xs text-brand-gold mt-3">Open this cut in the Explorer →</span>
            </div>
          </Link>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {rest.map(t => (
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
