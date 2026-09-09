# Rachel Green's WAR is not a data bug

## What the number actually is

WAR v2, per the published methodology:

```
WAR            = total_jokes × max(shrunk_quality − replacement_quality, 0)
shrunk_quality = (n · observed_quality + 30 · league_median) / (n + 30)
replacement    = 6.555   (25th pct of characters with 10–50 analyzed jokes)
league_median  = 6.775
```

Rachel: n = 1,960, observed quality = (6.59 + 6.47) / 2 = 6.530

```
shrunk = (1960 × 6.530 + 30 × 6.775) / 1990 = 6.5337
gap    = 6.5337 − 6.555 = −0.0213
WAR    = 1960 × max(−0.0213, 0) = 0.0
```

She misses the replacement line by **0.021 points** and the floor turns that into
a fall from 6th to 131st. Regenerating `characters.json` will reproduce 0.0
exactly. There is nothing to repair.

## The real defect is the floor, not Rachel

Four characters are floored at zero. Their unfloored WAR:

| Character | Jokes | Shrunk quality | Gap | Unfloored WAR |
|---|---|---|---|---|
| Rachel | 1,960 | 6.5337 | −0.0213 | **−41.8** |
| Richard | 41 | 6.4776 | −0.0774 | −3.2 |
| Tim | 14 | 6.5268 | −0.0282 | −0.4 |
| Melissa | 11 | 6.4557 | −0.0993 | −1.1 |

And the three characters ranked immediately *above* Rachel:

| Rank | Character | Jokes | WAR |
|---|---|---|---|
| 128 | Carl | 5 | 0.4 |
| 129 | Megan | 5 | 0.4 |
| 130 | Max | 5 | 0.3 |
| **131** | **Rachel** | **1,960** | **0.0** |

Carl, Megan and Max have five jokes each. Their WAR is sampling noise that the
k=30 shrinkage could not fully absorb. Flooring at zero collapses Rachel's
−41.8 onto the same value as Tim's −0.4, so a 1,960-joke lead sorts below three
five-joke walk-ons. That is the part that reads as broken, and it is a
presentation choice, not bad data.

## Rachel being last among the leads is a real finding

It is not an artifact. Her supporting numbers all agree:

- elite rate 10.1%, against Phoebe 17.6% and Chandler 17.6%
- `vs_castmates_delta` −0.182 with a CI half-width of 0.043, measured across
  222 shared episodes, so the gap is roughly four standard errors wide

She genuinely scores lowest per joke of the six leads on this model. The model
is not lying about her. It is the rendering of "below replacement" as `0.0`,
tied with noise, that misleads.

## Recommendation

Stop flooring. Publish the signed value and let Rachel show −41.8.

It is more honest, it sorts her correctly relative to five-joke guest stars, and
"Rachel Green has negative WAR" is a far better argument-starter than a zero
that looks like a loading error. It needs three changes:

1. The scoring pipeline emits `total_jokes × (shrunk_quality − replacement)`
   without the `max(…, 0)`.
2. `app/methodology/page.tsx` line 410 drops the `max(…, 0)` from the printed
   formula and gains a sentence saying negative WAR means below replacement.
3. `CharactersClient.tsx` needs no change; it already sorts on the raw value.

The alternative, raising the bench pool floor above 50 jokes so the replacement
level stops being estimated from noise, is the more principled fix but it moves
every character on every show. Not something to do two days before #14 posts.

## What this does not block

#14 (Sep 11) makes no claim about Rachel. Its caption credits Phoebe and notes
that Ross's wedding-name jokes take the top three. The exposure is only that
Friends fans who click through to the leaderboard see a 0.0 next to Rachel
Green. That is embarrassing, not wrong, and it is not a reason to move the post.
