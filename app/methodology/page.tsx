import PageHeader from '@/components/layout/PageHeader';
import { FORMAT_COEFFICIENTS, FORMAT_LABELS } from '@/lib/scoring';
import { ShowFormat } from '@/lib/types';

export const metadata = {
  title: 'Methodology — The Humor Index',
  description: 'How we calculate the Humor Index: JPM, Craft, Impact, and the format adjustment.',
  alternates: {
    canonical: 'https://thehumorindex.com/methodology',
  },
  openGraph: {
    title: 'Methodology — The Humor Index',
    description: 'How we calculate the Humor Index: JPM, Craft, Impact, and the format adjustment.',
    images: ['/og-image.png'],
  },
};

export const dynamic = 'force-static';

export default function MethodologyPage() {
  return (
    <div>
      <PageHeader
        label="Transparency"
        title="How We Score"
        subtitle="Every number on this site is derived from the same pipeline. Here's exactly how it works."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* The three pillars */}
        <section>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-6">The Formula</p>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">Three Pillars</h2>
          <p className="text-brand-text-secondary text-sm leading-relaxed mb-8">
            The Humor Index is a weighted composite of three independently scored dimensions.
            Each episode is analyzed at the joke level, then aggregated to season and show level.
          </p>
          <div className="space-y-4">
            {[
              {
                abbr: 'JPM',
                weight: '30%',
                label: 'Jokes Per Minute',
                color: '#E8B931',
                desc: `Raw comedic density. We count every distinct joke that lands — setups with identifiable punchlines,
                       physical gags, callbacks, and running gags — then divide by the episode's net comedy runtime
                       (total runtime minus cold opens, credits, and drama-only scenes). Higher JPM reflects a tighter,
                       more consistently funny script.`,
              },
              {
                abbr: 'Craft',
                weight: '40%',
                label: 'Craft Score',
                color: '#378ADD',
                desc: `Quality over quantity. Each joke is scored across five sub-dimensions (see below).
                       Craft rewards structural sophistication: misdirection, subverted expectations,
                       perfect character fit, and timing precision. A show can have low JPM and high Craft
                       (slow-burn prestige comedy) or vice versa.`,
              },
              {
                abbr: 'Impact',
                weight: '30%',
                label: 'Impact Score',
                color: '#1D9E75',
                desc: `Resonance and staying power. Quotability (does this line get repeated?),
                       rewatch value (is it funnier the second time?), cultural footprint,
                       and callback payoff. Impact captures what pure craft analysis misses —
                       a technically average joke that becomes a catchphrase scores higher here.`,
              },
            ].map(p => (
              <div key={p.abbr} className="bg-brand-card border border-brand-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl" style={{ color: p.color }}>{p.abbr}</span>
                    <span className="text-sm font-medium text-brand-text-primary">{p.label}</span>
                  </div>
                  <span className="font-mono text-xs text-brand-text-muted border border-brand-border rounded px-2 py-0.5">
                    {p.weight}
                  </span>
                </div>
                <p className="text-sm text-brand-text-secondary leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Craft rubric */}
        <section>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-6">Craft Breakdown</p>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">The Craft Rubric</h2>
          <p className="text-brand-text-secondary text-sm leading-relaxed mb-6">
            Craft is scored 1–10 across five sub-dimensions, equally weighted. Each is assessed per joke,
            then averaged across the episode.
          </p>
          <div className="divide-y divide-brand-border border border-brand-border rounded-xl overflow-hidden">
            {[
              {
                name: 'Setup Quality',
                desc: 'How efficiently and elegantly the premise is established. A great setup is invisible — it plants the seed without telegraphing the punchline.',
                example: '"George is a marine biologist now." (Seinfeld S5E14)',
              },
              {
                name: 'Misdirection',
                desc: 'The degree to which the joke leads the audience toward a false expectation before subverting it. True misdirection is earned, not cheap.',
                example: '"I am not superstitious... but I am a little stitious." (The Office)',
              },
              {
                name: 'Subversion / Surprise',
                desc: 'Does the punchline go somewhere unexpected? Subversion is the delta between what the audience anticipated and what actually happened.',
                example: 'The Soup Nazi\'s final line in the episode finale.',
              },
              {
                name: 'Character Fit',
                desc: 'Could only this character have delivered this joke? High character fit means the joke reveals or reinforces something true about who the character is.',
                example: 'Every Dwight exit from a room.',
              },
              {
                name: 'Timing Precision',
                desc: 'Beat length, pause placement, delivery speed. Timing is harder to score but we proxy it through editing rhythm, reaction shot positioning, and line overlap.',
                example: 'Jim\'s camera looks. George\'s pauses before responding.',
              },
            ].map((item, i) => (
              <div key={i} className="p-5">
                <p className="text-sm font-medium text-brand-text-primary mb-1">{item.name}</p>
                <p className="text-sm text-brand-text-secondary leading-relaxed mb-2">{item.desc}</p>
                <p className="text-xs text-brand-text-muted italic">Example: {item.example}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Format adjustment */}
        <section>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-6">Format Adjustment</p>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">The Laugh Track Correction</h2>
          <p className="text-brand-text-secondary text-sm leading-relaxed mb-6">
            Multi-camera shows with sweetened laugh tracks structurally inflate joke density —
            the laugh track signals joke boundaries that a single-camera show leaves implicit.
            To compare across formats fairly, we apply a format coefficient to the raw Humor Index.
          </p>
          <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left text-xs uppercase tracking-widest text-brand-text-muted font-normal px-5 py-3">Format</th>
                  <th className="text-right text-xs uppercase tracking-widest text-brand-text-muted font-normal px-5 py-3">Coefficient</th>
                  <th className="text-right text-xs uppercase tracking-widest text-brand-text-muted font-normal px-5 py-3">Effect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {(Object.entries(FORMAT_COEFFICIENTS) as [ShowFormat, number][]).map(([fmt, coef]) => (
                  <tr key={fmt}>
                    <td className="px-5 py-3 text-brand-text-primary">{FORMAT_LABELS[fmt]}</td>
                    <td className="px-5 py-3 text-right font-mono text-brand-gold">{coef.toFixed(2)}×</td>
                    <td className="px-5 py-3 text-right text-xs text-brand-text-muted">
                      {coef === 1.00 ? 'Baseline' : `−${Math.round((1 - coef) * 100)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
            <span className="text-amber-400">Deprecated as of 2026-04-16.</span> Coefficients have all been set to 1.0
            (no format adjustment). The old coefficients were confounded with show identity and calibrated against
            an opaque small sample. We now publish raw scores and let you filter by format on the shows and
            rankings pages. See the &quot;Why we don&apos;t adjust for format&quot; section below.
          </p>
        </section>

        {/* Format policy */}
        <section>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-6">Policy</p>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">Why We Don&apos;t Adjust for Format</h2>
          <p className="text-brand-text-secondary text-sm leading-relaxed mb-4">
            An earlier version of the Humor Index silently penalized multi-cam shows (live audience, laugh track)
            by 15–25%, on the premise that audience reaction inflated perceived impact. That adjustment had three
            problems:
          </p>
          <ul className="text-sm text-brand-text-secondary space-y-2 list-disc list-inside mb-4">
            <li>
              <span className="text-brand-text-primary">Confounding.</span> With only three scored shows, the
              &quot;format effect&quot; can&apos;t be statistically separated from show-level idiosyncrasies. You
              can&apos;t identify a format coefficient with that few levels of the treatment variable.
            </li>
            <li>
              <span className="text-brand-text-primary">Opaque calibration.</span> The coefficients were point
              estimates with no published confidence interval and a sample we can&apos;t re-examine.
            </li>
            <li>
              <span className="text-brand-text-primary">Silent correction.</span> Friends&apos; 72.8 and
              Seinfeld&apos;s 77.9 partly reflected a 15% multi-cam tax, without that being visible to readers.
            </li>
          </ul>
          <p className="text-brand-text-secondary text-sm leading-relaxed mb-4">
            Our fix: <span className="text-brand-text-primary">report raw scores</span>, tag every show with its
            format, and offer format-filtered leaderboards so you can compare like against like. Multi-cam shows
            and single-cam shows aren&apos;t directly comparable on a single scale — they&apos;re different comedy
            traditions with different conventions.
          </p>
          <p className="text-xs text-brand-text-muted leading-relaxed">
            Score changes from the removal: Seinfeld 77.9 → 83.9, Friends 72.8 → 78.7, The Office 81.0 → 80.2.
            The original scores are preserved on each page as <code className="text-brand-text-secondary">humor_index_v1</code> for
            transparency.
          </p>
        </section>

        {/* Confidence intervals & percentiles */}
        <section>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-6">Uncertainty</p>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">Confidence Intervals &amp; Percentiles</h2>
          <p className="text-brand-text-secondary text-sm leading-relaxed mb-4">
            Every score on the site is a point estimate with real uncertainty. We now publish:
          </p>
          <ul className="text-sm text-brand-text-secondary space-y-2 list-disc list-inside">
            <li>
              <span className="text-brand-text-primary">95% bootstrap confidence intervals</span> on episode, season,
              and show Humor Indexes. Episode-level CIs resample the episode&apos;s own jokes with replacement 200×
              and take the 2.5th and 97.5th percentiles of the resulting score distribution. Season/show-level CIs
              resample episodes.
            </li>
            <li>
              <span className="text-brand-text-primary">Show-relative percentile</span> on every episode. An episode
              at p90 in Friends means it&apos;s funnier than 90% of scored Friends episodes, independent of the
              absolute score.
            </li>
            <li>
              <span className="text-brand-text-primary">Z-scores within show and within season.</span> Useful for
              cross-show comparisons that control for the show&apos;s overall comedy baseline.
            </li>
          </ul>
          <p className="text-xs text-brand-text-muted mt-4 leading-relaxed">
            These are model-uncertainty estimates — they capture how much the score would jitter if we resampled
            jokes or episodes. They do <em>not</em> capture structural bias (LLM compression, format effects, etc.).
            See the Known Limitations section.
          </p>
        </section>

        {/* Comedy WAR methodology */}
        <section>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-6">Career Value</p>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">Comedy WAR (Wins Above Replacement)</h2>
          <p className="text-brand-text-secondary text-sm leading-relaxed mb-4">
            Career WAR ranks characters by total comedic contribution relative to a
            &quot;replacement-level&quot; bench player. Higher WAR means more jokes at higher average
            quality than you&apos;d get from a typical recurring character.
          </p>
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 mb-4">
            <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Formula (v2)</p>
            <p className="font-mono text-sm text-brand-text-primary mb-3">
              WAR = total_jokes × max(shrunk_quality − replacement_quality, 0)
            </p>
            <p className="font-mono text-xs text-brand-text-secondary">
              shrunk_quality = (n · observed_quality + 30 · league_median) / (n + 30)
            </p>
            <p className="font-mono text-xs text-brand-text-secondary mt-1">
              observed_quality = (avg_craft + avg_impact) / 2
            </p>
          </div>
          <ul className="text-sm text-brand-text-secondary space-y-2 list-disc list-inside">
            <li><span className="text-brand-text-primary">Replacement quality</span> = 25th percentile of the (craft+impact)/2 quality metric among bench-player characters (10–50 analyzed jokes). As of 2026-04-16 that level sits at 6.555.</li>
            <li><span className="text-brand-text-primary">Bayesian shrinkage (k=30)</span> pulls small-sample estimates toward the league median (6.775), preventing a 10-joke guest star with a lucky mean from beating a 1,000-joke lead.</li>
            <li><span className="text-brand-text-primary">WAR/Episode</span> = WAR ÷ episodes appeared. Use this for cross-era and cross-run-length comparisons.</li>
          </ul>
          <p className="text-xs text-brand-text-muted mt-4 leading-relaxed">
            <span className="text-brand-text-primary">History:</span> v1 used a fixed midpoint
            (&quot;−5&quot;) as the replacement baseline, which caused WAR to collapse to roughly 1.5 × total_jokes
            (effectively a screen-time metric). v2 swaps in an empirical replacement level and adds
            Bayesian shrinkage — rankings now reflect genuine quality × volume.
          </p>
        </section>

        {/* Limitations */}
        <section>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-6">Honesty</p>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">Known Limitations</h2>
          <div className="space-y-3">
            {[
              {
                title: 'LLM score compression',
                desc: 'Across 594 scored episodes, average craft scores have a standard deviation of just 0.36 (nominal 0–10 scale). Most of the headline signal in the Humor Index comes from joke count and peak density, not fine-grained craft differences between episodes.',
              },
              {
                title: 'Format coefficient is a thumb on the scale',
                desc: 'The multi-cam penalty (15–25% on impact) was calibrated against a small blind sample, not learned from data. It mechanically depresses Friends and Seinfeld relative to single-camera shows. Results should be read with that in mind.',
              },
              {
                title: 'Small samples and Bayesian shrinkage',
                desc: 'Character WAR with fewer than 50 analyzed jokes is shrunk aggressively toward the league median. Rankings stabilize once a character crosses ~100 jokes.',
              },
              {
                title: 'Visual gags are underweighted',
                desc: 'AI works from transcripts and scene descriptions. Physical comedy — a pratfall, a facial expression, Kramer\'s entrances — is harder to capture and likely underscored.',
              },
              {
                title: 'Sarcasm and irony are hard',
                desc: 'Tone doesn\'t exist in a transcript. Ironic deadpan (e.g. Jim\'s camera looks) is identifiable through context, but subtle sarcasm likely gets miscategorized at the edges.',
              },
              {
                title: 'Cultural context decays',
                desc: 'Jokes referencing specific 90s or 00s cultural moments may score lower on "cultural footprint" than they should, since the model\'s resonance signals are present-weighted.',
              },
              {
                title: 'JPM uses estimated runtime',
                desc: 'Jokes Per Minute currently divides by an LLM-estimated episode runtime rather than an authoritative TMDB runtime. This makes JPM slightly self-correlated with joke count and format. Switching to TMDB runtime is planned.',
              },
              {
                title: 'Scoring is not blind to show identity',
                desc: 'The LLM sees the show name and character list when scoring. This can introduce show-level priors (e.g. "this is classic Office" biasing toward higher scores). A blind-mode rescoring study is planned for a future methodology version; it would require re-running the full ~600-episode corpus.',
              },
              {
                title: 'No audience data',
                desc: 'We don\'t use ratings, streaming numbers, or social media sentiment in the score itself. Across 591 episodes, the Humor Index correlates with IMDb audience ratings at r = −0.005 — they measure different things.',
              },
              {
                title: 'Only scripted comedy',
                desc: 'Stand-up specials, improv, and sketch comedy require a different methodology. This pipeline is calibrated for scripted, episodic television only.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-brand-card border border-brand-border rounded-xl p-5">
                <p className="text-sm font-medium text-brand-text-primary mb-1">{item.title}</p>
                <p className="text-sm text-brand-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
