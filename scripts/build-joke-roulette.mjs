// Builds public/data/joke-roulette.json: a pool of the cleanest, highest-scored
// lines across the ranked shows, for the homepage "one more" button.
// At most one line per episode and 24 per show, so no show dominates.
// Re-run after any rescore:  node scripts/build-joke-roulette.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'public/data';
const AWAITING = new Set(['curb-your-enthusiasm', 'the-simpsons', 'community', 'futurama', 'taxi', 'the-fresh-prince-of-bel-air']);
const shows = JSON.parse(readFileSync(join(DATA, 'shows.json'), 'utf8'));
const ranked = shows.filter((s) => s.humor_index > 0 && !AWAITING.has(s.slug));

const NARRATION = /\b(emerges|reveals|delivers|says|responds|replies|shouting|performs|demonstrates|deadpan(ly)?|mid-scene|mid-song|in its entirety|confessional|talking[- ]head|stinger|cold open|closes|speech|revelation|immediately|monologue|scene)\b/i;
function cleanQuote(raw) {
  let t = (raw ?? '').trim().replace(/[‘’]/g, "'");
  if (/^(SONG|SKETCH|BIT|SCENE)\b/i.test(t)) return null;
  const thirdPerson = /^[A-Z][a-z]+(?:'s)? [a-z]+\b/.test(t) && !/^[A-Z][a-z]+ (I|I'm|you|we)\b/.test(t);
  if (thirdPerson) {
    const afterColon = t.match(/:\s*['"“](.{12,}?)['"”]?\s*$/);
    if (!afterColon) return null;
    t = afterColon[1];
  }
  const wrapped = t.match(/^([A-Z][A-Za-z.' -]{0,24}):\s*['"“](.+)['"”]$/);
  if (wrapped) t = wrapped[2];
  else {
    const spans = [...t.matchAll(/(?:^|(?<=[\s:(—-]))['"“](.{12,}?)['"”](?=$|[\s.,!?;:—)-])/g)].map((m) => m[1]);
    if (spans.length > 1) return null;
    if (spans.length === 1 && NARRATION.test(t.replace(spans[0], ''))) t = spans[0];
  }
  if (/ \/ |[[\](){}]|\.\.\.|…/.test(t) || NARRATION.test(t)) return null;
  if (/['"”]\s+[—-]|['"] ['"]|[.!?,]['"] [A-Z]/.test(t)) return null;
  if (/(^|[\s'"])[A-Z][a-z]+( [A-Z][a-z]+)?:\s/.test(t)) return null;
  t = t.replace(/^['"\s]+|['"\s]+$/g, '');
  if (t.length < 24 || t.length > 180) return null;
  if (/¶|\u2014 [A-Z][\w.]*'s |'s (closing|opening|reason|line|reaction|response|answer|declaration|exit|entrance)\b|:\s*'/.test(t)) return null;
  if (EXPLICIT.test(t)) return null;
  return t;
}
// Above the fold on the homepage: keep it ad-safe.
const EXPLICIT = /\b(fuck|shit|cunt|pussy|cock|bitch|dick|whore|slut|nigg|fag|retard|rape|cum|tits?|titty|aids|suicide|penis|vagina|dildo|porn|molest)/i;
const UNKNOWN = /^(unknown|unnamed|various|multiple|ensemble|narrator|everyone|all|group|crowd)/i;

const pool = [];
for (const s of ranked) {
  const dir = join(DATA, s.slug);
  if (!existsSync(dir)) continue;
  const cands = [];
  for (const f of readdirSync(dir).filter((f) => /^s\d+e\d+\.json$/.test(f))) {
    const ep = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    let best = null;
    for (const j of ep.jokes ?? []) {
      const text = cleanQuote(j.text);
      if (!text) continue;
      const who = (j.characters ?? []).filter((c) => c && !UNKNOWN.test(c));
      if (who.length !== 1) continue; // one clear speaker reads best out of context
      const score = (j.craft_total + j.impact_score) / 2;
      if (!best || score > best.score) {
        best = { text, who: who[0], score: Math.round(score * 10) / 10, s: ep.season, e: ep.episode_number, t: ep.title };
      }
    }
    if (best && best.score >= 8.2) cands.push(best);
  }
  cands.sort((a, b) => b.score - a.score);
  for (const c of cands.slice(0, 24)) pool.push({ slug: s.slug, show: s.name, ...c });
}
pool.sort((a, b) => b.score - a.score);
writeFileSync(join(DATA, 'joke-roulette.json'), JSON.stringify(pool));
const by = {};
for (const p of pool) by[p.slug] = (by[p.slug] ?? 0) + 1;
console.log(pool.length, 'lines', by);
