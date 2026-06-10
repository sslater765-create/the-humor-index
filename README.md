# The Humor Index — web app

Next.js 14 (App Router) frontend for [thehumorindex.com](https://www.thehumorindex.com). Renders the leaderboard, per-show/episode/character pages, rankings, Compare, Comedy DNA, and the blog — all statically generated from JSON in `public/data/`.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # next lint + tsc --noEmit  ← run this before every push
npm test             # vitest (pure-logic unit tests)
npm run build        # full production build (also type-checks)
```

`npm run check` is the fast guard: it runs the same lint + type-check that `next build` (and Vercel) run, in ~15s, so type errors are caught locally instead of on deploy.

## Architecture

- `app/` — routes (App Router). Pages are server components, mostly `force-static`.
- `components/` — UI. `charts/` (Chart.js), `comedy-dna/`, `explorer/`, `ui/`, `seo/`.
- `lib/` — the logic layer (no React):
  - `site.ts` — **single source of truth for the domain.** `SITE_URL`, `canonical(path)`, `absUrl(path)`. Never hardcode the domain anywhere else.
  - `data.ts` — reads `public/data/*.json` (cached per render). `getAllShows`, `getEpisodes`, `getCharacters`, …
  - `siteStats.ts` — derived counts + leaderboard, so copy (FAQ, methodology) never hardcodes numbers that go stale.
  - `seo.ts` — `pageMeta()` + JSON-LD builders (`tvSeriesJsonLd`, `breadcrumbJsonLd`).
  - `scoring.ts`, `tiers.ts`, `comedyDna.ts`, `constants.ts` (`SHOW_SLUGS` derived from data).
- `public/data/` — **the source of truth for everything on the site** (produced by the scoring pipeline, a separate repo).

## Data contract (`public/data/`)

```
shows.json                      ← leaderboard + per-show metadata (one array)
<slug>/seasons.json             ← season summaries
<slug>/episodes.json            ← per-episode scores
<slug>/s##e##.json              ← per-episode detail incl. every joke
<slug>/characters.json          ← character WAR + stats (+ TMDB actor/photo)
comedy-dna-quiz.json            ← Comedy DNA battle pool (curated)
recommendations.json, search-index.json, top-jokes.json, …
```

A show is **"scored"** iff its `shows.json` entry has `humor_index > 0` and it has a data dir. `humor_index === 0` = a queued "Coming Soon" show (renders a teaser, no data dir required).

## How to add / launch a show

1. Drop the show's data into `public/data/<slug>/` (episodes, seasons, characters, …) — produced by the pipeline.
2. Add/flip its entry in `shows.json` (with `humor_index > 0`, art, network, etc.).
3. That's it for the data — `SHOW_SLUGS`, the sitemap, rankings, search, the FAQ/methodology copy, and the leaderboard all **derive from the data automatically**.
4. Manual editorial touches (not auto-derived): add a "What's New" item in `components/ui/WhatsNewPersonalized.tsx` (keeps the "Debuts at #N" framing), and — deliberately, to avoid clobbering the curated pool — fold it into the Comedy DNA battle separately.
5. `npm run check && npm run build`, then push (Vercel auto-deploys `main`).

## Conventions

- Domain/URLs: only via `lib/site.ts`. Canonicals use a trailing slash (matches `next.config` `trailingSlash: true`).
- Stats in copy: derive from `lib/siteStats.ts`, don't hardcode counts.
- `tsconfig` has `strict` + `noUnusedLocals`/`noUnusedParameters` on — the compiler flags dead code.
