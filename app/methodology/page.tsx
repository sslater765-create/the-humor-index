import { FORMAT_COEFFICIENTS, FORMAT_LABELS } from '@/lib/scoring';
import { ShowFormat } from '@/lib/types';

export const metadata = {
  title: 'How We Score Comedy: JPM, Craft, Impact & WAR',
  description: 'How we calculate the Humor Index: jokes per minute, craft, impact, and why we no longer adjust for format. The full scoring methodology.',
  alternates: {
    canonical: 'https://thehumorindex.com/methodology/',
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
      {/* Editorial hero */}
      <section className="relative border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-gold mb-4">The Show Your Work</p>
          <h1 className="font-serif italic text-4xl sm:text-6xl text-brand-text-primary leading-[1.05] mb-5 max-w-3xl">
            How we turn jokes into numbers.
          </h1>
          <p className="text-base sm:text-lg text-brand-text-secondary max-w-2xl leading-relaxed mb-6">
            Every score on this site comes from the same pipeline — Claude reading the whole transcript,
            tagging every laugh, rating each on a five-axis craft rubric, then aggregating up to the episode,
            season, and show. Here&apos;s the math, the rubric, and the noise floor we&apos;ve measured against it.
          </p>

          {/* The three numbers at a glance */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            <div>
              <p className="font-serif italic text-3xl sm:text-4xl text-brand-gold leading-none">25<span className="text-2xl">%</span></p>
              <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-1">Density</p>
            </div>
            <div>
              <p className="font-serif italic text-3xl sm:text-4xl text-brand-blue leading-none">40<span className="text-2xl">%</span></p>
              <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-1">Craft</p>
            </div>
            <div>
              <p className="font-serif italic text-3xl sm:text-4xl text-emerald-400 leading-none">35<span className="text-2xl">%</span></p>
              <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-1">Impact</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* The three pillars */}
        <section>
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">The Formula</p>
          <h2 className="font-serif italic text-3xl text-brand-text-primary mb-4 leading-tight">Three Pillars</h2>
          <p className="text-brand-text-secondary text-sm leading-relaxed mb-8">
            The Humor Index is a weighted composite of three independently scored dimensions.
            Each episode is analyzed at the joke level, then aggregated to season and show level.
          </p>
          <div className="space-y-4">
            {[
              {
                abbr: 'JPM',
                weight: '25%',
                label: 'Density (JPM + Peak)',
                color: '#E8B931',
                desc: `Raw comedic density across the episode plus peak density across its best runs. We count every distinct joke that lands —
                       setups with identifiable punchlines, physical gags, callbacks, and running gags — then divide by the episode's net
                       comedy runtime. The peak-density component (15% of the final score) rewards episodes that hit elite stretches; the
                       weighted-JPM component (10%) rewards sustained density over the full episode.`,
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
                weight: '35%',
                label: 'Impact Score',
                color: '#1D9E75',
                desc: `Resonance and staying power. Quotability (does this line get repeated?),
                       rewatch value (is it funnier the second time?), cultural footprint,
                       and callback payoff. Impact captures what pure craft analysis misses —
                       a technically average joke that becomes a catchphrase scores higher here.
                       A small memorability bonus is added on top for episodes packed with iconic moments.`,
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
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Craft Breakdown</p>
          <h2 className="font-serif italic text-3xl text-brand-text-primary mb-4 leading-tight">The Craft Rubric</h2>
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
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Format Adjustment</p>
          <h2 className="font-serif italic text-3xl text-brand-text-primary mb-4 leading-tight">The Laugh Track Correction</h2>
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
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Policy</p>
          <h2 className="font-serif italic text-3xl text-brand-text-primary mb-4 leading-tight">Why We Don&apos;t Adjust for Format</h2>
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
            transparency. <span className="text-brand-text-secondary">Subsequent update (April 18, 2026):</span> we then
            discovered that Jerry&apos;s stand-up bits at The Improv were being scored as sitcom comedy.
            Applying a 0.30 standup weighting and rescoring all 172 Seinfeld episodes with 3-run consensus
            moved Seinfeld from 83.9 → 77.8. <span className="text-brand-text-secondary">Reconciliation (May 25, 2026):</span> as
            new shows were added the live leaderboard drifted from the canonical aggregation, so we re-aggregated
            all nine scored shows with one consistent method and added bootstrap 95% confidence intervals.
            Current published order: 30 Rock 84.4, Arrested Development 82.0, The Office <span className="text-brand-text-primary">79.2</span>,
            Community 77.9, Parks and Recreation 77.7, Taxi 77.3, Schitt&apos;s Creek 77.3, Seinfeld 77.0,
            Friends 73.3. 30 Rock and Arrested Development pull clear at the top; the middle six cluster inside
            each other&apos;s intervals; Friends now sits clearly below the pack.
          </p>
        </section>

        {/* Scorer noise floor (Level 2 findings) */}
        <section>
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Reliability</p>
          <h2 className="font-serif italic text-3xl text-brand-text-primary mb-4 leading-tight">Our Scorer&apos;s Noise Floor</h2>
          <p className="text-brand-text-secondary text-sm leading-relaxed mb-4">
            We ran a test-retest study: 30 episodes were scored twice, both in blind mode, with different random seeds.
            Results:
          </p>
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 mb-4">
            <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Intraclass correlation (ICC)</p>
            <ul className="text-sm font-mono text-brand-text-primary space-y-1">
              <li>Humor Index (0–100): <span className="text-amber-400">0.28</span> <span className="text-xs text-brand-text-muted">(poor, &lt; 0.40)</span></li>
              <li>avg_craft (0–10): <span className="text-amber-400">0.28</span></li>
              <li>avg_impact (0–10): <span className="text-amber-400">0.24</span></li>
              <li>total_jokes detected: <span className="text-emerald-400">0.67</span> <span className="text-xs text-brand-text-muted">(moderate)</span></li>
              <li>JPM: <span className="text-emerald-400">0.53</span> <span className="text-xs text-brand-text-muted">(moderate)</span></li>
            </ul>
            <p className="text-xs text-brand-text-secondary mt-3">
              Mean absolute difference between two blind runs of the same episode: <span className="text-brand-text-primary">10.7 Humor Index points</span>.
              72% of single-run Humor Index variance is run-to-run scorer noise; only 28% is real episode signal.
            </p>
          </div>
          <p className="text-sm text-brand-text-secondary leading-relaxed mb-4">
            <span className="text-brand-text-primary">Why:</span> joke detection is stable (67% signal), but per-joke craft/impact
            ratings jitter by ~5% between runs. The Humor Index formula amplifies that noise through threshold-based metrics
            (peak_density, memorability_bonus) that flip on small score changes.
          </p>
          <p className="text-sm text-brand-text-secondary leading-relaxed mb-4">
            <span className="text-brand-text-primary">What this means for rankings:</span>
          </p>
          <ul className="text-sm text-brand-text-secondary space-y-2 list-disc list-inside mb-4">
            <li>
              <span className="text-brand-text-primary">Show-level rankings hold up.</span> Averaging over 170–236 episodes drives the standard error on show Humor Index to roughly <span className="font-mono">±0.4 points</span>. The 3–6 point gaps between Seinfeld, Office, and Friends are well above that floor.
            </li>
            <li>
              <span className="text-brand-text-primary">Individual episode rankings have ±5 point noise.</span> Two episodes within ~10 Humor Index points of each other are essentially tied under single-run scoring.
            </li>
            <li>
              <span className="text-brand-text-primary">Extreme episodes still stand out.</span> Dinner Party (100) vs an average 75 is comfortably above the noise. It&apos;s the close-finish ordering that&apos;s uncertain.
            </li>
          </ul>
          <p className="text-sm text-brand-text-secondary leading-relaxed mb-4">
            <span className="text-brand-text-primary">What we&apos;re doing:</span> consensus scoring. Our pipeline supports multi-run scoring via <code className="text-brand-text-primary">--num-runs</code>.
            All new shows starting with Parks and Recreation will be scored 3× per episode and averaged. This should raise ICC to moderate (≥0.40); five runs would reach the &quot;good&quot; threshold (≥0.75).
          </p>
          <p className="text-xs text-brand-text-muted leading-relaxed">
            Full study: see the <a href="/blog/scorer-noise-floor" className="text-brand-gold hover:underline">blog post</a>.
          </p>
        </section>

        {/* Show-identity bias */}
        <section>
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Bias</p>
          <h2 className="font-serif italic text-3xl text-brand-text-primary mb-4 leading-tight">Show-Identity Bias: Small and Not Significant</h2>
          <p className="text-brand-text-secondary text-sm leading-relaxed mb-4">
            We scored 99 episodes in blind mode (no show name, no character list, no description fed to the LLM) and
            compared to their non-blind production scores. Paired differences:
          </p>
          <div className="bg-brand-card border border-brand-border rounded-xl p-5">
            <ul className="text-sm font-mono text-brand-text-primary space-y-1">
              <li>Pooled (n=99): <span className="text-brand-text-primary">−1.47 HI points</span> <span className="text-xs text-brand-text-muted">(95% CI: [−3.72, +0.79])</span></li>
              <li>Seinfeld (n=33): −2.45 (CI [−5.71, +0.82])</li>
              <li>The Office (n=33): −1.23 (CI [−5.11, +2.65])</li>
              <li>Friends (n=33): −0.72 (CI [−5.29, +3.84])</li>
            </ul>
            <p className="text-xs text-brand-text-secondary mt-3">
              All CIs include zero. No show shows a statistically significant bias from knowing the show name. The
              direction (blind scores slightly HIGHER, not lower) is the opposite of what a naive &quot;AI favors famous
              shows&quot; hypothesis would predict.
            </p>
          </div>
        </section>

        {/* Bayesian credible intervals */}
        <section>
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Bayesian Model</p>
          <h2 className="font-serif italic text-3xl text-brand-text-primary mb-4 leading-tight">What a Hierarchical Model Actually Finds</h2>
          <p className="text-brand-text-secondary text-sm leading-relaxed mb-4">
            We fit a hierarchical Bayesian model to 15,000 jokes (5,000 per scored show) predicting joke-level impact from show, format, joke type, episode, and character. Here&apos;s what came out.
          </p>
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 mb-4">
            <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Format effect</p>
            <p className="font-mono text-sm text-brand-text-primary mb-1">Single-cam vs multi-cam: −0.052 (95% CrI: [−0.590, +0.442])</p>
            <p className="text-xs text-brand-text-secondary mt-2">
              The 95% credible interval straddles zero. After controlling for show, joke type, episode, and character, we cannot statistically distinguish single-cam from multi-cam on impact. This vindicates the decision to set the format coefficient to 1.0.
            </p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 mb-4">
            <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Show effects (impact deflection from grand mean)</p>
            <ul className="text-sm font-mono text-brand-text-primary space-y-1">
              <li>Seinfeld: +0.154 (95% CrI: [−0.224, +0.530])</li>
              <li>The Office: −0.007 (95% CrI: [−0.505, +0.456])</li>
              <li>Friends: −0.131 (95% CrI: [−0.498, +0.235])</li>
            </ul>
            <p className="text-xs text-brand-text-secondary mt-3">
              All three intervals overlap. The posterior ordering (Seinfeld &gt; Office &gt; Friends) matches our Humor Index rankings, but the differences are within the statistical noise of this model.
              Probability that Seinfeld beats Friends on show-effect is approximately 82% — better than a coin flip, but not 99%+ certain.
            </p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-xl p-5">
            <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Variance decomposition</p>
            <ul className="text-sm text-brand-text-secondary space-y-1 list-disc list-inside">
              <li><span className="text-brand-text-primary font-mono">63.9%</span> — within-joke residual (unexplained)</li>
              <li><span className="text-brand-text-primary font-mono">11.8%</span> — between episodes within a show</li>
              <li><span className="text-brand-text-primary font-mono">8.9%</span> — between joke types</li>
              <li><span className="text-brand-text-primary font-mono">7.9%</span> — between shows</li>
              <li><span className="text-brand-text-primary font-mono">7.5%</span> — between characters</li>
            </ul>
            <p className="text-xs text-brand-text-secondary mt-3">
              Shows explain only 7.9% of total joke-level variance. Rankings between shows capture a small fraction of what makes a joke score well.
              Two-thirds of the variance is unexplained within-joke residual — some real (same joke type executed better or worse), some LLM noise.
            </p>
          </div>
          <p className="text-xs text-brand-text-muted mt-4 leading-relaxed">
            Full Bayesian model outputs are published at{' '}
            <a href="/data/format_posteriors.json" className="text-brand-gold hover:underline">/data/format_posteriors.json</a>,{' '}
            <a href="/data/show_credible_intervals.json" className="text-brand-gold hover:underline">/data/show_credible_intervals.json</a>, and{' '}
            <a href="/data/variance_decomposition.json" className="text-brand-gold hover:underline">/data/variance_decomposition.json</a>.
          </p>
        </section>

        {/* Confidence intervals & percentiles */}
        <section>
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Uncertainty</p>
          <h2 className="font-serif italic text-3xl text-brand-text-primary mb-4 leading-tight">Confidence Intervals &amp; Percentiles</h2>
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
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Career Value</p>
          <h2 className="font-serif italic text-3xl text-brand-text-primary mb-4 leading-tight">Comedy WAR (Wins Above Replacement)</h2>
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
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Honesty</p>
          <h2 className="font-serif italic text-3xl text-brand-text-primary mb-4 leading-tight">Known Limitations</h2>
          <div className="space-y-3">
            {[
              {
                title: 'LLM score compression',
                desc: 'Across 594 scored episodes, average craft scores have a standard deviation of just 0.36 (nominal 0–10 scale). Most of the headline signal in the Humor Index comes from joke count and peak density, not fine-grained craft differences between episodes.',
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
                desc: 'The LLM sees the show name and character list when scoring. This can introduce show-level priors. We ran a 99-episode blind-mode study (above): pooled difference was −1.47 HI points, 95% CI [−3.72, +0.79] — no statistically significant bias, and the direction was opposite to what a naive "AI favors famous shows" hypothesis would predict. A full-corpus rescoring is still future work.',
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

        {/* Glossary — targets definitional queries ("what is jokes per minute", "comedy WAR") */}
        <section>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: 'What is jokes per minute (JPM)?', acceptedAnswer: { '@type': 'Answer', text: 'Jokes per minute (JPM) is the number of distinct, separately identifiable jokes a show lands per minute of runtime. The Humor Index counts gradeable jokes — not every comedic line or laugh-track beat — so the figure is lower than informal counts but consistent across every show.' } },
                { '@type': 'Question', name: 'What is the Humor Index?', acceptedAnswer: { '@type': 'Answer', text: 'The Humor Index is a 0–100 score combining four signals: peak joke density, craft (writing quality), impact (audience resonance), and weighted jokes per minute. Every joke in an episode is scored by AI, then aggregated to episode, season, and show level.' } },
                { '@type': 'Question', name: 'What is comedy WAR (Wins Above Replacement)?', acceptedAnswer: { '@type': 'Answer', text: 'WAR adapts baseball’s Wins Above Replacement to comedy: a character’s joke count multiplied by how much their shrunk average quality exceeds a replacement-level baseline (the 25th-percentile bench character). It rewards both volume and quality, so high-output stars rank above one-line scene-stealers.' } },
                { '@type': 'Question', name: 'What do craft and impact mean?', acceptedAnswer: { '@type': 'Answer', text: 'Craft is the writing quality of a joke across five sub-dimensions (originality, structure, character integration, economy, earned-vs-cheap). Impact is audience resonance — quotability, rewatch value, cultural footprint, and callback payoff. Both are scored 1–10 per joke.' } },
              ],
            }) }}
          />
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-3">Glossary</p>
          <h2 className="font-serif italic text-3xl text-brand-text-primary mb-4 leading-tight">Key Terms, Defined</h2>
          <div className="space-y-3">
            {[
              { term: 'Jokes Per Minute (JPM)', def: 'The number of distinct, gradeable jokes per minute of runtime. We count separable jokes a viewer could point to — not every comedic line — so JPM is comparable across every show.' },
              { term: 'Humor Index', def: 'A 0–100 composite of peak joke density, craft, impact, and weighted JPM. Every joke is scored, then rolled up to episode, season, and show level.' },
              { term: 'Craft', def: 'The writing quality of a joke, scored 1–10 across originality, structure, character integration, economy, and earned-vs-cheap.' },
              { term: 'Impact', def: 'Audience resonance of a joke (1–10): quotability, rewatch value, cultural footprint, and callback payoff.' },
              { term: 'WAR (Wins Above Replacement)', def: 'A character’s joke count × how far their shrunk average quality exceeds a replacement-level baseline. Rewards both volume and per-joke quality.' },
              { term: 'Replacement level', def: 'The quality of a 25th-percentile "bench" character. WAR measures value above this floor, so merely showing up doesn’t accrue value.' },
            ].map((g) => (
              <div key={g.term} className="bg-brand-card border border-brand-border rounded-xl p-5">
                <p className="text-sm font-medium text-brand-text-primary mb-1">{g.term}</p>
                <p className="text-sm text-brand-text-secondary leading-relaxed">{g.def}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
