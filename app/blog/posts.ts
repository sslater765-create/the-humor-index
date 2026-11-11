export const POSTS: Record<string, {
  title: string;
  description: string;
  date: string;
  category: string;
  content: string;
}> = {
  'density-vs-craft': {
    title: "Two Shows Tell the Same Number of Jokes Per Minute. One Scores 10 Points Higher.",
    description: "30 Rock and Broad City both average about 3.5 jokes per minute and sit 10.6 Humor Index points apart. Across the 13 shows scored on our current model, craft predicts 88% of the final score. Density predicts 25%, and nearly all of that comes from one show.",
    date: '2026-08-19',
    category: 'Data Science',
    content: `
Two shows on the Humor Index tell jokes at the same rate.

*30 Rock* fires 3.53 jokes per minute. *Broad City* fires 3.52. If joke density were the thing that made a comedy funny, these two would be neighbours on the leaderboard.

30 Rock scores **97.5**. Broad City scores **86.9**.

That is a 10.6-point gap between two shows telling the same volume of jokes. **Joke density is a quarter of the Humor Index and it decides almost nothing.**

## The setup

Every show on this site gets a Humor Index built from four components: craft (40%), impact (35%), peak density (15%) and weighted jokes-per-minute (10%). Density is a quarter of the score by design. We built it in deliberately, because a comedy that makes you laugh twice an hour is not doing the same job as one that makes you laugh twice a minute.

So the question is not whether density counts. It is whether, across real shows, it ever decides anything.

## It mostly does not

Take the 13 shows scored on our current model, so that every number comes from one scoring run on one scale:

- **Craft vs Humor Index: r = 0.94.** Craft alone predicts 88% of the variance in the final score.
- **Jokes-per-minute vs Humor Index: r = 0.50.** Density predicts 25%.
- **Craft vs jokes-per-minute: r = 0.31.**

A quarter of the variance sounds like something. It is one show. *Freaks and Geeks* is the sparsest show on the list (2.16 jokes per minute) and also the lowest-scoring (80.0), and it carries the whole relationship. Drop it and rerun the same three correlations on the other 12: craft still predicts the index (r = 0.91), density stops predicting it at all (**r = 0.10, about 1% of the variance**), and craft and density turn slightly negative with each other (r = −0.15).

Among the twelve shows that are plainly joke-first comedies, how many jokes a show tells says nothing about how it scores.

## Two natural experiments

The clean way to see this is to find shows that hold density constant. There are two near-exact ties on the board:

| Jokes/min | Show | Craft | Humor Index |
|---:|---|---:|---:|
| 3.53 | 30 Rock | 7.68 | **97.5** |
| 3.52 | Broad City | 7.16 | **86.9** |
| 3.24 | The Office | 7.23 | **88.0** |
| 3.24 | Schitt's Creek | 7.29 | **87.6** |

Same density with different craft: 10.6 points apart. Same density with nearly the same craft: 0.4 apart. The second pair is the control. When the joke rate and the craft both match, so does the score.

Now run it the other way. *Flight of the Conchords* averages 2.47 jokes per minute. Broad City averages 3.52, which is **43% more jokes in every minute of television**. Conchords scores 92.0 and finishes #7. Broad City scores 86.9 and finishes #11. Conchords out-crafts Broad City by 0.42, and when density and craft pull in opposite directions, craft wins.

## The exchange rate

Fit a line through the 13 and you can price the two inputs:

- **One tenth of a point of craft is worth about 2.2 Humor Index points.**
- **Holding craft and impact fixed, one additional joke per minute, for the entire run of the show, is worth about 2.6.**

So a tenth of a craft point costs most of an extra joke per minute to replace, in every episode, for the whole series.

The ranges make it lopsided. Across the 13, craft runs from 7.00 to 7.68, a **0.68-point band** on a ten-point scale. Density runs from 2.16 to 3.57, a 1.65x spread. Priced at 22.4 points per craft point, that 0.68 is worth about **15 Humor Index points**. The entire density range, 1.41 jokes per minute at 2.6 points each, buys about 3.7.

The variable with the wide range is the one that barely moves the score, and the variable that decides the score sits inside a band of about 10%. Television comedy writing is a narrow, competitive skill: the distance between the best room we have measured and a perfectly respectable one is two thirds of a point.

## What this means if you make comedy

The instinct in a room under pressure is to add jokes. More passes, more alts, more punch-ups. The data says that is a bad trade at the margin. Density does pay, at about 2.6 points per joke per minute, but there is little of it left to buy inside a single show's identity, and a small gain in craft is worth more than a large gain in volume.

## What we still cannot see

- **We read dialogue.** Density is measured on scripted, spoken jokes. Shows that work visually are undercounted on both axes.
- **Craft and impact move together** (r = 0.87 across the 13), so "craft explains the index" is substantially "the two quality dimensions explain the index." They are 75% of the formula between them. We are not claiming craft beats impact; we are claiming both of them beat density.
- **We correlated average density, not peak density.** The formula's density quarter is peak density (15%) plus weighted JPM (10%). What we publish per show, and what is used above, is plain average JPM. Peak density is not in our public data, so the component carrying the larger share of the density weight is untested here.
- **This is a formula we built.** Craft is 40% of the Humor Index because we decided it should be, so "craft predicts the index" is partly true by construction. The part that is not baked in: density, which we gave a quarter of the score, ends up sorting almost nobody, because real shows vary 1.65x in density and about 10% in craft, and the 10% is where the separation is.
- **Thirteen data points.** The exchange rate is a least-squares line through 13 shows, on an outcome that craft is an input to, and one show moves the density correlation from 0.10 to 0.50. Read it as a description of this board, not as a causal estimate.

The jokes-per-minute number stays on every show page. It tells you what kind of comedy you are about to watch, rapid-fire or slow-burn. It will not tell you whether it is any good.

*Scope: this post uses only the 13 shows scored on our current model: 30 Rock, Fleabag, Veep, Arrested Development, Chappelle's Show, Seinfeld, Flight of the Conchords, Parks and Recreation, The Office, Schitt's Creek, Broad City, The Larry Sanders Show and Freaks and Geeks. It was revised in November 2026. The first version led with Fleabag against The Simpsons, and The Simpsons has not been rescored, so that comparison mixed two scales and has been removed.*`,
  },
  'is-the-office-actually-funny': {
    title: 'Is The Office Actually Funny? We Analyzed Every Joke to Find Out.',
    description: 'We ran all 183 episodes of The Office through our AI comedy analyst. The results may surprise you.',
    date: '2026-04-10',
    category: 'Deep Dive',
    content: `
We set out to answer a simple question: **is The Office actually funny, or do we just love the characters?**

> **Update, September 2026.** The rescore is finished. All 183 episodes went through the current three-run consensus model, and every number below has been updated to match. The show moved from 79.4 to 88.0, and from #14 to #9 on the board. The shape of the original finding held. The one casualty is the headline: "Dinner Party" is no longer the top-scoring episode.


To find out, we built an AI comedy analyst that identifies and scores every joke in every episode. Not just the obvious punchlines — reaction shots, cringe beats, visual gags, Jim's camera looks, and uncomfortable silences all get counted and scored.

## The Methodology

Every joke gets two scores:
- **Craft** (1-10): How well-written is this joke? We measure originality, structure, character integration, economy of language, and whether the humor is earned or cheap.
- **Impact** (1-10): How hard does this land? Imagine 100 comedy-savvy viewers watching together — would the room erupt, chuckle, or sit in silence?

These feed into the **Humor Index**, our composite score on a 0-100 scale. The calibration points are fixed — 75 was set as the midpoint when the scale was built — but the distribution has moved as we've added shows: across the 13 shows scored on the current model the board runs from 80.0 to 97.5, so 75 now sits below the whole show-level range rather than in the middle of it. Read episode scores against their own show, not against 75.

## What We Found

Season 3 is the show's peak at **90.4** across 23 episodes, with Season 4 effectively tied at 90.2 across 14. The fan consensus says Season 4 and the measurement says Season 3, by 0.2 points, which is well inside the scorer's own noise floor. Read it as a tie.

The top of the episode board is **"The Duel" (98.5)**, then "Stress Relief" (97.9), "Product Recall" (97.1) and "The Injury" (97.0). All four come from Seasons 2 through 5, which is where density and craft peak together.

"Dinner Party" scores 91.2, 36th of 183. That number has now been three different things in this post: 88.1 under single-run scoring, 98.0 after the first consensus pass, 91.2 in the full rescore. Long discomfort sequences produce few, very high-value jokes, which is the shape a scorer is least stable on. Three-run consensus narrowed that spread. It did not close it.

## The Cringe Comedy Problem

This is the fundamental challenge of scoring The Office: its signature move — sustained, excruciating discomfort — doesn't play like traditional joke-based comedy.

A 3-minute scene where Michael shows off his tiny plasma TV isn't one joke. It's one long, beautiful nightmare. But in terms of our scoring, it counts the same as a quick one-liner.

We addressed this by weighting **peak density** (what percentage of jokes are elite-quality) more heavily than raw jokes-per-minute. This means an episode with 40 incredible jokes can outscore one with 70 mediocre ones.

## How The Office Compares

Better than it did when this post was written, for a boring reason: it had not been rescored yet.

On the current board The Office sits at **88.0, #9**, between Parks and Recreation (91.9) and Schitt's Creek (87.6). The rescore added 8.6 points, in line with every other show that has moved onto the current model.

The 30 Rock comparison is now much closer than this post has ever claimed:

- **30 Rock:** 3.53 jokes per minute, 7.68 average craft
- **The Office:** 3.24 jokes per minute, 7.23 average craft

That is **1.09x** on density, not the "nearly 3x" of the original post and not the 1.5x of the first correction. Both of those compared across scoring runs. 30 Rock still scores higher per joke and still leads the board at 97.5, but the sniper-versus-machine-gun framing does not survive measuring the two shows the same way. The Office fires almost as often.

## The Verdict

Yes, The Office is actually funny. Not just nostalgic, not just "comfortable TV" — genuinely, measurably funny. Its best episodes compete with the best comedy television has ever produced.

It is also steadier than we reported. Across all 183 episodes the range runs from "The Duel" at 98.5 down to "Hot Girl" at 78.6, with a mean of 88.0 and a standard deviation of 3.8. The old 98.0-to-63.5 spread was mostly single-run noise at the bottom of the board, not the show falling apart. Season 3, its best, runs from "The Merger" at 81.2 to "Product Recall" at 97.1.

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
How big a reaction would this joke get from 100 comedy-savvy viewers? *(Historical note: this used to include a 15–25% penalty on multi-cam sitcoms — 25% for sweetened laugh tracks, 15% for live audiences to discount laugh-track-inflated reactions. We removed it in April 2026 after a Bayesian audit showed the format effect was statistically indistinguishable from zero. See the [Methodology page](/methodology) for the full reasoning.)* Stand-up material (Jerry's monologues at The Improv) is weighted at 0.30 of a normal joke in aggregate scores, since it's polished professional material rather than sitcom comedy.

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
    description: 'A test-retest study on 30 episodes. Show-identity bias is tiny (not significant). But the scorer is noisier than we thought — individual episode Humor Indexes are only 28% signal, 72% run-to-run variance. Here’s what we’re doing about it.',
    date: '2026-04-17',
    category: 'Data Science',
    content: `
> **Scope note.** This study was run in April 2026 on the three shows the index had then (The Office, Seinfeld and Friends), using that month's scores. The reliability findings are properties of the scorer and still hold; they are why every episode is now scored three times. The show scores in the tables below are April's, not today's.

Earlier this week we ran a blind-mode rescoring study on 99 episodes across our three scored shows. Then we took 30 of those episodes and scored them a SECOND time (also in blind mode) to measure the scorer’s own noise floor.

The results are humbling. Here they are.

## Finding 1: Show-identity bias is small and not significant

First the good news. We compared each episode’s blind score to its production (non-blind) score — the one we currently show on the site. Paired difference analysis:

| Show | n | Blind HI | Non-blind HI | Δ (non-blind − blind) | 95% CI |
|---|---|---|---|---|---|
| Seinfeld | 33 | 84.6 | 82.1 | −2.45 | [−5.71, +0.82] |
| The Office | 33 | 78.9 | 77.7 | −1.23 | [−5.11, +2.65] |
| Friends | 33 | 81.3 | 80.5 | −0.72 | [−5.29, +3.84] |
| **Pooled** | 99 | — | — | **−1.47** | [−3.72, +0.79] |

Pooled bias: the LLM scores episodes **1.47 points lower** when it can see the show name. The 95% CI straddles zero, so this effect is not statistically significant at n=99.

The direction is the OPPOSITE of what you might expect. If the LLM were fellating famous shows, scores would go up with show knowledge, not down. The slight downward shift is likely explained by non-blind mode giving the LLM an explicit character list, which probably affects joke detection in subtle ways (more structured attribution → different joke ensembles).

**Takeaway**: show-identity bias is not a meaningful issue in the current production scores.

## Finding 2: Our own scorer is noisier than we thought

We scored 30 episodes TWICE, both blind, with different internal random seeds (the AI has natural non-determinism at temperature > 0). Ideally the two scores should be very similar. They’re not.

### Reliability per metric

| Metric | ICC | Interpretation |
|---|---|---|
| avg_craft (raw 0–10) | 0.28 | poor |
| avg_impact (raw 0–10) | 0.24 | poor |
| **Humor Index (0–100)** | **0.28** | **poor** |
| total_jokes detected | 0.67 | moderate |
| JPM | 0.53 | moderate |

Intraclass correlation (ICC) measures what fraction of the variance in scores is REAL between-episode signal vs. run-to-run noise. For individual-subject measurements, ICC ≥ 0.75 is “good,” 0.4–0.75 is “moderate,” and <0.4 is “poor.”

**Our Humor Index ICC is 0.28.** Only 28% of variance in a single-run episode score reflects real episode quality; 72% is run-to-run scorer noise.

### Variance decomposition

For the 30 test-retest pairs:

- **Between-episode variance** (real signal): 27.8% of total
- **Within-episode variance** (run-to-run noise): 72.2% of total

Mean absolute difference between two blind runs of the same episode: **10.7 Humor Index points.**

*(Flagged on review, August 2026: this figure and the "~5 point per-episode noise SD" used further down are not consistent with each other — for two independent runs, a mean absolute difference of 10.7 implies a per-run SD near 9.5, not 5. The 5-point figure is the one that reconciles with the observed episode-score spread, so the show-level standard errors below are computed from it. We are re-deriving the 10.7 and will correct whichever is wrong. Publishing the discrepancy rather than quietly picking one.)*

That means any two episodes within ~10 points of each other (on a 0–100 scale) are essentially indistinguishable with single-run scoring.

## Why does the Humor Index have so much noise?

Three sub-findings explain it:

**1. Joke detection is stable (r ≈ 0.63 on total jokes found).** The LLM reliably finds most jokes in an episode — joke counts across two runs are within ±8-9 of each other on average.

**2. Per-joke craft/impact scoring is moderately stable (SD ≈ 0.35 on 0–10).** Individual joke scores jitter by about 5% between runs. That’s the LLM’s actual noise floor.

**3. The Humor Index formula AMPLIFIES that noise via threshold metrics.** The formula includes \`peak_density\` — the fraction of jokes where BOTH craft ≥ 7 AND impact ≥ 7. A joke scored 7.01 vs 6.99 flips its “elite” status. When the scorer is noisy by ±0.35, a bunch of threshold-adjacent jokes cross the line in different runs, and peak_density swings by 1-2 points. That 1-2 point swing in a component with 15% weight translates to multi-point Humor Index swings.

Similarly, the \`memorability_bonus\` depends on the top 5 quotability scores — which can change when different jokes are identified as “top.” And \`effective_score\` uses top-quartile weighting, which compounds noise at the edges.

## So are the rankings meaningless?

No, but they need context.

### Show-level rankings are statistically fine

Each show’s overall Humor Index is averaged over a lot of episodes: 168 to 236 for the three studied here. The law of large numbers does its work:

- Per-episode noise SD: ~5 Humor Index points
- The Office (183 eps): SE on show mean ≈ 0.37
- Seinfeld (168 eps): SE on show mean ≈ 0.39
- Friends (236 eps): SE on show mean ≈ 0.33

So show-level Humor Indexes are stable to roughly ±0.4 points from LLM noise.

*(The example that used to sit here compared three show scores sitting within 1.5 points of each other. Two of those shows have since been rescored on the current model and moved by 9 and 15 points, which is a change of scale, not noise. The rule that survives: a 1 to 2 point gap between two shows scored the same way is noise. A gap between two shows scored on different models is not a measurement at all.)*

**Show rankings hold up — provided you only rank shows measured the same way.**

### Individual episode rankings have ±5-point noise

If two episodes are within ~10 Humor Index points, the ordering between them is within the scorer’s noise floor. A best-episodes list for a single show, where the top ten sit within a few points of each other, has a lot of real uncertainty in its ordering.

**Extreme episodes still stand out, but the extremes moved.** "The Duel" (98.5) is clearly above The Office's episode mean (88.0), and the bottom of the show at 78.6 is clearly below. Both gaps are around 10 points against a per-episode noise SD of roughly 5, so neither would flip. What did not survive the rescore is the width: the old bottom quartile sat at 63.5, the new one at 85.4, and most of that difference was single-run noise rather than bad episodes.

But the difference between #1 and #2 in a close race? That’s within noise.

## What we’re doing about it

Three changes:

**1. Publishing the noise floor.** This blog post and a new section on our methodology page spell it out: single-run Humor Index ICC = 0.28, mean |Δ| = 10.7 points, show-level SE = 0.4 points. Readers should calibrate their confidence accordingly.

**2. Consensus scoring going forward.** Our pipeline already supports multi-run consensus (the \`--num-runs\` flag). For all new shows — starting with Parks and Recreation when we resume — we’ll score each episode THREE times and use the mean. *(We did. Every show scored or rescored since uses three-run consensus.)* Three runs cuts per-episode SE by about √3 ≈ 1.7×, which should get ICC up to moderate (≥ 0.4) territory. Five runs would get us near “good” (≥ 0.75).

**3. Smoother aggregate formula (future work).** The threshold-based metrics in the Humor Index (peak_density, memorability_bonus) are the noise amplifiers. Replacing them with continuous smoothed versions — say, a sigmoid-weighted elite-joke score instead of a hard threshold — would cut formula-level amplification without changing the qualitative meaning. We’re leaving the current formula in place for continuity but exploring a v3 formula.

## The honest bottom line

We found out, in public, that our own scorer’s noise floor is higher than we thought.

We could have:
- Not run this study and never known
- Run it and buried the results
- Run it and presented the good part (small show-identity bias) while glossing over the bad part (poor ICC)

Instead we’re publishing the full findings, the specific ICC, the variance decomposition, and the plan to address it. This is what real research looks like. It’s uncomfortable, but it’s how you build something you can actually trust.

*Study artifacts: sample of 99 episodes scored blind, 30 of those scored again. Raw outputs are in our workspace and available on request. See also the [Bayesian credible intervals](/blog/bayesian-credible-intervals) post which independently corroborates the noise-floor finding via a hierarchical model.*
    `,
  },
  'bayesian-credible-intervals': {
    title: 'We Fitted a Bayesian Model to 15,000 Jokes. Format Explains Nothing.',
    description: 'A hierarchical Bayesian model of joke impact on 15,000 jokes. Format effect: statistically indistinguishable from zero — which is why the multi-cam penalty is gone. 64% of joke-level variance is unexplained noise, and show identity explains only 7.9%.',
    date: '2026-04-17',
    category: 'Data Science',
    content: `
> **Scope note, August 2026.** This model was fit in April 2026 on the three shows the index had at the time, and it has not been refit since. Its two durable findings — that format has no identifiable effect on joke impact, and that ~64% of joke-level variance is unexplained noise — are why the multi-cam penalty is gone and why we score every episode three times. Its third finding, that the show rankings were statistically indistinguishable, was a true statement **about three shows sitting within 1.5 points of each other**. That conclusion does not generalize to the current board. This post used to be titled "Every Show Ranking Is Within Noise"; we have changed the title.

Earlier this week we removed a silent format coefficient that was penalizing multi-cam shows by 15–25%. A data-science audit had flagged it as statistically unidentifiable with only three scored shows. We agreed and pulled it.

Then we went further. We fit a hierarchical Bayesian model to the entire dataset to answer the deeper question: **when you properly control for joke type, character, and episode, how much of a comedy show’s ranking is actual signal vs. within-noise differences?**

The answer is more humbling than we expected.

## The Model

We sampled 15,000 jokes across The Office, Seinfeld, and Friends (5,000 per show) and fit a model predicting each joke’s impact score (the LLM’s 0–10 audience-reaction estimate) as:

\`\`\`
impact_j = grand_mean
         + format_effect[format(j)]         # fixed effect
         + show_effect[show(j)]              # partially-pooled random effect
         + joke_type_effect[type(j)]
         + episode_effect[episode(j)]        # random intercept
         + character_effect[char(j)]         # random intercept
         + residual_noise
\`\`\`

Everything was sampled with PyMC using NUTS (2 chains, 500 post-warmup draws, 0 divergences). This is a textbook hierarchical-effects model — the kind of setup you’d use for player effects in a sports analytics paper.

## Finding 1: The format effect is statistically zero

Here’s the posterior for the format coefficient (single-cam vs. multi-cam baseline):

| | Posterior median | 95% CrI | P(effect > 0) |
|---|---|---|---|
| **Single-cam** (vs. multi-cam baseline) | **−0.052** | **[−0.590, +0.442]** | 0.40 |

Translation: the posterior distribution puts a 60% chance that the single-cam effect on impact is negative, 40% it’s positive. **The credible interval straddles zero.** After controlling for everything else, we cannot distinguish single-cam from multi-cam on impact.

This is vindication. The old 15–25% coefficient wasn’t just poorly calibrated — it was applying a correction to an effect the data doesn’t support.

## Finding 2: The three shows are statistically indistinguishable

Show random-effect deflections (on the 0–10 impact scale):

| Show | Median deflection | 95% CrI |
|---|---|---|
| **Seinfeld** | +0.154 | [−0.224, +0.530] |
| **The Office** | −0.007 | [−0.505, +0.456] |
| **Friends** | −0.131 | [−0.498, +0.235] |

All three intervals overlap. The posterior median orders them Seinfeld > Office > Friends. That did *not* match our published Humor Index ordering at the time, which had Office (80.2) narrowly ahead of Seinfeld (79.1) — a disagreement well inside the noise both methods were reporting. But the **statistical story is that this ordering is within noise.** The probability that Seinfeld’s show-effect really is higher than Friends’ is around 82%. That’s meaningfully better than a coin flip, but it’s not the 99%+ certainty you’d want to publish a ranking claim with.

With only 3 shows and 15K sampled jokes, the shows’ impact-quality differences don’t clear the statistical bar. *(The model has not been refit since. On the current board the between-show component would almost certainly come out well above 7.9%.)*

## Finding 3: 64% of variance is unexplained joke-level noise

The model’s variance decomposition:

- **Within-joke residual (unexplained): 63.9%**
- Between-episode within show: 11.8%
- Between-joke-type: 8.9%
- **Between-show: 7.9%**
- Between-character: 7.5%

Shows explain only **7.9% of total joke-level variance.** That is almost identical to the variance explained by joke type (8.9%) or individual character (7.5%), and less than variance between episodes within a show (11.8%).

Two-thirds of the variance is within-joke residual — the LLM gives similar jokes meaningfully different scores. Some of this is real (the same joke type can be executed well or badly), some is LLM noise. Without an inter-rater reliability study we can’t distinguish.

## What This Actually Means for the Rankings

The Humor Index, Comedy WAR, and every leaderboard on this site are computed from aggregates of joke-level scores. When the joke-level model can’t distinguish shows, the aggregates rank them — but those ranks sit on a foundation of overlap.

In practice: a **1–2 point Humor Index gap between two shows scored the same way is inside the noise floor**, and you should not read an ordering into it. That was the situation with the three shows in this model, which sat within 1.5 points of each other.

It is not the situation on the board today. The Office and Seinfeld have since been rescored on the current model and sit at 88.0 and 94.4, 6.4 points apart on the same scale. That gap is well outside the noise floor.

*Note (updated August 2026): when this post was first published, Seinfeld led at 83.9 because stand-up bits were being scored as sitcom comedy. That was fixed with a standup-aware rescore, which put it at 79.1; the 2026 canonical rescore has since moved it to 94.4. Three different numbers for one show in one year is a fair summary of why we publish a noise floor at all.*

This doesn’t mean the rankings are wrong. It means they’re **not statistically distinguishable given current data.** That’s a feature of being honest about our sample size and model, not a bug in the analysis.

## What We’re Changing on the Site

1. **Credible interval badges** on show pages. Next to each show’s Humor Index, we’re surfacing the 95% credible interval from this model. A reader can see that the three shows have overlapping intervals and draw their own conclusion.

2. **Variance decomposition on the methodology page.** The 64% within-joke noise figure is going in the Known Limitations section. Readers should know that two-thirds of what our model sees in joke-level scores is unexplained.

3. **The format filter stays.** Since format doesn’t have an identifiable effect on impact, the filter is just a convenience for users who want to compare multi-cam to multi-cam. It’s no longer a silent correction.

## The Big Picture

This result aligns with what a lot of comedy writers will tell you: **there is no universally correct answer to "which show is funnier."** Our data suggests the answer is somewhere between "they’re essentially the same" and "the differences we measure are small enough that the model can’t confidently order them."

We’re publishing the full model artifacts — posterior samples, variance components, and credible intervals — in the site’s \`public/data/\` directory, so anyone who wants to reanalyze is welcome to.

*Model outputs: [format_posteriors.json](/data/format_posteriors.json) • [show_credible_intervals.json](/data/show_credible_intervals.json) • [variance_decomposition.json](/data/variance_decomposition.json)*
    `,
  },
  'imdb-vs-humor-index': {
    title: 'IMDb Ratings vs. The Humor Index: Does "Funny" Mean "Good"?',
    description: 'We compared 1,057 episodes across the 13 shows scored on our current model against IMDb audience ratings. Within-show correlation: r = +0.27, so audience ratings explain about 7.5% of the variance in the Humor Index. They are mostly measuring something else.',
    date: '2026-04-12',
    category: 'Data Science',
    content: `
We integrated IMDb episode ratings across every analyzed show on The Humor Index. And the first thing we did was the obvious data science move: **how well do audience ratings predict our comedy scores?**

*Updated November 2026: this post originally ran on 591 episodes across three shows. The numbers below now cover the 13 shows scored on our current model, 1,057 episodes, every one with a matched IMDb rating. Shows still waiting on a rescore are left out until they are done.*

The answer: they don't. Not even close.

## The Numbers

Across **1,057 episodes** of 13 shows, centred within each show so that no cross-show differences leak in, the Pearson correlation between the Humor Index and IMDb ratings is **r = +0.27**. That is positive, and with n this large it is not a fluke, but it means audience ratings account for about **7.5% of the variance** in the Humor Index. The other 92% is something else.

Per show, here's where it lands:

- **Chappelle's Show** (27 eps): r = +0.65, the strongest on the board by some way, on one of the smallest samples
- **Arrested Development** (84 eps): r = +0.46
- **Fleabag** (12 eps): r = +0.40
- **The Larry Sanders Show** (90 eps): r = +0.37
- **Broad City** (50 eps): r = +0.36
- **The Office** (183 eps): r = +0.34
- **Veep** (65 eps): r = +0.29
- **Seinfeld** (168 eps): r = +0.27
- **Flight of the Conchords** (22 eps): r = +0.20 · **Parks and Recreation** (122 eps): r = +0.17 · **30 Rock** (136 eps): r = +0.12
- **Schitt's Creek** (80 eps): r = −0.02 · **Freaks and Geeks** (18 eps): r = −0.18

Eleven of thirteen shows are positive; the median show sits at **r = +0.29**, and only Chappelle's Show clears r = +0.6, on 27 episodes. There is a real signal here and it is weak almost everywhere.

Across all 13, IMDb explains about **7.5% of the variance** in our Humor Index scores, and in the two shows with negative correlations, none at all.

In plain English: knowing an episode's IMDb rating tells you almost nothing about how funny it actually is by our analysis.

## Why This Matters

IMDb ratings measure **whether audiences enjoyed an episode**. That's a cocktail of plot quality, emotional resonance, character development, guest stars, and yes — comedy. When someone gives "Casino Night" a 9.3, they're rating the Jim/Pam moment at the end as much as any joke.

The Humor Index measures something narrower: **comedy craft and density**. How many jokes land? How well-constructed are they? How hard do they hit?

These are genuinely different questions, and our data proves it.

## The Biggest Disagreements

Some episodes where our AI sees comedy gold but audiences shrug:

- **"Andy's Ancestry" (S9E03)**: Humor Index 94.8, IMDb 7.1. Dense with character comedy, and one of the widest gaps in the show. Season 9 fatigue dragged the audience score down regardless of what landed.
- **"Angry Andy" (S8E21)**: Humor Index 92.2, IMDb 6.6. Packed with jokes, but the late-season Andy arc turned audiences off no matter how many of them worked.
- **"Here Comes Treble" (S9E05)**: Humor Index 90.9, IMDb 6.7. Same pattern, same season, same verdict from the crowd.

And episodes audiences adore that don't score as high on pure comedy:

- **"Goodbye, Michael" (S7E21)**: Humor Index 87.6, IMDb 9.8. Tied with the finale for the highest audience rating in the series, and merely a good one by joke count. It is an exit, not a comedy showcase.
- **"Livin' the Dream" (S9E21)**: Humor Index 82.1, IMDb 9.0. Dwight finally gets the manager job. Payoff, not punchlines.
- **"The Merger" (S3E08)**: Humor Index 81.2, IMDb 8.6. The Stamford branch arrives, the plot moves, and the joke rate sits at the bottom of Season 3.

## What Predicts IMDb Ratings?

We tested which of our sub-metrics best correlates with audience scores:

Within The Office specifically:

- **Impact** (r = 0.39) — how hard jokes land is the closest thing to an audience proxy we have
- **Craft** (r = 0.35) — how well they are built
- **Humor Index** (r = 0.34) — the composite score
- **JPM** (r = -0.19) — joke density is the *least* related thing to an audience rating

The last one is the interesting one. **More jokes per minute predicts slightly lower audience ratings.** Episodes with the highest joke density often give up plot and character time to get there, and audiences notice.

## Season-by-Season Patterns

The correlation varies wildly by season:

- **Season 2** has the strongest correlation (r = 0.51), the stretch where the show's best episodes are also its funniest by joke count
- **Season 8** is the only negative season (r = -0.24). It is also the Michael-less season, where our scorer keeps finding jokes the audience had stopped showing up for
- **Seasons 5 and 1** land in between (r = 0.42 and r = 0.39); Season 4 is nearly flat at r = 0.14

## The Dinner Party Correction

Earlier versions of this post led with "Dinner Party" as the cringe paradox: our highest-scoring Office episode, an IMDb 7.6, brilliant discomfort that audiences would not sit through twice. Both halves of that were wrong.

"Dinner Party" is an IMDb **9.4**, one of the highest-rated episodes the show ever aired. The 7.6 came from our own join: IMDb splits the hour-long episodes into two entries and we did not, so our ratings slid out of alignment in the seasons that have them. That is fixed as of September 2026 by matching on episode title instead of episode number, across every show it affected: 36 of 183 Office ratings came back different, and so did 28 Seinfeld, 9 Larry Sanders, 7 30 Rock and 2 Parks. On the comedy side the September rescore put the episode at **91.2**, 36th of 183, not first.

So the cringe paradox does not hold where we said it did. Audiences and our scorer agree about "Dinner Party": both rate it highly. Where they genuinely part company is Seasons 8 and 9, where our scorer keeps counting well-built jokes in episodes the audience had already written off.

That is still the distinction the Humor Index exists to make. Not "did you enjoy this" but "is this comedy operating at a high level". It just turns out the clearest examples of the two coming apart are late-series Andy episodes, not the show's most famous bottle episode.

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
> **Editor's note (April 16, 2026): This post has been retracted.** We removed the format coefficient described below after a Bayesian audit found the effect was statistically indistinguishable from zero. With only three scored shows in the corpus — two of them multi-cam — the "penalty" was confounded with show-level idiosyncrasies rather than driven by format. See the [Methodology page](/methodology) for the reasoning behind the removal and for current policy. The original argument is preserved below for transparency.

---

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
