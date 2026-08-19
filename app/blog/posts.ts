export const POSTS: Record<string, {
  title: string;
  description: string;
  date: string;
  category: string;
  content: string;
}> = {
  'density-vs-craft': {
    title: "Two Shows Tell Exactly the Same Number of Jokes Per Minute. One Scores 16 Points Higher.",
    description: "Fleabag and The Simpsons both average 3.46 jokes per minute. They are 16.8 Humor Index points apart. Across 13 canonically-scored shows, craft predicts 91% of the final score and joke density predicts 8% \u2014 and the two are almost unrelated to each other.",
    date: '2026-08-19',
    category: 'Data Science',
    content: `
Two shows on the Humor Index tell jokes at exactly the same rate.

*Fleabag* fires 3.46 jokes per minute. *The Simpsons* fires 3.46 jokes per minute. Same number, to two decimal places, across 12 episodes and 552 episodes respectively. If joke density were the thing that made a comedy funny, these two would be neighbours on the leaderboard.

Fleabag scores **95.8**. The Simpsons scores **79.0**.

That is a 16.8-point gap between two shows telling the identical volume of jokes — and it is the cleanest illustration we have of something the data has been saying for months. **Joke density is a quarter of the Humor Index and it decides almost nothing.**

## The setup

Every show on this site gets a Humor Index built from four components: craft (40%), impact (35%), peak density (15%) and weighted jokes-per-minute (10%). Density, in other words, is a quarter of the score by design. It is not a rounding error in the formula. We built it in deliberately, because a comedy that makes you laugh twice an hour is not doing the same job as one that makes you laugh twice a minute.

So the question is not *whether* density counts. It is: across real shows, does it ever decide anything?

## It does not

Take the 13 shows currently scored on our canonical model — one scoring run, one scale, no cross-model contamination:

- **Craft vs Humor Index: r = 0.96.** Craft alone predicts 91% of the variance in the final score.
- **Jokes-per-minute vs Humor Index: r = 0.28.** Density predicts 8%.
- **Craft vs jokes-per-minute: r = 0.13.** The two are, for practical purposes, unrelated to each other.

That third number is the important one. If dense shows also happened to be well-written shows, density would look like it mattered when it was really craft wearing a disguise. It does not happen. Writing more jokes and writing better jokes are close to statistically independent activities.

Run the same three correlations across all 21 scored shows and you get r = 0.97, r = 0.36 and r = 0.26 — same story, slightly louder.

## The two natural experiments

The clean way to see this is to find shows that hold density constant and let craft vary. We have two exact ties, and both fall entirely among canonically-scored shows:

| Jokes/min | Show | Craft | Humor Index |
|---:|---|---:|---:|
| 3.52 | 30 Rock | 7.67 | **97.4** |
| 3.52 | Broad City | 7.16 | **86.9** |
| 3.46 | Fleabag | 7.62 | **95.8** |
| 3.46 | The Simpsons | 6.92 | **79.0** |

Identical joke rates. Ten-and-a-half points apart in the first pair, nearly seventeen in the second. In both cases the entire gap is carried by craft and the impact score that moves with it.

Now run it the other way. *Flight of the Conchords* averages 2.47 jokes per minute, one of the sparsest shows we score. The Simpsons averages 3.46, or **40% more jokes in every minute of television**. Conchords scores 92.0 and finishes #7. The Simpsons scores 79.0 and finishes #16.

That pair is not a controlled comparison — Conchords also out-crafts The Simpsons by 0.66, which is most of the available range, and by the exchange rate below that alone would account for the gap. Which is the point. When density and craft pull in opposite directions, craft wins so decisively that the density difference never surfaces.

## The exchange rate

Fit a line through the canonical 13 and you can price the two inputs directly:

- **One tenth of a point of craft is worth about 2.3 Humor Index points.**
- **One additional joke per minute — for the entire run of the show — is worth about 3.9.**

So a tenth of a craft point costs you roughly 0.6 jokes per minute to replace. That is one extra joke every hundred seconds, in every episode, forever, just to break even with a writers' room that got marginally sharper.

And here is the part that makes the exchange rate bite: **nobody has that much craft to trade.** Across the canonical 13, craft runs from 6.92 to 7.67 — a **0.75-point band** on a ten-point scale. Density over the same 13 runs from 2.16 to 3.57, a 1.65x spread. Widen to all 21 shows and craft still only spans 0.92 while density spans 2.7x. Whichever set you use, the variable with the enormous range is the one that does not move the needle, and the variable that decides everything sits inside a band of about 13%.

That is not a quirk of our formula. It is a statement about the ceiling of the craft: television comedy writing is a narrow, brutally competitive skill where the distance between the best room we have measured and a perfectly respectable one is three quarters of a point. Priced at 23.5 points per craft point, that 0.75 is worth **17.6 Humor Index points** — more than the entire canonical density range (1.41 jokes per minute) can buy at 3.9 points each, which is 5.5.

## A show that ran the experiment on itself

The cross-show version of this always invites the objection that we are comparing incomparable things. So here is the within-show version, one show, one scale, one writers' room.

*It's Always Sunny in Philadelphia* did not get denser as it went on. The cult era (Seasons 1–7) averages 1.77 jokes per minute. The renaissance era (Seasons 13–17) averages 1.70. That difference is not statistically meaningful — the two eras tell jokes at effectively the same rate.

The renaissance era scores 3.1 points higher, and that gap *is* significant.

Same five leads, same core writers, same joke rate, better show. Whatever Sunny learned over fifteen years, it wasn't to talk faster.

## What this means if you make comedy

The instinct in a room under pressure is to add jokes. More passes, more alts, more punch-ups, higher density. The data says that instinct is a bad trade at the margin.

Hold quality fixed and density does pay: run craft, impact and jokes-per-minute into the score together and each additional joke per minute is worth about 2.5 Humor Index points. It is not nothing. But the *available* range on density inside a single show's identity is small, and the range on craft, though narrower in raw units, is priced twenty-three points to the unit. Moving a tenth of a point on craft — 2.3 points — takes six-tenths of a joke per minute to match. Sustained, every episode, forever.

Volume is the cheap lever. It is cheap because there is so little of it left to buy.

## What we still cannot see

The usual caveats, and one specific to this post:

- **We read dialogue.** Density is measured on scripted, spoken jokes. Shows that work visually — The Simpsons above all — are undercounted on *both* axes, not just one, so the comparison is fairer than it looks but still not perfect.
- **Craft and impact move together** (r = 0.95 across all 21, 0.90 across the canonical 13), so "craft explains the index" is substantially "the two quality dimensions explain the index." They are 75% of the formula between them. We are not claiming craft beats impact; we are claiming both of them beat density, comfortably.
- **We correlated the wrong density number, strictly speaking.** The formula's density quarter is peak density (15%) plus *weighted* JPM (10%). What we have published per show, and what is used above, is plain average JPM. Peak density is not in our public data, so the component carrying the larger share of the density weight is untested here. If peak density behaves very differently from average density, this finding would need revisiting — though it would be a strange result, since the two are mechanically related.
- **This is a formula we built.** Craft is 40% of the Humor Index because we decided it should be, so "craft predicts the index" is partly true by construction and we are not pretending otherwise. The finding that is *not* baked in: density, which we deliberately gave a quarter of the score, ends up sorting nobody — because real shows vary 2.7x in density and 13% in quality, and the 13% is where all the separation lives. That is a fact about comedy, not about our weights.
- **Thirteen data points.** The exchange rate is an ordinary least-squares line through 13 shows, on an outcome that craft is an input to. Read it as a description of this board, not as a causal estimate of what happens if a writers' room gets sharper.

The jokes-per-minute number stays on every show page. It is genuinely interesting — it tells you what kind of comedy you are about to watch, machine-gun or slow-burn. It just will not tell you whether it is any good.

*Scale note: 13 of our 21 shows have been rescored on the current canonical model, and the headline correlations, both natural experiments and the exchange rate above use only those 13. Eight shows — The Office, Friends, Curb Your Enthusiasm, It's Always Sunny, Community, Futurama, Taxi and The Fresh Prince of Bel-Air — are still on the pre-2026 scale. The Sunny era comparison is internal to one show scored one way, so the mixed scale does not affect it.*`,
  },
  'futurama-launch': {
    title: "Futurama Out-Scores the Show It Roasted",
    description: "We scored 137 episodes of Futurama — 1999 to 2025, 8,900 jokes. It lands at 77.8 (#18 of 21) despite the highest joke density on the board, and yes, it outranks the Friends episode Lrrr made fun of.",
    date: '2026-06-14',
    category: 'Show Launch',
    content: `
In a 2002 episode of *Futurama*, an alien warlord named Lrrr settles in to watch an episode of *Friends*, grows visibly confused, and asks the only question that makes sense to him: **"Why does Ross, the largest friend, not simply eat the other five?"**

Twenty-two years later, we scored that joke. It landed a **9.0 for impact and a 9.5 for quotability** — one of the highest-rated lines in the entire series.

Then we scored *Friends* too. It sits at **73.2** on the Humor Index. Futurama — the show that paused, mid-episode, to mock it — comes in at **77.8**. The robot won. (Both shows are scored on the same pre-2026 scale, so that's a clean head-to-head.)

We ran **137 episodes** of Futurama through our pipeline — the 1999 Fox debut through the 2025 Hulu revival, **8,900 jokes** in total, each graded three times and averaged for consistency. Here's what the data says.

> **Correction, August 2026.** This post originally reported 170 episodes and 11,042 jokes. It was wrong. Futurama had been ingested twice under two different season-numbering schemes — the Comedy Central numbering and the streaming numbering — and 33 episodes were sitting in the database twice, scored separately, inflating the joke total by about 2,100 and pulling the show score down slightly. We found it on 2026-08-19, removed the duplicates, and re-ran the aggregates. The show moved from 77.6 to **77.8**; every figure below is the corrected one. Thirty-three episodes of the original run were never ingested at all, which is why 137 and not 170 — they are on the list to be scored.

## The headline number

Futurama scores **77.8**, which puts it **#18 of the 21 shows** we've scored — slotting between Community (77.9) and Taxi (77.4). A lower-table finish for a show whose reputation rests as much on heartbreak as on punchlines, and one worth reading carefully: Futurama has the **highest joke density on the entire board** at 3.83 jokes per minute. Volume is not what the index rewards.

It comes with the caveat we always make for animation: our scoring reads dialogue, so Futurama's dense visual comedy — Bender's sight gags, the background signage, the throwaway alien designs — goes largely uncounted. The 77.8 is a floor, not a ceiling.

## The real story: the revival held up

The Hulu revival (2023–2025) holds up far better than revivals usually do — though "statistically indistinguishable," which is what an earlier version of this post claimed, was too strong.

Across the 107 scored episodes of the original run (1999–2013), the show averaged **6.85 craft** and **6.57 impact**. Across the 30 revival episodes: **6.80 craft** and **6.47 impact** — a 0.05 gap in craft, a 0.10 gap in impact. Per joke, that is very nearly the same show.

At the episode level the gap is wider: the original run averages **78.6**, the revival **75.2**, and the middle revival season (73.0) is the weakest Futurama has ever had. So the honest verdict is not "no decline." It is that the revival gave up about three points of Humor Index while holding its per-joke writing quality almost exactly steady — which is still a far better outcome than most revivals manage. The revival's two best episodes score 81.9 and 81.4, landing at ranks 28 and 31 of 137 — upper quartile, comfortably above the series median of 78.1, but not among the show's all-time best.

## The single best joke is 24 years old

Of all 8,900 jokes, exactly one earned a perfect **10.0 for impact and 10.0 for quotability**: Zapp Brannigan's account of his military strategy in Season 1's "Love's Labours Lost in Space."

> "You see, killbots have a preset kill limit. Knowing their weakness, I sent wave after wave of my own men at them until they reached their limit and shut down."

It's sci-fi-specific absurdity that doubles as a perfect joke about bureaucratic incompetence — the exact register Futurama lives in better than any other show on the index.

## A few more for the highlight reel

- **"Shut up and take my money!"** — Fry. The line that escaped the show entirely and became a permanent piece of internet vocabulary.
- **"When you do things right, people won't be sure you've done anything at all."** — the God-entity in "Godfellas," the franchise's most quietly profound line.
- **"I'd always whisper 'except one.' Fry was that one — and I never told him so."** — Bender, in "The Sting."
- **"She's built like a steak house, but she handles like a bistro."** — Zapp Brannigan, naturally.

## Why this is the Humor Index thesis in one show

137 episodes. Four eras. Twenty-six years. Two networks and a streamer. And across all of it, the per-joke writing quality barely moved — 6.85 craft in the Fox and Comedy Central years, 6.80 in the Hulu return, twenty-four years apart.

That's the whole idea behind what we do here: great comedy isn't a lightning strike, it's a craft — and craft is repeatable. Futurama is the proof.

**See the full breakdown — every episode, every season, scored — on the [Futurama show page](/shows/futurama).**

*Scale note: 13 of our 21 shows have been rescored on the current canonical model. Eight — The Office, Friends, Curb Your Enthusiasm, It's Always Sunny, Community, Futurama, Taxi and The Fresh Prince of Bel-Air — are still on the pre-2026 scale and will move when they're rescored. Comparisons that mix the two are flagged where they appear.*
`,
  },
  'the-simpsons-all-20-seasons': {
    title: "We Scored All 20 Seasons of The Simpsons. The Golden Age Is Real — and the Decline Is Smaller Than You Think.",
    description: "All 441 episodes and 28,170 jokes, scored. The golden age is statistically real — Season 6 peaks at 82.5 — but the post-classic decline is gentler than the memes: seasons 11–20 never drop below 77.6, and the single highest-scoring episode is from Season 16.",
    date: '2026-06-09',
    category: 'Analysis',
    content: `
![The Simpsons — Humor Index 79.0](/blog/simpsons-hero.png)

We just finished the biggest single ingest in Humor Index history: **all 20 seasons of *The Simpsons*. 441 episodes. 28,170 individual jokes**, each one read, rated for craft and impact, and folded into one number.

That number is **79.0** — which places the show **#16 of the 21** we've scored, a mid-table finish that surprises people. But the headline score was never the interesting part. The interesting part is what happens when you line up two decades of the show season by season and let the data settle a thirty-year-old argument: *when, exactly, did The Simpsons fall off?*

The short version: it didn't fall off a cliff. It stepped down a few stairs and then stood there, still funny, for another decade.

## The golden age isn't nostalgia. It's in the numbers.

![Humor Index by season, S1–20](/blog/simpsons-season-curve.png)

Fans have argued for years that seasons four through eight are the show's peak. The data agrees, almost to the season. The Humor Index is jumpy early — Season 2 already touches 80.1 before Season 3 falls back to 77.2 — then locks in: **Season 4 (81.2)**, and a peak at **Season 6 — 82.5**, the highest any season scores across the entire run. Seasons 4 through 8 never drop below 80.1.

It's not a coincidence that this window holds the densest concentration of all-timers: *Treehouse of Horror V* (92.2), *Who Shot Mr. Burns?* (90.8) and *Homer's Enemy* (90.8) are ranks 4, 5 and 6 of all 552 episodes. (*You Only Move Twice*, which usually makes these lists, scores 79.0 — dead average by our metric. Hank Scorpio is a character triumph more than a joke-density one.) When craft and impact are both running this hot for this long, you get a golden age. Ours is a translucent gold band on the chart above, and it earns its color.

## The "Zombie Simpsons" decline is real — and gentler than the memes claim.

Here's where the data pushes back on the internet.

The drop is real. After Season 8 the line bends down, and it bottoms out at the classic era's floor: **Season 10 — 76.4**. If you stopped reading the chart there, you'd have your tidy "it died at the millennium" narrative.

But the line doesn't keep falling. It *recovers*. Seasons 11 through 20 settle into a remarkably stable band — never dropping below 77.6, drifting back up toward **78.2–78.6 across Seasons 13–15**, and closing out Season 20 at a perfectly respectable 78.4. Across ten "post-classic" seasons, the show's worst year is still funnier than the average sitcom's best.

That's the part the "Zombie Simpsons" crowd skips. The show stopped being *transcendent*. It never stopped being *good*.

## The plot twist: the single best episode is from Season 16.

![Top-scoring episodes](/blog/simpsons-top-episodes.png)

If the golden age were the whole story, every top-scoring episode would come from the mid-90s. It doesn't.

The highest-scoring single episode in the entire 441-episode run is **"The Father, the Son, and the Holy Guest Star" — Season 16, a 93.2.** Third on the board sits **"Tales From the Public Domain" (Season 13, 92.5)**, just behind "The Joy of Sect" (Season 9, 92.6). Two of our top three episodes aired *after* the supposed death of the show.

It turns out a great Simpsons episode can show up in any era. The classics just clustered.

## The jokes that scored highest

The elite tier skews exactly where you'd expect — the mid-90s, when the writers' room was operating at a level television rarely reaches:

- **Marge, "You'll always have them to remind you of the time when you were the whole world's special little guy."** (S5) — our single highest-rated joke in the entire series: craft 9.4, impact 9.5.
- **Skinner: "Aurora borealis? At this time of year, at this time of day, in this part of the country, localized entirely within your kitchen?"** (S7)
- **Ralph: "Me fail English? That's unpossible."** (S6)
- **Homer: "To alcohol! The cause of — and solution to — all of life's problems."** (S8)
- **The cardiac doctor: "You've had what we call a cardiac episode. Worst. Episode. Ever."** (S12) — proof the show could still land a perfect meta-joke a decade in.

## The verdict

Twenty seasons. 441 episodes. 28,170 jokes. One Humor Index of **79.0.**

The receipts confirm the legend — Season 6 is the peak, the mid-90s are untouchable — but they complicate the obituary. The Simpsons didn't collapse. It came down off an impossible high and then did something almost as hard: it stayed funny for another ten years.

*Scope note (updated August 2026): this analysis covers Seasons 1–20, the scope we had scored when it was written. Our Simpsons corpus now runs through Season 25 — 552 episodes, 34,957 jokes. The extra five seasons contain the show's true floor (Season 22, 74.8) and don't change the golden-age finding.*

*Scale note: 13 of our 21 shows have been rescored on the current canonical model. Eight — The Office, Friends, Curb Your Enthusiasm, It's Always Sunny, Community, Futurama, Taxi and The Fresh Prince of Bel-Air — are still on the pre-2026 scale and will move when they're rescored. Comparisons that mix the two are flagged where they appear.*
`,
  },
  'fresh-prince-geoffrey-butler': {
    title: "The Funniest Person in the Fresh Prince Mansion Is the Butler",
    description: "We scored all 148 episodes of The Fresh Prince of Bel-Air. Will Smith leads the cast in total Comedy WAR — but only because he says three times as many jokes as anyone else. Per joke, the funniest Banks-household voice is Geoffrey, the butler with under four lines an episode and the sharpest one in the room.",
    date: '2026-06-07',
    category: 'Analysis',
    content: `
The Fresh Prince of Bel-Air joined the Humor Index this week — all 148 episodes, 8,222 jokes, six seasons of West Philadelphia energy crashing into a Bel-Air mansion. The show lands at a Humor Index of **76.0** — 20th of the 21 shows we've scored, which is a low finish for a broad multi-cam sitcom built around a movie star who hadn't made movies yet, and one the caveat at the bottom of this post should temper.

But the show-level score isn't the interesting finding. The interesting finding is *who* is carrying the comedy — and it isn't who the opening credits say it is.

## Will Smith leads the cast. He also drags it down per-joke.

Here's the cast ranked by total Comedy WAR — our wins-above-replacement stat, which rewards both how many jokes a character lands and how good those jokes are:

- **Will** (Will Smith) — WAR 275.3 · 3,839 jokes
- **Carlton** (Alfonso Ribeiro) — WAR 254.2 · 1,245 jokes
- **Philip / Uncle Phil** (James Avery) — WAR 177.5 · 834 jokes
- **Hilary** (Karyn Parsons) — WAR 162.8 · 675 jokes
- **Geoffrey** (Joseph Marcell) — WAR 162.1 · 500 jokes

Will wins. Of course Will wins — it's his show, his name in the title, and he says **3,839 jokes**, more than triple anyone else in the house. Volume is a real comedic contribution and WAR counts it.

But WAR is volume *times* quality, and when you pull the two apart, the picture flips. Will's per-joke quality index is **6.63** — the *lowest* of the five leads. And his vs-castmates score — how his jokes rate against everyone else's jokes in the same episode — is **−0.133**. Negative. In the average Fresh Prince episode, the line coming out of Will's mouth is slightly *below* the room average.

That's not a knock on Will Smith. It's the mechanical signature of a lead who is *on screen constantly*, carrying every plot, delivering the connective tissue — the "what's up, big guy" and the "yo, Carlton" and the hundred small lines that move a scene. The star says everything, so the star says a lot of ordinary things.

## The butler is the sharpest voice in the mansion

Now look at the other end of the table. Geoffrey the butler — Joseph Marcell — says only **500 jokes** across the whole series — under four an episode. But:

- His quality index of **6.88** is the **highest of any character on the show.**
- His vs-castmates score is **+0.295** — also the highest in the cast, by a wide margin.

Read that second number carefully. +0.295 means that when Geoffrey speaks, his line rates nearly a third of a point higher than the average joke in that same episode — the single biggest per-line edge of anyone in the household. The butler walks in, delivers one withering aside about the family's nonsense, and walks out, and that one line beats whatever the leads were doing.

This is the dry-sidekick pattern the index keeps surfacing. We just saw it with Rip Torn's Artie out-WARing the host of The Larry Sanders Show. Fresh Prince is the cleaner version of it: the show's funniest-per-joke character is its most peripheral one. Geoffrey exists to puncture the room, and the math says he never missed.

Carlton, for the record, sits in between — 1,245 jokes at quality 6.76, the second-most-valuable character and arguably the show's true comedic engine once you weight for how much heavy lifting the Carlton-dance, the prep-school primness, and the Tom Jones devotion did. But the butler is the efficiency king.

## The season curve, and the recast that didn't matter

Fresh Prince has one of the most-told backstage stories in sitcom history: Janet Hubert, the original Aunt Viv, left after Season 3 amid public tension with Will Smith, and Daphne Maxwell Reid took over for Seasons 4 through 6. Fan lore treats the recast as the moment the show changed.

The Humor Index by season:

- S1: 76.5
- S2: 77.4
- S3: 77.5
- **S4: 77.9 — the peak**
- S5: 75.6
- S6: 72.5

The recast happens going *into* Season 4 — which is the **highest-scoring season the show ever had.** Whatever the off-screen story was, the jokes did not get worse when Aunt Viv changed. They got, fractionally, better, and stayed strong for a full season after.

The actual decline is later and steeper: Seasons 5 and 6, with the finale stretch (S6) falling to 72.5, the show's weakest by a clear margin. The bottom three episodes all live in Season 6, led by the 60.6 of "I, Whoops, There It Is." If you want to know when Fresh Prince ran out of gas, the data points at the very end — not at the recast everyone remembers.

## What we still can't see

The usual caveat, and it matters more for this show than most: we score the words in the subtitle file. Fresh Prince is a *physical* comedy — the Carlton dance, Will's mugging straight into the lens, Geoffrey's slow-burn reaction shots, the door-slam timing of a live multi-cam stage. None of that survives into a transcript. Will Smith's gift was always as much face and body as line delivery, and a dialogue-only model is structurally blind to it. Treat 76.0 as a floor, and treat Will's per-joke number as "per *spoken* joke" — the camera-look tax is real and it falls hardest on the star.

## What's next

Twenty-one shows on the board now, 2,720 episodes, just under 174,000 jokes. The Fresh Prince slots in at #20 — between Taxi (77.4) and Friends (73.2), at the bottom of the table alongside the other shows still waiting on a rescore. The butler, meanwhile, retires undefeated on a per-line basis. Geoffrey would have a withering aside about that, and it would score higher than this sentence.

*Scale note: 13 of our 21 shows have been rescored on the current canonical model. Eight — The Office, Friends, Curb Your Enthusiasm, It's Always Sunny, Community, Futurama, Taxi and The Fresh Prince of Bel-Air — are still on the pre-2026 scale and will move when they're rescored. Comparisons that mix the two are flagged where they appear.*
`,
  },
  'sunny-renaissance': {
    title: "It's Always Sunny Is Better Now Than It Was in 2010 — the Data Says So",
    description: "Fan consensus says peak Sunny is the original FX run — Mac, Charlie, Dennis, Dee and Frank at their cult-comedy sharpest. The Humor Index disagrees. We scored all 177 episodes across 17 seasons; the last five seasons (S13–S17) outscore the first seven (S1–S7) by 3.1 points. Sunny didn't decline. It got meaner — and the dialogue craft followed.",
    date: '2026-05-31',
    category: 'Analysis',
    content: `
Every Sunny fan has the same theory. *Peak Sunny was the FX run. Anything past Season 10 is the gang on autopilot. They should have ended it at 'The Gang Goes to Hell.'*

We just scored every joke in every episode of *It's Always Sunny in Philadelphia* — 8,786 jokes across 177 episodes, three independent AI passes each — and the data tells a different story. **The last five seasons are not a decline. They're the peak.**

## The headline

On the Humor Index, the full series averages **79.2**. The "Renaissance arc" cut — Seasons 13 through 17 — averages **80.4**, +1.2 above the full-series number. The "Cult era" cut — Seasons 1 through 7, the FX heyday — averages **77.3**, –1.9 below. That's a three-point gap between the two halves of the same show. Same five leads. Same writers' room core. Different decade.

Built the cut yourself: [Sunny Renaissance arc (S13–S17) →](/shows/its-always-sunny/explore)

## Season by season

Here's the per-season scoring across all 17 seasons (display HI, with our 95% bootstrap CI on each):

| Season | HI | Episodes | Era |
|---|---:|---:|---|
| **S15** | **82.8** | 8 | Renaissance |
| **S17** | 81.2 | 8 | Renaissance |
| **S09** | 80.8 | 10 | Transition |
| **S14** | 80.0 | 10 | Renaissance |
| **S13** | 79.6 | 10 | Renaissance |
| **S11** | 79.5 | 10 | Late |
| **S12** | 79.1 | 10 | Late |
| **S08** | 79.0 | 10 | Transition |
| **S16** | 78.5 | 8 | Renaissance |
| **S07** | 78.0 | 13 | Cult |
| **S10** | 78.0 | 10 | Transition |
| **S01** | 77.9 | 7 | Cult |
| **S03** | 77.6 | 15 | Cult |
| **S04** | 77.4 | 13 | Cult |
| **S05** | 77.2 | 12 | Cult |
| **S06** | 76.5 | 13 | Cult |
| **S02** | 76.4 | 10 | Cult |

Seven of the top nine seasons are post-S10. **No** Renaissance-era season drops below 78.5; **no** Cult-era season climbs above 78.0. Three of the five Renaissance seasons reach 80 or better; and no Cult season comes closer than two points to it. The cleanest split on the entire show falls right around the mid-2010s. Whatever happened to Sunny in 2015 happened *for the better*, by the numbers.

## So what's actually changed?

The gang got meaner.

This isn't us editorializing — it's what the per-joke scores show. The single biggest gap between early and late Sunny isn't joke density — the two eras tell jokes at effectively the same rate (1.70 per minute in the Renaissance era vs 1.77 in the cult era — a difference well inside run-to-run noise). It isn't run-time. It's **impact** and **dark/subversive** weight. Same joke rate, three more points of Humor Index.

Late-season Sunny leans hard into joke types our model rates higher per beat: *dark/subversive*, *character comedy from sustained malice*, *cringe escalation*, *callbacks that take a full season to detonate*. Early Sunny had to introduce itself — establishing the gang's awfulness in every episode, often with broader, more setup-heavy joke construction. Late Sunny doesn't have to introduce anything. The audience knows. The gang gets to lean directly into the punch.

## The single best episode is a Renaissance episode

The #1-ranked Sunny episode of all 177, by Humor Index, is **"The Gang Goes to Hell (1)" — S11E09, HI 92.8.** Number two is **"The Gang Gets Cursed" — S16E03, HI 91.5.** Number three is **"The Gang Gets Analyzed" — S08E05, HI 91.1** (the closest a pre-S11 episode comes to the top of the list).

Of the top 15 episodes by Humor Index, **eight are S11 or later.** Six come from the pre-S10 era and one from S10 — closer than the season averages suggest, because the cult era's ceiling was always high; it was the floor that moved. The fan-favorite Cult-era classics — *Dennis Looks Like a Registered Sex Offender*, *The Nightman Cometh* — are great episodes. They're just not, on average, the show's best work. (*The Gang Gets Analyzed* is the exception that proves it: at 91.1 it is the third-best episode in the series, and it is from Season 8, after the cult era had already ended.) The show's best work happened after most casual viewers stopped paying attention.

## Where the data could be wrong

We're trying to keep the [honesty receipts](/methodology) updated on this site, so:

- **Single-run scorer noise is real.** Our intraclass correlation between AI passes on the same episode is around 0.28 on individual runs — meaning ~72% of episode-level variance is scorer noise. We pull that down hard with the 3-run consensus we use here, but it's worth flagging.
- **Cluster overlap.** The 95% bootstrap CI on the Renaissance cut is 78.8–81.9. The CI on the Cult cut is 76.1–78.4. They don't overlap, but only just — and they're a lot closer than the three-point gap suggests at a glance.
- **Late-season Sunny rewards rewatch.** A lot of Renaissance joke craft is callbacks ("The Implication" turning up six seasons later, "Wild Card, Bitches!" landing as a payoff). Our scoring credits callback craft. If you've never seen early Sunny, half of S15 is just nonsense.

The picture isn't that "Renaissance Sunny is *funnier*" in some absolute sense — it's that the writing got tighter, the jokes earn more, and the gang's sustained awfulness has had two decades to compound. Whatever your fan theory of when Sunny peaked, the data has a different one. [Build your own cut →](/shows/its-always-sunny/explore)

*Scale note: 13 of our 21 shows have been rescored on the current canonical model. Eight — The Office, Friends, Curb Your Enthusiasm, It's Always Sunny, Community, Futurama, Taxi and The Fresh Prince of Bel-Air — are still on the pre-2026 scale and will move when they're rescored. Comparisons that mix the two are flagged where they appear.*
`,
  },
  'war-reconciliation': {
    title: "We Found a WAR Methodology Drift. Here's What We Fixed.",
    description: "Some shows' WAR was being computed against a higher replacement value than documented. Jerry, AD characters, and Schitt's characters were under-counted by hundreds of points. After applying the documented formula uniformly, the cross-show leaderboard reshuffles \u2014 Jerry overtakes George, and AD's top tier moves up where it belongs. (Both have since been overtaken again as the corpus grew; see the coverage note.)",
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

At the time of this audit we had characters.json files for seven scored shows. (We have 21 today \u2014 see the coverage note at the end.) We back-calculated the implicit replacement value each show's WAR was using.

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
| 3 | George Costanza | Seinfeld | 1,181.9 | 1,181.3 | −0.6 |
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
- Jerry passes Jack and George for the #1 spot cross-show *(as of May 2026; Homer Simpson and Larry David have since passed him)*.
- AD and Schitt's characters move up significantly. Michael Bluth and Moira Rose specifically jump 280-300 points into the top 15.

## Why this matches intuition better — and where it still won't

The AD shift is the one that always bothered me about the old numbers. We published a piece showing that 8 of the top 10 per-joke craft characters in TV comedy came from Arrested Development \u2014 a claim scoped to the six shows scored at the time, and one that no longer survives on a 21-show board. But on the old WAR leaderboard, only one AD character (Michael Bluth at #16) made the top 20. That was a real contradiction in our data — the same characters that were elite per-joke were ranked below Friends supporting players on total WAR. The fix resolves it: AD characters now show up where their craft scores said they should be.

Where the fix won't match every reader's intuition: **Jerry passing George.** Most Seinfeld fans say George is the funnier character. The data supports that on a per-joke basis (George has slightly higher craft AND slightly higher impact). What the data shows is that Jerry, who has 44% more eligible jokes than George (3,800 vs 2,632 after stand-up downweighting), contributes more *aggregate* comedic output. Both are true. Both matter. Which one is "funniest" is a definition question, not a data question.

To make that clearer, we've added a new sort on the [/rankings/funniest-characters](/rankings/funniest-characters) page: **Per-joke Quality**. It ranks by quality_index (the shrunk per-joke score) instead of total WAR. Sort by that, and George tops Seinfeld. Sort by Total WAR, and Jerry tops Seinfeld. The two leaderboards together tell a more honest story than either alone.

## What didn't change

To be very explicit:

- **Per-joke craft and impact scores are unchanged.** Every individual joke's score is identical to what it was yesterday. The fix is in how those scores aggregate to character-level WAR, not in the scores themselves.
- **The methodology was already documented correctly.** This wasn't a methodology change. It was reconciling data files that had drifted from the documented formula. The formula stays the same.
- **The shows that were already correct stayed correct.** Office, Friends, Parks, 30 Rock, and most of Seinfeld saw shifts of less than 10 WAR (rounding-level drift from the league median moving slightly with 30 Rock added).
- **Internal show rankings are unchanged.** Within each show, the same characters are still at the top. Dwight is still #1 on Office. George is still #1 on Seinfeld by per-joke quality. The fix only reshuffles cross-show positions.

## What this means for the published cross-show post

Our original cross-show leaderboard post from May 12 was titled "George Costanza Just Beat Jerry Seinfeld." Under the fix, that title's claim reverses on total WAR. That post has since been retired, along with the other posts built on pre-rescore numbers.

## Lessons learned

Two things we'd do differently:

1. **Verify replacement values consistently when adding shows.** Each show should be exported through the same script with the same replacement constant. We should have caught the AD/Schitt's drift during launch QA. Adding a one-line assertion to the export pipeline will prevent this from recurring.

2. **Publish reproducible methodology code.** The WAR formula is documented in CLAUDE.md and on the methodology page, but the script that computed the characters.json files isn't in the public repo. We'll publish the WAR computation script alongside the data so anyone can reproduce the numbers and catch drift like this earlier.

*Coverage note (updated August 2026): this audit covered the seven shows that had character files at the time — The Office, Seinfeld, Friends, Parks and Recreation, Arrested Development, Schitt's Creek and 30 Rock. We now score 21 shows, and the cross-show WAR leaderboard has moved well past what this post describes: **Homer Simpson (2,323.1) and Larry David (2,306.3) both sit above Jerry, who is now #3.** The formula fix documented above is still correct; the ranking it produced in May 2026 is not the current one. This post was originally titled "Jerry Seinfeld Is Now #1 Cross-Show"; we have changed the title rather than leave a false claim in it.*

*One further caveat this post never carried: the leaderboard below mixes shows scored on two different models. WAR is derived from craft and impact, so the rows drawn from The Office and Friends are not on the same scale as the rows drawn from Seinfeld, 30 Rock, Arrested Development, Schitt's Creek and Parks. Compare within a scale, not across.*

If you want the underlying numbers and re-run the math yourself, the per-show characters.json files are at \`thehumorindex.com/data/{show-slug}/characters.json\`. Every field is documented. Math is yours to check.

---

*Full methodology: [thehumorindex.com/methodology](/methodology). The display scale recalibration on May 14 has since been superseded by the canonical rescore; see [Methodology](/methodology). Questions: hello@thehumorindex.com.*
`,
  },
  'character-comedy-spectrum': {
    title: "Modern Sitcoms Are More Character-Driven Than the Classics",
    description: "Across the 18 shows with joke-type tagging, character_comedy is the most variable axis in our taxonomy — a 47-point spread. Schitt's Creek tells more character-driven jokes than Seinfeld. By a factor of nearly three.",
    date: '2026-05-03',
    category: 'Data Science',
    content: `
Schitt's Creek tells more character-driven jokes than Seinfeld. By a factor of nearly three.

That's not a take. It's what falls out of the data when you tag every joke in every episode by type and add up the columns. Across the eighteen joke categories the Humor Index tracks, the one with the widest spread between shows is **character_comedy** — the type where the punchline depends on *who* said it, not what they said.

Here's the chart that started this post — the full ranking across the 18 shows we've tagged by joke type:

- **Schitt's Creek:** 69.1% (#1)
- **30 Rock:** 62.7% (#2)
- **Arrested Development:** 54.4% (#3)
- **The Office:** 36.7% (#4)
- **Parks and Recreation:** 36.5% (#5)
- **Broad City:** 34.8% (#6)
- **The Simpsons:** 33.3% · **Community:** 31.6% · **The Fresh Prince of Bel-Air:** 31.2% · **Taxi:** 30.7% · **Veep:** 30.5% · **It's Always Sunny:** 30.2% · **Futurama:** 30.0% · **Flight of the Conchords:** 29.2% · **The Larry Sanders Show:** 28.6%
- **Friends:** 26.4% · **Seinfeld:** 24.6% · **Chappelle's Show:** 22.2% (#18)

Forty-seven points between top and bottom. No other axis in our taxonomy comes close — absurdist, the runner-up, spans twenty. **And the ceiling rises with the decade, even though the floor doesn't.** That cuts against the cultural memory of TV comedy, which tends to crown Seinfeld and Friends as the great character comedies of their era. By our measurement, they aren't — at least, not relative to what's been made since.

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

- **Taxi** (1978–1983): 30.7%
- **Seinfeld** (1989–1998): 24.6%
- **The Fresh Prince of Bel-Air** (1990–1996): 31.2%
- **The Larry Sanders Show** (1992–1998): 28.6%
- **Friends** (1994–2004): 26.4%
- **Arrested Development** (2003–2019): 54.4%
- **The Office** (2005–2013): 36.7%
- **30 Rock** (2006–2013): 62.7%
- **Parks and Recreation** (2009–2015): 36.5%
- **Veep** (2012–2019): 30.5%
- **Broad City** (2014–2019): 34.8%
- **Schitt's Creek** (2015–2020): 69.1%

(Six of the eighteen are left out of this list to keep it readable — The Simpsons 33.3%, Community 31.6%, It's Always Sunny 30.2%, Futurama 30.0%, Flight of the Conchords 29.2%, Chappelle's Show 22.2%. All six sit in the 22–34% band, none of them changes the shape.)

With six shows it looked like a monotonic trend. With eighteen it's something more interesting: a **rising ceiling**, not a rising floor. Every pre-2000 show sits between 24.6% and 33.3%, and so do most of the modern ones — Veep, Sunny, Community and Futurama are all clustered with Taxi and Seinfeld, and Broad City at 34.8% barely clears them. Correlation between air date and character-comedy share across the 18: r = +0.41, which explains 17% of the spread. It's a real trend and a weak one. What changed after 2003 is that three shows — Arrested Development, 30 Rock and Schitt's Creek — discovered you could build *almost the entire show* out of character comedy and it would hold. Nobody had done that before. Plenty of modern shows still don't.

That's surprising if you remember Friends and Seinfeld as character shows. Friends *was* a character show — six distinctive personalities you could parody from a single line of dialogue. Same with Seinfeld; "yada yada yada" only works because of Elaine. So why are they at the bottom of this list?

## Because they had other engines

A show can be funny without being character-funny. Friends and Seinfeld were funny mostly through:

**Setup/punchline.** This is the explanation everyone reaches for, and our data doesn't support it. Seinfeld's setup_punchline rate is **6.4%** — seventh of eighteen, below Schitt's Creek (7.1%) and Arrested Development (6.8%), and nowhere near The Fresh Prince of Bel-Air (11.7%), which is the actual setup-punchline machine on this board. Friends is also 6.4%. Whatever makes Seinfeld and Friends read as un-character-driven, it isn't an unusual reliance on the classic joke shape.

**Observational comedy.** Seinfeld was the apex predator of its era here — observational scores **11.2%**, third-highest on the index today behind 30 Rock (13.8%) and Schitt's Creek (13.0%), and narrowly the highest of any pre-2000 show (The Larry Sanders Show is right behind at 11.0%). The whole "what's the deal with airplane peanuts" mode of thinking. Modern shows mostly don't bother.

**Catchphrase / running gag.** Both shows traffic in repeatable lines. "How *you* doin'." "Yada yada." "Serenity now." These are funny on rewatch *because they're the same line*, not because the character is doing something newly characteristic — but they're rarer than the reputation suggests: Seinfeld tags 0.7% running_gag and Friends 0.6%, both near the floor of the taxonomy. Arrested Development, at 2.9%, runs four times as many.

The result is shows that *feel* character-driven because the characters are vivid, but where the joke level doesn't anchor to character as much as the perception does.

## Why this matters

Character comedy ages better than any other type. It's the reason Schitt's Creek will rewatch in 2040 the way Seinfeld rewatches now — better, probably, because it doesn't have the topical-reference decay Seinfeld does. Watch a Seinfeld episode about a cell phone in the late 90s and a chunk of the comedy is illegible to a 2026 viewer. Watch the Cabaret episode of Schitt's Creek; nothing in it depends on the year.

It also predicts which shows generate quotable line-cards on social media a decade after airing. Character-comedy concentration is highly correlated with the share of TikToks that begin "this is what this character would do in this situation" — because that's the format. Schitt's and Arrested Development have absurdly high TikTok afterlife rates relative to viewership during their run. Friends and Seinfeld show up too, but mostly as nostalgia clips, not as character bits.

And it predicts what kind of comedy a show *can* be. Character_comedy peaks at 69.1%; nobody scores 100% because pure character work doesn't carry a half-hour of TV. The remaining 30% is structural — the setup mechanism, the visual gag, the misdirection — that gives the character work somewhere to land. Schitt's Creek floors that lower bound: almost the entire show is character. The Roses don't have plots, they have *patterns*.

## We made three predictions. Here's how they scored.

When this post first ran we had three shows queued and put priors on all of them. One has since been scored.

- **30 Rock** — we predicted 45–55% on the theory that Liz, Jack, Tracy, Kenneth and Jenna are hyper-specific enough to override the show's plot-driven, cutaway-heavy structure. **Actual: 62.7%** — higher than our range, second only to Schitt's Creek. We under-called it, and the reason is instructive: 30 Rock also posts the highest *absurdist* share on the board (24.5%), and we assumed absurdism would crowd out character work. It doesn't. The absurdity in 30 Rock is almost always *character-specific* absurdity — it's not that a wolf shows up, it's that Tracy would say that about the wolf.
- **Brooklyn Nine-Nine** — predicted 45–55%. Still unscored.
- **Two and a Half Men** — predicted 25–35%. Still unscored.

One resolved prediction out of three, and it landed outside our band on the high side. Logging it here rather than quietly deleting it.

## The Humor Index thesis, restated

If you've read past Humor Index posts, you know the recurring frame: **comedy is multi-dimensional, and any single number for "how funny" is hiding a richer story.** This is one of those richer stories. The leaderboard says 30 Rock (97.4) is the funniest show we've measured, with Arrested Development at 95.0 and Schitt's Creek down at #9. But Schitt's Creek is the most character-driven show in the dataset by 6.4 clear points, and Chappelle's Show — 22.2% on character comedy, dead last on this axis — posts the highest per-joke impact of any show we've scored (7.70). This post adds another lens: shows live somewhere on a 47-point character-comedy spectrum, and that placement tells you a different kind of truth than the Humor Index alone.

The TL;DR is simple: **character comedy is the modern mode of TV comedy, and it's been getting more dominant for thirty years.** The shows we remember as "great character shows" from the 90s scored low on character comedy. The shows that don't get the same cultural-memory weight — Schitt's Creek, Arrested Development — are the actual character extremists.

Both things can be true. The data just lets you see which is which.

---

*The character_comedy share for each show is computed from joke-by-joke type tagging across every episode. Joke-type tagging currently covers 18 of our 21 scored shows; Fleabag, Curb Your Enthusiasm and Freaks and Geeks are not yet tagged. Methodology: [/methodology](/methodology). Per-show comedy DNA donut charts are on each show's page.*
`,
  },
  'is-the-office-actually-funny': {
    title: 'Is The Office Actually Funny? We Analyzed Every Joke to Find Out.',
    description: 'We ran all 183 episodes of The Office through our AI comedy analyst. The results may surprise you.',
    date: '2026-04-10',
    category: 'Deep Dive',
    content: `
We set out to answer a simple question: **is The Office actually funny, or do we just love the characters?**

> **Update, August 2026.** The Office is one of eight shows still carrying a pre-2026 score, and it is being rescored onto our current model as this note is written. Every Office number below — the show score, the season averages, the individual episode scores — will move when that finishes. The *shape* of the finding (great peaks, wide spread) has survived every previous rescore; the specific digits will not.


To find out, we built an AI comedy analyst that identifies and scores every joke in every episode. Not just the obvious punchlines — reaction shots, cringe beats, visual gags, Jim's camera looks, and uncomfortable silences all get counted and scored.

## The Methodology

Every joke gets two scores:
- **Craft** (1-10): How well-written is this joke? We measure originality, structure, character integration, economy of language, and whether the humor is earned or cheap.
- **Impact** (1-10): How hard does this land? Imagine 100 comedy-savvy viewers watching together — would the room erupt, chuckle, or sit in silence?

These feed into the **Humor Index**, our composite score on a 0-100 scale. The calibration points are fixed — 75 was set as the midpoint when the scale was built — but the distribution has moved as we've added shows: across the 21 shows scored today the board runs from 73.2 to 97.4, so 75 now sits near the *bottom* of the show-level range rather than the middle of it. Read episode scores against their own show, not against 75.

## What We Found

The Office Season 4 — widely considered the show's peak — averages **83.8** across 14 episodes, the strongest season the show has. Standout episodes push into the high 80s and past 90.

And on the question of whether the fan consensus is right: it is. **"Dinner Party" scores 98.0** — the highest-scoring episode of the entire series, six points clear of second place. "Local Ad" (88.9), "Chair Model" (88.4) and "Survivor Man" (88.0) fill out the season's top four.

That's worth flagging because it wasn't always true here. An earlier version of this post reported "Dinner Party" at 88.1, behind "The Deposition" and "Did I Stutter?" — an artifact of single-run scoring, which we've since replaced with three-run consensus. The cringe-heavy episodes were exactly the ones single-run scoring was worst at: long discomfort sequences produce few, very high-value jokes, and a noisy scorer either finds them or doesn't.

## The Cringe Comedy Problem

This is the fundamental challenge of scoring The Office: its signature move — sustained, excruciating discomfort — doesn't play like traditional joke-based comedy.

A 3-minute scene where Michael shows off his tiny plasma TV isn't one joke. It's one long, beautiful nightmare. But in terms of our scoring, it counts the same as a quick one-liner.

We addressed this by weighting **peak density** (what percentage of jokes are elite-quality) more heavily than raw jokes-per-minute. This means an episode with 40 incredible jokes can outscore one with 70 mediocre ones.

## How The Office Compares

Honestly? Less well than it did when this post was written.

On the current board The Office sits at **79.4, #14 of 21** — the bottom half, and below all but one of the shows that have been through the current scoring model (The Simpsons, at 79.0, is the exception). Some of that is a real quality judgment. Most of it is that it hasn't been rescored yet; every show that has moved onto the current model gained ground, several of them by ten points or more.

The one comparison worth making now is a mechanical one:

- **30 Rock:** 3.52 jokes per minute
- **The Office:** 2.38 jokes per minute

That's **1.5x**, not the "nearly 3x" this post originally claimed — an error that came from comparing across two different scoring runs. 30 Rock does fire faster, and it also scores higher per joke on craft (7.67 vs 6.88). The sniper-vs-machine-gun framing was generous to The Office: on this data 30 Rock is doing both.

## The Verdict

Yes, The Office is actually funny. Not just nostalgic, not just "comfortable TV" — genuinely, measurably funny. Its best episodes compete with the best comedy television has ever produced.

But it's also inconsistent. Within Season 4 alone — its best season — the gap runs from "Dinner Party" at 98.0 down to "Launch Party" at 71.9. Across all 183 episodes the spread is 98.0 to 63.5. When The Office is on, it's transcendent. When it's off, it's coasting on goodwill.

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
> **Scope note, August 2026.** This study was run in April 2026, when the index had three scored shows. It has 21 today. The reliability findings below are properties of the scorer and still hold — they are what drove us to three-run consensus scoring, which every show scored or rescored since has used (13 of 21 so far). The specific show scores quoted as examples have all moved; they are corrected inline and marked.

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

Each show’s overall Humor Index is averaged over a lot of episodes — 12 for our smallest (Fleabag), 552 for our largest (The Simpsons), 168–236 for the three studied here. The law of large numbers does its work:

- Per-episode noise SD: ~5 Humor Index points
- The Office (183 eps): SE on show mean ≈ 0.37
- Seinfeld (168 eps): SE on show mean ≈ 0.39
- Friends (236 eps): SE on show mean ≈ 0.33

So show-level Humor Indexes are stable to roughly ±0.4 points from LLM noise.

*(Updated August 2026: the example that used to sit here — Office 80.2, Seinfeld 79.1, Friends 78.7, "all within the noise floor" — no longer works, and the way it broke is worth keeping. Those three shows now score 79.4, 94.5 and 73.2. What separated them was not scorer noise; it was that two of the three had not yet been through the current model. Seinfeld moved 15 points on rescore. The lesson stands with the sign flipped: a 1–2 point gap between two shows scored the same way is noise, but a gap between two shows scored differently is not a gap at all.)*

**Show rankings hold up — provided you only rank shows measured the same way.**

### Individual episode rankings have ±5-point noise

If two episodes are within ~10 Humor Index points, the ordering between them is within the scorer’s noise floor. A “Best Friends Episode” list, where the top 10 episodes are all between 85-95, has a lot of genuine uncertainty in its ordering.

**Extreme episodes still stand out.** Dinner Party (98.0) is clearly above The Office’s episode mean (78.4). A bottom-quartile Office episode at 63.5 is clearly below. These wouldn’t flip. The second example this post used to give — Friends’ "The Last One" at 95 — was itself a casualty of single-run noise: it scores 77.5 today, barely above the Friends episode mean of 73.1. It was never a clear-cut case, and we should not have used it as one.

But the difference between #1 and #2 in a close race? That’s within noise.

## What we’re doing about it

Three changes:

**1. Publishing the noise floor.** This blog post and a new section on our methodology page spell it out: single-run Humor Index ICC = 0.28, mean |Δ| = 10.7 points, show-level SE = 0.4 points. Readers should calibrate their confidence accordingly.

**2. Consensus scoring going forward.** Our pipeline already supports multi-run consensus (the \`--num-runs\` flag). For all new shows — starting with Parks and Recreation when we resume — we’ll score each episode THREE times and use the mean. *(August 2026: we did. Every show scored or rescored since April 2026 uses three-run consensus, and 13 of 21 shows are now on it.)* Three runs cuts per-episode SE by about √3 ≈ 1.7×, which should get ICC up to moderate (≥ 0.4) territory. Five runs would get us near “good” (≥ 0.75).

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
> **Scope note, August 2026.** This model was fit in April 2026 on the three shows the index had at the time, and it has not been refit since. Its two durable findings — that format has no identifiable effect on joke impact, and that ~64% of joke-level variance is unexplained noise — are why the multi-cam penalty is gone and why we score every episode three times. Its third finding, that the show rankings were statistically indistinguishable, was a true statement **about three shows sitting within 1.5 points of each other**. The board now runs from 73.2 to 97.4 across 21 shows, and that conclusion does not generalize to it. This post used to be titled "Every Show Ranking Is Within Noise"; we have changed the title.

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

With only 3 shows and 15K sampled jokes, the shows’ impact-quality differences don’t clear the statistical bar. *(August 2026: we have 18 more shows now and have not refit the model. Doing so is on the list — with a 21-show corpus the between-show variance component would almost certainly come out well above 7.9%.)*

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

It is emphatically *not* the situation on the board today. Those same three shows now score 79.4, 94.5 and 73.2 — a 21-point spread — because two of them have since been rescored on a different model and one has not. That is not a noise-floor question; it is an apples-to-oranges question, and it is the one to actually worry about when comparing shows on this site.

*Note (updated August 2026): when this post was first published, Seinfeld led at 83.9 because stand-up bits were being scored as sitcom comedy. That was fixed with a standup-aware rescore, which put it at 79.1; the 2026 canonical rescore has since moved it to 94.5. Three different numbers for one show in one year is a fair summary of why we publish a noise floor at all.*

This doesn’t mean the rankings are wrong. It means they’re **not statistically distinguishable given current data.** That’s a feature of being honest about our sample size and model, not a bug in the analysis.

## What We’re Changing on the Site

1. **Credible interval badges** on show pages. Next to each show’s Humor Index, we’re surfacing the 95% credible interval from this model. A reader can see that Friends and Office have overlapping intervals and draw their own conclusion.

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
    description: 'We compared 2,682 episodes across all 21 scored shows against IMDb audience ratings. Within-show correlation: r = +0.18 — audience ratings explain about 3% of the variance in comedy craft. They are measuring something else almost entirely.',
    date: '2026-04-12',
    category: 'Data Science',
    content: `
We integrated IMDb episode ratings across every analyzed show on The Humor Index. And the first thing we did was the obvious data science move: **how well do audience ratings predict our comedy scores?**

*Updated August 2026: this post originally ran on 591 episodes across three shows. We now have IMDb ratings matched to 2,649 scored episodes across all 21 shows, so the headline numbers below have been recomputed on the full corpus. The finding got stronger, not weaker.*

The answer: they don't. Not even close.

## The Numbers

Across **2,649 episodes** of all 21 scored shows, centred within each show so that no cross-show scale differences leak in, the Pearson correlation between the Humor Index and IMDb ratings is **r = +0.18**. That is positive, and with n this large it is not a fluke — but it means audience ratings account for roughly **3% of the variance** in how well an episode's jokes are written. Ninety-seven percent is something else.

Per show, here's where it lands:

- **Chappelle's Show** (27 eps): r = +0.58 — the strongest on the board, on one of the smaller samples
- **Arrested Development** (84 eps): r = +0.46
- **Fleabag** (12 eps): r = +0.40
- **Broad City** (50 eps): r = +0.36
- **The Larry Sanders Show** (89 eps): r = +0.33
- **The Simpsons** (552 eps): r = +0.31
- **Veep** (65 eps): r = +0.29
- **Futurama** (137 eps): r = +0.25
- **Seinfeld** (166 eps): r = +0.24
- **Flight of the Conchords** (22 eps): r = +0.20 · **Taxi** (114 eps): r = +0.19 · **The Fresh Prince** (148 eps): r = +0.18 · **Parks and Recreation** (123 eps): r = +0.17 · **The Office** (183 eps): r = +0.16 · **Community** (110 eps): r = +0.12
- **30 Rock** (138 eps): r = +0.06 · **Curb Your Enthusiasm** (120 eps): r = +0.05
- **Schitt's Creek** (80 eps): r = −0.02 · **It's Always Sunny** (177 eps): r = −0.03 · **Friends** (234 eps): r = −0.05 · **Freaks and Geeks** (18 eps): r = −0.18

Seventeen of twenty-one shows are positive; the median show sits at **r = +0.19**, and not one show clears r = +0.6. There is a real signal here and it is weak everywhere.

Across all 21, IMDb explains about **3% of the variance** in our Humor Index scores — and in the four shows with negative correlations, none at all.

In plain English: knowing an episode's IMDb rating tells you almost nothing about how funny it actually is by our analysis.

## Why This Matters

IMDb ratings measure **whether audiences enjoyed an episode**. That's a cocktail of plot quality, emotional resonance, character development, guest stars, and yes — comedy. When someone gives "Casino Night" a 9.3, they're rating the Jim/Pam moment at the end as much as any joke.

The Humor Index measures something narrower: **comedy craft and density**. How many jokes land? How well-constructed are they? How hard do they hit?

These are genuinely different questions, and our data proves it.

## The Biggest Disagreements

Some episodes where our AI sees comedy gold but audiences shrug:

- **"Angry Andy" (S8E21)** — Humor Index: 89.5, IMDb: 6.7. Packed with jokes, but the late-season Andy arc turned audiences off regardless of how many gags landed.
- **"Dinner Party" (S4E13)** — Humor Index: 98.0, IMDb: 7.6. The highest-scoring Office episode is an IMDb 7.6. This is the cringe comedy paradox: brilliantly crafted discomfort that many viewers can't rewatch without covering their eyes.
- **"Andy's Ancestry" (S9E03)** — Humor Index: 88.8, IMDb: 7.1. Dense with character comedy, but S9 fatigue dragged audience scores down.

And episodes audiences adore that don't score as high on pure comedy:

- **"Casino Night" (S2E22)** — Humor Index: 72.6, IMDb: 9.3. The Jim/Pam poker scene is legendary television, but it's drama, not comedy. Our system correctly identifies this as a great episode with average joke density.
- **"The Inner Circle" (S7E22)** — Humor Index: 75.2, IMDb: 9.8. Will Ferrell episodes got a huge audience boost. The comedy itself is solid but not spectacular.
- **"Classy Christmas" (S7E11)** — Humor Index: 72.1, IMDb: 8.8. Holiday episodes get an emotional ratings bump that has nothing to do with joke quality.

## What Predicts IMDb Ratings?

We tested which of our sub-metrics best correlates with audience scores:

Within The Office specifically:

- **Craft** (r = 0.21) — the strongest predictor, but still weak
- **Humor Index** (r = 0.16) — the composite score
- **Impact** (r = 0.09) — how hard jokes land
- **JPM** (r = -0.05) — joke density is the *least* related thing to an audience rating

That last one is fascinating. **More jokes per minute slightly predicts lower audience ratings.** This makes sense — episodes with the highest joke density often sacrifice plot and character moments. Audiences notice.

## Season-by-Season Patterns

The correlation varies wildly by season:

- **Season 7** has the strongest correlation (r = 0.40) — during Michael's farewell arc, funnier episodes also happen to be more emotionally satisfying
- **Seasons 3, 4, and 8** have negative correlations — audiences and our AI actively disagree about which episodes are best
- **Season 5** shows moderate alignment (r = 0.33)

## The Dinner Party Problem

"Dinner Party" perfectly illustrates why these metrics diverge. It scores **98.0** on our Humor Index — the highest-scoring episode The Office ever produced. Every joke is meticulously crafted. The cringe comedy is operating at peak efficiency.

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
