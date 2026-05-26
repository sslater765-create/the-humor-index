// Comedy DNA — shared constants + pure recommender math (safe in client & server).
// Ported from the validated prototype: baseline-centered, inverse-frequency-weighted
// cosine with small-sample shrinkage. No fs/DOM here so it can be imported anywhere.

import type { JokeType } from './types';

// Canonical joke-type order. MUST match the `types` array in comedy-dna-quiz.json
// and the keys present in comedy-dna.json.
export const DNA_TYPES: JokeType[] = [
  'character_comedy', 'escalation', 'absurdist', 'cringe_discomfort', 'observational',
  'irony_sarcasm', 'setup_punchline', 'deadpan_understatement', 'wordplay_pun', 'dark_subversive',
  'callback', 'misdirection', 'reaction_beat', 'visual_gag', 'physical_slapstick',
  'meta_self_referential', 'running_gag', 'awkward_silence',
];
const N = DNA_TYPES.length;
const TI: Record<string, number> = Object.fromEntries(DNA_TYPES.map((t, i) => [t, i]));

export interface QuizJoke { id: number; text: string; slug: string; show?: string; vec: number[]; quot?: number; speaker?: string; ep?: string; etitle?: string; scene?: string; }
export interface QuizData { types: JokeType[]; pool: QuizJoke[]; reco: QuizJoke[]; }
export interface ShowFingerprint { slug: string; name: string; fp: number[]; n: number; }

export interface Archetype {
  name: string; tag: string; blurb: string; slug: string;
  weights: Partial<Record<JokeType, number>>; tags: string[]; emblem: number;
}

export const ARCHES: Archetype[] = [
  { name: 'The Wordsmith', tag: 'Language doing backflips.', slug: 'wordsmith',
    blurb: 'You live for the perfectly engineered line — wordplay, irony, a setup that snaps shut like a trap. The funniest thing in the room is usually a sentence.',
    weights: { wordplay_pun: 3, irony_sarcasm: 2, observational: 2, misdirection: 2, setup_punchline: 1.5, deadpan_understatement: 1 }, tags: ['wordplay', 'irony', 'tight writing'], emblem: 0 },
  { name: 'The Absurdist', tag: 'The weirder, the better.', slug: 'absurdist',
    blurb: "Logic is optional. You're drawn to comedy that escalates into the surreal, breaks its own reality, and commits fully to the bit no matter how strange it gets.",
    weights: { absurdist: 3, escalation: 2, meta_self_referential: 2, visual_gag: 1.5, physical_slapstick: 1 }, tags: ['absurd', 'escalation', 'meta'], emblem: 1 },
  { name: 'The Cringe Connoisseur', tag: 'Comedy from behind a pillow.', slug: 'cringe-connoisseur',
    blurb: "You savor the squirm. The longer the silence, the more painful the misstep, the better — discomfort is the whole point and you wouldn't look away for anything.",
    weights: { cringe_discomfort: 3, awkward_silence: 2.5, dark_subversive: 1.5, character_comedy: 1 }, tags: ['cringe', 'awkward', 'second-hand embarrassment'], emblem: 2 },
  { name: 'The Character Devotee', tag: "It's about who's saying it.", slug: 'character-devotee',
    blurb: "The line only kills because of who delivers it. You're loyal to comedy that grows out of character — callbacks, running gags, people being exactly themselves.",
    weights: { character_comedy: 3, callback: 2, running_gag: 2, reaction_beat: 1 }, tags: ['character', 'callbacks', 'running gags'], emblem: 3 },
  { name: 'The Deadpan Purist', tag: 'Dry as the Sahara.', slug: 'deadpan-purist',
    blurb: 'No mugging, no winking. You like it underplayed — the throwaway delivery, the observation so dry it takes a beat to land. Understatement is the highest form.',
    weights: { deadpan_understatement: 3, observational: 2.2, irony_sarcasm: 2, misdirection: 1 }, tags: ['deadpan', 'dry wit', 'understated'], emblem: 4 },
  { name: 'The Anarchist', tag: 'No line uncrossed.', slug: 'anarchist',
    blurb: "You want it loud, dark, and a little dangerous — comedy that escalates into chaos and isn't afraid to go to the bad place. Polite is boring.",
    weights: { dark_subversive: 3, escalation: 2, physical_slapstick: 2, absurdist: 1.5 }, tags: ['dark', 'subversive', 'chaos'], emblem: 5 },
];
export function archetypeBySlug(slug: string): Archetype | undefined { return ARCHES.find(a => a.slug === slug); }

export const AXES: Array<{ left: string; right: string; l: JokeType[]; r: JokeType[] }> = [
  { left: 'Verbal', right: 'Physical', l: ['wordplay_pun', 'irony_sarcasm', 'observational', 'deadpan_understatement', 'misdirection', 'setup_punchline'], r: ['visual_gag', 'physical_slapstick', 'reaction_beat', 'escalation'] },
  { left: 'Grounded', right: 'Absurd', l: ['observational', 'deadpan_understatement', 'character_comedy', 'cringe_discomfort'], r: ['absurdist', 'meta_self_referential', 'visual_gag', 'wordplay_pun'] },
  { left: 'Warm', right: 'Dark', l: ['character_comedy', 'callback', 'running_gag'], r: ['dark_subversive', 'cringe_discomfort', 'awkward_silence'] },
  { left: 'Tidy', right: 'Chaotic', l: ['setup_punchline', 'misdirection', 'wordplay_pun', 'callback'], r: ['escalation', 'physical_slapstick', 'absurdist', 'reaction_beat'] },
];

export const TYPE_LABEL: Record<JokeType, string> = {
  character_comedy: 'character-driven humor', escalation: 'escalating chaos', absurdist: 'absurdism',
  cringe_discomfort: 'cringe', observational: 'observational wit', irony_sarcasm: 'irony & sarcasm',
  setup_punchline: 'tight setup-punchlines', deadpan_understatement: 'deadpan', wordplay_pun: 'wordplay',
  dark_subversive: 'dark, subversive humor', callback: 'callbacks', misdirection: 'misdirection',
  reaction_beat: 'reaction beats', visual_gag: 'visual gags', physical_slapstick: 'slapstick',
  meta_self_referential: 'meta humor', running_gag: 'running gags', awkward_silence: 'awkward silences',
};

// Archetype emblems — hand-drawn SVG (inner markup). Colors use the site's brand palette.
export const EMBLEMS: Array<{ c: string; svg: string }> = [
  { c: '#1D9E75', svg: '<path d="M14 50 L20 30 L42 12 L54 24 L34 44 Z" fill="#1D9E75" fill-opacity=".18" stroke="none"/><path d="M14 50 L20 30 L42 12 L54 24 L34 44 Z"/><line x1="22" y1="42" x2="42" y2="22"/><circle cx="17" cy="47" r="2.6" fill="#1D9E75" stroke="none"/>' },
  { c: '#E8B931', svg: '<path d="M32 12 a20 20 0 0 1 0 40 a16 16 0 0 1 0 -32 a12 12 0 0 1 0 24 a8 8 0 0 1 0 -16 a5 5 0 0 1 0 10"/>' },
  { c: '#D85A30', svg: '<circle cx="23" cy="24" r="3.2" fill="#D85A30" stroke="none"/><circle cx="41" cy="24" r="3.2" fill="#D85A30" stroke="none"/><rect x="19" y="36" width="26" height="13" rx="3.5"/><line x1="19" y1="42.5" x2="45" y2="42.5"/><line x1="27" y1="36" x2="27" y2="49"/><line x1="35" y1="36" x2="35" y2="49"/>' },
  { c: '#7F77DD', svg: '<path d="M18 18 C18 15 46 15 46 18 C49 35 41 47 32 49 C23 47 15 35 18 18 Z" fill="#7F77DD" fill-opacity=".18" stroke="none"/><path d="M18 18 C18 15 46 15 46 18 C49 35 41 47 32 49 C23 47 15 35 18 18 Z"/><path d="M22 27 q4 -4 8 0"/><path d="M34 27 q4 -4 8 0"/><path d="M24 36 q8 7 16 0"/>' },
  { c: '#378ADD', svg: '<rect x="13" y="23" width="15" height="11" rx="3.5" fill="#378ADD" fill-opacity=".2"/><rect x="36" y="23" width="15" height="11" rx="3.5" fill="#378ADD" fill-opacity=".2"/><line x1="28" y1="26.5" x2="36" y2="26.5"/><line x1="24" y1="44" x2="40" y2="44"/>' },
  { c: '#E24B4A', svg: '<circle cx="29" cy="40" r="14" fill="#E24B4A" fill-opacity=".18"/><circle cx="29" cy="40" r="14"/><path d="M40 30 q5 -7 10 -9"/><line x1="50" y1="21" x2="50" y2="15"/><line x1="50" y1="21" x2="55" y2="18"/><line x1="50" y1="21" x2="45" y2="18"/><circle cx="24" cy="35" r="2.4" fill="#fff" stroke="none"/>' },
];

export function emblemSVG(i: number, size: number): string {
  const e = EMBLEMS[i];
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" stroke="${e.c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">${e.svg}</svg>`;
}

// Show monogram tiles — brand-evoking colors that read well on the dark theme.
export const SHOW_STYLE: Record<string, { c: string; m: string }> = {
  'the-office': { c: '#378ADD', m: 'TO' }, 'seinfeld': { c: '#E24B4A', m: 'SE' },
  'friends': { c: '#D4537E', m: 'FR' }, '30-rock': { c: '#7F77DD', m: '30' },
  'community': { c: '#1D9E75', m: 'CO' }, 'parks-and-recreation': { c: '#3FB6A8', m: 'PR' },
  'arrested-development': { c: '#D85A30', m: 'AD' }, 'taxi': { c: '#E8B931', m: 'TX' },
  'schitts-creek': { c: '#9C8CF0', m: 'SC' }, 'the-simpsons': { c: '#5BB0E8', m: 'SI' },
};

export function relLum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const a = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
export function tileText(c: string): string { const L = relLum(c); return 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#ffffff' : '#16130f'; }
const STOP = new Set(['the', 'and', 'a', 'an', 'in', 'of', 'to', 'is']);
export function autoStyle(slug: string): { c: string; m: string } {
  let h = 0; for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const hex = hslToHex(h % 360, 55, 52);
  const words = slug.split('-').filter(w => w && !STOP.has(w));
  const m = (words.length >= 2 ? words[0][0] + words[1][0] : slug.replace(/-/g, '').slice(0, 2) || '??').toUpperCase();
  return { c: hex, m };
}
function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100; const a = s * Math.min(l, 1 - l);
  const f = (n: number) => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}
export function showStyle(slug: string): { c: string; m: string } { return SHOW_STYLE[slug] || autoStyle(slug); }

// ---------- math ----------
export function dot(a: number[], b: number[]): number { let s = 0; for (let i = 0; i < N; i++) s += a[i] * b[i]; return s; }
export function l1norm(v: number[]): number[] { const s = v.reduce((x, y) => x + y, 0) || 1; return v.map(x => x / s); }

export function buildBaseline(pool: QuizJoke[]): number[] {
  return DNA_TYPES.map((_, d) => pool.reduce((s, j) => s + (j.vec[d] || 0), 0) / (pool.length || 1));
}
// Fingerprints come in as raw type→share vectors; we L1-normalize each so percent vs fraction scaling is irrelevant.
export function normalizeFingerprints(fps: ShowFingerprint[]): ShowFingerprint[] {
  return fps.map(f => ({ ...f, fp: l1norm(f.fp) }));
}
export function meanFingerprint(fps: ShowFingerprint[]): number[] {
  return DNA_TYPES.map((_, d) => fps.reduce((s, f) => s + f.fp[d], 0) / (fps.length || 1));
}
export function buildWeights(meanFp: number[]): number[] {
  const raw = meanFp.map(m => 1 / Math.sqrt(m + 0.005));
  const mean = raw.reduce((a, b) => a + b, 0) / N;
  return raw.map(x => x / mean);
}
function wdot(a: number[], b: number[], w: number[]): number { let s = 0; for (let i = 0; i < N; i++) s += w[i] * a[i] * b[i]; return s; }
function wnorm(a: number[], w: number[]): number { return Math.sqrt(wdot(a, a, w)) || 1e-9; }
export function wcos(a: number[], b: number[], w: number[]): number { return wdot(a, b, w) / (wnorm(a, w) * wnorm(b, w)); }

const SHRINK_K = 4000;
export function centeredShow(f: ShowFingerprint, meanFp: number[]): number[] {
  return DNA_TYPES.map((_, d) => {
    const shrunk = (f.n * f.fp[d] + SHRINK_K * meanFp[d]) / (f.n + SHRINK_K);
    return shrunk - meanFp[d];
  });
}

export function rankArchetypes(pref: number[], w: number[]): { arche: Archetype; score: number }[] {
  return ARCHES.map(a => ({ arche: a, score: wcos(pref, DNA_TYPES.map(t => a.weights[t] || 0), w) }))
    .sort((x, y) => y.score - x.score);
}
export interface ShowRank { slug: string; name: string; fp: number[]; score: number; pct: number; }
export function rankShows(pref: number[], fps: ShowFingerprint[], meanFp: number[], w: number[]): ShowRank[] {
  const scored = fps.map(f => ({ slug: f.slug, name: f.name, fp: f.fp, score: wcos(pref, centeredShow(f, meanFp), w) }))
    .sort((a, b) => b.score - a.score);
  const hi = scored[0]?.score ?? 1, lo = scored[scored.length - 1]?.score ?? 0, span = (hi - lo) || 1;
  return scored.map(s => ({ ...s, pct: Math.round(73 + 25 * ((s.score - lo) / span)) }));
}
export function topUserTypes(pref: number[], w: number[], k: number): JokeType[] {
  return DNA_TYPES.map((t, d) => ({ t, v: w[d] * pref[d] })).filter(x => x.v > 0).sort((a, b) => b.v - a.v).slice(0, k).map(x => x.t);
}
export function whyText(show: ShowRank, pref: number[], w: number[], meanFp: number[]): string {
  const mine = topUserTypes(pref, w, 4);
  const overlap = mine.filter(t => show.fp[TI[t]] > meanFp[TI[t]]);
  const use = (overlap.length ? overlap : mine).slice(0, 2).map(t => TYPE_LABEL[t]);
  const phrase = use.length === 2 ? `${use[0]} and ${use[1]}` : (use[0] || 'this exact mix');
  return `You leaned into ${phrase} — that's right in ${show.name}'s wheelhouse.`;
}

// For each archetype, the live show whose joke-type fingerprint matches it most
// (same weighted-cosine the recommender uses). Greedy-unique assignment so the
// public archetype section shows distinct shows when the catalog allows.
export function archetypeExemplars(fps: ShowFingerprint[]): { arche: Archetype; slug: string; name: string }[] {
  if (!fps.length) return ARCHES.map(a => ({ arche: a, slug: '', name: '' }));
  const norm = normalizeFingerprints(fps);
  const mean = meanFingerprint(norm);
  const w = buildWeights(mean);
  const cen = norm.map(f => centeredShow(f, mean));
  const archeVecs = ARCHES.map(a => DNA_TYPES.map(t => a.weights[t] || 0));

  const pairs: { ai: number; fi: number; s: number }[] = [];
  archeVecs.forEach((av, ai) => norm.forEach((_, fi) => pairs.push({ ai, fi, s: wcos(av, cen[fi], w) })));
  pairs.sort((a, b) => b.s - a.s);

  const picked: (ShowFingerprint | null)[] = ARCHES.map(() => null);
  const usedShow = new Set<number>();
  for (const p of pairs) {
    if (picked[p.ai] || usedShow.has(p.fi)) continue;
    picked[p.ai] = norm[p.fi]; usedShow.add(p.fi);
  }
  // Fallback if there are fewer shows than archetypes: allow the best (possibly reused).
  picked.forEach((sel, ai) => {
    if (sel) return;
    let best = norm[0], bestS = -Infinity;
    norm.forEach((f, fi) => { const s = wcos(archeVecs[ai], cen[fi], w); if (s > bestS) { bestS = s; best = f; } });
    picked[ai] = best;
  });

  return ARCHES.map((a, ai) => ({ arche: a, slug: picked[ai]!.slug, name: picked[ai]!.name }));
}

// Position on one taste axis (0=left .. 1=right), widened for readability. Works
// for a user's win-fractions or a show's normalized fingerprint — same formula.
export function axisValue(frac: number[], axis: { l: JokeType[]; r: JokeType[] }): number {
  const ls = axis.l.reduce((s, t) => s + frac[TI[t]], 0);
  const rs = axis.r.reduce((s, t) => s + frac[TI[t]], 0);
  let pr = (ls + rs) > 0 ? rs / (ls + rs) : 0.5;
  pr = 0.5 + (pr - 0.5) * 1.5;
  return Math.max(0.06, Math.min(0.94, pr));
}

// Top-N pool jokes that best match an archetype (for per-archetype pages).
export function archetypeExampleJokes<T extends { vec: number[] }>(a: Archetype, pool: T[], n: number): T[] {
  const av = DNA_TYPES.map(t => a.weights[t] || 0);
  return [...pool].map(j => ({ j, s: dot(j.vec, av) })).sort((x, y) => y.s - x.s).slice(0, n).map(x => x.j);
}
