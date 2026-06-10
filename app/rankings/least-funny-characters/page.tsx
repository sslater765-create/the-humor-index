import Link from 'next/link';
import { getAllShows, getCharacters } from '@/lib/data';
import PageHeader from '@/components/layout/PageHeader';
import SocialShare from '@/components/ui/SocialShare';
import LeastFunnyClient from './LeastFunnyClient';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const dynamic = 'force-static';

// Replacement-level quality from the WAR formula (K=30, replacement=6.555).
const REPLACEMENT = 6.555;

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
    canonical: 'https://www.thehumorindex.com/rankings/least-funny-characters/',
  },
};

interface BottomCharacter {
  name: string;
  fullName: string;
  showName: string;
  showSlug: string;
  showFormat: string;
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
  vsCastmatesCiHalf: number | null;
  actor?: string;
  profilePath?: string;
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
          showFormat: show.format,
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
          vsCastmatesCiHalf: c.vs_castmates_ci_half ?? null,
          actor: c.actor,
          profilePath: c.profile_path,
        });
      }
    } catch { /* skip */ }
  }

  // PRIMARY CUT: characters whose vs-castmates delta is STATISTICALLY significant
  // at 95% — i.e. delta + CI half-width < 0. Controlled comparison with same
  // prompt, same LLM, same show context; the CI catches small-sample flukes.
  const ranked = all
    .filter(c =>
      c.vsCastmates !== null &&
      c.vsCastmatesCiHalf !== null &&
      c.vsCastmates + c.vsCastmatesCiHalf < 0 && // upper bound of CI still negative
      c.vsCastmatesEps >= 5
    )
    .sort((a, b) => (a.vsCastmates ?? 0) - (b.vsCastmates ?? 0));

  // Characters with a negative point-estimate but CI crossing zero — suggestive but not conclusive
  const suggestive = all
    .filter(c =>
      c.vsCastmates !== null &&
      c.vsCastmates < 0 &&
      c.vsCastmatesCiHalf !== null &&
      c.vsCastmates + c.vsCastmatesCiHalf >= 0 &&
      c.vsCastmatesEps >= 5
    ).length;

  const belowReplacement = all.filter(c => c.quality < REPLACEMENT).length;

  return (
    <div>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Rankings', path: '/rankings' },
          { name: 'Below Cast Average', path: '/rankings/least-funny-characters' },
        ]}
      />
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
          <div className="bg-brand-surface border border-rose-500/30 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-rose-400">Below cast average · dialogue only</p>
            <p className="font-mono text-lg text-rose-400 mt-1">{ranked.length}</p>
            <p className="text-xs text-brand-text-muted mt-1">95% CI on their vs-cast delta stays negative — real finding.</p>
          </div>
          <div className="bg-brand-surface border border-amber-500/30 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-amber-400">Suggestive but noisy</p>
            <p className="font-mono text-lg text-amber-400 mt-1">{suggestive}</p>
            <p className="text-xs text-brand-text-muted mt-1">Point estimate negative but CI crosses zero — within noise.</p>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-brand-text-muted">Below WAR replacement</p>
            <p className="font-mono text-lg text-brand-text-primary mt-1">{belowReplacement}</p>
            <p className="text-xs text-brand-text-muted mt-1">Avg quality under {REPLACEMENT.toFixed(2)} — WAR floors at zero here.</p>
          </div>
        </div>

        <div className="bg-brand-surface/60 border border-brand-border rounded-lg p-4 mb-8 text-sm text-brand-text-secondary leading-relaxed space-y-2">
          <p>
            <strong className="text-brand-text-primary">Headline metric: vs castmates, with a 95% CI.</strong>{' '}
            For every episode a character appears in, we compare their average joke quality to the
            rest of the cast in that same episode, then average across episodes. Same LLM, same
            prompt, same show context. The <span className="font-mono">± value</span> next to each
            delta is the 95% confidence interval half-width — <em>only characters whose upper
            bound is still negative appear here</em>. Small-sample flukes (Erin Hannon, Toby
            Flenderson) are automatically filtered out even though their point estimates are
            negative.
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

        <LeastFunnyClient characters={ranked} />

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
