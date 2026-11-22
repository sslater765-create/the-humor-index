'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface StudyJoke { id: number; t: string; who: string; show: string; se: number; ep: number; et: string; s: number }

const DONE_KEY = 'humor_index_study_done';
const RATER_KEY = 'humor_index_study_rater';
const MIN_PER_JOKE = 3;
const MIN_JOKES = 50;

function pearson(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
}

function ranks(v: number[]): number[] {
  const idx = v.map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0]);
  const r = new Array<number>(v.length);
  for (let i = 0; i < idx.length;) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1;
    i = j + 1;
  }
  return r;
}

export default function StudyGame({ jokes }: { jokes: StudyJoke[] }) {
  const [done, setDone] = useState<number[]>([]);
  const [current, setCurrent] = useState<StudyJoke | null>(null);
  const [rater, setRater] = useState('');
  const [last, setLast] = useState<{ joke: StudyJoke; rating: number } | null>(null);
  const [results, setResults] = useState<{ jokes: Record<string, [number, number]>; raters: number } | null>(null);

  useEffect(() => {
    let d: number[] = [];
    try { d = JSON.parse(localStorage.getItem(DONE_KEY) || '[]'); } catch { /* none */ }
    let r = '';
    try {
      r = localStorage.getItem(RATER_KEY) || '';
      if (!r) { r = (crypto.randomUUID?.() ?? String(Math.random()).slice(2)).replace(/[^a-z0-9-]/gi, ''); localStorage.setItem(RATER_KEY, r); }
    } catch { /* private mode */ }
    setDone(d);
    setRater(r);
    // Pick once the counts arrive so the least-rated jokes go first; fall back
    // to a plain random pick if the tallies can't be read.
    fetch('/api/study').then((x) => x.json()).then((res) => { setResults(res); pick(d, res?.jokes); }).catch(() => pick(d));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Least-rated first, random among equals. Random draws over 300 jokes take
  // about 900 ratings before most jokes have three; this gets 50 jokes to three
  // ratings in about 150.
  function pick(d: number[], counts = results?.jokes, exclude?: number) {
    const left = jokes.filter((j) => !d.includes(j.id) && j.id !== exclude);
    if (!left.length) { if (exclude === undefined) setCurrent(null); return; }
    const n = (j: StudyJoke) => counts?.[String(j.id)]?.[1] ?? 0;
    const min = Math.min(...left.map(n));
    const pool = left.filter((j) => n(j) === min);
    setCurrent(pool[Math.floor(Math.random() * pool.length)]);
  }

  async function rate(n: number) {
    if (!current) return;
    const next = done.concat(current.id);
    setLast({ joke: current, rating: n });
    setDone(next);
    try { localStorage.setItem(DONE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    void fetch('/api/study', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: current.id, rating: n, rater }) });
    // Count this rating locally so the next pick moves on from it.
    const id = String(current.id);
    const prev = results?.jokes?.[id] ?? [0, 0];
    const counts = { ...(results?.jokes ?? {}), [id]: [prev[0] + n, prev[1] + 1] as [number, number] };
    if (results) setResults({ ...results, jokes: counts });
    pick(next, counts);
  }

  function skip() {
    if (!current) return;
    pick(done, results?.jokes, current.id);
  }

  const summary = useMemo(() => {
    if (!results) return null;
    const byId = new Map(jokes.map((j) => [String(j.id), j]));
    const rows = Object.entries(results.jokes)
      .filter(([id, [, n]]) => n >= MIN_PER_JOKE && byId.has(id))
      .map(([id, [sum, n]]) => ({ human: sum / n, model: byId.get(id)!.s, n }));
    const ratings = Object.values(results.jokes).reduce((a, [, n]) => a + n, 0);
    const xs = rows.map((r) => r.human), ys = rows.map((r) => r.model);
    return {
      ratings,
      raters: results.raters,
      jokes: rows.length,
      r: pearson(xs, ys),
      rho: pearson(ranks(xs), ranks(ys)),
    };
  }, [results, jokes]);

  return (
    <div>
      {current ? (
        <div className="rounded-2xl border border-brand-border bg-brand-card p-5 sm:p-6">
          <p className="text-xs text-brand-text-muted">Joke {done.length + 1} · show and character revealed after you rate</p>
          <p className="mt-3 font-serif italic text-xl text-brand-text-primary leading-snug">“{current.t}”</p>
          <div className="mt-6 grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => void rate(n)}
                className="rounded-lg border border-brand-border py-2.5 font-mono text-brand-text-primary hover:border-brand-gold hover:text-brand-gold"
                aria-label={`Rate ${n} out of 10`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-brand-text-muted">
            <span>1 = not funny · 10 = one of the funniest lines you know</span>
            <button type="button" onClick={skip} className="hover:text-brand-text-primary">Skip</button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-brand-border bg-brand-card p-5 text-brand-text-secondary">
          You’ve rated every joke in the study. Thank you.
        </p>
      )}

      {last && (
        <p className="mt-4 text-xs text-brand-text-muted">
          Last one (you gave it {last.rating}): <span className="text-brand-text-secondary">{last.joke.who}</span>, {last.joke.show} S{last.joke.se}E{last.joke.ep}{last.joke.et ? ` “${last.joke.et}”` : ''}.
        </p>
      )}
      <p className="mt-2 text-sm text-brand-text-muted">You’ve rated {done.length} of {jokes.length}.</p>

      <section className="mt-12 rounded-xl border border-brand-border bg-brand-card p-5 text-sm text-brand-text-secondary leading-relaxed">
        <p className="text-brand-text-primary font-medium mb-2">Results so far</p>
        {!summary ? (
          <p>Loading…</p>
        ) : summary.jokes < MIN_JOKES ? (
          <>
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-brand-border/60" role="progressbar" aria-valuemin={0} aria-valuemax={MIN_JOKES} aria-valuenow={summary.jokes}>
            <div className="h-2 rounded-full bg-brand-gold" style={{ width: `${(100 * summary.jokes) / MIN_JOKES}%` }} />
          </div>
          <p>
            {summary.ratings.toLocaleString()} ratings from {summary.raters.toLocaleString()} people. We publish the correlation once {MIN_JOKES} jokes
            have at least {MIN_PER_JOKE} ratings each; {summary.jokes} do so far. You get the least-rated jokes first, so every rating moves this bar.
          </p>
          </>
        ) : (
          <p>
            Across {summary.jokes} jokes with {MIN_PER_JOKE}+ ratings ({summary.ratings.toLocaleString()} ratings from {summary.raters.toLocaleString()} people),
            the average human rating and the model’s impact score correlate at r = <span className="font-mono text-brand-gold">{summary.r?.toFixed(2) ?? '–'}</span>
            {' '}(rank correlation <span className="font-mono">{summary.rho?.toFixed(2) ?? '–'}</span>). Above 0.5 would mean the model ranks jokes much as people do;
            near 0 would mean it doesn’t.
          </p>
        )}
        <p className="mt-2 text-xs text-brand-text-muted">
          Live numbers, not yet a finished study. The method and the final result will be on the <Link href="/methodology/#model-card" className="text-brand-gold hover:underline">methodology page</Link>.
        </p>
      </section>
    </div>
  );
}
