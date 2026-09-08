# Rescore worklist — contaminated episodes

Generated 2026-09-08 by `scripts/check-data.mjs` plus an overview-match test.

## What is wrong

Some episodes carry another episode's transcript. The metadata (title, air date, IMDb) is right; the jokes underneath it belong to a different episode. That means the score shown for those episodes is another episode's score, and the real content is missing from the dataset entirely.

Two spot checks confirm it. Neither `"the sea was angry"` nor `"marine biologist"` appears anywhere in the Seinfeld data, so The Marine Biologist's real content was never captured. `"Crazy Joe Davola"` appears in S04E03, E04, E05 and E23 but not in S04E09 The Opera, which is the episode he is actually in.

## Confirmed by signature test

Four rows were checked independently by grepping the whole show for phrases the episode must contain. All four confirm the verdict:

| Episode | Signature phrase | Found? |
| :-- | :-- | :-- |
| Seinfeld S05E14 The Marine Biologist | "the sea was angry", "marine biologist" | nowhere in the dataset |
| Seinfeld S04E09 The Opera | "Crazy Joe Davola" | in S04E03/04/05/23, not in S04E09 |
| The Office S03E20 Product Recall | "watermark" | nowhere in the dataset |
| The Simpsons S08E15 Homer's Phobia | "John Waters", "steel mill" | nowhere; "Poochie" appears in both S08E14 and S08E15 |

The same test also corrected two rows. For the Sunny and Futurama pairs, *neither* side contains its own signature content ("pooped the bed", "mutant"/"sewer" are all absent), so both episodes are carrying something else and both need rescoring. Those rows are marked accordingly.

## How the corrupt side was identified

For each flagged pair, both episodes' joke text is compared against their own `tmdb_overview`. The genuine episode's jokes echo its synopsis; the copy's do not. The method agrees with both hand-verified cases above (The Marine Biologist 90% vs 30%, The Opera 50% vs 85%), which is why I trust it for the rest.

Confidence reflects the gap between the two match scores. Anything marked **inspect** needs a human look: either an overview is missing from the data or the two scores are too close to call.

## Worklist

| Show | Rescore this one | Its jokes actually belong to | Overlap | Match | Confidence |
| :-- | :-- | :-- | --: | :-- | :-- |
| Seinfeld | **S05E14 The Marine Biologist** | S05E13 The Dinner Party | 70% | 30% vs 90% | high |
| The Simpsons | **S15E02 My Mother The Carjacker** | S15E01 Treehouse Of Horror Xiv | 69% | 38% vs 46% | low |
| The Simpsons | **S17E05 Marge's Son Poisoning** | S17E08 The Italian Bob | 67% | 36% vs 44% | low |
| The Office | **S08E07 Pam's Replacement** | S08E06 Doomsday | 67% | 32% vs 44% | low |
| The Office | **S04E14 Goodbye Toby** | S04E10 Chair Model | 56% | 26% vs 43% | medium |
| The Simpsons | **S08E15 Homer's Phobia** | S08E14 The Itchy & Scratchy & Poochie Show | 55% | 30% vs 82% | high |
| It's Always Sunny in Philadelphia | **both** S04E05 Mac and Charlie Die (1) and S04E07 Who Pooped the Bed? | a third episode | 54% | 20% vs 52% | see note |
| Futurama | **both** S07E12 31St Century Fox and S06E12 The Mutants Are Revolting | a third episode | 52% | 17% vs 56% | see note |
| Seinfeld | **S04E09 The Opera** | S05E02 The Puffy Shirt | 52% | 50% vs 85% | high |
| Seinfeld | **S04E16 The Shoes** | S04E17 The Outing | 51% | 50% vs 88% | high |
| The Simpsons | **S14E17 Three Gays Of The Condo** | S14E16 Scuse Me While I Miss The Sky | 49% | 10% vs 48% | high |
| The Office | **S04E12 Did I Stutter?** | S04E08 The Deposition | 49% | 42% vs 63% | medium |
| Seinfeld | **S05E03 The Glasses** | S05E02 The Puffy Shirt | 41% | 29% vs 85% | high |
| Seinfeld | **S05E03 The Glasses** | S04E09 The Opera | 39% | 29% vs 50% | medium |
| Seinfeld | **S07E15 The Cadillac (2)** | S07E16 The Shower Head | 35% | 30% vs 92% | high |
| The Office | **S07E13 The Seminar** | S07E12 Ultimatum | 35% | 53% vs 63% | low |
| Seinfeld | **S02E10 The Baby Shower** | S02E06 The Statue | 34% | 41% vs 56% | medium |
| The Office | **S03E20 Product Recall** | S03E19 Safety Training | 33% | 21% vs 76% | high |
| Friends | **S01E18 The One With All The Poker** | S01E19 The One Where The Monkey Gets Away | 33% | 19% vs 35% | medium |
| Arrested Development | **S01E07 In God We Trust** | S01E08 My Mother, The Car | 33% | 30% vs 68% | high |
| The Office | **S06E17 New Leads** | S05E20 Dream Team | 30% | 50% vs 59% | low |

That is **20 episodes** to rescore, out of 23 flagged pairs.

## Needs a human look

- **Broad City**: S01E05 Fattest Asses vs S01E06 Stolen Phone (52% overlap). No `tmdb_overview` on both, so the test cannot run.
- **The Office**: S04E03 Launch Party vs S04E05 Local Ad (38% overlap). Overview match is 48% vs 45%, too close to call.

## Notes

- The threshold is 25% shared jokes. Genuine two-parters are excluded by title, and recurring runners across a season can produce real overlap, so treat low-confidence rows as candidates rather than facts.
- `The Opera`, `The Puffy Shirt` and `The Glasses` form a three-way cluster: Puffy Shirt content appears in all three, and both The Opera and The Glasses score as copies. Rescoring those two should be one job.
- Every pair here is listed in `scripts/known-data-issues.json`, so `npm run check` stays green. Delete a pair's entry as you fix it and the checker will enforce it from then on.
- None of the 30 TikTok scripts cite any episode in this list.
- I also ran an absolute version of the overview test across all 2,584 episodes that have a synopsis (median match 55%, 5th percentile 30%). It flags 28 episodes below 20%, but only 3 of those also share a transcript with another episode, so on its own it is mostly picking up synopses whose vocabulary simply does not appear in dialogue. I did not use it to add anyone to this list. If you want to dig further it is worth re-running after the known pairs are fixed, when the noise floor will be easier to read.
- The pair test is the trustworthy detector, because duplicated content is unambiguous. The overview test is only good for deciding *which* side of a known pair is wrong, and the signature test is what confirms it.
