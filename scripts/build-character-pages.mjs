// Writes lib/character-pages.json: for each show, the characters that get a
// built page (same rule as generateStaticParams in the character route:
// at least 20 jokes across at least 3 episodes). Links to anyone else 404'd,
// which is how Search Console ended up with 2,000+ "not found" pages.
// Runs before every build (npm prebuild).
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'public/data';
const out = {};
for (const d of readdirSync(DATA, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const f = join(DATA, d.name, 'characters.json');
  if (!existsSync(f)) continue;
  const names = JSON.parse(readFileSync(f, 'utf8'))
    .filter((c) => (c.total_jokes ?? 0) >= 20 && (c.episodes_appeared ?? 0) >= 3)
    .map((c) => c.name);
  if (names.length) out[d.name] = names.sort();
}
writeFileSync('lib/character-pages.json', JSON.stringify(out) + '\n');
console.log('character pages:', Object.values(out).reduce((n, a) => n + a.length, 0));
