import { notFound } from 'next/navigation';
import Link from 'next/link';
import SocialShare from '@/components/ui/SocialShare';
import EndOfArticleCTA from '@/components/ui/EndOfArticleCTA';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export const dynamicParams = false;

const POSTS: Record<string, {
  title: string;
  description: string;
  date: string;
  category: string;
  content: string;
}> = {
  'is-the-office-actually-funny': {
    title: 'Is The Office Actually Funny? We Analyzed Every Joke to Find Out.',
    description: 'We ran all 186 episodes of The Office through our AI comedy analyst. The results may surprise you.',
    date: '2026-04-10',
    category: 'Deep Dive',
    content: `
We set out to answer a simple question: **is The Office actually funny, or do we just love the characters?**

To find out, we built an AI comedy analyst that identifies and scores every joke in every episode. Not just the obvious punchlines — reaction shots, cringe beats, visual gags, Jim's camera looks, and uncomfortable silences all get counted and scored.

## The Methodology

Every joke gets two scores:
- **Craft** (1-10): How well-written is this joke? We measure originality, structure, character integration, economy of language, and whether the humor is earned or cheap.
- **Impact** (1-10): How hard does this land? Imagine 100 comedy-savvy viewers watching together — would the room erupt, chuckle, or sit in silence?

These feed into the **Humor Index**, our composite score on a 0-100 scale where 75 is average, 85+ is excellent, and 90+ is all-time great.

## What We Found

The Office Season 4 — widely considered the show's peak — averages an **80.6** across 14 episodes. That's solidly in "good" territory, with standout episodes pushing into the high 80s and low 90s.

But here's what surprised us: **the funniest episodes aren't always the ones you'd expect.**

"The Deposition" and "Did I Stutter?" tied for the top spot at **90.3** — beating fan favorite "Dinner Party" (88.1). Why? They have higher peak density — a larger percentage of their jokes score 7+ on both craft AND impact.

"Dinner Party" is iconic and quotable, but it has a different comedy profile: fewer total jokes, with longer cringe sequences that score incredibly high individually but lower the joke density.

## The Cringe Comedy Problem

This is the fundamental challenge of scoring The Office: its signature move — sustained, excruciating discomfort — doesn't play like traditional joke-based comedy.

A 3-minute scene where Michael shows off his tiny plasma TV isn't one joke. It's one long, beautiful nightmare. But in terms of our scoring, it counts the same as a quick one-liner.

We addressed this by weighting **peak density** (what percentage of jokes are elite-quality) more heavily than raw jokes-per-minute. This means an episode with 40 incredible jokes can outscore one with 70 mediocre ones.

## How The Office Compares

Against other shows we've analyzed, The Office holds up well:

- **The Office S4 average: 80.6**
- **30 Rock "Rosemary's Baby": 85.4** (a single episode, not a season average)
- **Two and a Half Men S12E08: 60.3**

30 Rock fires jokes at a machine-gun pace — nearly 3x the joke density of The Office. But The Office's best moments hit harder. It's the sniper rifle vs. machine gun debate, and our formula respects both styles.

## The Verdict

Yes, The Office is actually funny. Not just nostalgic, not just "comfortable TV" — genuinely, measurably funny. Its best episodes compete with the best comedy television has ever produced.

But it's also inconsistent. The gap between its best (90.3) and worst Season 4 episodes (61.0) is enormous. When The Office is on, it's transcendent. When it's off, it's coasting on goodwill.

*Full episode rankings and joke-by-joke breakdowns are available on our [show page](/shows/the-office).*
    `,
  },
  'how-we-score-comedy': {
    title: 'How We Score Comedy: The Math Behind the Humor Index',
    description: 'The complete breakdown of how we turn thousands of joke scores into a single number.',
    date: '2026-04-10',
    category: 'Methodology',
    content: `
The Humor Index isn't a single number — it's a composite of multiple measurements, each designed to capture a different dimension of comedy.

## The Components

**Craft Score (40% weight)**
Every joke is scored on five dimensions:
- Originality (25%): How novel is the comedic concept?
- Structure (25%): How well-built is the setup/payoff?
- Character Integration (20%): Could only THIS character deliver this joke?
- Economy (15%): Maximum funny per word?
- Earned vs. Cheap (15%): Genuine wit or lazy shortcuts?

We use a **top-weighted average**: the top 25% of jokes count for 40% of the effective craft score. This means a show with a few brilliant jokes and some mediocre filler can still score well — as long as the peaks are genuine peaks.

**Impact Score (35% weight)**
How big a reaction would this joke get from 100 comedy-savvy viewers? This is adjusted for show format — multi-camera sitcoms with sweetened laugh tracks get a 25% penalty, because the laugh track inflates perceived reactions.

**Peak Density (15% weight)**
What percentage of jokes are genuinely excellent (scoring 7+ on BOTH craft and impact)? This replaces raw jokes-per-minute as our density metric, because it measures quality density, not just volume.

**Weighted JPM (10% weight)**
Impact-weighted jokes per minute. A high-impact joke contributes more to this metric than a throwaway line. This still rewards joke density, but at a lower weight than our original formula.

**Memorability Bonus (up to +5 points)**
The average quotability score of the top 5 jokes, scaled to add up to 5 bonus points. Episodes that produce culturally memorable lines get a bump.

## The Display Scale

Raw scores (0-10) are converted to a 100-point display scale using fixed calibration:
- **90+**: All-time great episode
- **80-89**: Excellent comedy
- **70-79**: Good, solid episode
- **60-69**: Below average
- **Below 60**: Weak

These calibration points are fixed — they won't shift as we add more shows.

*See our full [methodology page](/methodology) for additional details.*
    `,
  },
  'scorer-noise-floor': {
    title: 'We Rescored 30 Episodes Twice. Our Single-Run Humor Index Has an ICC of 0.28.',
    description: 'A test-retest study on 30 episodes. Show-identity bias is tiny (not significant). But the scorer is noisier than we thought — individual episode Humor Indexes are only 28% signal, 72% run-to-run variance. Here\u2019s what we\u2019re doing about it.',
    date: '2026-04-17',
    category: 'Data Science',
    content: `
Earlier this week we ran a blind-mode rescoring study on 99 episodes across our three scored shows. Then we took 30 of those episodes and scored them a SECOND time (also in blind mode) to measure the scorer\u2019s own noise floor.

The results are humbling. Here they are.

## Finding 1: Show-identity bias is small and not significant

First the good news. We compared each episode\u2019s blind score to its production (non-blind) score \u2014 the one we currently show on the site. Paired difference analysis:

| Show | n | Blind HI | Non-blind HI | Δ (non-blind − blind) | 95% CI |
|---|---|---|---|---|---|
| Seinfeld | 33 | 84.6 | 82.1 | \u22122.45 | [\u22125.71, +0.82] |
| The Office | 33 | 78.9 | 77.7 | \u22121.23 | [\u22125.11, +2.65] |
| Friends | 33 | 81.3 | 80.5 | \u22120.72 | [\u22125.29, +3.84] |
| **Pooled** | 99 | — | — | **\u22121.47** | [\u22123.72, +0.79] |

Pooled bias: the LLM scores episodes **1.47 points lower** when it can see the show name. The 95% CI straddles zero, so this effect is not statistically significant at n=99.

The direction is the OPPOSITE of what you might expect. If the LLM were fellating famous shows, scores would go up with show knowledge, not down. The slight downward shift is likely explained by non-blind mode giving the LLM an explicit character list, which probably affects joke detection in subtle ways (more structured attribution → different joke ensembles).

**Takeaway**: show-identity bias is not a meaningful issue in the current production scores.

## Finding 2: Our own scorer is noisier than we thought

We scored 30 episodes TWICE, both blind, with different internal random seeds (Claude has natural non-determinism at temperature > 0). Ideally the two scores should be very similar. They\u2019re not.

### Reliability per metric

| Metric | ICC | Interpretation |
|---|---|---|
| avg_craft (raw 0–10) | 0.28 | poor |
| avg_impact (raw 0–10) | 0.24 | poor |
| **Humor Index (0–100)** | **0.28** | **poor** |
| total_jokes detected | 0.67 | moderate |
| JPM | 0.53 | moderate |

Intraclass correlation (ICC) measures what fraction of the variance in scores is REAL between-episode signal vs. run-to-run noise. For individual-subject measurements, ICC ≥ 0.75 is \u201Cgood,\u201D 0.4–0.75 is \u201Cmoderate,\u201D and <0.4 is \u201Cpoor.\u201D

**Our Humor Index ICC is 0.28.** Only 28% of variance in a single-run episode score reflects real episode quality; 72% is run-to-run scorer noise.

### Variance decomposition

For the 30 test-retest pairs:

- **Between-episode variance** (real signal): 27.8% of total
- **Within-episode variance** (run-to-run noise): 72.2% of total

Mean absolute difference between two blind runs of the same episode: **10.7 Humor Index points.**

That means any two episodes within ~10 points of each other (on a 0–100 scale) are essentially indistinguishable with single-run scoring.

## Why does the Humor Index have so much noise?

Two sub-findings explain it:

**1. Joke detection is stable (r ≈ 0.63 on total jokes found).** The LLM reliably finds most jokes in an episode — joke counts across two runs are within ±8-9 of each other on average.

**2. Per-joke craft/impact scoring is moderately stable (SD ≈ 0.35 on 0–10).** Individual joke scores jitter by about 5% between runs. That\u2019s the LLM\u2019s actual noise floor.

**3. The Humor Index formula AMPLIFIES that noise via threshold metrics.** The formula includes \`peak_density\` \u2014 the fraction of jokes where BOTH craft ≥ 7 AND impact ≥ 7. A joke scored 7.01 vs 6.99 flips its \u201Celite\u201D status. When the scorer is noisy by ±0.35, a bunch of threshold-adjacent jokes cross the line in different runs, and peak_density swings by 1-2 points. That 1-2 point swing in a component with 15% weight translates to multi-point Humor Index swings.

Similarly, the \`memorability_bonus\` depends on the top 5 quotability scores \u2014 which can change when different jokes are identified as \u201Ctop.\u201D And \`effective_score\` uses top-quartile weighting, which compounds noise at the edges.

## So are the rankings meaningless?

No, but they need context.

### Show-level rankings are statistically fine

Each show\u2019s overall Humor Index is averaged over 170-236 episodes. The law of large numbers does its work:

- Per-episode noise SD: ~5 Humor Index points
- The Office (186 eps): SE on show mean ≈ 0.37
- Seinfeld (172 eps): SE on show mean ≈ 0.38
- Friends (236 eps): SE on show mean ≈ 0.33

So the show-level Humor Indexes we publish (Seinfeld 83.9, Office 80.2, Friends 78.7) are stable to roughly ±0.4 points from LLM noise. The differences between these shows (3–6 points) are far larger than that noise floor.

**Show rankings hold up.**

### Individual episode rankings have ±5-point noise

If two episodes are within ~10 Humor Index points, the ordering between them is within the scorer\u2019s noise floor. A \u201CBest Friends Episode\u201D list, where the top 10 episodes are all between 85-95, has a lot of genuine uncertainty in its ordering.

**Extreme episodes still stand out.** Dinner Party (100) is clearly above mean (75). The Last One (95) is clearly above mean. A bottom-quartile episode at 62 is clearly below. These wouldn\u2019t flip.

But the difference between #1 and #2 in a close race? That\u2019s within noise.

## What we\u2019re doing about it

Three changes:

**1. Publishing the noise floor.** This blog post and a new section on our methodology page spell it out: single-run Humor Index ICC = 0.28, mean |Δ| = 10.7 points, show-level SE = 0.4 points. Readers should calibrate their confidence accordingly.

**2. Consensus scoring going forward.** Our pipeline already supports multi-run consensus (the \`--num-runs\` flag). For all new shows \u2014 starting with Parks and Recreation when we resume \u2014 we\u2019ll score each episode THREE times and use the mean. Three runs cuts per-episode SE by about √3 ≈ 1.7\u00D7, which should get ICC up to moderate (≥ 0.4) territory. Five runs would get us near \u201Cgood\u201D (≥ 0.75).

**3. Smoother aggregate formula (future work).** The threshold-based metrics in the Humor Index (peak_density, memorability_bonus) are the noise amplifiers. Replacing them with continuous smoothed versions \u2014 say, a sigmoid-weighted elite-joke score instead of a hard threshold \u2014 would cut formula-level amplification without changing the qualitative meaning. We\u2019re leaving the current formula in place for continuity but exploring a v3 formula.

## The honest bottom line

We found out, in public, that our own scorer\u2019s noise floor is higher than we thought.

We could have:
- Not run this study and never known
- Run it and buried the results
- Run it and presented the good part (small show-identity bias) while glossing over the bad part (poor ICC)

Instead we\u2019re publishing the full findings, the specific ICC, the variance decomposition, and the plan to address it. This is what real research looks like. It\u2019s uncomfortable, but it\u2019s how you build something you can actually trust.

*Study artifacts: sample of 99 episodes scored blind, 30 of those scored again. Raw outputs are in our workspace and available on request. See also the [Bayesian credible intervals](/blog/bayesian-credible-intervals) post which independently corroborates the noise-floor finding via a hierarchical model.*
    `,
  },
  'bayesian-credible-intervals': {
    title: 'We Fitted a Bayesian Model to 15,000 Jokes. Every Show Ranking Is Within Noise.',
    description: 'A hierarchical Bayesian model of joke impact on 15,000 jokes. Format effect: statistically indistinguishable from zero. The three scored shows\u2019 credible intervals overlap completely. 64% of joke-level variance is unexplained within-joke noise.',
    date: '2026-04-17',
    category: 'Data Science',
    content: `
Earlier this week we removed a silent format coefficient that was penalizing multi-cam shows by 15\u201325%. A data-science audit had flagged it as statistically unidentifiable with only three scored shows. We agreed and pulled it.

Then we went further. We fit a hierarchical Bayesian model to the entire dataset to answer the deeper question: **when you properly control for joke type, character, and episode, how much of a comedy show\u2019s ranking is actual signal vs. within-noise differences?**

The answer is more humbling than we expected.

## The Model

We sampled 15,000 jokes across The Office, Seinfeld, and Friends (5,000 per show) and fit a model predicting each joke\u2019s impact score (the LLM\u2019s 0\u201310 audience-reaction estimate) as:

\`\`\`
impact_j = grand_mean
         + format_effect[format(j)]         # fixed effect
         + show_effect[show(j)]              # partially-pooled random effect
         + joke_type_effect[type(j)]
         + episode_effect[episode(j)]        # random intercept
         + character_effect[char(j)]         # random intercept
         + residual_noise
\`\`\`

Everything was sampled with PyMC using NUTS (2 chains, 500 post-warmup draws, 0 divergences). This is a textbook hierarchical-effects model \u2014 the kind of setup you\u2019d use for player effects in a sports analytics paper.

## Finding 1: The format effect is statistically zero

Here\u2019s the posterior for the format coefficient (single-cam vs. multi-cam baseline):

| | Posterior median | 95% CrI | P(effect > 0) |
|---|---|---|---|
| **Single-cam** (vs. multi-cam baseline) | **\u22120.052** | **[\u22120.590, +0.442]** | 0.40 |

Translation: the posterior distribution puts a 60% chance that the single-cam effect on impact is negative, 40% it\u2019s positive. **The credible interval straddles zero.** After controlling for everything else, we cannot distinguish single-cam from multi-cam on impact.

This is vindication. The old 15\u201325% coefficient wasn\u2019t just poorly calibrated \u2014 it was applying a correction to an effect the data doesn\u2019t support.

## Finding 2: The three shows are statistically indistinguishable

Show random-effect deflections (on the 0\u201310 impact scale):

| Show | Median deflection | 95% CrI |
|---|---|---|
| **Seinfeld** | +0.154 | [\u22120.224, +0.530] |
| **The Office** | \u22120.007 | [\u22120.505, +0.456] |
| **Friends** | \u22120.131 | [\u22120.498, +0.235] |

All three intervals overlap. The posterior median orders them Seinfeld > Office > Friends, which matches our raw Humor Index rankings. But the **statistical story is that this ordering is within noise.** The probability that Seinfeld\u2019s show-effect really is higher than Friends\u2019 is around 82%. That\u2019s meaningfully better than a coin flip, but it\u2019s not the 99%+ certainty you\u2019d want to publish a ranking claim with.

If we get three more scored shows into the dataset, these intervals will narrow. But as of today, with 3 shows and 15K sampled jokes, the shows\u2019 impact-quality differences don\u2019t clear the statistical bar.

## Finding 3: 64% of variance is unexplained joke-level noise

The model\u2019s variance decomposition:

- **Within-joke residual (unexplained): 63.9%**
- Between-episode within show: 11.8%
- Between-joke-type: 8.9%
- **Between-show: 7.9%**
- Between-character: 7.5%

Shows explain only **7.9% of total joke-level variance.** That is almost identical to the variance explained by joke type (8.9%) or individual character (7.5%), and less than variance between episodes within a show (11.8%).

Two-thirds of the variance is within-joke residual \u2014 the LLM gives similar jokes meaningfully different scores. Some of this is real (the same joke type can be executed well or badly), some is LLM noise. Without an inter-rater reliability study we can\u2019t distinguish.

## What This Actually Means for the Rankings

The Humor Index, Comedy WAR, and every leaderboard on this site are computed from aggregates of joke-level scores. When the joke-level model can\u2019t distinguish shows, the aggregates rank them \u2014 but those ranks sit on a foundation of overlap.

In practice: if you\u2019re reading *"Seinfeld has a Humor Index of 83.9 vs. The Office\u2019s 80.2,"* you should read that as *"Seinfeld scores higher on our current sample, but the difference is within the range of how much rescoring noise would move these numbers."* A 3-point Humor Index gap is bigger than the typical inter-episode bootstrap CI but smaller than the show-level credible interval.

This doesn\u2019t mean the rankings are wrong. It means they\u2019re **not statistically distinguishable given current data.** That\u2019s a feature of being honest about our sample size and model, not a bug in the analysis.

## What We\u2019re Changing on the Site

1. **Credible interval badges** on show pages. Next to each show\u2019s Humor Index, we\u2019re surfacing the 95% credible interval from this model. A reader can see that Friends and Office have overlapping intervals and draw their own conclusion.

2. **Variance decomposition on the methodology page.** The 64% within-joke noise figure is going in the Known Limitations section. Readers should know that two-thirds of what our model sees in joke-level scores is unexplained.

3. **The format filter stays.** Since format doesn\u2019t have an identifiable effect on impact, the filter is just a convenience for users who want to compare multi-cam to multi-cam. It\u2019s no longer a silent correction.

## The Big Picture

This result aligns with what a lot of comedy writers will tell you: **there is no universally correct answer to "which show is funnier."** Our data suggests the answer is somewhere between "they\u2019re essentially the same" and "the differences we measure are small enough that the model can\u2019t confidently order them."

We\u2019re publishing the full model artifacts \u2014 posterior samples, variance components, and credible intervals \u2014 in the site\u2019s \`public/data/\` directory, so anyone who wants to reanalyze is welcome to.

*Model outputs: [format_posteriors.json](/data/format_posteriors.json) \u2022 [show_credible_intervals.json](/data/show_credible_intervals.json) \u2022 [variance_decomposition.json](/data/variance_decomposition.json)*
    `,
  },
  'comedy-war': {
    title: 'Jerry Seinfeld Is the Most Valuable Comedy Character in Television History',
    description: 'Comedy WAR is like baseball\'s Wins Above Replacement but for sitcom characters. Jerry Seinfeld leads at 1,708 career WAR — nearly 4× Michael Scott.',
    date: '2026-04-16',
    category: 'Data Science',
    content: `
We just upgraded **Comedy WAR** \u2014 our career-value metric for sitcom characters \u2014 to use a proper empirical replacement baseline. The result: Jerry Seinfeld is the most valuable comedy character we\u2019ve ever measured, by a wide margin.

## What Is Comedy WAR?

In baseball, WAR measures how many wins a player adds over a \u201Creplacement-level\u201D player \u2014 a generic minor leaguer you could call up for free. It captures total value: skill multiplied by volume.

Comedy WAR does the same thing for sitcom characters. For every joke a character delivers, we measure how much more comedy value it produces than a \u201Creplacement-level\u201D character \u2014 empirically defined as the 25th-percentile quality among bench-player characters with 10\u201350 analyzed jokes. Currently that baseline sits at **6.555** on our craft-plus-impact quality scale.

The formula (v2):

**WAR = total_jokes \u00D7 max(shrunk_quality \u2212 replacement_quality, 0)**

Where \`shrunk_quality\` is each character\u2019s average (craft+impact)/2, pulled toward the league median (6.775) via Bayesian shrinkage with prior strength k = 30. Translation: a 10-joke guest star with a lucky mean doesn\u2019t get to outrank a 500-joke lead. Small samples get appropriately discounted.

## The All-Time Leaderboard

- **Jerry Seinfeld \u2014 1,708.7 WAR** (4,339 jokes across 172 episodes)
- **George Costanza \u2014 1,177.6 WAR** (2,632 jokes across 171 episodes)
- **Dwight Schrute \u2014 807.6 WAR** (1,734 jokes across 184 episodes)
- **Chandler Bing \u2014 637.0 WAR** (2,962 jokes across 232 episodes)
- **Phoebe Buffay \u2014 628.5 WAR** (2,036 jokes across 232 episodes)
- **Kramer \u2014 560.4 WAR** (1,547 jokes across 171 episodes)
- **Joey Tribbiani \u2014 531.6 WAR** (2,655 jokes across 232 episodes)
- **Michael Scott \u2014 443.3 WAR** (3,265 jokes across 141 episodes)
- **Jim Halpert \u2014 330.2 WAR** (1,501 jokes across 184 episodes)
- **Elaine Benes \u2014 315.3 WAR** (1,316 jokes across 171 episodes)

Jerry\u2019s WAR is **nearly 4\u00D7 Michael Scott\u2019s.** That\u2019s how much raw quality-times-volume dominance he has over every other character in the dataset.

## Why Jerry Dominates

Three factors compound:

**1. Joke volume.** 4,339 analyzed jokes \u2014 more than any other character. Jerry is in every episode, and in most of the A-plots as the straight man responding to chaos.

**2. Per-joke quality.** His average (craft+impact)/2 lands at 6.95 \u2014 near the top of the leaderboard and well above replacement level.

**3. The multiplier effect.** WAR rewards every joke above replacement, so volume \u00D7 quality compounds. Jerry\u2019s 4,339 jokes at 0.4 above replacement \u2248 1,700 WAR. No one else clears 1,200.

## Why v2 Matters

An earlier version of Comedy WAR used a fixed midpoint of 5.0 as its replacement baseline. That seemed sensible \u2014 5 is the middle of a 0\u201310 scale, right?

But a data-science audit exposed a problem: **LLM-generated craft and impact scores are heavily compressed.** Across 594 scored episodes, the standard deviation of episode-level craft is just 0.36. Everyone\u2019s quality lands between 6.5 and 7.2. When the replacement level was at 5, \`(quality \u2212 5) \u2248 1.8\` was nearly constant across all characters \u2014 which meant WAR collapsed to \u22481.5 \u00D7 total_jokes. Essentially just screen time dressed up as quality.

v2 fixes this two ways:

1. **Empirical baseline.** Replacement is the 25th percentile of actual bench-player quality (6.555), not a theoretical midpoint. Now the \`(quality \u2212 replacement)\` term actually varies across characters and reflects meaningful quality differences.

2. **Bayesian shrinkage.** Small-sample estimates get pulled toward the league median before WAR is computed, so a hot-streak guest star doesn\u2019t fraudulently outrank an established lead.

The ranking that came out is what a sports-reference style site should produce: the characters at the top have both volume *and* quality. Ones missing either fall down.

## What About Michael Scott?

Michael is still an icon \u2014 the single most-quoted comedy character in television history is almost certainly him. But WAR doesn\u2019t measure memorability. It measures total quality-adjusted output.

Michael\u2019s craft and impact numbers (6.80 / 6.58) are solid but not elite. Jerry\u2019s (6.96 / 6.94) are higher. Combine that with Jerry\u2019s edge in joke volume (Michael exits after Season 7, Jerry stays for all 9 seasons), and the math is decisive. Michael is iconic. Jerry is most valuable.

## The Per-Episode Story

Career WAR rewards longevity. For a more apples-to-apples look, WAR per episode flips some of the ranking:

- **Jerry:** 9.93 WAR/ep
- **George:** 6.89 WAR/ep
- **Kramer:** 3.28 WAR/ep
- **Dwight:** 4.39 WAR/ep
- **Chandler:** 2.74 WAR/ep
- **Phoebe:** 2.71 WAR/ep
- **Michael:** 3.14 WAR/ep

Jerry still leads. But George jumps way up, and Kramer becomes more competitive with the Office mains. This is the equivalent of looking at batting average rather than total hits: it controls for opportunity.

Use Total WAR when you want to know who produced the most comedy value across a career. Use WAR/ep when you want to know who was best *per opportunity*.

## The Bottom Line

Jerry Seinfeld: most valuable comedy character in television history, by about as large a margin as the data can produce. It\u2019s not close, and now that Comedy WAR has a proper baseline, the result is defensible.

*Explore WAR for every character: [The Office characters](/shows/the-office) \u2022 [Seinfeld characters](/shows/seinfeld) \u2022 [Friends characters](/shows/friends) \u2022 [Full ranking](/rankings/funniest-characters)*
    `,
  },
  'seinfeld-vs-the-office': {
    title: 'Seinfeld Just Passed The Office on Our Humor Index. Here\'s Why.',
    description: 'We removed our silent multi-cam penalty. With raw scores, Seinfeld leads at 83.9 vs The Office at 80.2 — and the math explains why the old "adjusted" ordering was questionable.',
    date: '2026-04-16',
    category: 'Methodology',
    content: `
For a few weeks this site had The Office ahead of Seinfeld on the Humor Index. A lot of you argued with that ordering \u2014 Seinfeld has better-written jokes, you said. You were right. We had a thumb on the scale, and we just took it off.

## The Updated Numbers

With every silent format adjustment removed, here\u2019s where the three scored shows land:

- **Seinfeld:** 83.9 (was 77.9, +6.0)
- **The Office:** 80.2 (was 81.0, \u22120.8 \u2014 essentially unchanged)
- **Friends:** 78.7 (was 72.8, +5.9)

Seinfeld now leads by a comfortable margin. Friends is competitive with Office on raw score. The old ordering \u2014 Office first, Seinfeld second, Friends a distant third \u2014 was partly an artifact of a 15\u201325% penalty we were applying to multi-cam sitcoms without telling you.

## What Was the Old Penalty?

Our earlier methodology multiplied the impact score of every multi-cam episode by a coefficient below 1.0. The theory: a live audience / laugh track inflates perceived impact, so we should correct for it.

That theory isn\u2019t crazy. But three things made the correction indefensible:

1. **Confounding.** With only three scored shows, the "format effect" can\u2019t be separated from show-level differences. A 15% penalty applied to Seinfeld could just as easily be a 15% penalty on Seinfeld-the-show, and you\u2019d never know.
2. **Opaque calibration.** The coefficient was a point estimate with no published confidence interval. The underlying calibration study was a small sample that we can\u2019t re-run or audit.
3. **Silent correction.** You saw Friends at 72.8 and had no way to know that 15% of that came from a multi-cam tax, not from the comedy being weaker.

## What We\u2019re Doing Instead

Raw scores. Every show\u2019s score is now whatever the joke-level data produces, full stop. We\u2019ve added:

- **Format tags** next to every show and episode, so you can always see what kind of comedy you\u2019re looking at.
- **Format filters** on every ranking page \u2014 compare multi-cam shows to each other, or filter to just single-cam.
- **Bootstrap 95% confidence intervals** on every Humor Index, so the noise in each score is visible.
- **Show-relative percentiles** on every episode, so an 85 on Seinfeld and an 85 on Friends are commensurable within their own shows.

This is the right way to do it. If we later run a rigorous calibration study \u2014 with blind mode on, matched content, proper sample sizes, and uncertainty estimates \u2014 we might reintroduce a format correction. For now, no silent corrections.

## So Is Seinfeld Actually Funnier?

By raw Humor Index, on our scoring: yes, by about 3.7 points. By craft score per joke: yes. By joke density: yes. By peak density: yes.

The Office still has things Seinfeld doesn\u2019t. The sustained cringe. The mockumentary format letting Jim carry a weak plot with a camera look. Michael as a performance. These are real and the scores don\u2019t fully capture them.

What changed today is that we stopped pretending our scores did capture them. The data says Seinfeld\u2019s jokes land harder. The old ordering was the format adjustment talking. Now you see what the numbers actually say.

## The Takeaway

Methodologies should be transparent. When we make a choice that changes rankings by 5\u20136 points, that choice should be visible, defensible, and documented. The old format coefficient failed all three tests.

If you want the old, format-adjusted score for any show or episode, it\u2019s still in our data as \`humor_index_v1\`. The UI just doesn\u2019t display it anymore, because we don\u2019t trust it.

That's the whole point of The Humor Index \u2014 we give you the data, you make the argument.

*Explore the full data: [The Office](/shows/the-office) \u2022 [Seinfeld](/shows/seinfeld) \u2022 [Compare side by side](/compare/the-office-vs-seinfeld)*
    `,
  },
  'imdb-vs-humor-index': {
    title: 'IMDb Ratings vs. The Humor Index: Does "Funny" Mean "Good"?',
    description: 'We compared 591 episodes across The Office, Seinfeld, and Friends against IMDb audience ratings. Pooled correlation: r = -0.005. Audience scores and comedy craft are essentially unrelated.',
    date: '2026-04-12',
    category: 'Data Science',
    content: `
We integrated IMDb episode ratings across every analyzed show on The Humor Index. And the first thing we did was the obvious data science move: **how well do audience ratings predict our comedy scores?**

The answer: they don't. Not even close.

## The Numbers

Pooled across **591 episodes** of The Office, Seinfeld, and Friends, the Pearson correlation between the Humor Index and IMDb ratings is **r = −0.005** — indistinguishable from zero.

Per show, here's where it lands:

- **The Office** (186 eps): r = +0.164 — barely positive
- **Seinfeld** (170 eps): r = −0.058 — slightly negative
- **Friends** (235 eps): r = −0.013 — effectively zero

Across all three, IMDb explains essentially **0% of the variance** in our Humor Index scores.

In plain English: knowing an episode's IMDb rating tells you almost nothing about how funny it actually is by our analysis.

## Why This Matters

IMDb ratings measure **whether audiences enjoyed an episode**. That's a cocktail of plot quality, emotional resonance, character development, guest stars, and yes — comedy. When someone gives "Casino Night" a 9.3, they're rating the Jim/Pam moment at the end as much as any joke.

The Humor Index measures something narrower: **comedy craft and density**. How many jokes land? How well-constructed are they? How hard do they hit?

These are genuinely different questions, and our data proves it.

## The Biggest Disagreements

Some episodes where our AI sees comedy gold but audiences shrug:

- **"Angry Andy" (S8E21)** — Humor Index: 96.1, IMDb: 6.7. Packed with jokes, but the late-season Andy arc turned audiences off regardless of how many gags landed.
- **"Dinner Party" (S4E13)** — Humor Index: 100.0, IMDb: 7.6. Our highest-scoring episode ever is an IMDb 7.6. This is the cringe comedy paradox: brilliantly crafted discomfort that many viewers can't rewatch without covering their eyes.
- **"Andy's Ancestry" (S9E03)** — Humor Index: 95.0, IMDb: 7.1. Dense with character comedy, but S9 fatigue dragged audience scores down.

And episodes audiences adore that don't score as high on pure comedy:

- **"Casino Night" (S2E22)** — Humor Index: 71.5, IMDb: 9.3. The Jim/Pam poker scene is legendary television, but it's drama, not comedy. Our system correctly identifies this as a great episode with average joke density.
- **"The Inner Circle" (S7E22)** — Humor Index: 75.4, IMDb: 9.8. Will Ferrell episodes got a huge audience boost. The comedy itself is solid but not spectacular.
- **"Classy Christmas" (S7E11)** — Humor Index: 70.8, IMDb: 8.8. Holiday episodes get an emotional ratings bump that has nothing to do with joke quality.

## What Predicts IMDb Ratings?

We tested which of our sub-metrics best correlates with audience scores:

Within The Office specifically (where the correlation is highest):

- **Craft** (r = 0.22) — the strongest predictor, but still weak
- **Humor Index** (r = 0.16) — the composite score
- **Impact** (r = 0.11) — how hard jokes land
- **JPM** (r = -0.08) — joke density has *slightly negative* correlation with IMDb

That last one is fascinating. **More jokes per minute slightly predicts lower audience ratings.** This makes sense — episodes with the highest joke density often sacrifice plot and character moments. Audiences notice.

## Season-by-Season Patterns

The correlation varies wildly by season:

- **Season 7** has the strongest correlation (r = 0.40) — during Michael's farewell arc, funnier episodes also happen to be more emotionally satisfying
- **Seasons 3, 4, and 8** have negative correlations — audiences and our AI actively disagree about which episodes are best
- **Season 5** shows moderate alignment (r = 0.33)

## The Dinner Party Problem

"Dinner Party" perfectly illustrates why these metrics diverge. It scores a perfect 100 on our Humor Index — the highest-scoring episode we've ever analyzed. Every joke is meticulously crafted. The cringe comedy is operating at peak efficiency.

But on IMDb? A 7.6. Not bad, but far from The Office's best-rated episodes.

This is because "Dinner Party" is *uncomfortable*. It's bottle-episode cringe comedy that makes your skin crawl. Audiences rate it lower because watching Jan's Seychelles slideshow makes them physically squirm — even though, objectively, it's comedy writing at its absolute finest.

This is exactly what The Humor Index was built to measure. Not "did you enjoy this?" but "is this comedy operating at the highest possible level?"

## The Bottom Line

The Humor Index and IMDb are complementary, not competing metrics. IMDb tells you what audiences love. The Humor Index tells you what's actually funny.

Sometimes those overlap. Often, they don't. And the disagreements are where the most interesting conversations happen.

*Explore the data yourself — every episode now displays its IMDb rating alongside the Humor Index score. See where you agree with the crowd and where your taste diverges. [Start with The Office](/shows/the-office).*
    `,
  },
  'laugh-track-penalty': {
    title: 'Should Laugh Tracks Be Penalized? Our Data Says Yes.',
    description: 'Multi-camera sitcoms with sweetened laugh tracks score lower. Here is why.',
    date: '2026-04-10',
    category: 'Analysis',
    content: `
This is the most controversial part of our methodology, and we expect pushback. Here's our reasoning.

## The Format Coefficients

We apply a multiplier to impact scores based on show format:
- Single camera: 1.00 (no adjustment)
- Hybrid: 0.90
- Multi-camera live audience: 0.85
- Multi-camera sweetened (laugh track added in post): 0.75

A multi-camera sitcom with sweetened audio gets a 25% reduction on its impact scores. That's significant.

## Why This Is Fair

The impact score measures "how big of a reaction would this get from comedy-savvy viewers watching together?" But laugh tracks manipulate that measurement. Studies show that viewers rate jokes as funnier when accompanied by laughter — even when they can identify the laughter as canned.

A joke that gets a 7.0 impact on a sweetened show might only get a 5.25 in a silent room. The laugh track is doing 25% of the work.

Live audience shows get a smaller penalty (15%) because the laughter is real — but it still functions as a social cue that inflates perceived quality.

## The Counterargument

Multi-camera shows are *written for* the laugh track. The timing, the pauses, the delivery — everything is designed around those beats. Removing the laugh track from Seinfeld makes it feel awkward, not because the jokes are bad, but because the rhythm is wrong.

This is a valid point. We're penalizing a creative choice, not a quality deficit.

## Our Position

We're measuring the comedy writing, not the production format. A brilliantly written joke should score the same whether it's delivered in a single-camera mockumentary or a multi-camera studio. The format coefficient attempts to normalize for the amplification effect of laugh tracks.

Is 25% the right number? Honestly, we don't know. It's our best estimate based on audience research. We're transparent about this because we believe the debate itself is interesting.

*Disagree? We'd love to hear your argument. Reach out on [Twitter/X](https://twitter.com/thehumorindex).*
    `,
  },
};

export async function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      images: [`/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.category)}`],
    },
    alternates: {
      canonical: `https://thehumorindex.com/blog/${params.slug}`,
    },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) notFound();

  // Simple markdown-like rendering
  const paragraphs = post.content.trim().split('\n\n');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: { '@type': 'Person', name: 'Sam Slater' },
          publisher: {
            '@type': 'Organization',
            name: 'The Humor Index',
            logo: { '@type': 'ImageObject', url: 'https://thehumorindex.com/favicon-400.png' },
          },
          url: `https://thehumorindex.com/blog/${params.slug}`,
          image: `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.category)}`,
        }) }}
      />
      <div className="flex items-center gap-2 text-xs text-brand-text-muted mb-6">
        <Link href="/blog" className="hover:text-brand-text-secondary transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-brand-text-secondary">{post.category}</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full px-2.5 py-0.5">
            {post.category}
          </span>
          <span className="text-xs text-brand-text-muted">{formatDate(post.date)}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-brand-text-primary leading-tight mb-4">
          {post.title}
        </h1>
        <SocialShare
          title={post.title}
          text={post.description}
          url={`/blog/${params.slug}`}
        />
      </div>

      <article className="prose-custom space-y-4">
        {paragraphs.map((p, i) => {
          const trimmed = p.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={i} className="text-xl font-medium text-brand-text-primary mt-8 mb-3">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }

          // Inline formatting: bold, italic, links
          const formatInline = (text: string) => {
            return text.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-brand-text-primary font-medium">{part.slice(2, -2)}</strong>;
              }
              return part.split(/(\*[^*]+\*)/).map((sub, k) => {
                if (sub.startsWith('*') && sub.endsWith('*') && !sub.startsWith('**')) {
                  return <em key={k} className="text-brand-text-muted">{sub.slice(1, -1)}</em>;
                }
                return sub.split(/(\[[^\]]+\]\([^)]+\))/).map((linkPart, l) => {
                  const linkMatch = linkPart.match(/\[([^\]]+)\]\(([^)]+)\)/);
                  if (linkMatch) {
                    return <Link key={l} href={linkMatch[2]} className="text-brand-gold hover:underline">{linkMatch[1]}</Link>;
                  }
                  return linkPart;
                });
              });
            });
          };

          if (trimmed.startsWith('- ')) {
            const items = trimmed.split('\n').filter(l => l.startsWith('- '));
            return (
              <ul key={i} className="space-y-1 ml-4">
                {items.map((item, j) => (
                  <li key={j} className="text-sm text-brand-text-secondary leading-relaxed list-disc">
                    {formatInline(item.replace(/^- /, ''))}
                  </li>
                ))}
              </ul>
            );
          }

          return (
            <p key={i} className="text-sm text-brand-text-secondary leading-relaxed">
              {formatInline(trimmed)}
            </p>
          );
        })}
      </article>

      <EndOfArticleCTA />

      {/* Related posts */}
      {(() => {
        const currentPost = POSTS[params.slug];
        if (!currentPost) return null;
        const related = Object.entries(POSTS)
          .filter(([slug]) => slug !== params.slug)
          .filter(([, p]) => p.category === currentPost.category)
          .slice(0, 2);
        // Fill with other posts if not enough in same category
        if (related.length < 2) {
          const others = Object.entries(POSTS)
            .filter(([slug]) => slug !== params.slug && !related.some(([s]) => s === slug))
            .slice(0, 2 - related.length);
          related.push(...others);
        }
        if (related.length === 0) return null;
        return (
          <div className="mt-10 border-t border-brand-border pt-8">
            <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-4">You might also like</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map(([slug, p]) => (
                <Link
                  key={slug}
                  href={`/blog/${slug}`}
                  className="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-brand-gold/40 transition-colors group"
                >
                  <span className="text-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full px-2.5 py-0.5">
                    {p.category}
                  </span>
                  <h3 className="text-sm font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors mt-3 mb-1 line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-brand-text-muted">{formatDate(p.date)}</p>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="mt-8 border-t border-brand-border pt-8">
        <Link href="/blog" className="text-sm text-brand-text-muted hover:text-brand-gold transition-colors">
          ← Back to all posts
        </Link>
      </div>
    </div>
  );
}
