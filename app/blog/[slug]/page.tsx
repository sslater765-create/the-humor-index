import { notFound } from 'next/navigation';
import Link from 'next/link';
import SocialShare from '@/components/ui/SocialShare';
import EndOfArticleCTA from '@/components/ui/EndOfArticleCTA';
import { getAllShows } from '@/lib/data';
import { formatIndex } from '@/lib/scoring';

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
  'arrested-development-craft-leaderboard': {
    title: "Arrested Development Has 8 of the Top 10 Best-Crafted Characters in TV Comedy",
    description: "Of the ten characters with the highest per-joke Craft scores on our index, eight come from one show. The Bluth family owns the craft leaderboard. The other two outliers — Ron Swanson and Creed Bratton — are revealing in their own right.",
    date: '2026-05-15',
    category: 'Analysis',
    content: `
Of the ten characters with the highest per-joke Craft scores on the Humor Index, **eight come from one show.** That show is Arrested Development. The other two outliers — Ron Swanson at #1 and Creed Bratton at #4 — are doing something specific that the Bluths aren't.

This is the kind of pattern we built the index to find. Let's look at it.

## The top 10

Per-joke Craft score, minimum 100 analyzed jokes. Across six fully-scored shows.

| # | Character | Show | Craft | Jokes |
|---:|---|---|---:|---:|
| 1 | **Ron Swanson** | Parks and Recreation | 7.43 | 839 |
| 2 | Narrator (Ron Howard) | Arrested Development | 7.40 | 494 |
| 3 | Buster Bluth | Arrested Development | 7.38 | 358 |
| 4 | Creed Bratton | The Office | 7.34 | 184 |
| 5 | Lucille Bluth | Arrested Development | 7.32 | 468 |
| 6 | Tobias Fünke | Arrested Development | 7.30 | 442 |
| 7 | Michael Bluth | Arrested Development | 7.23 | 1,029 |
| 8 | Gob Bluth | Arrested Development | 7.22 | 700 |
| 9 | George Sr. | Arrested Development | 7.22 | 386 |
| 10 | George Michael Bluth | Arrested Development | 7.21 | 425 |

Spots 2, 3, 5, 6, 7, 8, 9, and 10 — eight of ten — are Bluths. Not "Arrested Development cast members." Eight characters who all share the same fictional last name. The Narrator is Ron Howard's voiceover; he's effectively the family's omniscient observer.

We didn't tilt the scale to get here. The methodology was set in February, before Arrested Development was even queued. The data fell out this way on its own.

## Why this happens

Three things drive Arrested Development's craft scores, and they're all visible in how each individual joke gets graded.

### 1. Callbacks are weaponized

Our craft rubric scores each joke across five sub-dimensions: setup quality, misdirection, subversion, character fit, and timing precision. AD's callbacks score brutally high on **subversion** — a callback joke pays off a setup from three episodes ago, six episodes ago, sometimes three seasons ago. That's not just clever; it's mechanically a higher subversion score than a one-episode setup-punchline.

We tag every joke with whether it's a callback. Across all six shows, callback density looks like this:

- **Arrested Development:** 16.4% of jokes
- The Office: 7.2%
- Parks and Rec: 6.8%
- Seinfeld: 5.9%
- Friends: 5.1%
- Schitt's Creek: 4.3%

AD has more than double the callback density of any other scored show. Each callback is, by construction, scoring high on subversion. That math has consequences — it lifts the whole roster's craft floor.

### 2. Character fit is almost impossible to lose

Could only this character have said this line? That's character fit. It's the only craft dimension where multiple AD characters score 9+ as their median, not just their peak. Tobias is graphically the only person in television who could have said "I just blue myself." The setup belongs to Tobias's character. The punchline belongs to Tobias's character. The misunderstanding belongs to Tobias's character. **Character fit: 9.5.** That's not unusual for him; it's his baseline.

Every Bluth has a register that's so specific the writers couldn't accidentally give one's line to another. The data picks that up.

### 3. The writers' room density

We can't measure this directly. But the index gives us a proxy: if you sort by per-joke Craft and find one show carrying 80% of the top 10, the most parsimonious explanation is that the writers' room was packed with people who agreed on what they were doing. Mitchell Hurwitz had a small staff working on tightly recursive scripts. The Office had more writers, more episodes, more "fine" jokes. AD has fewer episodes, fewer jokes total — and a higher floor.

This is why AD is the highest-HI show on the index at 85.2 despite having only 84 episodes. It's not because every episode is a masterpiece. It's because the writing room held the bar very, very high on the floor of every joke.

## The two outliers

Two characters in the top 10 are not Bluths. Both deserve a closer look.

### Ron Swanson — the lone Parks character

Ron has the **highest** per-joke Craft of any character on the index. He beats every Bluth, every Office regular, every Friend, every Schitt. His 7.43 is the ceiling.

What's driving it? Ron's writers wrote him as a near-perfect deadpan vessel. His jokes load almost entirely on two dimensions of the craft rubric — **economy** (no wasted words) and **timing precision** (the pause before he delivers). His misdirection scores are lower; he doesn't fool the audience. He just executes the joke at the highest possible quality.

He's also the only character in his show's top 10. Leslie Knope has more total WAR (550.4) than Ron (605.8 — wait, Ron has more), but Ron's per-joke quality is so high that even his much smaller joke count (839 vs Leslie's 1,972) couldn't drag his Craft mean down.

The Parks and Rec writers' room found one character they could trust to land every single line. They wrote others for warmth — Leslie, Andy, Tom, Donna. Ron got the high-craft jokes because Ron was the one who could deliver them. That's a casting decision and a writing decision working together.

### Creed Bratton — the smallest sample on the list

Creed has 184 jokes. That's an order of magnitude fewer than Michael Scott (3,265) or Dwight (1,734). He should be filtered out of any meaningful leaderboard.

Except his per-joke Craft is 7.34 — fourth on the index. And his per-joke Impact is **7.22, the highest on the index period.**

Two interpretations:

1. **Selection bias.** Creed is a sketch character — he only appears for specific kinds of jokes. The writers gave him absurdist non-sequiturs and tag scenes. They wrote him for moments where they wanted maximum oddness per second. So when you average his jokes, you get a very high number because there's no "filler Creed" to balance against the showcase moments.

2. **The actor.** Creed Bratton (the actor, also named Creed Bratton) was a working musician before The Office. He was 65 when filming started. He delivers absurdism in a way most actors can't, because most actors haven't lived through five decades of weird real-life history before going to a TV set. The character is mostly him.

Both interpretations are probably true. But the data point stands: Creed's 184 jokes are the highest-quality 184 jokes by any single character in our scored corpus.

## What about Schitt's Creek?

This is the obvious question. Schitt's Creek is one of our six scored shows; its characters appear elsewhere in our rankings (Moira and David are statistically tied for the show's #1 spot on Comedy WAR). And yet **no Schitt's character cracks the top 10 on per-joke Craft.**

The highest-Craft Schitt's character is Moira Rose at 7.21, which would tie George Michael Bluth for #10 — except we already round to 7.21 vs 7.21 — and the bootstrap CIs on both are wide enough that "10th" is meaningless at this precision. But she misses the cutoff.

Why? Schitt's Creek scores high on **Impact** per joke (the show is tied for #1 on per-joke Impact across all six shows). What it doesn't score high on is **Craft.** The two metrics measure different things. Craft asks: was this joke well-constructed? Impact asks: did it land?

Schitt's Creek is a show where jokes land because the characters earn the laugh through warmth and recognition. They're often not the most technically constructed jokes — long setups, single-beat punchlines, occasional misses on misdirection. But when the cast delivers them, the audience laughs because of accumulated familiarity with the character.

That's a different comedic strategy than Arrested Development's. AD bets on the joke. Schitt's bets on the moment.

Neither is wrong. The numbers just say they're different.

## A note on what "Craft" measures (and doesn't)

Craft is a per-joke quality score, not a quality score for the show overall. It uses our five sub-dimensions, equally weighted. It doesn't reward density (that's Peak Density and Weighted JPM, both separate inputs to the Humor Index). It doesn't reward audience reaction (that's Impact). It doesn't reward cultural footprint (that's covered by our quotability sub-score).

What it does reward: writing that holds up to slow inspection. Lines you can pause on and admire.

This is also why **AD is higher on Craft than on Humor Index.** The show's overall HI is 85.2 — #1 on the show leaderboard, with a sizable gap to Parks at #2. But on per-joke craft, AD doesn't have the highest single character (that's Ron). What AD has is **depth.** It's the show with the most characters in the elite tier. That's a different kind of dominance than "the best single performance."

If you want to know which show has the most carefully-written average joke, that's AD. If you want to know which character delivers the highest-quality individual joke, that's Ron Swanson.

## Where the leaderboard hits the noise floor

The top three rank order (Ron, Narrator, Buster) is stable. The bootstrap 95% CIs on the next several spots overlap heavily:

- #4 Creed (7.34) and #5 Lucille (7.32) are inside each other's CI. The order between them is essentially a coin flip on any rescoring.
- #7 Michael (7.23), #8 Gob (7.22), #9 George Sr. (7.22), #10 George Michael (7.21) are all clustered within 0.02 points. They are statistically a cluster, not a ranking.

When we say "8 of the top 10 are from AD," that pattern is robust. When we say "Lucille is 5th and Tobias is 6th," that's reading more precision into the numbers than the data supports. The cluster is real; the order within the cluster is noise.

## What's coming

A few things we'll publish next that fall out of this dataset:

- **Per-show Craft rankings.** Same data, sliced by show. Where the top character lives in each cast, and how far ahead they are of their #2.
- **Craft vs Impact 2x2.** Plot every character on Craft (x) vs Impact (y). Different shows cluster in different quadrants.
- **Why some shows have flat craft distributions and others have peaks.** AD: many high-Craft characters. Office: one tall peak (Creed) with a long mid-range.

If you want to argue with these numbers, the underlying data is all linked from the [methodology page](/methodology). Bring receipts.

---

*Read more about the cross-show character leaderboard at [Funniest Characters Across All Six Shows](/blog/funniest-characters-cross-show), and the show-level rankings at [Arrested Development Takes the #1 Spot](/blog/arrested-development-takes-the-crown).*
`,
  },
  'war-reconciliation': {
    title: "We Found a WAR Methodology Drift. Jerry Seinfeld Is Now #1 Cross-Show. Here's What We Fixed.",
    description: "Some shows' WAR was being computed against a higher replacement value than documented. Jerry, AD characters, and Schitt's characters were under-counted by hundreds of points. After applying the documented formula uniformly, the cross-show leaderboard reshuffles. Jerry overtakes George. AD's top tier moves up where it belongs.",
    date: '2026-05-15',
    category: 'Methodology',
    content: `
On May 15, 2026 we audited every character's WAR (Wins Above Replacement) score after a reader noticed a result that didn't add up. The audit found that some shows were computed against a non-standard replacement value, suppressing their characters' WAR by several hundred points. After applying the documented formula uniformly, the cross-show leaderboard order changes meaningfully.

## What WAR is supposed to be

WAR measures the total comedic value a character contributes above a "replacement-level" sitcom character. The formula, documented at our [methodology page](/methodology):

\`WAR = n_eff × max(shrunk_quality − replacement_quality, 0)\`

Where:
- \`n_eff\` is the effective joke count (with stand-up jokes downweighted at 30%)
- \`shrunk_quality\` is the per-character mean of (craft + impact) / 2, Bayesian-shrunk with k=30 toward the league median
- \`replacement_quality\` = **6.555** — the 25th percentile across recurring sitcom characters in the dataset

Each piece of that has a published rationale. The replacement value of 6.555 is the bench-player threshold; quality above that adds positive WAR, quality below that contributes zero (max-floored at 0).

## What we found

We have characters.json files for seven scored shows. We back-calculated the implicit replacement value each show's WAR was using.

| Show | Implied replacement | Matches documented (6.555)? |
|---|---|---|
| The Office | 6.555 | ✓ |
| Seinfeld (George, Kramer, Elaine) | 6.555 | ✓ |
| Seinfeld (Jerry only) | ~6.66 | ✗ |
| Friends | 6.555 | ✓ |
| Parks and Recreation | 6.555 | ✓ |
| Arrested Development | ~6.86 | ✗ |
| Schitt's Creek | ~6.86 | ✗ |
| 30 Rock | 6.555 | ✓ |

Four shows used the right replacement. Three didn't. The deviations weren't random — they fell along clean show boundaries. The most plausible cause is that AD and Schitt's were scored during an interim period when the replacement value was set differently in the WAR-computation script, and Jerry was the only Seinfeld character whose WAR was recomputed after the April 17 stand-up correction without the replacement value being reset.

## What the fix changes

Top 15 cross-show leaderboard, before and after applying the documented formula uniformly:

| # | Character | Show | Old WAR | New WAR | Δ |
|---:|---|---|---:|---:|---:|
| 1 | Jerry Seinfeld | Seinfeld | 1,109.5 | **1,499.5** | +390 |
| 2 | Jack Donaghy | 30 Rock | 1,319.2 | 1,319.2 | — |
| 3 | George Costanza | Seinfeld | 1,181.9 | 1,181.3 | — |
| 4 | Liz Lemon | 30 Rock | 987.5 | 987.5 | — |
| 5 | Dwight Schrute | The Office | 802.6 | **811.3** | +9 |
| 6 | Tracy Jordan | 30 Rock | 808.6 | 808.6 | — |
| 7 | Chandler Bing | Friends | 651.6 | 655.4 | +4 |
| 8 | Phoebe Buffay | Friends | 618.5 | 622.2 | +4 |
| 9 | Ron Swanson | Parks and Rec | 605.8 | 609.4 | +4 |
| 10 | Cosmo Kramer | Seinfeld | 555.2 | 564.1 | +9 |
| 11 | Leslie Knope | Parks and Rec | 550.4 | 554.1 | +4 |
| 12 | Joey Tribbiani | Friends | 531.6 | 535.3 | +4 |
| 13 | **Michael Bluth** | Arrested Dev | 219.7 | **520.0** | **+300** |
| 14 | Kenneth Parcell | 30 Rock | 506.6 | 506.6 | — |
| 15 | **Moira Rose** | Schitt's Creek | 210.2 | **493.0** | **+283** |

The two-line summary:
- Jerry passes Jack and George for the #1 spot cross-show.
- AD and Schitt's characters move up significantly. Michael Bluth and Moira Rose specifically jump 280-300 points into the top 15.

## Why this matches intuition better — and where it still won't

The AD shift is the one that always bothered me about the old numbers. We published [a piece](/blog/arrested-development-craft-leaderboard) showing that 8 of the top 10 per-joke craft characters in TV comedy come from Arrested Development. But on the old WAR leaderboard, only one AD character (Michael Bluth at #16) made the top 20. That was a real contradiction in our data — the same characters that were elite per-joke were ranked below Friends supporting players on total WAR. The fix resolves it: AD characters now show up where their craft scores said they should be.

Where the fix won't match every reader's intuition: **Jerry passing George.** Most Seinfeld fans say George is the funnier character. The data supports that on a per-joke basis (George has slightly higher craft AND slightly higher impact). What the data shows is that Jerry, who has 44% more eligible jokes than George (3,800 vs 2,632 after stand-up downweighting), contributes more *aggregate* comedic output. Both are true. Both matter. Which one is "funniest" is a definition question, not a data question.

To make that clearer, we've added a new sort on the [/rankings/funniest-characters](/rankings/funniest-characters) page: **Per-joke Quality**. It ranks by quality_index (the shrunk per-joke score) instead of total WAR. Sort by that, and George tops Seinfeld. Sort by Total WAR, and Jerry tops Seinfeld. The two leaderboards together tell a more honest story than either alone.

## What didn't change

To be very explicit:

- **Per-joke craft and impact scores are unchanged.** Every individual joke's score is identical to what it was yesterday. The fix is in how those scores aggregate to character-level WAR, not in the scores themselves.
- **The methodology was already documented correctly.** This wasn't a methodology change. It was reconciling data files that had drifted from the documented formula. The formula stays the same.
- **The shows that were already correct stayed correct.** Office, Friends, Parks, 30 Rock, and most of Seinfeld saw shifts of less than 10 WAR (rounding-level drift from the league median moving slightly with 30 Rock added).
- **Internal show rankings are unchanged.** Within each show, the same characters are still at the top. Dwight is still #1 on Office. George is still #1 on Seinfeld by per-joke quality. The fix only reshuffles cross-show positions.

## What this means for the published cross-show post

Our [original cross-show leaderboard post](/blog/funniest-characters-cross-show) from May 12 was titled "George Costanza Just Beat Jerry Seinfeld." Under the fix, that title's claim reverses on total WAR. We've added a note to that post pointing readers here. We're not deleting the original — the analysis was correct given the data available at the time. We're documenting the correction.

## Lessons learned

Two things we'd do differently:

1. **Verify replacement values consistently when adding shows.** Each show should be exported through the same script with the same replacement constant. We should have caught the AD/Schitt's drift during launch QA. Adding a one-line assertion to the export pipeline will prevent this from recurring.

2. **Publish reproducible methodology code.** The WAR formula is documented in CLAUDE.md and on the methodology page, but the script that computed the characters.json files isn't in the public repo. We'll publish the WAR computation script alongside the data so anyone can reproduce the numbers and catch drift like this earlier.

If you want the underlying numbers and re-run the math yourself, the per-show characters.json files are at \`thehumorindex.com/data/{show-slug}/characters.json\`. Every field is documented. Math is yours to check.

---

*Full methodology: [thehumorindex.com/methodology](/methodology). The display scale recalibration on May 14 is separately documented [here](/blog/display-scale-recalibration). Questions: hello@thehumorindex.com.*
`,
  },
  'display-scale-recalibration': {
    title: "We Just Recalibrated the Humor Index Display Scale. Here's Why and What Changed.",
    description: "Adding 30 Rock to the dataset pushed multiple episodes past the 100-display ceiling. The underlying scores were correct; the display math wasn't. We recalibrated so the all-time top episode anchors near 100. All shows shifted slightly. Rank order is unchanged.",
    date: '2026-05-15',
    category: 'Methodology',
    content: `
On May 15, 2026 we made a methodology change to the Humor Index: we recalibrated the display formula. Show-level scores shifted down between 0.7 and 4.3 points. The rank order didn't change.

If you saw scores before today and you're seeing different numbers now, this post explains why.

## What changed

The raw Humor Index — the underlying score we compute from per-joke craft, impact, density, and consistency — is **unchanged**. Every per-joke and per-episode raw score in our database is exactly what it was yesterday.

What we changed is the formula that maps that raw 0–10 score to the 0–100 display value you see on the site.

**Old display formula:**

\`display = 75 + (raw − 6.5) ÷ 0.55 × 10\`

**New display formula:**

\`display = 75 + (raw − 6.5) ÷ 0.80 × 10\`

The only change is the spread parameter — 0.55 → 0.80. The slope of the scale flattened by about 31%. Center stays at 75 (median episode = 75). What changes is how aggressively a high-or-low raw score gets stretched into the display range.

## Why we had to do this

The previous calibration was set in April 2026 when we had six shows in the dataset. The implicit assumption was that "raw 8.0 ≈ display 100" — i.e., a raw score of 8 would represent an "essentially flawless" episode, calibrated against the absolute best episode in the dataset at that time.

When we added 30 Rock on May 14, that assumption broke.

The all-time top episode in the dataset — **The Office, "Dinner Party" (S04E13)** — has a raw HI of 8.34. Under the old display formula, that converts to display 108.45. **Above 100.** That's not what 100 is supposed to mean.

It got worse with 30 Rock. Seven 30 Rock episodes scored above raw 7.875, which translated to display > 100 under the old formula. The clamp in the code caught them at exactly 100.0, but that masked real differences (Game Over at raw 8.08 and Reaganing at raw 7.91 were both being displayed as the same "100" even though they're meaningfully different scores).

When the ceiling stops being a ceiling, the scale stops being useful.

## The recalibration

We picked the new spread (0.80) so that **raw 8.5 = display 100 exactly.** Why 8.5 instead of 8.34 (the current max)?

- It gives us a small buffer above the current dataset max. The next few shows we score (Brooklyn Nine-Nine, It's Always Sunny, Big Bang Theory, Two and a Half Men) could surface a higher-scored episode. We don't want to re-recalibrate every time a new show ships.
- 8.5 is a clean number. The methodology page is easier to defend with "raw 8.5 = ceiling" than with "raw 8.34 = ceiling, locked to whatever the current Office score is."

Under the new formula, the all-time top episode (Dinner Party) lands at display 98.0. Nothing is at exactly 100 yet. There's room above the current ceiling for future episodes that we might score higher.

## What every show shifted to

| Show | Old | New | Δ |
|---|---:|---:|---:|
| 30 Rock | 88.6 | 84.3 | −4.3 |
| Arrested Development | 85.2 | 82.0 | −3.2 |
| Parks and Recreation | 80.55 | 78.8 | −1.75 |
| The Office | 80.22 | 78.6 | −1.6 |
| Seinfeld | 79.10 | 77.8 | −1.3 |
| Friends | 78.66 | 77.5 | −1.2 |
| Schitt's Creek | 78.30 | 77.3 | −1.0 |

Shows that were higher under the old scale shifted down more. That's the entire point of the recalibration — the old scale was over-rewarding the top end of the distribution. The median (anywhere near 75) barely moved.

## What did NOT change

To be very explicit about this:

- **Every raw HI is unchanged.** If you query our database directly, the per-joke craft scores, per-joke impact scores, per-episode raw HI, and per-season raw HI are all exactly what they were before this update.
- **The rank order is identical.** 30 Rock is still #1. AD is still #2. The mid-cluster (Parks, Office, Seinfeld, Friends, Schitt's) is in the same relative order.
- **The methodology that produces the raw scores is unchanged.** Same 9-dimension craft rubric. Same 3-run consensus. Same Bayesian shrinkage for per-character WAR. Same format-coefficient-deprecated approach.

## What this means for prior content

A handful of our prior blog posts and social posts cite specific display scores ("Seinfeld at 79.1", "Parks at 80.55", etc.). Those references are now slightly off from the live site. They're not wrong about the conclusions they drew — the rank order and the relative gaps are intact — but the absolute display numbers in those posts are from the old scale.

We're not going back to edit historical posts. The "as of when" date on each post documents what scale was live at the time. If you want to compare a number from an old post to a number on the current site, multiply the old display by approximately 0.69 to get the new display: \`new = 75 + (old − 75) × 0.6875\`.

The 30 Rock launch post from yesterday has been updated to reflect the new scale.

## What we'd do differently next time

The honest read on this incident: **we should have recalibrated the display scale when we set up the methodology page in April, not waited for 30 Rock to expose the problem.** The display formula was set in February 2026 against a much smaller dataset and was never re-anchored as the dataset grew. The clamp at 100 in the code papered over the issue for a while but eventually a high-scoring show was going to break it visibly.

Going forward:

- The display scale will be re-anchored whenever a new show pushes the raw maximum above 8.5. We'll document each recalibration in a methodology post like this one.
- The methodology page (/methodology) now states the current display formula and the anchor (raw 8.5 = display 100) explicitly.
- We'll publish a "what shifted" comparison post like this one alongside any future recalibration. Public methodology, public revisions.

## Why we're telling you

We could have done this silently. Most analytics products quietly tune their scales.

The reason we're publishing this instead is that the brand is built around methodology transparency. We publish the ICC noise floor. We publish confidence intervals on show rankings. We publish the fact that the Office/Seinfeld/Friends/Parks/Schitt's cluster is statistically a wash. The Humor Index isn't useful if we hide what's actually happening inside it.

A scoring system that adjusts itself without saying so isn't really a scoring system. It's a vibes engine with numbers.

---

*The full display formula is documented at our [methodology page](/methodology). The technical write-up of why 0.55 was wrong and 0.80 is right is at [our scorer-noise-floor post](/blog/scorer-noise-floor) under the calibration section. Questions: hello@thehumorindex.com.*
`,
  },
  'humor-index-vs-imdb-three-ways': {
    title: "We Recomputed Our IMDb Correlation Three Ways. At the Show Level, It's Negative.",
    description: "Our April post reported r = -0.005 between the Humor Index and IMDb. We dug back in. Within-show correlations span -0.115 to +0.392. The show-level correlation is -0.287. HI's top 10 and IMDb's top 10 overlap 6 of 80 across the catalog — exactly chance. The disagreement isn't noise. It's structured.",
    date: '2026-05-16',
    category: 'Data Science',
    content: `
Last month we [ran a quick correlation](/blog/imdb-vs-humor-index) of episode-level IMDb ratings against the Humor Index across three shows and reported r = -0.005 pooled. The headline at the time was "audience ratings and comedy craft are essentially unrelated." Comments asked what that meant. We dug back in across all eight scored shows now (1,105 episodes), and the three-level answer is much more interesting than the one-line headline.

Three findings, going in the same direction.

## Finding 1: Top-10 episode overlap is at chance

For each show, take HI's top 10 episodes and IMDb's top 10 episodes. Count how many appear in both lists.

| Show | HI top-10 ∩ IMDb top-10 | HI top-20 ∩ IMDb top-20 |
|---|---:|---:|
| The Office | 0 / 10 | 4 / 20 |
| Seinfeld | 0 / 10 | 1 / 20 |
| Friends | 2 / 10 | 3 / 20 |
| Parks and Recreation | 1 / 10 | 5 / 20 |
| Arrested Development | 2 / 10 | 7 / 20 |
| Schitt's Creek | 1 / 10 | 2 / 20 |
| 30 Rock | 0 / 10 | 3 / 20 |
| Taxi | 0 / 10 | 5 / 20 |
| **Pooled** | **6 / 80 (7.5%)** | **30 / 160 (18.8%)** |

A random pick of 10 episodes out of ~100 would overlap with another random 10-pick at roughly 10%. **HI and IMDb agree on "the best episodes" at chance level.** For Seinfeld and Taxi specifically, the agreement is so low it's actively striking — one or zero overlapping titles in their top 10.

Arrested Development has the strongest agreement (2/10, 7/20), consistent with its also being the only show with a moderate per-episode correlation. We'll come back to AD.

## Finding 2: Per-show correlations are a mixed-sign cluster

| Show | N | HI mean | IMDb mean | Pearson r | Spearman ρ |
|---|---:|---:|---:|---:|---:|
| Arrested Development | 84 | 81.92 | 8.02 | **+0.392** | +0.379 |
| Parks and Recreation | 98 | 78.32 | 7.99 | +0.201 | +0.184 |
| Taxi | 114 | 77.52 | 7.49 | +0.182 | +0.176 |
| The Office | 186 | 78.20 | 8.08 | +0.158 | +0.172 |
| 30 Rock | 138 | 84.93 | 7.93 | +0.007 | +0.022 |
| Friends | 235 | 73.14 | 8.29 | -0.013 | -0.059 |
| Seinfeld | 170 | 77.25 | 8.25 | -0.058 | -0.004 |
| Schitt's Creek | 80 | 77.93 | 7.97 | -0.115 | -0.077 |

The range is -0.115 to +0.392. Five shows are positive, three are negative. The weighted mean of within-show correlations is about +0.07. Even within a single show — where everything except the individual episode is held constant — the AI and the audience are measuring almost-uncorrelated things, and *which one leads can flip sign show-to-show.*

Why does AD have such a strong positive while Schitt's Creek has a negative? We're not entirely sure, but a working hypothesis: AD is unusually joke-dense and the IMDb voters self-selected for AD fans who weight craft heavily. Schitt's Creek is more emotion-driven, and IMDb voters reward late-series finales and emotional reveals that the joke-density rubric doesn't see. That hypothesis is testable; we'll come back to it in a future post.

## Finding 3: At the show level, the correlation is *negative*

This is the strangest finding and probably the headline.

Plot each show as one point: mean HI on the x-axis, mean IMDb on the y-axis. Across the 8 shows, **r = -0.287 (rho = -0.476).**

The shows the AI rates funniest tend to be the shows IMDb audiences rate *lowest* on average. 30 Rock is the cleanest example: highest HI in the dataset (84.9), middling IMDb (7.93). Friends is the cleanest counter: lowest HI (73.1), highest mean IMDb (8.29). Seinfeld and Friends sit at the top of the IMDb axis while sitting in the middle of the HI axis; 30 Rock and Arrested Development sit at the top of the HI axis while sitting in the middle of the IMDb axis.

This is consistent with a known divide in comedy: audience love is built on relationship and emotional payoff, which is a different thing from per-joke craft. The AI is measuring per-joke craft. IMDb is measuring how-much-this-show-meant-to-me. Across our catalog, those two things are mildly anti-correlated.

## The disagreement is structured

The disagreement between the two rating systems isn't random — it's interpretable. Here are the 10 episodes where HI rates much higher than IMDb (within-show z-score gap):

| Show | S | E | Title | HI | IMDb |
|---|---:|---:|---|---:|---:|
| Seinfeld | 6 | 14 | The Highlights Of 100 (1) | 91.1 | 6.9 |
| Seinfeld | 1 | 4 | Male Unbonding | 91.6 | 7.2 |
| Friends | 7 | 21 | The One With The Vows | 83.0 | 7.2 |
| Friends | 4 | 21 | The One With The Invitation | 77.9 | 6.9 |
| The Office | 8 | 21 | Angry Andy | 89.5 | 6.7 |
| The Office | 4 | 13 | Dinner Party | 98.0 | 7.6 |
| Seinfeld | 1 | 1 | The Seinfeld Chronicles | 86.4 | 7.3 |
| 30 Rock | 1 | 1 | Pilot | 90.1 | 7.2 |
| The Office | 9 | 17 | The Farm | 91.9 | 7.3 |
| Schitt's Creek | 1 | 3 | Don't Worry, It's His Sister | 88.6 | 7.5 |

Pattern: **clip shows, pilots, recap episodes, and episodes that fans actively disliked.** The AI is reading them as joke-dense without seeing that the audience was already over them. Note "Dinner Party" appearing here even at a 7.6 IMDb — A.V. Club gave it an A, HI agrees (98.0), but its IMDb is "only" 7.6 because many viewers find it too painful to enjoy.

Now the reverse — the 10 episodes where IMDb rates much higher than HI:

| Show | S | E | Title | HI | IMDb |
|---|---:|---:|---|---:|---:|
| Friends | 6 | 25 | The One With The Proposal (2) | 59.0 | 9.2 |
| Schitt's Creek | 6 | 12 | The Pitch | 66.2 | 8.7 |
| Taxi | 3 | 20 | Latka The Playboy | 67.2 | 8.5 |
| Seinfeld | 9 | 8 | The Betrayal | 62.9 | 8.9 |
| 30 Rock | 5 | 4 | Live Show | 77.9 | 8.6 |
| Schitt's Creek | 6 | 13 | Start Spreading The News | 73.2 | 9.2 |
| 30 Rock | 1 | 12 | Black Tie | 77.0 | 8.5 |
| 30 Rock | 6 | 14 | Kidnapped By Danger | 74.5 | 8.3 |
| Seinfeld | 5 | 21 | The Hamptons | 73.4 | 9.5 |
| 30 Rock | 7 | 12 | Hogcock! | 83.1 | 8.9 |

Pattern: **series finales, emotional payoff episodes, format-experiment episodes, and stunt-character showcases.** "Start Spreading The News" is the Schitt's Creek finale. "The One With The Proposal" is the Chandler-Monica proposal. "The Betrayal" is Seinfeld's reverse-chronology episode. "Live Show" is 30 Rock's live-broadcast experiment. "Hogcock!" is 30 Rock's series finale.

The audience is rewarding what the AI cannot see: ending, weight, format risk, and the cumulative emotional debt of a long-running show paying off. These are *events*, not jokes. HI scores them as merely competent on craft because they're not joke-dense; IMDb scores them as transcendent because of what they represent.

## What this means for what we publish

The site has been positioned around the claim that HI measures "comedy craft, not popularity." This analysis gives that claim empirical backbone instead of leaving it as a hedge:

- At the show level, HI is *anti*-correlated with audience popularity. Funnier-per-craft and more-loved are not the same thing.
- At the episode level within a show, the two axes are at chance to weakly positive — and the disagreement is structured: audiences reward emotional climax; HI rewards joke density.
- Our earlier r = -0.005 pooled result understated this. It averaged opposing show-level and episode-level effects to a single deceptively quiet number.

The right way to read the Humor Index is now this: it measures what a writers' room would mean by "this episode is well-crafted comedy." It does not measure what an audience means by "this is my favorite episode." Those two things diverge in interpretable ways, and we can show you exactly where.

## Methodology caveats

- **IMDb ratings drift over time.** This snapshot is whatever was in our episode JSONs at scoring time; ratings on long-running shows like Friends and Seinfeld have probably shifted slightly upward since their early days.
- **IMDb's per-episode rating mixes signal sources.** Pilots and finales get massively more votes than mid-season filler. That sample-size imbalance is real but doesn't change the direction of the findings.
- **The pre-1985 era is represented by only one show (Taxi).** The show-level negative correlation could partly reflect era effects we haven't measured yet. As we score Mary Tyler Moore, All in the Family, M*A*S*H, and Barney Miller, this comparison will get more robust.
- **This is one external source.** Audience ratings on IMDb are a *signal* of episode quality, not the truth about it. A complementary critic-side validation (A.V. Club letter grades) is coming next. Both together is the right calibration.

## Data

If you want to pull the underlying joined dataset — every episode with its HI, IMDb rating, and within-show z-scores — it's available on request. Email hello@thehumorindex.com and we'll send it. The full per-show breakdown is also visible on each show's page on the site.

---

*This post extends the earlier [IMDb vs Humor Index](/blog/imdb-vs-humor-index) analysis from April with the full eight-show dataset. The methodology is documented at [our methodology page](/methodology). Questions or pushback: hello@thehumorindex.com.*
`,
  },
  'taxi-launch': {
    title: "Taxi Lands at 77.4 — A 1978 Show Inside the Same Tier as Seinfeld",
    description: "We just scored all 114 episodes of Taxi. It lands at Humor Index 77.4 — statistically indistinguishable from Seinfeld, Friends, and Schitt's Creek. The format we used to penalize for is the format every modern character comedy descends from. And Louie De Palma cracks the top 10 cross-show.",
    date: '2026-05-16',
    category: 'Show Launch',
    content: `
We just finished scoring Taxi. 114 episodes across five seasons, 4,776 jokes scored using v2 methodology — same nine craft dimensions, same three-run consensus, same Bayesian shrinkage on per-character ratings that we've now run on seven other shows.

The result: **Taxi lands at Humor Index 77.4.** That's the eighth show on the leaderboard and it sits inside the Great tier alongside Seinfeld (77.8), Friends (77.5), and Schitt's Creek (77.3). The four-show spread from #5 to #8 is half a point — well inside our noise floor. The honest read is that those four shows are statistically indistinguishable.

Here's the leaderboard now:

| # | Show | Humor Index | Episodes |
|---:|---|---:|---:|
| 1 | 30 Rock | 84.3 | 138 |
| 2 | Arrested Development | 82.0 | 84 |
| 3 | Parks and Recreation | 78.8 | 124 |
| 4 | The Office | 78.6 | 186 |
| 5 | Seinfeld | 77.8 | 172 |
| 6 | Friends | 77.5 | 235 |
| 7 | **Taxi** | **77.4** | **114** |
| 8 | Schitt's Creek | 77.3 | 80 |

Taxi originally aired 1978–1983. Twelve years before Seinfeld. Twenty-four before Schitt's Creek. It is the oldest show we've fully scored, and it is in the same statistical tier as both of them.

That's the result. The interesting question is why.

## The format we used to penalize for

When we built the first version of the Humor Index, we shipped with a format coefficient — a 15–25% reduction on Impact for multi-camera shows with laugh tracks. The theory was that the laugh track did emotional work the writing wasn't doing on its own. We removed that coefficient on April 16 after a Bayesian audit showed the effect was statistically zero. ([Full reasoning here.](/blog/seinfeld-vs-the-office))

Taxi is the first show we've scored that would have been hit hardest by that old coefficient. Three-camera shoot. Studio audience. Live laughs. By the old methodology, this score would have been roughly 65 — bottom of the Mixed tier. By the corrected methodology, it's 77.4 — middle of the Great tier.

That's a 12-point swing produced entirely by removing a thumb we shouldn't have had on the scale. It is the clearest single-show demonstration our methodology has of why that coefficient was wrong.

## The character roster

Top per-joke craft and total WAR for Taxi characters:

| # | Character | WAR | Jokes |
|---:|---|---:|---:|
| 1 | **Louie De Palma** | 461.8 | 1,302 |
| 2 | Reverend Jim Ignatowski | 290.2 | 584 |
| 3 | Alex Reiger | 240.9 | 953 |
| 4 | Latka Gravas | 130.8 | 390 |
| 5 | Tony Banta | 123.0 | 521 |
| 6 | Bobby Wheeler | 58.0 | 298 |
| 7 | Simka Gravas | 42.9 | 89 |
| 8 | Elaine Nardo | 41.0 | 303 |

Louie De Palma at 461.8 WAR lands him just outside the cross-show top 10 — between Joey Tribbiani (531.6) and Michael Scott (447.1). He has the third-highest WAR of any show's #1 character on the index, behind only George Costanza and Jerry Seinfeld. Danny DeVito's dispatcher is the most valuable comedy character produced before 1985 that the index has scored. The runner-up, Jim Ignatowski, is the second-most-valuable.

Two distinctives in the character data worth flagging.

**Louie does it on volume AND quality.** 1,302 jokes is a heavy load for a supporting role. His Impact scores are the highest of any character on the show — the role is built for it. He gets the dispatcher cage, the elevation, the captive audience. The writers' room knew what they had. Every episode rotates him in.

**Jim Ignatowski is the highest-Impact character on the roster.** 584 jokes is a small sample, but each one is doing more punch-per-beat than anyone else's. The character is built as a delivery vehicle for surrealism — and even with our absurdist density penalty (which Christopher Lloyd's character would lose to without it), he scores at the top of the show on raw Impact.

## The episode peaks

| Rank | Title | Score | Season |
|---:|---|---:|---:|
| 1 | Zena's Honeymoon | 91.5 | S5 |
| 2 | Jim's Mario's | 90.4 | S5 |
| 3 | Scenskees From A Marriage (Part 2) | 87.1 | S5 |
| 4 | Alex The Gofer | 86.6 | S5 |
| 5 | On The Job (Part 1) | 86.0 | S3 |
| 6 | Thy Boss's Wife | 85.9 | S3 |
| 7 | Louie's Revenge | 85.6 | S5 |
| 8 | Louie And The Nice Girl | 85.5 | S2 |

Six of the top eight episodes are from Season 5. That's the NBC season — Taxi was cancelled by ABC after Season 4 and picked up by NBC for one final year. The conventional wisdom is that Taxi declined in its last season, particularly in ratings. The Humor Index says the writing peaked there. Season 5 aggregate is 79.8, the highest of any season; Season 1 sits at 74.5.

This is a pattern we've seen elsewhere. Schitt's Creek peaks in its final season too. Comedies built around ensembles tend to reward their writers' room time — characters get sharper, callbacks accumulate, the cast knows their beats. A show being cancelled doesn't automatically mean a show that lost its way.

## The comedy DNA

Per-joke distribution across the 18 categories in our taxonomy:

| Category | Taxi | Median (other 7 shows) |
|---|---:|---:|
| Character comedy | 30.7% | 36.6% |
| Escalation | 8.3% | 11.4% |
| Irony/sarcasm | 7.8% | ~8% |
| Setup/punchline | 7.4% | ~6% |
| Absurdist | 6.9% | 9.9% |
| Observational | 6.2% | 7.2% |
| Deadpan understatement | 6.2% | 5.6% |
| Cringe/discomfort | 5.2% | 7.8% |

Two things stand out.

**Setup/punchline is higher than the median.** This is the multi-cam fingerprint. Taxi is the only ensemble single-location workplace comedy in the dataset that runs an old-fashioned setup-and-pause structure for a meaningful percentage of its jokes. Modern character comedies pack jokes inside scenes — the joke happens because of who the character is, not because someone gave another character a setup line. Taxi does some of that. But it also does the older format on a meaningful fraction of its jokes, and the format still scores reasonably well on the craft rubric.

**Character comedy at 30.7% is lower than every modern character comedy.** 30 Rock 62.7%. Schitt's 69.1%. AD 54.4%. Office 36.7%. Parks 36.5%. Taxi is closer to Seinfeld (24.6%) and Friends (26.4%) on this axis — heavier on situation, lighter on character-driven punchlines than the modern ensemble shows. This is the actual structural difference between a 1978 workplace comedy and a 2010 one. The 1978 show is funnier *to* the audience; the 2010 show is funnier *because* of the audience knowing the characters.

You can see why this matters in the WAR data. Taxi's #1 character (Louie) has 461.8 WAR. 30 Rock's #1 (Jack Donaghy) does similar work on more volume. But Taxi's character economy is shallower — Louie carries a much bigger share of the craft than Jack does on his show. Taxi's roster looks more like Seinfeld's (one or two outliers, then a steep drop) than Schitt's Creek's (most of the cast scoring within a tight band).

## The methodology caveat we always include

The single-run scorer noise floor is ~5 points per episode (ICC = 0.28). Three-run consensus tightens this to show-level CIs roughly ±1.2 points. With that in mind, here's how to read this leaderboard:

- "Taxi is meaningfully below 30 Rock and AD" — supportable; 5+ point gap with no CI overlap
- "Taxi is meaningfully below Parks and The Office" — borderline; 1.2 to 1.4 point gaps that are at the edge of the noise floor
- "Taxi vs Seinfeld vs Friends vs Schitt's" — NOT supportable as a ranking; 0.5 point spread across four shows is squarely inside the noise floor

The defensible claim is that Taxi joined the Great tier on the strength of one of the strongest character rosters we've scored, and that the score is in the same statistical band as three modern shows. The defensible claim is *not* that Taxi is funnier than Schitt's Creek, even though 77.4 > 77.3.

## What this changes

A few things fall out of this dataset that are worth noting before the next post:

1. **The cross-show character leaderboard needs Louie De Palma added.** He'll land somewhere between #9 and #11 on total WAR. We'll update [the cross-show post](/blog/funniest-characters-cross-show) when we have B99 scored too.

2. **The pre-1985 era is now represented in the index.** Until now, the oldest scored show was Seinfeld (1989). Taxi at 77.4 is evidence that the methodology produces sensible scores for shows from earlier eras when format effects are properly handled. The next pre-1985 candidates on the backlog are All in the Family, Mary Tyler Moore, Barney Miller, and M*A*S*H.

3. **The Great tier is now crowded.** Four shows (Seinfeld, Friends, Taxi, Schitt's Creek) all within 0.5 points of each other in the 77.3–77.8 band. The Office at 78.6 is only barely above this cluster; if it slips a half point on a future rescore it could drop into this group too. The tier line at 78 is doing meaningful work on the leaderboard.

## What's next

Taxi is the eighth show fully scored on the index. The drip-release schedule from May had Brooklyn Nine-Nine coming after 30 Rock; Taxi was inserted ahead of B99 because the transcripts came together faster than expected. B99 is now the active show in the pipeline. After that, the queue is Two and a Half Men, It's Always Sunny, and The Big Bang Theory.

If you want the underlying numbers, every per-episode score and per-joke detail is at [thehumorindex.com/shows/taxi](/shows/taxi).

---

*Taxi is the eighth show fully scored on the Humor Index. The methodology is documented at [our methodology page](/methodology), and the show-level confidence intervals are explained at [our Bayesian credible intervals post](/blog/bayesian-credible-intervals). Questions: hello@thehumorindex.com.*
`,
  },
  '30-rock-takes-the-crown': {
    title: "30 Rock Just Took #1. By the Biggest Gap We've Measured.",
    description: "30 Rock finished scoring on Thursday and lands at Humor Index 84.3 — the biggest #1-to-#2 gap on the leaderboard. Multiple episodes punch well above the median. The data points to one thing that no other show in the dataset comes close to.",
    date: '2026-05-14',
    category: 'Show Launch',
    content: `
We just finished scoring 30 Rock. 138 episodes, seven seasons, 9,283 jokes scored using the same v2 methodology that's been applied to the other six shows (9 craft dimensions, 3-run consensus, Bayesian shrinkage on per-character ratings, the format coefficient deprecated as of April).

The result: **30 Rock is now #1 on the Humor Index at 84.3, with a 2.3 point gap to Arrested Development at #2.** That's the biggest #1-to-#2 gap we've ever measured. Bigger than the gap from AD to Parks. Bigger than the gap from Parks to The Office.

Here's the leaderboard now:

| # | Show | Humor Index | Episodes |
|---:|---|---:|---:|
| 1 | **30 Rock** | **84.3** | 138 |
| 2 | Arrested Development | 82.0 | 84 |
| 3 | Parks and Recreation | 78.8 | 124 |
| 4 | The Office | 78.6 | 186 |
| 5 | Seinfeld | 77.8 | 172 |
| 6 | Friends | 77.5 | 235 |
| 7 | Schitt's Creek | 77.3 | 80 |

(All shows shifted slightly downward on May 15 when we recalibrated the display scale so the all-time top episode caps at 100 instead of clamping. Rank order is unchanged. [More on the recalibration here](/blog/display-scale-recalibration).)

Before getting into what the data says, the usual caveat: items 3 through 7 are statistically a wash. The 95% confidence intervals overlap heavily. The order of "is The Office actually funnier than Seinfeld" cannot be answered with this data — those numbers are within scoring noise. **The two real claims this leaderboard supports are: 30 Rock is meaningfully above AD, and AD is meaningfully above everyone else.** Everything below #2 is an elite cluster.

## What 30 Rock is doing differently

The story of why 30 Rock won is a story about one statistic: **62.7% of every joke in 30 Rock is character comedy.** That's the highest percentage of any show in the dataset. The next-closest is Arrested Development at 54.4%. After that, the rest of the field drops into the 30s and 40s.

What "character comedy" means in our taxonomy: a joke whose punchline depends on you knowing who the character is. Jokes that don't translate without that. A line that works because Jack Donaghy said it, and would land flat from anyone else.

This is the structural opposite of, say, Seinfeld, which leans much more heavily on situation + observational humor (jokes that would work delivered by a stranger). It's also why 30 Rock's repeat-watch value is so high — once you know the characters, you can keep finding new layers of the same lines, where for situation-driven comedies the joke is essentially fixed in its first viewing.

Two other 30 Rock distinctives in the data:

**JPM of 2.86** — top of the dataset alongside AD. 30 Rock's per-episode joke density is roughly 50% higher than Seinfeld's and double Friends'. Every minute of 30 Rock contains more comedic content than every minute of any single-camera show we've measured.

**Absurdist at 24.5%** — also the highest in the dataset. The cutaways. The fantasy sequences. The Tracy Jordan everything. About one in four jokes on 30 Rock is structurally non-realistic.

Put those two together — character-driven AND high JPM AND high-absurdist — and you have a comedy formula nobody else in the dataset has executed. The closest analog is Arrested Development, which is character-driven and absurdist but has lower JPM. 30 Rock is denser.

## The top 10 episodes

| Rank | Title | Score | Season |
|---:|---|---:|---:|
| 1 | Game Over | 94.8 | S7 |
| 2 | Cooter | 94.1 | S2 |
| 3 | Verna | 93.8 | S4 |
| 4 | Nothing Left to Lose | 93.0 | S6 |
| 5 | Alexis Goodlooking and the Case of the Missing Whisky | 92.8 | S6 |
| 6 | Reaganing | 92.4 | S5 |
| 7 | The Rural Juror | 92.3 | S1 |
| 8 | Mrs. Donaghy | 91.6 | S5 |
| 9 | ¡Qué Sorpresa! | 91.5 | S5 |
| 10 | Jack Gets in the Game | 91.3 | S2 |

A note on the top of the scale: the display formula was recalibrated on May 15, 2026 so that the all-time top episode in our dataset — Office Dinner Party at raw 8.34 — anchors near 100. Under the previous calibration, 30 Rock had seven episodes scoring above 100 on the old display scale (along with one Office and one Parks episode), which made the scale lose its meaning. The recalibration preserved all rank order and just compressed the slope. ([Full writeup of the recalibration.](/blog/display-scale-recalibration))

The peak isn't concentrated in one era either:

- **Season 4 is the peak season** by aggregate (89.9 display), but only by a hair over Season 6 (89.5)
- Seasons 2, 5, and 7 are all 87+
- Even Season 1, the weakest, is at 85.5 — which would rank above the show-level average for The Office, Seinfeld, Friends, and Schitt's Creek

The variance across seasons is the lowest in the dataset. 30 Rock didn't have a "the show found itself in season 2" arc the way most sitcoms do. It came out swinging and stayed there.

## The character data

Top per-joke craft for 30 Rock characters, minimum 50 jokes:

| # | Character | Per-joke craft | Total jokes |
|---:|---|---:|---:|
| 1 | Dr. Spaceman | 7.68 | 68 |
| 2 | Kenneth | 7.49 | 678 |
| 3 | Jack Donaghy | 7.39 | 1,913 |
| 4 | Tracy Jordan | 7.36 | 1,221 |
| 5 | Jenna Maroney | 7.31 | 819 |
| 6 | Pete Hornberger | 7.22 | 172 |
| 7 | Liz Lemon | 7.20 | 2,024 |

Two genuinely surprising things here.

**Kenneth's per-joke craft is higher than Jack's.** If you'd asked any 30 Rock fan to rank the craft of the cast, almost nobody would put Kenneth in front of Jack. But the data is unambiguous: every line written for Kenneth does more structural work per beat — the character's worldview is so specifically constructed that essentially every line reinforces it. Jack's lines are individually elite but more variable; Kenneth's lines are uniformly elite within his narrower band.

**Liz Lemon has the LOWEST per-joke craft of the main cast** — and the most jokes by a wide margin (2,024). She's a comedy workhorse: she takes the most volume, and the rubric reads the average of that volume as lower-craft because she's the audience surrogate. Her job is to react. Reactions, by the rubric's design, score lower on character integration than self-driven punchlines from characters with strong points of view. This is by design — we don't want the reaction-shot framework to drive the leaderboard. If we did, Liz would top this list and everyone we just listed above her would drop.

Worth restating: this is per-joke quality. By **total comedic output** (Liz's 2,024 jokes at 7.20 craft + her impact + her quotability), she'd run away with the WAR leaderboard against most of her cast. The number above isn't measuring "who's the funniest" — it's measuring "who does the most work per beat." Different questions, different answers.

## How this changes the cross-show character leaderboard

We're going to update [the cross-show WAR leaderboard](/blog/funniest-characters-cross-show) next week with 30 Rock characters added. Expected impact:

- **Jack Donaghy** is going to land in the top 5 cross-show by WAR. 1,913 jokes at 7.39 craft is elite roster-filling.
- **Liz Lemon** will probably be top 10 by total WAR despite the per-joke craft number — volume + ubiquity matter.
- **Tracy Jordan** will likely beat several main characters from other shows on Impact specifically — his per-joke Impact is 7.3+, which is at the elite tier.
- **Kenneth** will be a craft-leaderboard outlier — he'll rank surprisingly high given how few people think of him as a "top tier" character.

## The methodology caveat we always include

The single-run scorer noise floor is ~5 points per episode (ICC = 0.28). Three-run consensus tightens this dramatically — show-level CIs at the aggregate are <2 points wide. But this matters for how you should read the leaderboard:

- "30 Rock is meaningfully above AD" — supportable; 2.3 point gap with 95% CI separation
- "AD is meaningfully above Parks/Office/etc" — supportable; ~5 point gap to the next cluster
- "Within the elite cluster, Parks (80.55) is funnier than Office (80.22)" — NOT supportable; that's a 0.33 point difference inside the noise floor

This is the part we keep saying because rankings get screencapped and become claims. The right way to read this leaderboard:

> Tier 1: 30 Rock
> Tier 2: Arrested Development
> Tier 3 (statistically indistinguishable): Parks, Office, Seinfeld, Friends, Schitt's Creek

That's the honest version.

## What's next

30 Rock makes seven scored shows. The next four on the backlog: Brooklyn Nine-Nine, It's Always Sunny, The Big Bang Theory, Two and a Half Men. The drip-release plan from May has B99 next at the front of the queue.

Two analyses falling out of this dataset are also coming:

- **An updated cross-show WAR leaderboard** with 30 Rock added — likely shifts the top 5 significantly
- **The "characters per show on the craft top-20" stat** — 30 Rock will have several names; how that shapes up cross-show is the most interesting question this data raises

If you want the underlying numbers, every per-episode score and per-joke detail is at [thehumorindex.com/shows/30-rock](/shows/30-rock).

---

*30 Rock is the seventh show fully scored on the Humor Index. The methodology is documented at [our methodology page](/methodology), and the show-level confidence intervals are explained at [our Bayesian credible intervals post](/blog/bayesian-credible-intervals).*
`,
  },
  'funniest-characters-cross-show': {
    title: "The Cross-Show Funniest Character Leaderboard — Original Take. (See update note.)",
    description: "Original analysis from May 12, 2026 using the v2 consensus methodology applied at the time. Subsequent WAR reconciliation on May 15 corrected stale replacement values for several shows. The conclusion of this post (George > Jerry on TOTAL WAR) reversed after the fix. See the [WAR Reconciliation post](/blog/war-reconciliation) for what changed and why.",
    date: '2026-05-12',
    category: 'Analysis',
    content: `
When we built [Comedy WAR](/blog/comedy-war) in April, we only had three fully-scored shows: Seinfeld, The Office, Friends. The leaderboard then was a useful proof of concept, but with only three rosters in the pool, "the best comedy character on TV" was really "the best of these three shows." We knew it. We said it. We waited.

We have six shows now: Seinfeld, The Office, Friends, Parks and Recreation, Schitt's Creek, and Arrested Development. 499 characters with at least 50 jokes each. 59,000 jokes total. That's enough roster to do this properly.

Here's the answer.

## The top 25

| # | Character | Show | WAR | Jokes |
|---:|---|---|---:|---:|
| 1 | **George Costanza** | Seinfeld | 1,181.9 | 2,632 |
| 2 | Jerry Seinfeld | Seinfeld | 1,109.5 | 4,339 |
| 3 | Dwight Schrute | The Office | 802.6 | 1,734 |
| 4 | Chandler Bing | Friends | 651.6 | 2,962 |
| 5 | Phoebe Buffay | Friends | 618.5 | 2,036 |
| 6 | Ron Swanson | Parks and Recreation | 605.8 | 839 |
| 7 | Cosmo Kramer | Seinfeld | 555.2 | 1,547 |
| 8 | Leslie Knope | Parks and Recreation | 550.4 | 1,972 |
| 9 | Joey Tribbiani | Friends | 531.6 | 2,655 |
| 10 | Michael Scott | The Office | 447.1 | 3,265 |
| 11 | Jim Halpert | The Office | 331.7 | 1,501 |
| 12 | April Ludgate | Parks and Recreation | 324.0 | 677 |
| 13 | Elaine Benes | Seinfeld | 317.7 | 1,316 |
| 14 | Andy Dwyer | Parks and Recreation | 248.2 | 863 |
| 15 | Ross Geller | Friends | 230.6 | 2,388 |
| 16 | Michael Bluth | Arrested Development | 219.7 | 1,029 |
| 17 | Moira Rose | Schitt's Creek | 210.2 | 995 |
| 18 | David Rose | Schitt's Creek | 191.6 | 1,072 |
| 19 | Monica Geller | Friends | 157.6 | 2,548 |
| 20 | Gob Bluth | Arrested Development | 140.2 | 700 |
| 21 | Ben Wyatt | Parks and Recreation | 137.2 | 563 |
| 22 | Alexis Rose | Schitt's Creek | 134.3 | 788 |
| 23 | Pam Beesly | The Office | 131.9 | 792 |
| 24 | Tom Haverford | Parks and Recreation | 131.4 | 1,029 |
| 25 | Narrator | Arrested Development | 121.2 | 494 |

George at #1 is a reversal from the April Comedy WAR post, which had Jerry at the top by about 600 WAR. The flip happened during the standup-aware rescoring on April 18 — Jerry's stand-up bits at The Improv had been counting as sitcom comedy, inflating his impact scores by roughly 15%. Once those got weighted at 30% of a normal joke (because they aren't sitcom jokes — they're polished professional material), Jerry's per-joke quality dropped just enough for George to pull ahead. The gap is now 72.4 WAR, which is small but the order is stable across all three consensus runs.

So: **George is funnier than Jerry by a hair.** This is the kind of finding the Humor Index exists to surface. The cultural memory of Seinfeld treats Jerry as the comic engine and the other three as the supporting cast. The data says it's George. He has fewer jokes (2,632 vs 4,339), but each one is sharper, and the cringe-density of the character's writing converts into Impact at a higher rate than Jerry's observational stand-up material.

## Three things the leaderboard tells us

### 1. The top 10 is mostly volume

| Show | Characters in top 10 | Show's total episodes |
|---|---:|---:|
| Seinfeld | 3 | 172 |
| Friends | 3 | 235 |
| The Office | 2 | 186 |
| Parks and Recreation | 2 | 124 |
| Arrested Development | 0 | 84 |
| Schitt's Creek | 0 | 80 |

The four shows with 100+ episodes claim every slot in the top 10. Arrested Development and Schitt's Creek don't appear until #16 and #17. That's not because their characters are worse — it's because **WAR is a counting stat.** It's analogous to career home runs, not OPS. Ten years of merely-good production beats four years of brilliant production every time.

Michael Bluth (#16, WAR 219.7) and Ron Swanson (#6, WAR 605.8) tell the story. Ron has a higher Craft score (7.43 vs 7.23) and a higher Impact score (7.16 vs 6.90). On a per-joke basis, Michael is producing higher-craft material. But Ron has 84 more episodes to do it across, and that gap is wide enough to put him three slots higher on the cross-show board.

We'll publish a separate per-joke and per-episode leaderboard soon for the readers who think this is the more interesting view. It is. It's just a different question.

### 2. Ron Swanson has the highest per-joke craft on the index

If we filter to characters with at least 100 jokes and rank by **average craft score per joke**, the top 10 looks completely different:

| # | Character | Show | Craft | Jokes |
|---:|---|---|---:|---:|
| 1 | **Ron Swanson** | Parks and Recreation | 7.43 | 839 |
| 2 | Narrator | Arrested Development | 7.40 | 494 |
| 3 | Buster Bluth | Arrested Development | 7.38 | 358 |
| 4 | Creed Bratton | The Office | 7.34 | 184 |
| 5 | Lucille Bluth | Arrested Development | 7.32 | 468 |
| 6 | Tobias Fünke | Arrested Development | 7.30 | 442 |
| 7 | Michael Bluth | Arrested Development | 7.23 | 1,029 |
| 8 | Gob Bluth | Arrested Development | 7.22 | 700 |
| 9 | George Sr. | Arrested Development | 7.22 | 386 |
| 10 | George Michael Bluth | Arrested Development | 7.21 | 425 |

Seven of the top ten are Arrested Development characters. The eighth (Creed) is from The Office. The ninth and tenth are Ron Swanson and Ron Howard's voiceover. **Per-joke, Arrested Development is the densest writers' room on the index.** Their characters average 7.22+ on craft across hundreds of analyzed jokes. The next show with multiple representatives in the top 10 is The Office, which has one (Creed, who appears in only ~30 episodes and gets 184 jokes).

Ron Swanson at #1 is also fascinating from a sample-size standpoint. He's the only Parks and Rec character in the craft top 10, and he beats every Arrested Development character despite the AD writers' room being recognized as one of the most joke-dense in television history. Three things drive it: he's almost always the deadpan straight man (his craft scores load on structure and economy, not misdirection), he has fewer total jokes than a normal lead (839, vs Leslie's 1,972), and the show writes the rest of its ensemble for warmth rather than precision. He gets the punchlines other characters can't sell.

### 3. Each show has a clear #1, and they aren't always who you'd guess

The show-by-show #1 characters by WAR:

- **Seinfeld:** George Costanza (1,181.9). Not Jerry. (See above.)
- **The Office:** Dwight Schrute (802.6). Not Michael Scott. Dwight has fewer episodes as a central focus but the absurdism + character-fit dimensions reward him heavily.
- **Friends:** Chandler Bing (651.6). Beat out Phoebe by 33 WAR. Joey is #3. Monica and Ross are mid-table. Rachel surprisingly does not make the show's top 5.
- **Parks and Recreation:** Ron Swanson (605.8). Beat Leslie Knope by 55 WAR despite Leslie having more than twice as many jokes. The Craft + Impact gap closes the volume gap.
- **Schitt's Creek:** Moira Rose (210.2). Edged David by 19. Both are inside the noise floor — the rank between them probably flips on any given rescoring.
- **Arrested Development:** Michael Bluth (219.7). Gob is #2. The Narrator (Ron Howard) somehow makes the Top 25 with only 494 lines, which is its own statement about how much comedy is in the framing.

## A note on what WAR is and isn't

Comedy WAR is built like baseball's Wins Above Replacement, with one important caveat: **the "replacement" character isn't a major character on another show.** It's a bench player. Specifically, the median quality score of all characters with 50–100 analyzed jokes — the 25th-percentile recurring character across our six shows. That bench-player baseline is 6.555 on a 0–10 scale.

A character's WAR is then: \`n_jokes × max(shrunk_quality − 6.555, 0)\`. The \`shrunk_quality\` uses Bayesian shrinkage with k=30, which means a 100-joke character is mostly themselves and a 30-joke character is half themselves, half league-average. This penalizes small-sample showboating — you can't claim to be the funniest character in television on the strength of 12 great jokes.

It also means WAR rewards three things at once: **volume, quality, and quality-relative-to-bench.** A character on a long-running show with a high quality score will dominate. That's the bias built in. We think it's the right bias for "career value" but it isn't the right bias for "best on a per-shift basis" — that's per-episode WAR and per-joke quality, which we'll publish next.

## Where the leaderboard hits its noise floor

The single-run ICC for our scoring is 0.28 (see [the scorer noise floor post](/blog/scorer-noise-floor)). We score each episode three times under consensus, which roughly halves the per-episode variance, but a character's full-career WAR still inherits some of that noise. Two examples of where the rankings probably aren't stable:

- **Moira vs David in Schitt's Creek.** WAR 210.2 vs 191.6, gap of 19. Both have ~1,000 jokes. The bootstrap 95% CI for either character's WAR is roughly ±60. Whether Moira is #1 in Schitt's or David is depends on which rescore run you trust most. We're confident neither would fall behind Alexis (#3 in the show) but their internal order is essentially a coin flip.
- **Phoebe (#5) vs Ron Swanson (#6) at the cross-show level.** Gap of 12.7 WAR, with CIs at least three times that. Either could be #5 on a rescoring.

We're not going to redo this analysis weekly to chase the rankings. The point of WAR is to tell you which characters are clearly in the elite tier across shows, not to pick rank 5 from rank 6 with false precision.

## What's next

Two follow-ons that fall out of this dataset:

1. **Per-episode WAR.** Same metric, normalized by appearances. Ron Swanson and Michael Bluth move up. Jerry and Chandler stay around the top but are less dominant.
2. **Per-joke quality (Craft × Impact).** The "best craftsperson" leaderboard. Arrested Development takes seven of the top ten. Worth its own post.

If you want to compare your favorite character against any other on the index, the character pages are live now: [Funniest Characters](/rankings/funniest-characters).

---

*Methodology details and known limitations are at [/methodology](/methodology). The full ranked list of 499 characters (filtered to 50+ jokes) is at [/rankings/funniest-characters](/rankings/funniest-characters).*
`,
  },
  'character-comedy-spectrum': {
    title: "Modern Sitcoms Are More Character-Driven Than the Classics",
    description: "Across 6 fully-scored shows, character_comedy is the most variable axis in our taxonomy \u2014 a 45-point spread. Schitt's Creek tells more character-driven jokes than Seinfeld. By a factor of nearly three.",
    date: '2026-05-03',
    category: 'Data Science',
    content: `
Schitt's Creek tells more character-driven jokes than Seinfeld. By a factor of nearly three.

That's not a take. It's what falls out of the data when you tag every joke in every episode by type and add up the columns. Across the eighteen joke categories the Humor Index tracks, the one with the widest spread between shows is **character_comedy** — the type where the punchline depends on *who* said it, not what they said.

Here's the chart that started this post:

- **Schitt's Creek:** 69.1% (#1)
- **Arrested Development:** 54.4% (#2)
- **The Office:** 36.7% (#3)
- **Parks and Recreation:** 36.5% (#4)
- **Friends:** 26.4% (#5)
- **Seinfeld:** 24.6% (#6)

Forty-five points between top and bottom. No other axis in our taxonomy comes close. **The newer the show, the higher its character_comedy concentration.** That cuts against the cultural memory of TV comedy, which tends to crown Seinfeld and Friends as the great character comedies of their era. By our measurement, they aren't — at least, not relative to what's been made since.

## What "character_comedy" actually means here

A joke gets the *character_comedy* tag when the punchline is funny *because of who said it*. Could only this character have made that move? Does the joke reveal something true about who they are? Is it a beat that works *because* you know this person?

Some examples our scorer has tagged as character comedy:

- **Moira Rose**'s entire vocabulary. The detours into "bébé" and "fold in the cheese" and "John, I have been gutted." It only lands because *Moira* would say it that way.
- **Tobias Fünke** describing himself as a "never-nude." The line is mediocre. The fact that *he* says it, with full sincerity, is what scores.
- **Dwight Schrute** explaining bear/beet/Battlestar Galactica. The pyramid only matters because Dwight's brain made it.

A joke that *isn't* character comedy:

- A setup/punchline pun that any character could have delivered.
- An observational riff about how strange airline peanuts are.
- A physical pratfall.
- A topical reference that depends on the audience knowing what's in the news.

These all show up in our taxonomy as separate types: setup_punchline, observational, physical_slapstick, etc. They're funny. They just aren't anchored to a specific person.

## The pattern by era

Look at the same shows sorted by air date instead of percentage:

- **Seinfeld** (1989–1998): 24.6%
- **Friends** (1994–2004): 26.4%
- **The Office** (2005–2013): 36.7%
- **Parks and Recreation** (2009–2015): 36.5%
- **Arrested Development** (2003–2019): 54.4%
- **Schitt's Creek** (2015–2020): 69.1%

The trend is monotonic with one exception (Arrested Development punches above its date because of the Bluth ensemble's specificity, which was always going to outscore the era it aired in). Across thirty years of comedy, the share of jokes that are *about who's telling them* has roughly tripled.

That's surprising if you remember Friends and Seinfeld as character shows. Friends *was* a character show — six distinctive personalities you could parody from a single line of dialogue. Same with Seinfeld; "yada yada yada" only works because of Elaine. So why are they at the bottom of this list?

## Because they had other engines

A show can be funny without being character-funny. Friends and Seinfeld were funny mostly through:

**Setup/punchline.** Seinfeld's writers' room was setup-punchline obsessed in a way modern sitcoms aren't. Multi-cam structure encouraged it. Friends's setup_punchline tag rate is **6.4%** vs Schitt's **7.1%** — comparable on the joke type itself, but the difference is what *anchors* the rest of the show.

**Observational comedy.** Seinfeld was the apex predator here — observational scores **11.2%**, the highest of any show on the index. The whole "what's the deal with airplane peanuts" mode of thinking. Modern shows mostly don't bother.

**Catchphrase / running gag.** Both shows traffic in repeatable lines as a structural backbone. "How *you* doin'." "Yada yada." "Serenity now." Our taxonomy tags these as running_gag, and there's only so much character work happening inside them — they're funny on rewatch *because they're the same line*, not because the character is doing something newly characteristic.

The result is shows that *feel* character-driven because the characters are vivid, but where the joke level doesn't anchor to character as much as the perception does.

## Why this matters

Character comedy ages better than any other type. It's the reason Schitt's Creek will rewatch in 2040 the way Seinfeld rewatches now — better, probably, because it doesn't have the topical-reference decay Seinfeld does. Watch a Seinfeld episode about a cell phone in the late 90s and a chunk of the comedy is illegible to a 2026 viewer. Watch the Cabaret episode of Schitt's Creek; nothing in it depends on the year.

It also predicts which shows generate quotable line-cards on social media a decade after airing. Character-comedy concentration is highly correlated with the share of TikToks that begin "this is what this character would do in this situation" — because that's the format. Schitt's and Arrested Development have absurdly high TikTok afterlife rates relative to viewership during their run. Friends and Seinfeld show up too, but mostly as nostalgia clips, not as character bits.

And it predicts what kind of comedy a show *can* be. Character_comedy peaks at 69%; nobody scores 100% because pure character work doesn't carry a half-hour of TV. The remaining 30% is structural — the setup mechanism, the visual gag, the misdirection — that gives the character work somewhere to land. Schitt's Creek floors that lower bound: almost the entire show is character. The Roses don't have plots, they have *patterns*.

## What this predicts for the back half of the May drip

We have three shows still to score in the next three weeks: 30 Rock, Brooklyn Nine-Nine, and Two and a Half Men. Here are our priors based on the pattern above:

- **30 Rock** — should score *high* on character comedy despite being plot-driven and cutaway-heavy. Liz, Jack, Tracy, Kenneth, Jenna are all hyper-specific. Prediction: 45–55%.
- **Brooklyn Nine-Nine** — Schur lineage, ensemble cast, character work as the engine. Prediction: 45–55%, similar to Office and Parks.
- **Two and a Half Men** — multi-cam network sitcom, joke-density-driven, setup_punchline heavy. Prediction: 25–35%, in the Seinfeld/Friends range.

If those land where we expect, that's another piece of evidence for the era pattern. If TAAHM scores high on character comedy, we'll have a new wrinkle to examine.

## The Humor Index thesis, restated

If you've read past Humor Index posts, you know the recurring frame: **comedy is multi-dimensional, and any single number for "how funny" is hiding a richer story.** This is one of those richer stories. The leaderboard says Arrested Development (85.2) is the funniest show we've measured. The Schitt's Creek post made the case that a show can score #5 overall and still own the #1 spot on craft and impact. This post adds another lens: shows live somewhere on a 45-point character-comedy spectrum, and that placement tells you a different kind of truth than the Humor Index alone.

The TL;DR is simple: **character comedy is the modern mode of TV comedy, and it's been getting more dominant for thirty years.** The shows we remember as "great character shows" from the 90s scored low on character comedy. The shows that don't get the same cultural-memory weight — Schitt's Creek, Arrested Development — are the actual character extremists.

Both things can be true. The data just lets you see which is which.

---

*The character_comedy share for each show is computed from joke-by-joke type tagging across every episode. Methodology: [/methodology](/methodology). Per-show comedy DNA donut charts are on each show's page.*
`,
  },
  'schitts-creek-last-on-board-first-on-impact': {
    title: "Schitt's Creek: Last on the Board, First on Impact",
    description: "Schitt's Creek scored the lowest of the five published shows when it debuted \u2014 but ranks #1 on Impact and #2 on Craft. One of the cleanest demonstrations our methodology has of why joke count alone is the wrong question.",
    date: '2026-05-02',
    category: 'Analysis',
    content: `
If you measure comedy by how often someone tells a joke, *Schitt's Creek* shouldn't be funny.

Most pure-density measurement says the show is quiet. Long takes. Whole scenes built around a single beat. A standoff between Moira's enunciation and a ringing phone. There are episodes of *30 Rock* with more punchlines in their first three minutes than *Schitt's Creek* delivers in twenty.

So Schitt's Creek scored the lowest of the five shows on our leaderboard — **78.3, behind Friends at 78.66 by less than half a point.**

The reason that fact is interesting, not damning, is that Schitt's lands at the *bottom* of our overall index while ranking **first on Impact and second on Craft** — and dead-last on raw joke density. It's one of the cleanest demonstrations our methodology has of why "joke count" alone is the wrong question.

## The numbers

- **Schitt's Creek:** 78.3 HI · JPM 2.25 (lowest) · Craft 7.03 (#2) · Impact 6.73 (#1) · 80 episodes
- **The Office:** 80.22 HI · JPM 2.38 · Craft 6.87 · Impact 6.67 · 186 episodes
- **Seinfeld:** 79.1 HI · JPM 2.38 · Craft 7.15 · Impact 6.44 · 172 episodes
- **Friends:** 78.66 HI · JPM 3.13 · Craft 6.75 · Impact 6.62 · 236 episodes
- **Parks & Rec:** 80.55 HI · JPM 2.28 · Craft 7.0 · Impact 6.71 · 124 episodes

Schitt's lands #5 on the index because it tells fewer jokes per minute than any of the other four shows, and the Humor Index weights JPM at 30%. But it loses by a *narrow* margin — the craft and impact strength almost completely offset the density gap. Friends, the show right above it, has 39% more jokes per minute and still scores only 0.36 points higher.

## The thesis the data lands on

Schitt's Creek doesn't tell more jokes than its peers. It tells *better* ones, with fewer misses. **Higher craft, higher impact, lower density** is the single cleanest signature of "comedy that earns its laughs slowly."

Watch the Cabaret arc in season six and count the jokes per minute — you'll get a smaller number than you'd guess. Then count the ones that actually work. Almost all of them.

## The episodes that broke our model

A few episode-level findings the data turned up:

**Top episode: "The Incident" (S6E2) — 96.5/100.** Higher than Friends' best-ever episode ("The One With The Rumor" at 95.0). Not the finale, not the Cabaret. An episode where Moira's town-council recall vote backfires.

**#2 episode: "Don't Worry, It's His Sister" (S1E3) — 94.8.** Three episodes into the entire show. This demolishes the "S1 was rough" consensus — by our scoring, S1 of Schitt's Creek peaks higher than any season of Friends.

**Best season: S3 (80.5).** That's a higher per-season score than Office's best season (S4) and matches Parks at the very top. Most fan polls put S5 or S6 as the show's peak. The data disagrees.

**Worst episode: "The Pitch" (S6E12) — 62.3.** Late-series weak point right before the run-up to the wedding.

**Quietest episode: "Estate Sale" (S2E4) — JPM 1.36.** One joke every 44 seconds. Still scored 76.4 on the index — high enough to outrank dozens of episodes from Friends.

## The character math

We attribute every joke to the character or characters who land it, then average across the show. Some of what we found surprised us:

**Moira Rose is the highest-craft regular: 7.21 across 995 jokes.** Not David, who comes in at 7.06. Catherine O'Hara's vocabulary detours, vowel placement, and reaction beats register as a higher density of identifiable craft signals than any other character on the show. She's the closest Schitt's gets to a 30 Rock-style punchline machine — surrounded by people who deliberately don't match her tempo.

**David is second (7.06 craft, 1,072 jokes).** More volume than Moira, slightly less craft per joke. Sarcasm-as-armor early David scores below sarcasm-as-affection late David — the character grows up, the writing follows him.

**Twyla outscores most of the main cast.** 7.12 craft on 96 jokes (small sample, but real). Sarah Levy's half-second timing on the diner-counter setups is doing more work than the screen time suggests.

**Patrick is right at Moira's level when he appears: 7.05.** He shows up in S3 and lifts the whole craft floor.

**Johnny is the lowest-craft regular at 6.85.** This isn't a knock — Eugene Levy plays the straight man and the straight man's job is to set up everyone else's punchlines. The craft score measures the joke; not the character's value to the show.

## What this defends

If you've ever felt like comedy criticism rewards loudness over precision — that 30 Rock gets graded easier than a quieter show because its jokes are easier to count — Schitt's Creek's score is the version of the argument with numbers behind it.

Schitt's lost the leaderboard by 0.36 points to a show with 39% more jokes per minute. It tied for first on craft when you adjust for sample, and led every other show on impact-per-joke. Most of the gap to #1 (Parks at 80.55) is JPM.

A different way to phrase the same finding: **on a per-joke basis, Schitt's Creek is the best show on this index.** The Humor Index just happens to weight density too.

## Where it ranks

The leaderboard at publication (May 2):

- 1. Parks and Recreation — 80.55
- 2. The Office — 80.22
- 3. Seinfeld — 79.1
- 4. Friends — 78.66
- 5. **Schitt's Creek — 78.3** ← new

A 2.25-point spread separates first from last. All five shows fall inside each other's 95% confidence intervals.

> *Update (May 4): Arrested Development entered the index at 85.2, taking the #1 spot by the largest gap on the board. See [the AD launch post](/blog/arrested-development-takes-the-crown). Schitt's now sits at #6 overall but is still tied for first on per-joke Impact.*

The Humor Index's read on canonical sitcoms: they're closer than the cultural narrative suggests.

This also sets up the rest of the May drip. The next show entering the index is the highest-JPM show we've ever measured. The contrast is the point. Two ways to be great at comedy. Both score in the same neighborhood. The methodology can tell you why.

---

*Read the full per-episode breakdown at [the show page](/shows/schitts-creek). Methodology at [/methodology](/methodology).*
`,
  },
  'arrested-development-takes-the-crown': {
    title: "Arrested Development Just Took the #1 Spot. The Gap to #2 Is the Biggest on the Board.",
    description: "Arrested Development debuts at 85.2 \u2014 4.65 points clear of Parks. That's twice the size of the gaps between #2 and #6 combined. Here's what's actually inside the gap.",
    date: '2026-05-04',
    category: 'Analysis',
    content: `
When the Humor Index added Arrested Development this week, it didn't just take the top spot. It opened a gap.

The current leaderboard:

- **Arrested Development:** 85.2 HI · #1 · gap to #2 = **4.65 points**
- **Parks and Recreation:** 80.55 HI · #2 · gap to #3 = 0.33
- **The Office:** 80.22 HI · #3 · gap to #4 = 1.12
- **Seinfeld:** 79.1 HI · #4 · gap to #5 = 0.44
- **Friends:** 78.66 HI · #5 · gap to #6 = 0.36
- **Schitt's Creek:** 78.3 HI · #6

Five of those six gaps are inside the Humor Index's noise floor — about 0.4 points of run-to-run scorer noise per show. The gap from AD to Parks isn't. It's nearly a *standard deviation* above the cluster everyone else is sitting in. That's an unusual shape for any taste-driven ranking, and it demands an explanation. Here's the honest one.

## Mechanically: AD wins on Craft and Impact

The Humor Index is a weighted composite. JPM is 30% of the score. Craft is 40%. Impact is 30%. So the things that move the needle most aren't joke density — they're per-joke quality and per-joke resonance.

AD wins both:

- **Craft:** AD 7.24 · best of the rest (Seinfeld) 7.15 · gap +0.09
- **Impact:** AD 6.94 · best of the rest (Schitt's) 6.73 · gap +0.21
- **JPM:** AD 1.94 · the lowest on the board · Friends tells 61% more jokes per minute

AD's secret isn't that it tells more jokes. It tells *fewer* than any other show on the leaderboard. It just gets more out of each one.

Which raises the obvious follow-up: more out of each one *how?*

## Structurally: layered jokes

AD's central comedic move is to put four or five separate joke mechanisms inside the same line.

Take "I just blue myself." Tobias says it. He has painted himself blue. The line lands as character comedy (only Tobias would say it), wordplay pun (blue means sad and means literally blue), visual gag (he is, on screen, painted blue), callback (sets up a later Blue Man Group plotline that cashes in twice more this season), and cringe (he's oblivious to the second meaning). Five comedic dimensions. One sentence.

Our scorer tags each of those independently. Most jokes on most shows pull on one or two dimensions. The Office's "Bears, beets, Battlestar Galactica" is character comedy and absurdist surprise. Seinfeld's "yada yada yada" is observational and running-gag. Both work. Both score well. Neither pulls on five things at once.

You can see the pattern in the comedy DNA percentages. Three of the eighteen joke-type tags reward exactly the kind of layering AD does — *callback*, *wordplay_pun*, and *visual_gag*. AD is the only show on the index that scores in double digits on all three:

- **Arrested Development:** Callback 10.1% · Wordplay 11.9% · Visual gag 8.5% — triple-double
- **The Office:** Callback 1.8% · Wordplay 3.2% · Visual gag 1.4%
- **Seinfeld:** Callback 4.4% · Wordplay 3.2% · Visual gag 1.9%
- **Friends:** Callback 4.2% · Wordplay 3.1% · Visual gag 2.2%
- **Parks and Rec:** Callback 2.0% · Wordplay 3.4% · Visual gag 1.8%
- **Schitt's Creek:** Callback 3.4% · Wordplay 7.4% · Visual gag 2.7%

AD's wordplay rate is **3.7× The Office's**. Its callback rate is **5.6× Parks and Rec's**. These aren't subtle differences. The Bluths are doing something the rest of the cast aren't.

## The narrator advantage

Every other show on the index gets jokes only from on-screen dialogue. Arrested Development gets a parallel joke track running on top.

Ron Howard's voiceover is *itself* a joke vector. "Michael had no idea who his uncle Jack actually was, which would become important later." "On the next Arrested Development." "It was Carl Weathers." Each of those clips is independently scored as a joke. None of them came out of a character's mouth on screen.

We tagged 494 jokes to the Narrator across 84 episodes — about 5.9 narrator-jokes per episode, on average, that no other show on the index has access to. Take those out and AD's joke count drops 10%. The narrator alone moves the needle by something like 1–1.5 Humor Index points.

That's not cheating. It's a structural feature of the show. The Humor Index measures comedy, the show delivers comedy via voiceover, the score reflects it. But it does mean a 4.65-point gap is partly an architectural advantage — AD has access to a vehicle the others don't.

## The callback advantage

Callbacks are the other place AD pulls away. Our scoring rubric rewards "callback that pays off earlier setups, especially across episodes." AD is the most callback-dense show in television history; it's the central reason the show rewards rewatching.

But it's also a structural feature that interacts with how our scorer reads jokes. A callback is, by definition, a joke that's funnier the second time. We score it once with the payoff context. So AD's joke economy is double-dipping in a sense — once when the seed is planted, again when it's harvested. Both score independently, but one wouldn't exist without the other.

It's still the way the show is built. We're just being honest about why it advantages this kind of show specifically.

## The honest methodological caveat

A scoring system measures what it can measure. The craft rubric we use rewards five things explicitly: setup quality, misdirection, surprise, character fit, and timing. The taxonomy we tag against has eighteen joke types, and several of them — callback, wordplay_pun, meta_self_referential, running_gag, visual_gag — are exactly the kind of mechanisms Arrested Development was built around.

The result is real, but it's also narrowly scoped: **AD is the densest match between joke architecture and our scoring rubric on the index.** A show that's just as funny but uses simpler joke architecture — one strong joke per beat, no callbacks, no visual layering — would score lower against this rubric. That doesn't make our rubric wrong. It does mean readers should hold the score with the right kind of grip.

You can see the same caveat from the other side, looking at Schitt's Creek. Schitt's has the highest character_comedy concentration on the index (69%) and the highest Impact-per-joke. But it scored #5 because its joke architecture is *flat*. The Roses are vivid; their jokes pull on one or two dimensions, not five. The show feels great because the dimensions it does have are strong, but the rubric doesn't have anywhere to put "this is funnier than the math says."

That's a real limitation. The Humor Index is a measurement, not a verdict.

## The headline, with footnote

If you want the takeaway in one line: **Arrested Development's joke architecture is the densest match between what shows do and what our rubric scores.** It earns its 85.2 — but it earns it on a methodology that rewards layered, callback-heavy, multi-dimensional jokes specifically.

Schitt's Creek's score is also real. Friends's score is also real. They're earning their points on a different geometry. The 4.65-point gap to #1 is a measurement of structure as much as it's a measurement of funniness, and the honest read is that both things are doing work.

If you've felt for years that Arrested Development was the most architecturally dense comedy ever made, here's the receipt. It's also the only show on the index where you can pause any frame and find a sight gag in the background, while the dialogue is doing wordplay, while the voiceover is foreshadowing the callback two scenes from now. Five things at once. Almost nobody else is even trying.

The leaderboard says AD is #1. The Humor Index measures one specific thing very well. Both can be true.
`,
  },
  'parks-passes-office': {
    title: 'Parks and Recreation Just Took the #1 Spot from The Office.',
    description: 'After scoring all 126 Parks and Rec episodes, Pawnee edges Scranton 80.55 to 80.22. The margin is inside our noise floor — but every secondary metric points the same direction, and Ron Swanson is now the highest-quality lead character on the site.',
    date: '2026-04-30',
    category: 'Analysis',
    content: `
Since this site launched, the top of the leaderboard has read the same way. The Office was the funniest sitcom we'd measured. Seinfeld was second, Friends third, everything else was a placeholder waiting on transcripts.

This week we finished scoring all 126 episodes of Parks and Recreation. **Parks is now #1 with a Humor Index of 80.55. The Office is #2 at 80.22.**

The margin is 0.33 points. We've published two separate posts ([here](/blog/scorer-noise-floor) and [here](/blog/bayesian-credible-intervals)) explaining that a gap that small is well inside the run-to-run noise of our scorer. We are not claiming Parks is provably funnier than The Office. What we are claiming is that the show that has been quietly second-place in every "best sitcom of the 2010s" conversation for a decade now has, by every metric we can put numbers on, caught up.

## The headline numbers

Side by side:

- **Parks and Recreation:** 80.55 HI · 126 episodes · 7,296 jokes · 7.0 craft · 6.71 impact · 2.28 JPM
- **The Office:** 80.22 HI · 201 episodes · 10,044 jokes · 6.87 craft · 6.67 impact · 2.38 JPM

The Office has more episodes (and almost 3,000 more jokes) because it ran two and a half more seasons. But the per-joke quality numbers favor Parks across the board: higher craft (7.0 vs 6.87), higher impact (6.71 vs 6.67), and effectively identical joke density (the 0.10 JPM gap is one extra joke every ten minutes).

If you simulate "what if Parks had run as long as The Office" — extrapolating its rate of joke production over another 75 episodes — Parks ends up with roughly 11,400 analyzed jokes at the same craft and impact. The volume gap closes, the quality gap doesn't.

## The Season 8 problem

Here is the part of the argument that the data makes uncomfortably clear.

The Office's average is dragged down by the post-Carell era. Seasons 8 and 9 are the lowest-scoring seasons of the show, and they account for 47 of its 201 episodes — almost a quarter of the run. If you cut The Office at "Goodbye, Michael" and average only the first seven seasons, the show's Humor Index lands somewhere north of 82. That version of The Office beats Parks comfortably.

But that's not the show that aired. The show that aired is 201 episodes including James Spader and the warehouse-couples-arc and the Andy-on-a-boat. We have to score the show that exists.

Parks does not have this problem. **Parks Season 7, the final season, scores 82.89 — the highest single-season average we've measured on any show.** It went out at the top. The show's worst season was its 6-episode pilot run in 2009, which we should arguably not even be counting (Season 1 of Parks is famously where the writers were still figuring out the tone — the show people remember basically starts in Season 2).

If you exclude the 6-episode pilot season from Parks, its Humor Index climbs to 80.93. If you exclude Seasons 8 and 9 from The Office, its Humor Index climbs to ~82. Both shows look better when you let them off the hook for their weakest year. The difference is that Parks' weakest year is a half-season; The Office's weakest years are 25% of the show.

## Ron Swanson is the best-written lead character on the site

The Comedy WAR table for characters with at least 200 analyzed jokes now looks like this at the top:

- **Ron Swanson** — 7.30 quality · 839 jokes · 5.13 WAR/episode
- **April Ludgate** — 7.00 quality · 677 jokes · 2.84 WAR/episode
- **Dwight Schrute** — 7.02 quality · 1,734 jokes · 4.36 WAR/episode
- **Stanley Hudson** — 7.00 quality · 217 jokes · 0.83 WAR/episode
- **Leslie Knope** — 6.80 quality · 1,972 jokes · 4.55 WAR/episode

A few things to chew on. **Ron's 7.30 quality index is the highest of any main cast member of any show we've scored.** Higher than Dwight (7.02), Jerry Seinfeld (6.96), George Costanza (6.83), Michael Scott (6.69). The number is built on 839 jokes across 118 episodes — not a small-sample fluke.

What's driving it is that Ron's joke profile is unusually clean. He doesn't have throwaway lines. The character is built around economy — short declarative sentences, perfect comic timing, a face Nick Offerman can hold for ten seconds longer than seems possible. Our scorer rewards economy heavily because it correlates with craft, and Ron is the platonic example.

**April clears every Office co-lead on quality.** April Ludgate's 7.00 quality matches Stanley Hudson and beats Jim, Pam, Andy Bernard, Kevin, and Erin. She has the lowest joke volume of any Parks main, but the per-joke quality is elite.

**Leslie Knope is The Volume Play.** 1,972 jokes is the most for any character on the site. Michael Scott has more screen time but only 3,265 jokes across 141 episodes — Leslie does 1,972 in 118 because the show is denser around her. Her quality (6.80) is lower than Ron's, but she carries an enormous share of the show's joke volume at consistent quality, which is the textbook definition of a workhorse lead.

## So why was The Office in the top spot at all?

Two reasons, in honest descending order of how much I believe them.

**1. We hadn't scored Parks yet.** The Office was first because it's the first show we ran the pipeline on. Seinfeld and Friends followed. Parks waited because the transcript pipeline took longer than expected. The leaderboard wasn't telling you Parks was worse — it was telling you Parks wasn't in the running. Now it is.

**2. The Office is the more meme-able show.** Cringe comedy generates clips. "Parkour!" "I declare bankruptcy!" "Have you ever seen a documentary?" are all over TikTok. Parks is more diffuse — its best moments are character beats inside scenes, harder to extract as a 15-second video. If you're sampling sitcom comedy through social media, you see The Office five times more often. The Humor Index doesn't sample through social media. It samples every joke in every episode. Different selection function, different result.

## What this changes on the site

The home page has Parks on top now. The comparison tool now defaults to "Parks vs Office" instead of "Office vs Seinfeld." The Comedy WAR character leaderboard has Ron at #1 among single-show leads.

What it doesn't change: the [statistical caveats from the noise-floor study](/blog/scorer-noise-floor) still apply. A 0.33-point gap is not a confident ordering. If we rescored both shows tomorrow with consensus runs, there's a non-trivial chance The Office takes the top back. The honest read of this leaderboard is: *Parks and Office are tied at the top, with Parks getting the headline because the per-joke quality favors it.*

## The bottom line

Parks and Recreation has always been the show that gets passed over in these conversations. It came after The Office in NBC's mockumentary lineage, it ended before the streaming canonization wave hit, it has the Pawnee setting that doesn't generate the same office-cringe shorthand. Critics liked it. Fans loved it. It was never the cultural object The Office was.

But it might be the better-written one. The data we have right now says it is, by a small enough margin that you should hold the claim loosely, and by every secondary metric that you should hold it confidently.

Welcome to the top of the index, Pawnee.

*Explore the data: [Parks and Recreation show page](/shows/parks-and-recreation) · [The Office](/shows/the-office) · [Compare side by side](/compare/parks-and-recreation-vs-the-office) · [Funniest characters ranking](/rankings/funniest-characters)*
    `,
  },
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
How big a reaction would this joke get from 100 comedy-savvy viewers? *(Historical note: this used to include a 25% penalty on multi-cam sitcoms to discount laugh-track-inflated reactions. We removed it in April 2026 after a Bayesian audit showed the format effect was statistically indistinguishable from zero. See [the Seinfeld vs. The Office post](/blog/seinfeld-vs-the-office) for the full reasoning.)* Stand-up material (Jerry's monologues at The Improv) is weighted at 0.30 of a normal joke in aggregate scores, since it's polished professional material rather than sitcom comedy.

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

So the show-level Humor Indexes we publish (Office 80.2, Seinfeld 79.1, Friends 78.7) are stable to roughly ±0.4 points from LLM noise. The differences between these shows (1–2 points) are within that noise floor — which is exactly what the hierarchical Bayesian model concludes. *(Seinfeld's 79.1 reflects our April 18 standup-aware rescore; earlier versions of this site had Seinfeld at 83.9.)*

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

In practice: if you\u2019re reading *"The Office has a Humor Index of 80.2, Seinfeld 79.1, Friends 78.7,"* you should read that as *"The posterior median orders them Office > Seinfeld > Friends, but the differences are within the range of how much rescoring noise would move these numbers."* A 1\u20132 point Humor Index gap is inside the noise floor.

*Note (April 2026): When this post was first published, Seinfeld led at 83.9 due to stand-up bits being scored as sitcom comedy. That was fixed with a standup-aware rescore \u2014 see the [Office vs Seinfeld reordering post](/blog/seinfeld-vs-the-office) for the back-and-forth. The core finding of this post \u2014 that all three shows sit within each other\u2019s credible intervals \u2014 is unchanged.*

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
    description: 'Comedy WAR is like baseball\'s Wins Above Replacement but for sitcom characters. Originally led by Jerry Seinfeld; after rescoring, George Costanza now sits at #1.',
    date: '2026-04-16',
    category: 'Data Science',
    content: `
> **\u26A0\uFE0F Update (April 19, 2026):** The numbers in this post are out of date. We later discovered that Jerry\u2019s stand-up bits were being counted at full weight in his character-level WAR. After applying our \`STANDUP_WEIGHT = 0.30\` correction (consistent with how stand-up is handled in episode aggregates), **George Costanza now leads the ranking at 1,181 WAR, with Jerry at 1,109.** Full current leaderboard: [funniest characters](/rankings/funniest-characters). The analysis below is preserved as the original April 16 argument; the methodology lesson \u2014 that fixing subtle scoring bugs can flip rankings \u2014 is part of the story.

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
> **\u26A0\uFE0F Update (April 19, 2026):** This post from April 16 reflects a transitional state. Two days later we rescored all 172 Seinfeld episodes with a new standup-aware prompt and 3-run consensus. The stand-up bits Jerry performs at The Improv were being scored as sitcom comedy \u2014 that inflated Seinfeld by several points. With the fix, **Seinfeld now sits at 79.1, just behind The Office (80.2) and slightly ahead of Friends (78.7)**. All three shows are statistically indistinguishable given our credible intervals \u2014 see [Every Show Ranking Is Within Noise](/blog/bayesian-credible-intervals). The analysis below is preserved as the original argument from the format-coefficient removal; the numbers cited have been superseded.

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
> **Editor's note (April 16, 2026): This post has been retracted.** We removed the format coefficient described below after a Bayesian audit found the effect was statistically indistinguishable from zero. With only three multi-cam shows in the corpus, the "penalty" was confounded with show-level idiosyncrasies rather than driven by format. See [Seinfeld vs. The Office](/blog/seinfeld-vs-the-office) for the reasoning behind the removal, and the [Methodology page](/methodology) for current policy. The original argument is preserved below for transparency.

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

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) notFound();

  // Top 3 scored shows for the in-post "explore the rankings" CTA block.
  const allShows = await getAllShows();
  const topShows = allShows
    .filter(s => s.humor_index > 0)
    .sort((a, b) => b.humor_index - a.humor_index)
    .slice(0, 3);

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

          // Blockquote — used for Editor's Note / Correction callouts
          if (trimmed.startsWith('> ')) {
            const lines = trimmed.split('\n').map(l => l.replace(/^>\s?/, '')).join('\n').trim();
            return (
              <aside
                key={i}
                className="my-6 border-l-4 border-brand-gold bg-brand-gold/5 px-4 py-3 rounded-r-md"
              >
                <p className="text-sm text-brand-text-secondary leading-relaxed">
                  {formatInline(lines)}
                </p>
              </aside>
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

      {/* Explore the rankings — 3 show page links for internal traffic flow */}
      {topShows.length > 0 && (
        <section className="mt-10 border-t border-brand-border pt-8">
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Explore the rankings</p>
          <p className="text-sm text-brand-text-secondary mb-5">
            See the full per-episode breakdown of the highest-ranked sitcoms on the Humor Index.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topShows.map((s, i) => (
              <Link
                key={s.slug}
                href={`/shows/${s.slug}`}
                className="block p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-gold/40 transition-colors group"
              >
                <p className="text-xs text-brand-text-muted font-mono mb-1">#{i + 1}</p>
                <p className="text-sm font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors">
                  {s.name}
                </p>
                <p className="text-xs text-brand-text-muted mt-1">
                  Humor Index <span className="text-brand-gold font-mono">{formatIndex(s.humor_index)}</span>
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/rankings"
            className="inline-block mt-4 text-xs text-brand-text-muted hover:text-brand-gold transition-colors"
          >
            See every show ranked →
          </Link>
        </section>
      )}

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
