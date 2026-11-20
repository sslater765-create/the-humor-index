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

// The current scoring model often wraps a line in narration ("Ron Swanson emerges
// as 'Duke Silver' — ..."). Featured jokes must read as lines, so: unwrap a single
// quoted line from narration, and skip exchanges, songs and stage directions.
const NARRATION = /\b(emerges|reveals|delivers|says|responds|replies|shouting|performs|demonstrates|deadpan(ly)?|mid-scene|mid-song|in its entirety|confessional|talking[- ]head|stinger|cold open|closes|speech|revelation|immediately|monologue)\b/i;
function cleanQuote(raw) {
  let t = (raw ?? '').trim().replace(/[\u2018\u2019]/g, "'");
  if (/^(SONG|SKETCH|BIT|SCENE)\b/i.test(t)) return null;
  // "Phoebe sees Ross and Rachel kiss: 'See? He's her lobster!" -> the quoted line.
  const thirdPerson = /^[A-Z][a-z]+(?:'s)? [a-z]+\b/.test(t) && !/^[A-Z][a-z]+ (I|I'm|you|we)\b/.test(t);
  if (thirdPerson) {
    const afterColon = t.match(/:\s*['"\u201c](.{12,}?)['"\u201d]?\s*$/);
    if (!afterColon) return null;
    t = afterColon[1];
  }
  const wrapped = t.match(/^([A-Z][A-Za-z.' -]{0,24}):\s*['"\u201c](.+)['"\u201d]$/);
  if (wrapped) t = wrapped[2];
  else {
    const spans = [...t.matchAll(/(?:^|(?<=[\s:(\u2014-]))['"\u201c](.{12,}?)['"\u201d](?=$|[\s.,!?;:\u2014)-])/g)].map(m => m[1]);
    if (spans.length > 1) return null;
    if (spans.length === 1 && NARRATION.test(t.replace(spans[0], ''))) t = spans[0];
  }
  if (/ \/ |[[\](){}]/.test(t) || NARRATION.test(t)) return null;
  if (/['"\u201d]\s+[\u2014-]|['"] ['"]|[.!?,]['"] [A-Z]/.test(t)) return null;
  if (/(^|[\s'"])[A-Z][a-z]+( [A-Z][a-z]+)?:\s/.test(t)) return null;
  t = t.replace(/^['"\s]+|['"\s]+$/g, '');
  if (t.length < 20 || t.length > 220) return null;
  return t;
}

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
      const text = cleanQuote(j.text);
      if (!text) continue;
      const combined = Math.round(((j.craft_total + j.impact_score) / 2 + Number.EPSILON) * 100) / 100;
      if (!best || combined > best.combined) {
        best = {
          show: bySlug.get(slug)?.name ?? slug,
          show_slug: slug,
          season: ep.season,
          episode_number: ep.episode_number,
          episode_title: ep.title,
          characters: j.characters ?? [],
          text,
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
