// Joke search, run on the server. The index is 33 MB; the search page used to
// download all of it to every visitor's phone before the box would accept input.
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

interface CompactJoke { i: number; t: string; c: string[]; jt: string[]; cr: number; im: number; sn: string; ss: string; s: number; e: number; et: string; mv?: string }
interface Indexed extends CompactJoke { hay: string; txt: string }
interface Suggestion { label: string; type: 'character' | 'episode' | 'movie'; count: number; slug: string; href?: string }

let INDEX: Indexed[] | null = null;
let SUGGEST: Suggestion[] = [];
let TYPES: string[] = [];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function load() {
  if (INDEX) return;
  const raw = fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'search-index.json'), 'utf-8');
  const data = JSON.parse(raw) as CompactJoke[];
  // Movies: every joke from each published film, tagged mv=<slug>. s/e are 0
  // and et holds the film-time timestamp. Titles go in as suggestions.
  const movieSuggest: Suggestion[] = [];
  try {
    const dir = path.join(process.cwd(), 'public', 'data', 'movies');
    const list = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf-8')) as Array<{ slug: string; title: string; year: number; total_jokes: number }>;
    for (const m of list) {
      const d = JSON.parse(fs.readFileSync(path.join(dir, `${m.slug}.json`), 'utf-8')) as {
        jokes: Array<{ id: number; t: number | null; text: string; characters: string[]; joke_types: string[]; craft: number; impact: number }>;
      };
      const short = m.title.split(':')[0].trim();
      for (const j of d.jokes) {
        const t = j.t ?? 0;
        data.push({ i: j.id, t: j.text, c: j.characters, jt: j.joke_types, cr: j.craft, im: j.impact,
          sn: short, ss: m.slug, s: 0, e: 0, et: `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`, mv: m.slug });
      }
      movieSuggest.push({ label: `${short} (${m.year})`, type: 'movie', count: m.total_jokes, slug: m.slug, href: `/movies/${m.slug}` });
    }
  } catch { /* no movies published */ }
  INDEX = data.map(j => ({ ...j, hay: norm(`${j.t} ${j.c.join(' ')} ${j.sn} ${j.et}`), txt: norm(j.t) }));
  const items = new Map<string, Suggestion>();
  const types = new Set<string>();
  for (const j of data) {
    j.jt.forEach(t => types.add(t));
    for (const c of j.c) {
      const k = `${c.toLowerCase()}-${j.ss}`;
      const it = items.get(k);
      if (it) it.count++; else items.set(k, { label: c, type: 'character', count: 1, slug: j.ss });
    }
    if (j.mv) continue;
    const ep = `${j.sn} S${j.s}E${String(j.e).padStart(2, '0')} ${j.et}`;
    if (!items.has(ep.toLowerCase())) items.set(ep.toLowerCase(), { label: ep, type: 'episode', count: 1, slug: j.ss });
  }
  SUGGEST = [...movieSuggest, ...Array.from(items.values()).sort((a, b) => b.count - a.count)];
  TYPES = Array.from(types).sort();
}

export function GET(req: NextRequest) {
  load();
  const sp = req.nextUrl.searchParams;
  const q = (sp.get('q') || '').slice(0, 120);
  const type = sp.get('type') || '';
  const sort = sp.get('sort') || 'relevance';
  const headers = { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' };

  if (sp.get('meta')) {
    return NextResponse.json({ total: INDEX!.length, types: TYPES }, { headers });
  }

  const nq = norm(q);
  const suggestions = nq.length >= 2 && sp.get('suggest')
    ? SUGGEST.filter(s => s.label.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  if (!nq && !type) return NextResponse.json({ results: [], suggestions }, { headers });

  let list: Indexed[] = INDEX!;
  if (type) list = list.filter(j => j.jt.includes(type));
  if (nq) {
    const tokens = nq.split(' ').filter(Boolean);
    list = list.filter(j => tokens.every(t => j.hay.includes(t)));
    if (sort === 'relevance') {
      const res = tokens.map(t => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`));
      // The joke's own words outrank everything else: an exact phrase in the
      // line first, then every word in the line, and only then matches that
      // come from the episode title or speaker ("serenity now" used to return
      // every joke from "The Serenity Now", led by "Hoochie mama").
      const score = (j: Indexed) =>
        (j.txt.includes(nq) ? 3000 : 0) +
        (tokens.every(t => j.txt.includes(t)) ? 1000 : 0) +
        (j.hay.includes(nq) ? 100 : 0) +
        res.reduce((s, re) => s + (re.test(j.txt) ? 2 : re.test(j.hay) ? 1 : 0), 0);
      list = list.map(j => ({ j, s: score(j) }))
        .sort((a, b) => b.s - a.s || (b.j.cr + b.j.im) - (a.j.cr + a.j.im))
        .map(x => x.j);
    }
  }
  if (sort === 'craft') list = [...list].sort((a, b) => b.cr - a.cr);
  else if (sort === 'impact') list = [...list].sort((a, b) => b.im - a.im);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const results = list.slice(0, 50).map(({ hay, ...j }) => j);
  return NextResponse.json({ results, suggestions, matches: list.length }, { headers });
}
