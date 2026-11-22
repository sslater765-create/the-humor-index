'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ROUND_CLOSES, ROUND_NAMES, openRound } from '@/lib/bracket';

export interface BracketGag {
  id: string; slug: string; show: string; name: string; lar: number; gp: number; hit: number; line: string; legacy: boolean; seed?: number;
}

const MY_KEY = 'humor_index_gag_bracket_v2';

/** Standard seeding: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15. */
const ORDER = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', timeZone: 'America/New_York' }) + ' ET';

type Slot = BracketGag | undefined;

export default function GagBracket({ gags }: { gags: BracketGag[] }) {
  const bySeed = useMemo(() => new Map(gags.map((g) => [g.seed!, g])), [gags]);
  const first = useMemo(() => ORDER.map((s) => bySeed.get(s)), [bySeed]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(() => openRound());
  const [mine, setMine] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { setMine(JSON.parse(localStorage.getItem(MY_KEY) || '{}')); } catch { /* none */ }
    fetch('/api/bracket')
      .then((r) => r.json())
      .then((d) => { setVotes(d.votes || {}); if (typeof d.open === 'number') setOpen(d.open); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  function tally(r: number, a: BracketGag, b: BracketGag): [number, number] {
    const [x, y] = [a.id, b.id].sort();
    return [Number(votes[`${r}|${x}|${y}|${a.id}`] || 0), Number(votes[`${r}|${x}|${y}|${b.id}`] || 0)];
  }

  // Closed rounds are decided by the crowd; a tie goes to the higher seed.
  function winner(r: number, a: Slot, b: Slot): Slot {
    if (!a || !b) return undefined;
    const [va, vb] = tally(r, a, b);
    if (va !== vb) return va > vb ? a : b;
    return (a.seed ?? 99) < (b.seed ?? 99) ? a : b;
  }

  const rounds: Slot[][] = [first];
  for (let r = 1; r < 4; r++) {
    const prev = rounds[r - 1];
    rounds.push(Array.from({ length: prev.length / 2 }, (_, i) => (r - 1 < open ? winner(r - 1, prev[2 * i], prev[2 * i + 1]) : undefined)));
  }
  const champion = open >= 4 ? winner(3, rounds[3][0], rounds[3][1]) : undefined;

  function vote(r: number, a: BracketGag, b: BracketGag, pick: BracketGag) {
    const key = `${r}|${a.id}|${b.id}`;
    if (mine[key]) return;
    const next = { ...mine, [key]: pick.id };
    setMine(next);
    try { localStorage.setItem(MY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    const [x, y] = [a.id, b.id].sort();
    const k = `${r}|${x}|${y}|${pick.id}`;
    setVotes((v) => ({ ...v, [k]: String(Number(v[k] || 0) + 1) }));
    void fetch('/api/bracket', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ round: r, a: a.id, b: b.id, winner: pick.id }),
    });
  }

  const status = (r: number) =>
    r < open ? 'Final' : r === open ? `Voting open · closes ${fmt(ROUND_CLOSES[r])}` : `Opens ${fmt(ROUND_CLOSES[r - 1])}`;

  return (
    <div className="space-y-12">
      {/* The whole bracket at a glance. */}
      <section aria-label="Bracket overview" className="overflow-x-auto">
        <div className="grid min-w-[44rem] grid-cols-4 gap-3">
          {rounds.map((list, r) => (
            <div key={r} className="flex flex-col">
              <p className={`mb-2 font-mono text-[11px] uppercase tracking-widest ${r === open ? 'text-brand-gold' : 'text-brand-text-muted'}`}>{ROUND_NAMES[r]}</p>
              <div className="flex flex-1 flex-col justify-around gap-2">
                {Array.from({ length: list.length / 2 }, (_, m) => {
                  const a = list[2 * m], b = list[2 * m + 1];
                  const w = r < open ? winner(r, a, b) : undefined;
                  return (
                    <div key={m} className={`rounded-md border-l-2 bg-brand-card px-2 py-1.5 text-xs ${r === open ? 'border-brand-gold' : 'border-brand-border'}`}>
                      {[a, b].map((g, k) => (
                        <p key={k} className={`truncate ${g && w && w.id !== g.id ? 'text-brand-text-muted line-through decoration-brand-text-muted/50' : g ? 'text-brand-text-primary' : 'text-brand-text-muted'}`}>
                          {g ? <><span className="font-mono text-brand-text-muted mr-1">{g.seed}</span>{g.name}</> : 'TBD'}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {champion && (
        <div className="rounded-2xl border border-brand-gold/50 bg-brand-gold/10 p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold">Champion</p>
          <p className="mt-2 font-serif italic text-3xl text-brand-text-primary">{champion.name}</p>
          <p className="mt-1 text-sm text-brand-text-secondary">{champion.show} · {champion.seed} seed</p>
          <p className="mt-3 text-sm text-brand-text-secondary">“{champion.line}”</p>
        </div>
      )}

      {/* Rounds in detail, open round first. */}
      {[open, ...[0, 1, 2, 3].filter((r) => r !== open)].filter((r) => r < 4 && r <= open).map((r) => {
        const list = rounds[r];
        return (
          <section key={r}>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
              <h2 className="font-serif italic text-2xl text-brand-text-primary">{ROUND_NAMES[r]}</h2>
              <span className={`text-xs ${r === open ? 'text-brand-gold' : 'text-brand-text-muted'}`}>{status(r)}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: list.length / 2 }, (_, m) => {
                const a = list[2 * m], b = list[2 * m + 1];
                if (!a || !b) return null;
                const key = `${r}|${a.id}|${b.id}`;
                const myPick = mine[key];
                const closed = r < open;
                const w = closed ? winner(r, a, b) : undefined;
                const [va, vb] = tally(r, a, b);
                const total = va + vb;
                const showSplit = closed || !!myPick;
                return (
                  <div key={key} className="rounded-xl border border-brand-border bg-brand-card p-2">
                    {[a, b].map((g, k) => {
                      const n = k === 0 ? va : vb;
                      const hl = closed ? w?.id === g.id : myPick === g.id;
                      const dim = closed ? w?.id !== g.id : !!myPick && myPick !== g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          disabled={closed || !!myPick || !loaded}
                          onClick={() => vote(r, a, b, g)}
                          className={`block w-full text-left rounded-lg px-3 py-2.5 transition-colors ${hl ? 'bg-brand-gold/15 ring-1 ring-brand-gold/60' : dim ? 'opacity-50' : 'hover:bg-brand-surface'} disabled:cursor-default`}
                          aria-label={`Vote for ${g.name}, ${g.show}`}
                        >
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="min-w-0">
                              <span className="font-mono text-xs text-brand-text-muted mr-2">{g.seed}</span>
                              <span className="text-brand-text-primary">{g.name}</span>
                              <span className="block text-xs text-brand-text-muted truncate">{g.show}{g.legacy ? ' · earlier model' : ''} · {g.gp} GP · {Math.round(g.hit * 100)}% hit</span>
                            </span>
                            <span className="shrink-0 text-right">
                              <span className="block font-mono text-xs text-brand-gold">{g.lar > 0 ? '+' : ''}{g.lar.toFixed(1)}</span>
                              {showSplit && total > 0 && <span className="block font-mono text-[11px] text-brand-text-secondary">{Math.round((100 * n) / total)}%</span>}
                            </span>
                          </span>
                          <span className="mt-1.5 block text-sm italic text-brand-text-secondary line-clamp-2">“{g.line}”</span>
                        </button>
                      );
                    })}
                    <p className="px-3 pt-1 pb-1 text-[11px] text-brand-text-muted">
                      {closed
                        ? total > 0 ? `${w?.name} advances, ${Math.max(va, vb)} to ${Math.min(va, vb)}.` : `No votes; the higher seed advances.`
                        : myPick ? `Your vote is in. ${total} vote${total === 1 ? '' : 's'} so far.` : 'Tap the funnier gag. One vote per matchup.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="text-sm text-brand-text-muted">
        Want the numbers behind the seeds? <Link href="/rankings/running-gags/" className="text-brand-gold hover:underline">All running gags, scored</Link>.
      </p>
    </div>
  );
}
