import Link from 'next/link';
import { getAllShows, getEpisodes } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';
import { getExplorerConfig } from '@/lib/explorerPresets';

export const dynamic = 'force-static';

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

export async function generateMetadata() {
  return {
    title: 'Humor Index Explorer — Score Any Cut of Any Sitcom',
    description: 'Pick any seasons or episodes of a sitcom and see the average Humor Index of that cut. Compare eras — like Community with vs without Dan Harmon, or Seinfeld with vs without Larry David — every episode scored by AI.',
    alternates: { canonical: 'https://www.thehumorindex.com/explore/' },
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
      {/* Editorial hero */}
      <section className="relative border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-gold mb-4">The Explorer</p>
          <h1 className="font-serif italic text-4xl sm:text-6xl text-brand-text-primary leading-[1.05] mb-5 max-w-3xl">
            What&apos;s the funniest cut<br />
            <span className="text-brand-text-secondary">of your favorite sitcom?</span>
          </h1>
          <p className="text-base sm:text-lg text-brand-text-secondary max-w-2xl leading-relaxed">
            Drop a weak season. Isolate a hot streak. Compare eras. Every episode scored by AI —
            pick your cut and see the Humor Index, with 95% confidence intervals.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Hero pick — magazine cover treatment */}
        {hero && hero.delta != null && hero.signatureAvg != null && (
          <Link
            href={`/shows/${hero.slug}/explore`}
            className="relative block bg-brand-card border border-brand-gold/40 rounded-2xl overflow-hidden hover:border-brand-gold transition-colors group"
          >
            {hero.backdrop_path && (
              <div className="relative h-44 sm:h-56 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://image.tmdb.org/t/p/w1280${hero.backdrop_path}`} alt="" className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/60 to-transparent" />
                <span className="absolute top-5 left-6 text-[10px] uppercase tracking-[0.25em] text-brand-gold">
                  Most dramatic cut on the site
                </span>
              </div>
            )}
            <div className="px-6 sm:px-8 pb-7 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 sm:gap-8 items-end">
                <div>
                  <h2 className="font-serif italic text-3xl sm:text-5xl text-brand-text-primary group-hover:text-brand-gold transition-colors leading-tight">
                    {hero.name}:
                  </h2>
                  <p className="font-serif italic text-2xl sm:text-3xl text-brand-text-secondary mt-1 leading-tight">
                    {hero.signatureLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif italic text-5xl sm:text-6xl text-brand-gold leading-none">
                    {formatIndex(hero.signatureAvg)}
                  </p>
                  <p className={`text-sm font-medium mt-2 ${hero.delta >= 0 ? 'text-emerald-400' : 'text-brand-text-muted'}`}>
                    {hero.delta >= 0 ? '+' : ''}{hero.delta.toFixed(1)} vs full series
                  </p>
                </div>
              </div>
              <p className="text-sm text-brand-text-secondary mt-5 leading-relaxed">
                See how this cut was built — then build your own.
              </p>
              <span className="inline-block text-xs uppercase tracking-widest text-brand-gold mt-4">
                Open this cut in the Explorer →
              </span>
            </div>
          </Link>
        )}

        {/* Section header */}
        <div className="pt-2">
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Every Show, Recut</p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary leading-tight mb-2">
            Build your own cut.
          </h2>
          <p className="text-sm text-brand-text-secondary max-w-xl mb-8 leading-relaxed">
            Each show has its own preset cuts — Golden eras, Renaissance arcs, hot streaks. Or build a custom slice and see how it scores.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            {rest.map(t => (
              <Link
                key={t.slug}
                href={`/shows/${t.slug}/explore`}
                className="relative block bg-brand-card border border-brand-border rounded-2xl overflow-hidden hover:border-brand-gold/40 transition-colors group"
              >
                {t.backdrop_path && (
                  <div className="relative h-32 w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://image.tmdb.org/t/p/w780${t.backdrop_path}`} alt="" className="w-full h-full object-cover opacity-40 group-hover:opacity-55 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/50 to-transparent" />
                    <span className="absolute top-3 right-4 font-serif italic text-xl text-brand-gold drop-shadow-md">
                      {formatIndex(t.humor_index)}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-serif italic text-xl text-brand-text-primary group-hover:text-brand-gold transition-colors leading-tight mb-2">
                    {t.name}
                  </h3>
                  <p className="text-sm text-brand-text-secondary mb-3 leading-relaxed">{t.line}</p>
                  <span className="inline-block text-[10px] uppercase tracking-widest text-brand-gold">
                    Open the explorer →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
