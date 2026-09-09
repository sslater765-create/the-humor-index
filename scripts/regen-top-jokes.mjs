// Regenerates public/data/top-jokes.json: the single highest-scored joke for each
// scored show, one entry per show, sorted by combined score.
//
// This file has been silently reverted twice by rescore exports, which ship an
// older 25-entry version weighted 9 to Seinfeld and 7 to Chappelle's Show while
// fourteen shows have no entry at all. Re-run this after any rescore, and
// `npm run check` will tell you if it drifted again.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'public/data';
const shows = JSON.parse(readFileSync(join(DATA, 'shows.json'), 'utf8'));
const bySlug = new Map(shows.map((s) => [s.slug, s]));

const out = [];
for (const slug of readdirSync(DATA, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()) {
  const dir = join(DATA, slug);
  if (!existsSync(join(dir, 'episodes.json'))) continue;

  let best = null;
  for (const f of readdirSync(dir).filter((f) => /^s\d+e\d+\.json$/.test(f))) {
    const ep = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    for (const j of ep.jokes ?? []) {
      const combined = Math.round(((j.craft_total + j.impact_score) / 2 + Number.EPSILON) * 100) / 100;
      if (!best || combined > best.combined) {
        best = {
          show: bySlug.get(slug)?.name ?? slug,
          show_slug: slug,
          season: ep.season,
          episode_number: ep.episode_number,
          episode_title: ep.title,
          characters: j.characters ?? [],
          text: j.text,
          craft: j.craft_total,
          impact: j.impact_score,
          combined,
          quotability: j.quotability,
          joke_types: j.joke_types ?? [],
          explanation: j.explanation ?? '',
        };
      }
    }
  }
  if (best) out.push(best);
}

out.sort((a, b) => b.combined - a.combined);
writeFileSync(join(DATA, 'top-jokes.json'), JSON.stringify(out, null, 2));
console.log(`wrote ${out.length} entries, one per scored show`);
