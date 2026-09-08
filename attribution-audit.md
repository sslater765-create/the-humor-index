# Character attribution audit — 2026-09-08

Run after the caption audit found two jokes credited to the wrong speaker. The
question was whether that was two unlucky rows or a systematic problem, because
the character leaderboard, the WAR numbers and several pinned comments in the
30 TikTok scripts all rest on the `characters` field.

Answer: the attribution itself is mostly sound. The aggregation on top of it is
not, and one error is bad enough to fix before any Friends video goes out.

## 1. Rachel Green has a WAR of 0 and ranks 131st of 134

`funniest-characters/page.tsx:96` sorts by `war` descending. Rachel's is `0.0`,
so one of the six leads of the most-watched show in the dataset sits at the
bottom of her own cast list, below characters with four episodes.

| Rank | Character | WAR | Jokes | Episodes |
| --: | :-- | --: | --: | --: |
| 1 | Chandler | 655.4 | 2,962 | 232 |
| 2 | Phoebe | 622.2 | 2,036 | 232 |
| 3 | Joey | 535.3 | 2,655 | 232 |
| 4 | Ross | 234.3 | 2,388 | 232 |
| 5 | Monica | 161.3 | 2,548 | 233 |
| … | | | | |
| 131 | **Rachel** | **0.0** | **1,960** | **222** |

Her five castmates average 0.178 WAR per joke. At that rate she lands around
349, which would put her third or fourth. Her `quality_index` (6.54) computed
fine, so this is the WAR calculation specifically, not missing joke data.

Three others with the same signature, all with real joke counts and a WAR of 0:
Sam Weir (Freaks and Geeks, 177 jokes, and he is the lead), Jamm (Parks, 92),
Todd (The Office, 77). Nothing else above 50 jokes is affected, so this is four
rows, not a systemic collapse.

Two Friends videos (#14 and #35) point traffic at these rankings. Fix before
they post.

## 2. Split identities stranding jokes

Characters appearing twice in `characters.json` under two spellings, so their
totals are divided:

| Show | Kept | Stranded |
| :-- | :-- | :-- |
| Community | Dean (344 jokes, 45.6 WAR) | Dean Pelton (70 jokes, 23.0 WAR) |
| The Simpsons | Grandpa (60 jokes, 17.3 WAR) | Grandpa Simpson (43 jokes, 18.1 WAR) |
| Arrested Development | Michael (1,029) | Michael Bluth (11) |
| Arrested Development | Steve (5) | Steve Holt (26) |
| Arrested Development | Herbert (10) | Herbert Love (14) |
| Arrested Development | Stan (10) | Stan Sitwell (14) |
| Arrested Development | Warden (5) | Warden Gentles (9) |

Community's Dean is the one that changes a ranking: merged he is 414 jokes and
68.6 WAR instead of 344 and 45.6. Grandpa nearly doubles. The rest are small.

**Not errors, do not merge:** Lucille / Lucille Austero and Lucille / Lucille Sr.
(different characters), Phoebe / Phoebe Abbott (Phoebe's birth mother),
Michael / Michael as Scarn and Jim / Jim (as computer) (in-show personas,
arguably worth keeping separate), Judge / Judge Reinhold.

## 3. Long-form tags that may not be folded in

Jokes are tagged inconsistently: the same character appears as both "Ron" and
"Ron Swanson", "Tracy" and "Tracy Jordan", "Moira" and "Moira Rose". 850 such
pairs across 17,294 joke tags.

For Parks, `characters.json` states Ron at 839 jokes while the episode files tag
"Ron" 845 times and "Ron Swanson" a further 657. The stated total tracks the
short form alone, which suggests the long-form tags are dropped rather than
merged. I could not confirm this: the aggregation script is not in the repo, and
for other shows the stated totals do not match either count (Arrested
Development states Michael at 1,029 against 1,962 short tags), so something else
is happening too, possibly per-joke deduplication.

Worth checking against whatever generates `characters.json`. If long forms are
being dropped, Ron is missing 44% of his jokes and every ranking that uses joke
counts is understated for the characters whose names get written out in full.

## 4. What this means for the 30 scripts

Several pinned comments assert attribution directly:

- #30 "Dwight holds four of the top ten Office jokes. Michael holds three."
- #32 "Tracy has three of 30 Rock's top ten. Jenna has two."
- #33 "Ron Swanson has six of the eight highest-scored jokes in Parks & Rec."
- #36 "Alexis holds #2 and #4. David holds #1 and shares #5."

These are computed from the same `characters` field. #36 is already known to be
wrong: "You're my Mariah Carey" is Patrick's line, not David's, so David does not
hold #1. The other three are unverified. They are the kind of claim a fandom
checks, so either verify them against transcripts or soften them to something
the data supports without naming exact counts.

## Recommended order

1. Fix Rachel's WAR, and the other three zeros. Highest visibility, smallest fix.
2. Merge Dean / Dean Pelton and Grandpa / Grandpa Simpson.
3. Work out whether long-form joke tags are being dropped in aggregation.
4. Re-check the three unverified pinned comments, or reword them.
