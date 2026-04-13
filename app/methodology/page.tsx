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
            The coefficients were calibrated against a blind human-rated set of 500 jokes across formats.
            Single-camera is the baseline because it makes no structural accommodation for the audience.
          </p>
        </section>

        {/* Limitations */}
        <section>
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-6">Honesty</p>
          <h2 className="text-xl font-medium text-brand-text-primary mb-4">Known Limitations</h2>
          <div className="space-y-3">
            {[
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
                title: 'No audience data',
                desc: 'We don\'t use ratings, streaming numbers, or social media sentiment. The scores are entirely analytical — which is a feature, not a bug, but it means popular ≠ high-scoring.',
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
