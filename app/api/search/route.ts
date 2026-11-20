// Joke search, run on the server. The index is 33 MB; the search page used to
// download all of it to every visitor's phone before the box would accept input.
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

interface CompactJoke { i: number; t: string; c: string[]; jt: string[]; cr: number; im: number; sn: string; ss: string; s: number; e: number; et: string }
interface Indexed extends CompactJoke { hay: string }
interface Suggestion { label: string; type: 'character' | 'episode'; count: number; slug: string }

let INDEX: Indexed[] | null = null;
let SUGGEST: Suggestion[] = [];
let TYPES: string[] = [];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function load() {
  if (INDEX) return;
  const raw = fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'search-index.json'), 'utf-8');
  const data = JSON.parse(raw) as CompactJoke[];
  INDEX = data.map(j => ({ ...j, hay: norm(`${j.t} ${j.c.join(' ')} ${j.sn} ${j.et}`) }));
  const items = new Map<string, Suggestion>();
  const types = new Set<string>();
  for (const j of data) {
    j.jt.forEach(t => types.add(t));
    for (const c of j.c) {
      const k = `${c.toLowerCase()}-${j.ss}`;
      const it = items.get(k);
      if (it) it.count++; else items.set(k, { label: c, type: 'character', count: 1, slug: j.ss });
    }
    const ep = `${j.sn} S${j.s}E${String(j.e).padStart(2, '0')} ${j.et}`;
    if (!items.has(ep.toLowerCase())) items.set(ep.toLowerCase(), { label: ep, type: 'episode', count: 1, slug: j.ss });
  }
  SUGGEST = Array.from(items.values()).sort((a, b) => b.count - a.count);
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
      const score = (j: Indexed) => (j.hay.includes(nq) ? 1000 : 0) + res.reduce((s, re) => s + (re.test(j.hay) ? 1 : 0), 0);
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
