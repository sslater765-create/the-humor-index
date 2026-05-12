# The Humor Index — Project Memory

_Last updated: 2026-05-12_
_Owner: Sam Slater (sslater765@gmail.com / sam@thehumorindex.com)_

## What this is

**The Humor Index** (thehumorindex.com) is a comedy analytics platform that scores sitcom episodes using Claude. It publishes:

- Per-episode **Humor Index** scores (0–100)
- Per-show aggregates, rankings, and season breakdowns
- Compare-shows tool, "funniest episodes/characters" leaderboards
- Methodology page + data-science blog
- Newsletter (Beehiiv)

Business entity: **Humor Index Media LLC** (FL, EIN 42-2001337).
DBA: **The Humor Index**.

## Tech stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind
- **Hosting**: Vercel (nameservers: ns1/ns2.vercel-dns.com)
- **Registrar**: Namecheap → Vercel DNS
- **Email**: Google Workspace ($7/mo) — `sam@thehumorindex.com` primary
- **Newsletter**: Beehiiv
- **Scoring pipeline**: Python + Anthropic SDK (Claude Sonnet, streaming)
- **Legal**: Termly (Privacy Policy free tier); Terms + PP also self-hosted at `/terms` `/privacy`
- **Analytics/tracking**: None as of now (Vercel edge logs only)

## Repo layout

```
the-humor-index/               ← Next.js web app (this repo, public on Vercel)
  app/                         ← pages
  components/                  ← UI components
  lib/                         ← data loaders, newsletter helpers
  public/data/                 ← scored data (source of truth for live site)
    shows.json                 ← show-level leaderboard (aggregates)
    {show}/episodes.json       ← per-show episode list
    {show}/seasons.json        ← per-show season summaries
    {show}/s##e##.json         ← per-episode with full jokes + scores

~/Downloads/the-humor-index/   ← Python scoring pipeline (SEPARATE repo)
  analysis/
    prompt.py                  ← LLM prompt (includes STANDUP handling)
    scoring.py                 ← HI formula, STANDUP_WEIGHT=0.30, display scaling
    pipeline.py                ← batch entrypoint, API retries
    export.py                  ← writes public/data/ JSONs from SQLite
    batch.py                   ← CLI; default 3-run consensus, --blind flag
  transcripts/{show}/          ← raw subtitles (.srt/.vtt input)
```

## Scoring methodology (as of 2026-04-19)

- **Prompt version 2.0**: two-phase (detect jokes → score). Reads every comedic moment including visual/reaction/silence beats inferred from context. Stand-up bits (Jerry at The Improv) tagged `is_standup: true`.
- **Scoring per joke**: 5-dim craft (originality, structure, character integration, economy, earned-vs-cheap), impact 1–10, quotability, rewatch bonus, callback detection.
- **Episode HI formula**: `peak_density * 0.15 + eff_craft * 0.40 + eff_impact * 0.35 + wjpm_norm * 0.10 + mem_bonus`.
- **STANDUP_WEIGHT = 0.30**: stand-up jokes weighted at 30% of sitcom impact in aggregate (fix applied 2026-04-17).
- **3-run consensus**: each episode analyzed 3 times; aggregates averaged.
- **Display scaling**: raw (0–10) → display (0–100) via `DISPLAY_CENTER=75`, `DISPLAY_RAW_CENTER=6.5`, `DISPLAY_SPREAD=0.55`, `DISPLAY_SCALE=10`.
- **Show-level HI**: `0.40 * best_season_raw + 0.60 * mean_season_raw`, then raw→display.
- **WAR**: `n_jokes × max(shrunk_quality − replacement_quality, 0)` where shrunk quality uses Bayesian k=30 against league median, replacement = 6.555 (25th percentile bench characters).

## Honest methodology caveats (these are PUBLISHED on the blog — keep it that way)

- **ICC ≈ 0.28 on single-run scoring** → ~72% of episode-level variance is scorer noise. Blog post: `scorer-noise-floor`.
- **Show-level 95% CIs overlap heavily** for top-tier sitcoms. Seinfeld [77.8, 80.8], Office 80.2, Friends 78.7 — all statistically indistinguishable. Blog post: `bayesian-credible-intervals`.
- **Format coefficient was dropped**: an earlier correction penalizing single-camera vs multi-cam was tested via Bayesian model and found indistinguishable from zero. Reasoning is at `/blog/seinfeld-vs-the-office` and `/methodology` (sections "The Laugh Track Correction" and "Why We Don't Adjust for Format").
- **No external validation**: scores have not been validated against Nielsen, human-expert panel, or audience laughter data. This is honestly one AI's aesthetic judgment applied systematically. Product positioning should match that framing.

## Current data state (2026-05-12)

| Show | Episodes | HI | Notes |
|---|---:|---:|---|
| **Arrested Development** | 84 | **85.2** | ✅ Launched May 4; v2 consensus; largest #1-to-#2 gap on the board |
| **Parks and Recreation** | 124 | 80.55 | ✅ Full rescore complete (Apr 30 launch). Took #1 from The Office at the time. |
| **The Office** | 186 | 80.22 | v2 consensus; no stand-up so v1==v2 for single-cam. shows.json total_episodes=201 reflects TMDB; scored count is 186. |
| **Seinfeld** | 172 | 79.10 | v2 with standup-aware weighting + 3-run consensus. shows.json total_episodes=180 (TMDB incl. clip shows); scored=172. |
| **Friends** | 235 | 78.66 | v2 consensus complete. shows.json total_episodes=236; scored=235. |
| **Schitt's Creek** | 80 | 78.30 | ✅ Launched May 2; full v2; tied #1 on per-joke Impact |
| 30 Rock | 0/138 | 0.0 | Drip-release target. 18 episodes have run files in the Python repo but batch stalled. Not yet launched on the site. |
| Brooklyn Nine-Nine | 0/153 | 0.0 | Drip-release target. No data yet. |
| Two and a Half Men | 0/262 | 0.0 | Drip-release target. Methodology probe done on s12e08 only. |
| It's Always Sunny | 0/172 | 0.0 | Backlog. created_by recently corrected to McElhenney/Howerton/Day. |
| The Big Bang Theory | 0/279 | 0.0 | Backlog. |

## Recent work (2026-04 context)

Session Apr 18–19 accomplished:
1. **Standup weighting fix**: discovered Seinfeld S01E01 scored 99 due to Jerry's stand-up being treated as sitcom craft. Added `is_standup` flag to prompt, STANDUP_WEIGHT=0.30 in scoring, rescored all 172 Seinfeld episodes.
2. **Seinfeld show-level: 83.92 → 79.1**, CI [77.8, 80.8], WAR 3720.7. Correct peer-cluster with Office/Friends.
3. **Legal**: Termly Privacy Policy published; full self-hosted Terms + PP at `/terms` `/privacy` covering GDPR, 20+ US state privacy laws, PIPEDA. Contact email: sam@thehumorindex.com / legal@ / privacy@.
4. **Email**: Google Workspace activated for thehumorindex.com. Primary mailbox sam@. MX points to smtp.google.com. TXT verification + DKIM in progress. Forwarding to sslater765@gmail.com planned.
5. **Business**: Humor Index Media LLC filed in FL, EIN issued. USPTO trademark filing blocked pending Sam's ID verification.

## Open items (priority order)

1. **Finish Parks & Rec rescore** when current batch exits; ~17 episodes need retry due to connection resets.
2. **Retry script** for Parks & Rec skipped episodes should mirror `/tmp/rescore_seinfeld_all.py` pattern.
3. **Finish DKIM** setup in Vercel DNS (Sam needs to paste key copy).
4. **Gmail forwarding** sam@ → sslater765@gmail.com.
5. **Workspace aliases**: add legal@, privacy@, hello@ as alternates on sam's Workspace account.
6. **Beehiiv sender**: change to sam@thehumorindex.com once DNS propagates (24h).
7. **USPTO trademark** — blocked on ID verification.
8. **Copyright + DMCA agent registration** — parked per Sam's request.
9. **Eventually**: rescore Office and Friends with same standup-aware + 3-run consensus for apples-to-apples comparison (even though those shows have no stand-up, the 3-run consensus alone will tighten their CIs).

## Known traps for a new Claude session

- **Don't claim precision you don't have**. The CIs overlap. Seinfeld 79.1 vs Friends 78.7 is not a meaningful ranking difference. When discussing rankings, lean on tier language ("elite cluster") rather than decimal precision.
- **Python scoring repo is SEPARATE** (`~/Downloads/the-humor-index/`). The web repo (`~/the-humor-index/`) only contains the Next.js app + scored output JSONs.
- **Writing directly to JSONs bypasses the SQLite DB**. `analysis/export.py` reads from DB and writes JSONs. If you edit JSONs directly (as we did for the rescore), you must also manually update the aggregates in `shows.json` and `{show}/seasons.json` — they won't regenerate from `export.py` unless the DB is also updated.
- **DNS lives on Vercel** (not Namecheap). All DNS records must be added in Vercel dashboard → Domains → thehumorindex.com.
- **Bootstrap > full Bayesian** for show-level CIs: PyMC is installed but bootstrap over 10k resamples gives equivalent intervals in seconds, not minutes. The published `show_credible_intervals.json` was from PyMC; `ci_95_low/high` fields in `shows.json` are bootstrap.
- **Safety boundary**: Sam may ask for various tasks but passwords, financial data, file downloads need explicit confirmation. Claude Code has standard safety rules — don't enter credentials, don't make purchases without confirmation.

## Useful commands

```bash
# Score a single episode interactively (Python env)
cd ~/Downloads/the-humor-index
python -m analysis.pipeline {slug} --season N --episode N

# Rescore a whole show with 3-run consensus
python -m analysis.batch {slug} --runs 3

# Export from SQLite → JSONs for the web app
python -m analysis.export ~/the-humor-index/public/data

# Quick diff after rescoring (from web repo)
cd ~/the-humor-index && git status --short | head -20

# Check live vs local shows.json
curl -sL https://www.thehumorindex.com/data/shows.json | python3 -m json.tool | head -40
```

## Contact

- **Sam**: sam@thehumorindex.com (primary), sslater765@gmail.com (personal)
- **Legal/press**: legal@thehumorindex.com, privacy@thehumorindex.com
- **Repo**: github.com/sslater765-create/the-humor-index (main branch deploys to Vercel)
