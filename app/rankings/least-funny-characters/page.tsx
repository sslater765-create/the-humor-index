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
  vsCastmates: number | null;
  vsCastmatesEps: number;
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
          vsCastmates: c.vs_castmates_delta ?? null,
          vsCastmatesEps: c.vs_castmates_episodes ?? 0,
          actor: c.actor,
          profilePath: c.profile_path,
        });
      }
    } catch { /* skip */ }
  }

  // PRIMARY CUT: characters who rate below their own cast in the same episodes.
  // This is the strongest signal — controlled comparison with same prompt, same
  // LLM, same show context. Cross-show averages are biased by show/runtime/format;
  // within-show vs-castmates is not.
  const ranked = all
    .filter(c => c.vsCastmates !== null && c.vsCastmates < 0 && c.vsCastmatesEps >= 5)
    .sort((a, b) => (a.vsCastmates ?? 0) - (b.vsCastmates ?? 0));

  const belowMedian = all.filter(c => c.quality < LEAGUE_MEDIAN).length;
  const belowReplacement = all.filter(c => c.quality < REPLACEMENT).length;

  return (
    <div>
      <PageHeader
        label="Rankings"
        title="Characters Who Rate Below Their Own Castmates"
        subtitle="For each episode, we compare a character's average joke quality to the rest of their cast in that same episode. Same prompt, same show, same LLM — the cleanest controlled comparison we can run. These are the recurring characters who trail their ensemble."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SocialShare
            title="Below-Average Sitcom Characters, Ranked"
            text="Every show has plot-drivers whose jokes rate lower. Here's who our AI puts at the bottom."
            url="/rankings/least-funny-characters"
          />
        </div>

        {/* Context cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-brand-surface border border-brand-border rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">Below castmates</p>
            <p className="font-mono text-lg text-brand-text-primary mt-1">{ranked.length}</p>
            <p className="text-xs text-brand-text-muted mt-1">Characters who trail their own cast in same-episode head-to-head.</p>
          </div>
          <div className="bg-brand-surface border border-amber-500/30 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-amber-400">Below league median</p>
            <p className="font-mono text-lg text-amber-400 mt-1">{belowMedian}</p>
            <p className="text-xs text-brand-text-muted mt-1">Avg quality under {LEAGUE_MEDIAN.toFixed(2)} (global cross-show cut).</p>
          </div>
          <div className="bg-brand-surface border border-rose-500/30 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-rose-400">Below WAR replacement</p>
            <p className="font-mono text-lg text-rose-400 mt-1">{belowReplacement}</p>
            <p className="text-xs text-brand-text-muted mt-1">Avg quality under {REPLACEMENT.toFixed(2)} — WAR floors at zero here.</p>
          </div>
        </div>

        <div className="bg-brand-surface/60 border border-brand-border rounded-lg p-4 mb-8 text-sm text-brand-text-secondary leading-relaxed space-y-2">
          <p>
            <strong className="text-brand-text-primary">Headline metric: vs castmates.</strong>{' '}
            For every episode a character is in, we average their joke scores and compare to the
            rest of the cast in that same episode. A delta of{' '}
            <span className="font-mono text-rose-400">&minus;0.15</span> means their jokes rate 0.15
            points lower than their own castmates on a 10-point scale, averaged across all shared
            episodes. Same LLM, same prompt, same show context — you&rsquo;re controlling for
            show/format/era.
          </p>
          <p>
            <strong className="text-brand-text-primary">Avg and peak</strong> give more context:
            peak is the top 20% of their jokes. A character can trail castmates on average and still
            have elite peaks (Michael Scott: &minus;0.126 vs cast, 6.69 avg, 7.83 peak — the
            high-volume-character archetype).
          </p>
          <p>
            Straight men and plot-drivers typically trail the scene-stealers because they deliver
            the setups others punch off of. This measures the bits, not the character&rsquo;s value
            to the show.
          </p>
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
                <div className="text-right shrink-0 flex items-center gap-3 sm:gap-4">
                  {c.vsCastmates != null && (
                    <div className="w-20">
                      <p className={`font-mono text-sm ${c.vsCastmates <= -0.15 ? 'text-rose-400' : c.vsCastmates < 0 ? 'text-amber-400' : 'text-brand-text-primary'}`}>
                        {c.vsCastmates >= 0 ? '+' : ''}{c.vsCastmates.toFixed(3)}
                      </p>
                      <p className="text-[10px] text-brand-text-muted">vs cast</p>
                      <p className="text-[10px] text-brand-text-muted">{c.vsCastmatesEps} eps</p>
                    </div>
                  )}
                  <div className="w-14 hidden sm:block">
                    <p className={`font-mono text-sm ${t.color}`}>{c.quality.toFixed(2)}</p>
                    <p className="text-[10px] text-brand-text-muted">avg</p>
                  </div>
                  {c.peakQuality != null && (
                    <div className="w-14 hidden sm:block">
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
            No recurring characters currently trail their own castmates.
          </div>
        )}

        <div className="mt-12 border-t border-brand-border pt-8 space-y-4 max-w-2xl">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">vs castmates — how it&rsquo;s computed</p>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              For every episode a character appears in, we take the mean quality (craft + impact / 2)
              of their jokes and compare it to the mean of everyone else&rsquo;s jokes in that same
              episode. We average those per-episode deltas across all shared episodes (minimum 5
              for stability). This design cancels out show-level, season-level, and prompt-level
              biases because both sides are scored by the same model in the same call.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">Supporting metrics</p>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              Avg quality is every joke weighted equally; peak quality is the top 20% of the
              character&rsquo;s jokes. Only main and recurring characters appear ({'>'}30% of a
              show&rsquo;s episodes, 100+ jokes analyzed). See the{' '}
              <Link href="/rankings/funniest-characters" className="text-brand-gold hover:underline">WAR ranking</Link>
              {' '}and{' '}
              <Link href="/methodology" className="text-brand-gold hover:underline">full methodology</Link> for context.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
