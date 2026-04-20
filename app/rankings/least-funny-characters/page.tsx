import Link from 'next/link';
import Image from 'next/image';
import { getAllShows, getCharacters } from '@/lib/data';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';

export const dynamic = 'force-static';

// Quality benchmarks (from the WAR formula: K=30, league_median=6.775, replacement=6.555)
const LEAGUE_MEDIAN = 6.775;
const REPLACEMENT = 6.555;
// Visual scale for the quality bar
const BAR_MIN = 6.0;
const BAR_MAX = 7.5;

export const metadata = {
  title: 'Below-Average Sitcom Characters, Ranked by Joke Score',
  description:
    "Every ensemble has plot-drivers whose jokes rate below the league median. These are the recurring characters whose craft + impact scores sit at the bottom — not a judgment of the character, a measurement of the bits.",
  openGraph: {
    title: 'Below-Average Sitcom Characters, Ranked by AI',
    description: "The data has feelings. Here are the characters whose jokes rate below the league median.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://thehumorindex.com/rankings/least-funny-characters',
  },
};

interface BottomCharacter {
  name: string;
  fullName: string;
  showName: string;
  showSlug: string;
  totalJokes: number;
  episodesAppeared: number;
  ratio: number;
  avgCraft: number;
  avgImpact: number;
  quality: number;
  peakQuality: number | null;
  eliteRate: number | null;
  actor?: string;
  profilePath?: string;
}

function tierFor(q: number): { label: string; color: string; bar: string } {
  if (q < REPLACEMENT) return { label: 'Below replacement', color: 'text-rose-400', bar: 'bg-rose-500/70' };
  if (q < LEAGUE_MEDIAN) return { label: 'Below median',      color: 'text-amber-400', bar: 'bg-amber-500/70' };
  return { label: 'Above median', color: 'text-emerald-400', bar: 'bg-emerald-500/70' };
}

function barPct(q: number): number {
  const pct = ((q - BAR_MIN) / (BAR_MAX - BAR_MIN)) * 100;
  return Math.max(0, Math.min(100, pct));
}

export default async function LeastFunnyCharactersPage() {
  const shows = await getAllShows();
  const all: BottomCharacter[] = [];

  for (const show of shows) {
    if (show.humor_index <= 0) continue;
    const totalEps = show.total_episodes || 0;
    if (!totalEps) continue;
    try {
      const chars = await getCharacters(show.slug);
      for (const c of chars) {
        if (c.total_jokes < 100) continue;
        const eps = c.episodes_appeared ?? 0;
        const ratio = eps / totalEps;
        if (ratio < 0.3) continue;
        const q = ((c.avg_craft ?? 0) + (c.avg_impact ?? 0)) / 2;
        all.push({
          name: c.name,
          fullName: c.character_full_name || c.name,
          showName: show.name,
          showSlug: show.slug,
          totalJokes: c.total_jokes,
          episodesAppeared: eps,
          ratio,
          avgCraft: c.avg_craft ?? 0,
          avgImpact: c.avg_impact ?? 0,
          quality: q,
          peakQuality: c.peak_quality ?? null,
          eliteRate: c.elite_rate ?? null,
          actor: c.actor,
          profilePath: c.profile_path,
        });
      }
    } catch { /* skip */ }
  }

  // Only show characters whose quality sits at or below the league median.
  // Anything above the median is, by definition, not "below average" — so it
  // shouldn't appear on a least-funny list at all.
  const ranked = all
    .filter(c => c.quality < LEAGUE_MEDIAN)
    .sort((a, b) => a.quality - b.quality);

  const belowReplacement = ranked.filter(c => c.quality < REPLACEMENT).length;

  return (
    <div>
      <PageHeader
        label="Rankings"
        title="Below-Average Sitcom Characters"
        subtitle="Main and recurring characters (30%+ of show episodes, 100+ jokes analyzed) whose joke scores sit below the league median. This measures the bits, not the character's value."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SocialShare
            title="Below-Average Sitcom Characters, Ranked"
            text="Every show has plot-drivers whose jokes rate lower. Here's who our AI puts at the bottom."
            url="/rankings/least-funny-characters"
          />
        </div>

        {/* Context card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-brand-surface border border-brand-border rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">League median</p>
            <p className="font-mono text-lg text-brand-text-primary mt-1">{LEAGUE_MEDIAN.toFixed(2)}</p>
            <p className="text-xs text-brand-text-muted mt-1">Average joke quality across all characters.</p>
          </div>
          <div className="bg-brand-surface border border-amber-500/30 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-amber-400">Below median</p>
            <p className="font-mono text-lg text-amber-400 mt-1">{ranked.length - belowReplacement}</p>
            <p className="text-xs text-brand-text-muted mt-1">Quality between {REPLACEMENT.toFixed(2)} and {LEAGUE_MEDIAN.toFixed(2)}.</p>
          </div>
          <div className="bg-brand-surface border border-rose-500/30 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-rose-400">Below replacement</p>
            <p className="font-mono text-lg text-rose-400 mt-1">{belowReplacement}</p>
            <p className="text-xs text-brand-text-muted mt-1">Quality under {REPLACEMENT.toFixed(2)} — the WAR floor.</p>
          </div>
        </div>

        <div className="bg-brand-surface/60 border border-brand-border rounded-lg p-4 mb-8 text-sm text-brand-text-secondary leading-relaxed">
          <strong className="text-brand-text-secondary">Reading this chart:</strong> <span className="text-brand-text-primary">Avg quality</span> is
          every joke averaged equally; <span className="text-brand-text-primary">peak quality</span> is
          the top 20% of their bits. A character can sit below median on average and still have elite
          peaks — that&rsquo;s the high-volume character archetype (Michael Scott, 3,265 jokes: avg
          6.69, peak 7.83). Straight men and plot-drivers typically rate lower than scene-stealers
          because they deliver setups for others to punch off of. This measures the bits, not the
          character.
        </div>

        <div className="space-y-2">
          {ranked.map((c, i) => {
            const t = tierFor(c.quality);
            return (
              <Link
                key={`${c.showSlug}-${c.name}`}
                href={`/shows/${c.showSlug}/characters/${encodeURIComponent(c.name)}`}
                className="flex items-center gap-3 bg-brand-card border border-brand-border rounded-lg px-4 py-3 hover:border-brand-gold/40 transition-colors group"
              >
                <span className="font-mono text-sm text-brand-text-muted w-6 shrink-0">#{i + 1}</span>
                {c.profilePath ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-brand-surface">
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${c.profilePath}`}
                      alt={c.actor || c.fullName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center shrink-0">
                    <span className="text-sm text-brand-text-muted">{c.fullName[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors truncate">
                    {c.fullName}
                  </p>
                  <p className="text-xs text-brand-text-muted truncate">
                    {c.showName} &middot; {c.totalJokes.toLocaleString()} jokes &middot; {c.episodesAppeared} eps
                  </p>
                  {/* Quality bar with median + replacement reference marks */}
                  <div className="relative h-1.5 mt-1.5 bg-brand-surface rounded-full overflow-visible">
                    <div
                      className={`absolute h-full rounded-full ${t.bar}`}
                      style={{ width: `${barPct(c.quality)}%` }}
                    />
                    {/* Replacement marker */}
                    <div
                      className="absolute top-[-2px] h-[calc(100%+4px)] w-px bg-rose-400/60"
                      style={{ left: `${barPct(REPLACEMENT)}%` }}
                      title="Replacement"
                    />
                    {/* Median marker */}
                    <div
                      className="absolute top-[-2px] h-[calc(100%+4px)] w-px bg-brand-text-muted/60"
                      style={{ left: `${barPct(LEAGUE_MEDIAN)}%` }}
                      title="League median"
                    />
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center gap-4">
                  <div className="w-16">
                    <p className={`font-mono text-sm ${t.color}`}>{c.quality.toFixed(2)}</p>
                    <p className="text-[10px] text-brand-text-muted">avg</p>
                  </div>
                  {c.peakQuality != null && (
                    <div className="w-16">
                      <p className={`font-mono text-sm ${c.peakQuality >= 7.75 ? 'text-emerald-400' : c.peakQuality >= 7.5 ? 'text-brand-gold' : 'text-brand-text-primary'}`}>
                        {c.peakQuality.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-brand-text-muted">peak</p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {ranked.length === 0 && (
          <div className="text-center py-12 text-brand-text-muted">
            No main/recurring characters currently score below the league median.
          </div>
        )}

        <div className="mt-12 border-t border-brand-border pt-8">
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-3">Methodology</p>
          <p className="text-sm text-brand-text-secondary leading-relaxed max-w-2xl">
            Quality index = (average craft score + average impact score) / 2, averaged across every
            joke attributed to the character. Only main and recurring characters appear
            ({'>'}30% of a show&rsquo;s episodes, 100+ jokes analyzed) — so bit-part guests
            can&rsquo;t skew the list. The league median and replacement floor come from the same
            constants used for our{' '}
            <Link href="/rankings/funniest-characters" className="text-brand-gold hover:underline">
              WAR ranking
            </Link>
            . See the{' '}
            <Link href="/methodology" className="text-brand-gold hover:underline">full methodology</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
