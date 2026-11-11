export const POSTS: Record<string, {
  title: string;
  description: string;
  date: string;
  category: string;
  content: string;
}> = {
  'chappelles-show-sketch-advantage': {
    title: "A Sketch Show Has Four of Our Five Top-Ranked Episodes",
    description: "Chappelle's Show has the highest per-joke impact on the board (7.70) and four of the top five episodes. A sketch has no plot to service, and it shows in the numbers.",
    date: '2026-11-11',
    category: 'Analysis',
    content: `
The top of our funniest-episodes list is not a sitcom. Four of the first five entries are *Chappelle's Show*: "Black Bush", the Rick James "True Hollywood Stories", "The Racial Draft" and "The Wayne Brady Show". Only Seinfeld's "The Boyfriend" breaks the run.

## Why a sketch show scores this way

Every joke gets an impact score: how hard it would land in a room of comedy-literate viewers. Chappelle's Show averages **7.70**, the highest of the 13 shows on our current model. 30 Rock is next at 7.57.

It gets there on fewer jokes than anyone. The show averages 58 scored jokes an episode, the lowest on the board. A sitcom spends part of every episode moving a story forward, and those scenes carry lighter jokes. A sketch states a premise and then spends its whole running time escalating it. There is nothing to dilute the average.

## The seasons

- **Season 1** (12 episodes): 94.4
- **Season 2** (12 episodes): 96.9
- **Season 3** (the three "Lost Episodes"): 92.5

Season 2 is where the four top-ranked episodes come from. The show as a whole sits at 94.5, fifth on the board.

## What to keep in mind

Four Chappelle's Show episodes score 100, and so do 45 others. The Humor Index is capped at 100, so those 49 episodes are tied on the index itself. We order them by average craft plus impact, which is how these four rise to the top. 30 Rock has 29 episodes at the cap, more than every other show combined. The fair reading is that Chappelle's Show has the best per-joke numbers among the tied episodes, not that it beat them on the index.

*Covers the 13 shows scored on our current model.*
`,
  },
  'most-quotable-show': {
    title: "The Office Is Near the Bottom of Our Quotability Ranking",
    description: "Every joke gets a quotability score. 30 Rock leads at 7.29, with 37.5% of its jokes rated 8 or higher. The Office is twelfth of thirteen at 6.44.",
    date: '2026-11-04',
    category: 'Data Science',
    content: `
Alongside craft and impact, every joke we score gets a quotability rating from 1 to 10: would this line survive being repeated out of context? If you had to guess which show wins, The Office would be a reasonable guess. It finishes twelfth of thirteen.

## The ranking

| Show | Avg quotability | Jokes rated 8+ |
|---|---:|---:|
| 30 Rock | 7.29 | 37.5% |
| Veep | 7.24 | 34.6% |
| Chappelle's Show | 7.11 | 34.9% |
| Fleabag | 7.00 | 34.6% |
| Parks and Recreation | 6.97 | 27.5% |
| Arrested Development | 6.92 | 26.7% |
| Seinfeld | 6.91 | 27.3% |
| Flight of the Conchords | 6.80 | 23.7% |
| Schitt's Creek | 6.63 | 19.5% |
| Broad City | 6.55 | 19.2% |
| The Larry Sanders Show | 6.54 | 20.4% |
| The Office | 6.44 | 19.0% |
| Freaks and Geeks | 6.19 | 13.3% |

## What separates the top from the bottom

The top four write lines that are complete on their own. A 30 Rock or Veep joke is usually a constructed sentence: an insult, a boast, a comparison. You can lift it out and it still works.

The Office works differently. Much of its comedy is a look to camera, a pause, or a line that is only funny because of who is saying it and what just happened. Those moments are remembered and shared, but mostly as clips and reaction images, not as sentences. A quotability score that asks whether the words stand alone will mark them down, and it does: fewer than one in five Office jokes rates 8 or higher, against more than one in three for 30 Rock.

Quotability matters to the index only at the margin. The average of an episode's five most quotable jokes feeds a memorability bonus worth up to five points.

*Covers the 13 shows scored on our current model. Quotability is scored from dialogue, so it cannot credit a delivery or a face.*
`,
  },
  'most-consistent-show': {
    title: "The Most Consistent Show on the Board, and the Least",
    description: "Episode scores for most shows vary by about 3.5 points. Broad City varies by 5.4, almost all of it from one season. Parks and Recreation never scores below 83.8 across 122 episodes.",
    date: '2026-10-28',
    category: 'Data Science',
    content: `
A show's Humor Index is an average, and an average hides how bumpy the ride is. So we measured the spread: the standard deviation of episode scores within each show.

| Show | Episodes | Spread | Lowest | Highest |
|---|---:|---:|---:|---:|
| Freaks and Geeks | 18 | 2.2 | 75.9 | 84.8 |
| 30 Rock | 136 | 2.8 | 86.2 | 100 |
| Arrested Development | 84 | 3.1 | 84.9 | 100 |
| Veep | 65 | 3.2 | 84.0 | 100 |
| Parks and Recreation | 122 | 3.2 | 83.8 | 98.8 |
| The Larry Sanders Show | 90 | 3.4 | 77.6 | 96.5 |
| Fleabag | 12 | 3.5 | 88.6 | 100 |
| Schitt's Creek | 80 | 3.5 | 79.9 | 99.1 |
| Flight of the Conchords | 22 | 3.5 | 84.5 | 98.1 |
| Seinfeld | 168 | 3.6 | 84.4 | 100 |
| Chappelle's Show | 27 | 3.8 | 86.4 | 100 |
| The Office | 183 | 3.8 | 78.6 | 98.5 |
| Broad City | 50 | 5.4 | 72.1 | 95.1 |

## Broad City is the outlier

Twelve of thirteen shows sit between 2.2 and 3.8. Broad City is at 5.4, and the cause is its first season. Season 1 averages 82.5; the other four average between 87.5 and 88.9. The show's three lowest episodes, at 72.1, 72.1 and 73.0, are all from that first year. From Season 2 on it is as steady as anything else here.

## Parks and Recreation has the highest floor for its size

Across 122 episodes, Parks never scores below 83.8. No other show with more than 100 episodes has a floor that close to its average.

## Read 30 Rock's number carefully

30 Rock looks like the steadiest long-running show at 2.8, but part of that is the ceiling. The index is capped at 100 and 29 of its 136 episodes sit on the cap. Scores that cannot go higher cannot vary, so its real spread is wider than the table shows.

*Covers the 13 shows scored on our current model.*
`,
  },
  'pilots-score-below-their-show': {
    title: "Most Pilots Score Below Their Own Show",
    description: "Eight of thirteen pilots score below their show's episode average, by 1.6 points on the whole. Broad City's pilot is tied for its worst episode. Fleabag's scores 100.",
    date: '2026-10-21',
    category: 'Analysis',
    content: `
A pilot has to introduce every character and the premise before it can be funny about them. The scores show the cost. Eight of our thirteen pilots land below their own show's episode average.

## The pilots that lag

| Show | Pilot | Show average | Gap |
|---|---:|---:|---:|
| Broad City | 72.1 | 87.2 | −15.1 |
| The Office | 81.4 | 88.0 | −6.6 |
| 30 Rock | 92.5 | 97.1 | −4.6 |
| Freaks and Geeks | 77.9 | 80.5 | −2.6 |
| The Larry Sanders Show | 84.6 | 87.1 | −2.5 |
| Parks and Recreation | 89.4 | 91.9 | −2.5 |
| Veep | 92.1 | 93.7 | −1.6 |
| Seinfeld | 93.0 | 94.3 | −1.3 |

Broad City's pilot is tied for the lowest-scoring episode the show ever made. The Office's sits 6.6 points under the show's average: a close adaptation of the British original, made before the American cast had found its own rhythm.

## The pilots that arrive fully formed

| Show | Pilot | Show average | Gap |
|---|---:|---:|---:|
| Fleabag | 100 | 95.7 | +4.3 |
| Arrested Development | 98.9 | 94.9 | +4.0 |
| Flight of the Conchords | 96.0 | 92.9 | +3.1 |
| Chappelle's Show | 98.0 | 95.2 | +2.8 |
| Schitt's Creek | 89.6 | 88.0 | +1.6 |

Three of these five came in with material already developed elsewhere: Fleabag was a stage show, Flight of the Conchords a touring act and radio series, and Chappelle a working stand-up building sketches around his own voice.

## It is the first episode, not premieres in general

Later season premieres carry no penalty. Across 67 seasons of six or more episodes, the opening episode scores 0.5 points *above* its season's average. The problem is specific to episode one of the whole series, when the show has to explain itself.

*Covers the 13 shows scored on our current model.*
`,
  },
  'callbacks-score-higher': {
    title: "Callbacks Beat a Show's Other Jokes, in All 13 Shows",
    description: "22% of the 84,211 jokes on our current model are callbacks. They average 7.59 craft and 7.57 impact against 7.39 and 7.25 for everything else, and the gap holds in every show.",
    date: '2026-10-14',
    category: 'Data Science',
    content: `
When our scorer reads an episode it flags each joke that pays off something set up earlier. Across the 13 shows on our current model that is 18,579 of 84,211 jokes, or 22%.

Those jokes score higher than the rest:

| | Craft | Impact |
|---|---:|---:|
| Callbacks | 7.59 | 7.57 |
| Everything else | 7.39 | 7.25 |

A third of a point on impact is a large gap on a scale where whole shows are separated by less. It also holds in every one of the 13 shows. There is no show where callbacks score worse than its other jokes.

## Who uses them most

- **Seinfeld:** 33.1% of jokes
- **Arrested Development:** 30.4%
- **Chappelle's Show:** 22.8%
- **The Larry Sanders Show:** 22.4%
- **Flight of the Conchords:** 22.2%
- **The Office:** 19.9%
- **Fleabag:** 19.6%
- **Parks and Recreation:** 18.5%
- **Broad City:** 18.1%
- **30 Rock:** 17.7%
- **Freaks and Geeks:** 17.2%
- **Schitt's Creek:** 16.7%
- **Veep:** 15.7%

Seinfeld and Arrested Development are the two shows built on plots that collide in the final act, so a third of their jokes are payoffs by design.

## Where they help most, and least

The callback advantage is biggest in The Larry Sanders Show, Seinfeld and Freaks and Geeks, where a callback beats the show's other jokes by about two thirds of a point on combined craft and impact. It is smallest in Chappelle's Show (0.12) and 30 Rock (0.24). A sketch resets every few minutes, so there is less to call back to, and 30 Rock's ordinary jokes already score so high that there is little room above them.

## One caution

Part of this is built into the rubric. Structure is one of the five craft dimensions, and a joke that pays off a setup is structurally stronger by definition. The scorer also knows it is looking at a callback when it scores one. The impact gap is the more telling number, since impact is scored on how the line lands, not on how it was built.

*Covers the 13 shows scored on our current model.*
`,
  },
  'which-joke-types-score-highest': {
    title: "Dark Jokes Score Highest. Reaction Shots Score Lowest.",
    description: "We tag every joke by type. Dark and subversive jokes average 7.73 craft and 7.75 impact. Reaction beats average 7.13 and 6.95. Cringe comedy sits below the overall average.",
    date: '2026-10-07',
    category: 'Data Science',
    content: `
Every joke we score is tagged with one or more types: absurdist, deadpan, wordplay, cringe and so on. With 84,211 jokes on our current model, the types can be ranked against each other.

The average joke scores 7.44 on craft and 7.32 on impact. Here is how each type compares.

| Type | Share of jokes | Craft | Impact |
|---|---:|---:|---:|
| Dark / subversive | 10.7% | 7.73 | 7.75 |
| Escalation | 10.1% | 7.59 | 7.64 |
| Misdirection | 4.6% | 7.61 | 7.58 |
| Absurdist | 13.6% | 7.61 | 7.53 |
| Meta / self-referential | 2.0% | 7.63 | 7.53 |
| Setup and punchline | 11.4% | 7.54 | 7.52 |
| Wordplay | 3.6% | 7.51 | 7.39 |
| Character comedy | 73.8% | 7.44 | 7.30 |
| Running gag | 3.6% | 7.37 | 7.29 |
| Deadpan | 22.2% | 7.44 | 7.24 |
| Physical | 2.7% | 7.07 | 7.16 |
| Cringe | 9.7% | 7.22 | 7.15 |
| Visual gag | 2.9% | 7.25 | 7.15 |
| Irony and sarcasm | 18.6% | 7.31 | 7.12 |
| Awkward silence | 1.0% | 7.26 | 7.03 |
| Observational | 5.3% | 7.23 | 7.02 |
| Reaction beat | 5.9% | 7.13 | 6.95 |

A joke can carry more than one tag, so the shares add up to more than 100%.

## What the top of the table has in common

Dark jokes, escalation and misdirection all depend on surprise. The line goes somewhere the audience did not expect, or further than they expected. Those are the jokes the scorer rates highest on both dimensions.

## What the bottom has in common

Observational jokes, sarcasm and reaction beats confirm something the audience already sees. They are reliable and they are the connective tissue of most sitcoms, but they rarely produce the biggest laugh in a scene.

Cringe comedy is below average on both measures. That matters for one show in particular: discomfort is The Office's signature, and it is one reason the show sits in the lower half of the board on per-joke scores.

## The caveat that matters here

We score from transcripts. Physical comedy, visual gags, silences and reaction shots are exactly the jokes a transcript captures worst, and all four are in the bottom half of this table. Some of that is real and some of it is the limit of reading a script instead of watching a screen. Treat the ranking of the spoken types as solid and the ranking of the unspoken ones as a floor.

*Covers the 13 shows scored on our current model. Callbacks are tracked separately and get their own post.*
`,
  },
  'after-the-creator-left': {
    title: "Two Shows Lost Their Creators. Both Scored Higher Afterward.",
    description: "Veep averages 92.4 under Armando Iannucci and 95.5 after him. Seinfeld averages 93.6 with Larry David and 96.4 in the two seasons after he left. The reasons are different.",
    date: '2026-09-30',
    category: 'Analysis',
    content: `
Two shows on our board changed hands partway through. Armando Iannucci left *Veep* after Season 4, and Larry David left *Seinfeld* after Season 7. The usual story is that a show declines when its creator goes. On joke scores, neither did.

## Veep

| Era | Episodes | Humor Index | Craft |
|---|---:|---:|---:|
| Seasons 1 to 4 (Iannucci) | 38 | 92.4 | 7.48 |
| Seasons 5 to 7 (Mandel) | 27 | 95.5 | 7.64 |

Season by season: 91.2, 92.0, 92.5, 93.8, 93.6, 95.5, 98.2. The first season under David Mandel held level and the last two climbed. Craft per joke rose with it, so this is the writing scoring higher, not just more of it.

## Seinfeld

| Era | Episodes | Humor Index | Craft | Jokes/min |
|---|---:|---:|---:|---:|
| Seasons 1 to 7 (with David) | 126 | 93.6 | 7.47 | 3.35 |
| Seasons 8 and 9 | 42 | 96.4 | 7.50 | 4.25 |

Here craft barely moves. What changes is density: the last two seasons tell 27% more jokes per minute. That fits how those seasons are usually described, as faster and broader. On our index, more jokes at the same quality is a higher score.

## What this does and does not show

It does not show that either creator was holding the show back. Most shows on our board score higher late than early, with or without a change at the top, so some of this is simply a writers' room that knows its characters. What it does show is narrower: on jokes alone, neither show fell off when its creator left, and Veep's final season is its best.

Whether the later seasons are *better television* is a different question, and it is not one a joke score can answer.

*Covers the 13 shows scored on our current model. Seinfeld's Season 9 figure is 20 scored episodes; the finale and the clip shows are not in the dataset.*
`,
  },
  'the-office-after-michael': {
    title: "The Office After Michael: Season 8 Dipped, Season 9 Recovered",
    description: "The Office averages 88.3 with Michael Scott and 87.0 without him. Season 8 is the show's second-lowest at 85.9. Season 9, at 88.1, matches the series average.",
    date: '2026-09-23',
    category: 'Deep Dive',
    content: `
Steve Carell left The Office at the end of Season 7. The common view is that the show never recovered. The joke scores say something more specific: it had one weak season and then returned to its own average.

## The numbers

| Era | Episodes | Humor Index | Craft | Jokes/min |
|---|---:|---:|---:|---:|
| Seasons 1 to 7 | 138 | 88.3 | 7.25 | 3.25 |
| Seasons 8 and 9 | 45 | 87.0 | 7.19 | 3.36 |

A gap of 1.3 points, almost all of it from Season 8.

- **Season 8:** 85.9, the lowest of any full season and second-lowest overall after the six-episode first season (83.9)
- **Season 9:** 88.1, level with the series average of 88.0

## The post-Michael episodes hold their share of the top

The last two seasons are a quarter of the show's episodes. They supply 10 of its top 50, including "Andy's Ancestry" (94.8), the finale (94.2) and "Stairmageddon" (93.4). That is a little under their share, not a collapse.

## What changed

The writers' response to losing their lead was volume. Jokes per minute went up, from 3.25 to 3.36, while craft per joke slipped from 7.25 to 7.19. Michael Scott is in 36% of every joke the show ever told, and no single character replaced that. The jokes got spread across the ensemble, and in Season 8 they got slightly worse on the way.

## Why this disagrees with the audience

IMDb episode ratings average 7.4 for Season 8 and 7.7 for Season 9, against 8.0 to 8.4 for Seasons 2 through 7. Season 8 is also the only season where IMDb ratings and our scores move in opposite directions. Viewers were rating a show that had lost the character they cared about. We are scoring whether the jokes are well built and whether they land. Both can be true at once: the show can be measurably almost as funny and noticeably less loved.

*Scores are from the September 2026 rescore of all 183 episodes.*
`,
  },
  'what-the-rescore-changed': {
    title: "Why Some Scores Jumped Ten Points",
    description: "The Office went from 79.4 to 88.0 without a single episode changing. We moved to a newer scoring model that finds more jokes and rates them higher, and we are rescoring every show on it.",
    date: '2026-09-16',
    category: 'Methodology',
    content: `
If you have been following the leaderboard, you have seen shows move by ten points or more overnight. Nothing about the shows changed. The scorer did.

## What happened

The model we used to score the first batch of shows was retired by its provider in June. Everything scored since then runs on its successor, and every episode is now scored three separate times and averaged. We are working back through the earlier shows and scoring them again the same way.

Each show that has been through it moved up:

| Show | Before | After |
|---|---:|---:|
| Veep | 79.9 | 95.1 |
| Parks and Recreation | 77.8 | 91.9 |
| The Larry Sanders Show | 76.5 | 86.8 |
| The Office | 79.4 | 88.0 |

## Why the numbers went up

Two things, in the same direction.

**The new model finds more jokes.** On The Office it identified 13,529 jokes where the old one found 9,896, an increase of 37% on identical transcripts. Most of the additions are quieter beats the earlier model read past: a dry aside, a reaction, a throwaway line.

**It rates the jokes higher.** Average craft and impact both sit several tenths of a point above where the old model put them.

Three-run averaging does not raise scores, but it does make them steadier. Our own test-retest study found a single run was mostly noise at the episode level. Averaging three cuts that substantially.

## What this means for reading the site

A score from the old model and a score from the new one are not on the same scale. A show sitting at 78 that has not been rescored is not worse than a show at 90 that has. It has not been measured the same way yet.

Until a show has been rescored, read its number against its own episodes and seasons, where the comparison is still fair, and not against shows that have already moved.

## What we would do differently

We should have kept a fixed set of reference episodes from the start and rescored them every time anything changed, so the size of a shift like this could be measured the day it happened. We have that set now.
`,
  },
  'first-season-is-the-worst': {
    title: "The First Season Is Usually the Worst",
    description: "Of the ten shows on our board with three or more seasons, seven have their lowest score in Season 1. Six have their highest in the final season.",
    date: '2026-09-09',
    category: 'Analysis',
    content: `
Ten of the shows on our current model ran three seasons or more. In seven of them, Season 1 is the lowest-scoring season.

| Show | Season 1 | Best season | Gain |
|---|---:|---:|---:|
| Veep | 91.2 | 98.2 (S7) | +7.0 |
| The Office | 83.9 | 90.4 (S3) | +6.5 |
| Broad City | 82.5 | 88.9 (S5) | +6.4 |
| Seinfeld | 91.0 | 96.8 (S9) | +5.8 |
| Parks and Recreation | 88.4 | 93.9 (S7) | +5.5 |
| 30 Rock | 94.5 | 98.9 (S7) | +4.4 |
| Schitt's Creek | 85.4 | 89.0 (S3) | +3.6 |

The three exceptions are close calls or special cases. The Larry Sanders Show's second season is 0.2 below its first, which is a tie. Arrested Development's lowest is its fifth, made fifteen years after its first. Chappelle's Show's lowest is its third, which is three episodes assembled after its star had left.

## And the last season is often the best

Six of the ten peak in their final season: 30 Rock, Veep, Seinfeld, Parks and Recreation, Broad City and The Larry Sanders Show. The idea that sitcoms run out of steam does not show up in joke scores. On this board, most shows were still getting funnier when they stopped.

## Why first seasons lag

A first season is spent finding out what the show is. The writers do not yet know which characters are funniest together, and the audience does not yet know the characters well enough for character jokes to land. Both problems fix themselves with time, and the scores rise as they do.

## A caution on sample size

Several of these first seasons are short. The Office and Parks and Recreation each had six episodes, and Seinfeld had five. A short season can be pulled around by one weak episode. But the pattern holds for the full-length first seasons too: 30 Rock, Broad City and Schitt's Creek all open with their lowest year.

*Covers the 13 shows scored on our current model. Shows with one or two seasons are left out.*
`,
  },
  'parks-improved-every-season': {
    title: "Parks and Recreation Improved Every Single Season",
    description: "Seven seasons, seven increases: 88.4, 90.4, 91.5, 92.1, 92.6, 92.8, 93.9. No other show on our board with three or more seasons does it.",
    date: '2026-09-02',
    category: 'Analysis',
    content: `
Parks and Recreation is the only show on our board with three or more seasons that never had a down year.

| Season | Episodes | Humor Index | Craft |
|---|---:|---:|---:|
| 1 | 6 | 88.4 | 7.34 |
| 2 | 24 | 90.4 | 7.34 |
| 3 | 16 | 91.5 | 7.42 |
| 4 | 22 | 92.1 | 7.47 |
| 5 | 22 | 92.6 | 7.47 |
| 6 | 20 | 92.8 | 7.49 |
| 7 | 12 | 93.9 | 7.54 |

Every other long-running show here dips somewhere. 30 Rock slips in its third season, Veep in its fifth, and Seinfeld four times. Parks goes up seven times out of seven.

## Where the improvement comes from

The gain is in craft. Jokes per minute are flat after Season 2, hovering around 3.0 to 3.2. Average craft per joke climbs from 7.34 to 7.54, which is a large move on a scale where the whole board fits inside 0.7 points.

That matches the show's history. The first season is six episodes of a different, sharper-edged show. The second season rebuilt Leslie Knope into someone the other characters respect, and from there the writers kept finding more specific things for each member of the ensemble to be funny about.

## The floor

Across 122 scored episodes, the lowest is 83.8. The show's worst half hour still scores higher than the average Freaks and Geeks episode.

## The size of the steps

The later increases are small: 0.5 from Season 4 to 5, and 0.2 from 5 to 6. Gaps that size are inside our noise floor, so the fair statement is that the show rose sharply for three seasons, held a high plateau for three more, and finished on its best year.

*Covers the 13 shows scored on our current model.*
`,
  },
  'arrested-development-netflix-seasons': {
    title: "Arrested Development on Netflix: The Jokes Held Up. There Were Fewer of Them.",
    description: "The Fox seasons average 95.8 and the Netflix seasons 93.2. Craft per joke is almost unchanged (7.67 against 7.61). Jokes per minute fell by 21%.",
    date: '2026-08-26',
    category: 'Analysis',
    content: `
Arrested Development ran three seasons on Fox, then came back on Netflix seven years later for two more. The revival seasons have a poor reputation. The joke scores agree that they are weaker, and they are specific about why.

| Era | Episodes | Humor Index | Craft | Jokes/min |
|---|---:|---:|---:|---:|
| Fox, Seasons 1 to 3 | 53 | 95.8 | 7.67 | 3.27 |
| Netflix, Seasons 4 and 5 | 31 | 93.2 | 7.61 | 2.58 |

## The writing did not get worse

Craft per joke moves from 7.67 to 7.61. That is a difference of six hundredths of a point, well inside the noise. When a joke arrives in the Netflix seasons it is as well built as it was on Fox.

## There is just less of it

Jokes per minute fall from 3.27 to 2.58, a drop of 21%. The Netflix episodes are longer, and the extra running time is not filled with extra jokes. The original run was famous for how much it packed into 22 minutes. Without a broadcast clock forcing the edit, the density went.

## Season by season

- **Season 1:** 95.5
- **Season 2:** 95.6
- **Season 3:** 96.8
- **Season 4:** 94.5
- **Season 5:** 92.1

The third season, cut short at 13 episodes, is the show's best. The fourth holds up better than its reputation: 94.5 would be the top season of most shows on our board. The fifth is the real drop, and it is the show's lowest.

## What this leaves out

The complaints about Season 4 were mostly about structure: one character per episode, the cast rarely in a room together. A joke score does not measure that. It measures whether the lines are funny, and on that narrower question the revival lost pace, not quality.

*Covers the 13 shows scored on our current model.*
`,
  },
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
