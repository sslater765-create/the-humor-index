# Level 2 Analysis: Blind Rescoring + Inter-Rater Reliability

## 1. Show-identity bias

**Question**: Does the LLM score the same episode differently when it knows the show name?

We compare the blind score to the production (non-blind) score on the SAME episodes.
Note: the production score uses the v2 formula (no format coefficient). The blind score also applies coef=1.0 internally.

| Show | n | Mean blind HI | Mean non-blind HI | Δ (non-blind − blind) | Paired-sample 95% CI |
|---|---|---|---|---|---|
| seinfeld | 33 | 84.57 | 82.12 | -2.45 | [-5.71, +0.82] |
| the-office | 33 | 78.92 | 77.68 | -1.23 | [-5.11, +2.65] |
| friends | 33 | 81.25 | 80.52 | -0.72 | [-5.29, +3.84] |
| **Pooled** | 99 | — | — | **-1.47** | [-3.72, +0.79] |

**Interpretation:**
- Pooled bias is -1.47 — the LLM scores episodes **lower** when it knows the show. Unexpected but informative.

## 2. Inter-rater reliability (blind vs retest blind)

**Question**: If we ask the LLM to score the same episode twice (both blind), how consistent is it?

This measures the scorer's own noise floor — below this, any ranking difference is just LLM variance.

| Show | n | Pearson r (HI blind vs retest) | ICC (consistency) | Mean |Δ| |
|---|---|---|---|---|
| the-office | 10 | 0.013 | 0.007 | 10.47 |
| seinfeld | 10 | -0.001 | 0.033 | 9.42 |
| friends | 10 | -0.434 | -0.429 | 12.17 |
| **Pooled** | 30 | **-0.147** | **-0.130** | **10.69** |

**Interpretation**: Humor Index scores are weakly reliable between runs (r=-0.147).
The scorer's own noise floor is ~10.7 points; ranking differences smaller than that should be treated as noise.

## 3. Per-joke-type average impact (blind mode)

**Question**: Are any joke types systematically rated higher or lower? Does the LLM reward setup-punchline more than cringe?

| Joke type | n | Mean impact (blind) | Mean craft (blind) |
|---|---|---|---|
| character_comedy | 3000 | 6.64 | 6.92 |
| escalation | 1180 | 6.90 | 6.97 |
| cringe_discomfort | 873 | 6.58 | 6.60 |
| absurdist | 861 | 7.03 | 7.16 |
| observational | 774 | 6.56 | 6.89 |
| irony_sarcasm | 594 | 6.60 | 6.90 |
| deadpan_understatement | 520 | 6.65 | 7.02 |
| setup_punchline | 517 | 6.64 | 6.82 |
| wordplay_pun | 358 | 6.39 | 6.75 |
| dark_subversive | 305 | 7.29 | 7.31 |
| callback | 302 | 6.69 | 6.92 |
| reaction_beat | 296 | 6.24 | 6.52 |
| misdirection | 289 | 6.85 | 7.01 |
| visual_gag | 195 | 6.65 | 6.69 |
| physical_slapstick | 175 | 6.59 | 6.52 |