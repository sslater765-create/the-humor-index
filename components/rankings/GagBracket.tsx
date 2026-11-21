'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export interface BracketGag {
  id: string; slug: string; show: string; name: string; lar: number; gp: number; hit: number; line: string; legacy: boolean; seed?: number;
}

const ROUND_NAMES = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];
const KEY = 'humor_index_gag_bracket_v1';

/** Standard seeding: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15. */
const ORDER = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];

export default function GagBracket({ gags }: { gags: BracketGag[] }) {
  const bySeed = useMemo(() => new Map(gags.map((g) => [g.seed!, g])), [gags]);
  const first = useMemo(() => ORDER.map((s) => bySeed.get(s)).filter(Boolean) as BracketGag[], [bySeed]);
  const [picks, setPicks] = useState<string[][]>([[], [], [], []]);
  const [crowd, setCrowd] = useState<{ pairs: Record<string, string>; champs: Record<string, string> } | null>(null);

  useEffect(() => {
    try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); if (Array.isArray(p) && p.length === 4) setPicks(p); } catch { /* none */ }
    fetch('/api/bracket').then((r) => r.json()).then(setCrowd).catch(() => {});
  }, []);

  const byId = useMemo(() => new Map(gags.map((g) => [g.id, g])), [gags]);
  // Later rounds keep their slots even when an earlier pick is missing, so a
  // match only appears once both of its feeder picks are made.
  const rounds: (BracketGag | undefined)[][] = [first];
  for (let r = 1; r < 4; r++) {
    const size = 16 >> r;
    rounds.push(Array.from({ length: size }, (_, i) => (picks[r - 1][i] ? byId.get(picks[r - 1][i]) : undefined)));
  }
  const champion = picks[3][0] ? byId.get(picks[3][0]) : null;

  function choose(r: number, m: number, winner: BracketGag, loser: BracketGag) {
    const next = picks.map((x) => [...x]);
    next[r][m] = winner.id;
    // A changed pick clears the picks downstream of that match.
    let slot = m;
    for (let rr = r + 1; rr < 4; rr++) {
      slot = Math.floor(slot / 2);
      if (next[rr][slot]) next[rr][slot] = '';
    }
    setPicks(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
    void fetch('/api/bracket', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ a: winner.id, b: loser.id, winner: winner.id, champion: r === 3 ? winner.id : undefined }),
    });
  }

  function split(a: BracketGag, b: BracketGag): [number, number] | null {
    if (!crowd) return null;
    const [x, y] = [a.id, b.id].sort();
    const va = Number(crowd.pairs[`${x}|${y}|${a.id}`] || 0), vb = Number(crowd.pairs[`${x}|${y}|${b.id}`] || 0);
    return va + vb >= 5 ? [Math.round((100 * va) / (va + vb)), va + vb] : null;
  }

  function reset() {
    const empty = [[], [], [], []];
    setPicks(empty);
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  }

  const crowdChamp = crowd ? Object.entries(crowd.champs).sort((a, b) => Number(b[1]) - Number(a[1]))[0] : null;

  return (
    <div className="space-y-10">
      {rounds.map((list, r) => {
        if (!list.some(Boolean)) return null;
        const matches: (BracketGag | undefined)[][] = [];
        for (let m = 0; m < list.length / 2; m++) matches.push([list[2 * m], list[2 * m + 1]]);
        return (
          <section key={r}>
            <h2 className="font-serif italic text-2xl text-brand-text-primary mb-3">{ROUND_NAMES[r]}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {matches.map(([a, b], m) => {
                if (!a || !b) return null;
                const picked = picks[r][m];
                const s = picked ? split(a, b) : null;
                return (
                  <div key={`${a.id}-${b.id}`} className="rounded-xl border border-brand-border bg-brand-card p-2">
                    {[a, b].map((g, k) => {
                      const other = k === 0 ? b : a;
                      const won = picked === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => choose(r, m, g, other)}
                          className={`block w-full text-left rounded-lg px-3 py-2.5 transition-colors ${won ? 'bg-brand-gold/15 ring-1 ring-brand-gold/60' : picked ? 'opacity-50 hover:opacity-80' : 'hover:bg-brand-surface'}`}
                        >
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="min-w-0">
                              <span className="font-mono text-xs text-brand-text-muted mr-2">{g.seed}</span>
                              <span className="text-brand-text-primary">{g.name}</span>
                              <span className="block text-xs text-brand-text-muted truncate">{g.show}{g.legacy ? ' · earlier model' : ''} · {g.gp} GP · {Math.round(g.hit * 100)}% hit</span>
                            </span>
                            <span className="font-mono text-xs text-brand-gold shrink-0">{g.lar > 0 ? '+' : ''}{g.lar.toFixed(1)}</span>
                          </span>
                        </button>
                      );
                    })}
                    {picked && (
                      <p className="px-3 pt-1 pb-1 text-[11px] text-brand-text-muted">
                        {s ? `Crowd: ${s[0]}% picked ${a.name} (${s[1]} votes)` : 'Not enough votes on this matchup yet.'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {champion && (
        <div className="rounded-2xl border border-brand-gold/50 bg-brand-gold/10 p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold">Your champion</p>
          <p className="mt-2 font-serif italic text-3xl text-brand-text-primary">{champion.name}</p>
          <p className="mt-1 text-sm text-brand-text-secondary">{champion.show}</p>
          <p className="mt-3 text-sm text-brand-text-secondary">“{champion.line}”</p>
          {crowdChamp && byId.get(crowdChamp[0]) && (
            <p className="mt-4 text-xs text-brand-text-muted">Crowd favorite so far: {byId.get(crowdChamp[0])!.name} ({byId.get(crowdChamp[0])!.show}), {crowdChamp[1]} titles.</p>
          )}
          <button type="button" onClick={reset} className="mt-4 text-xs text-brand-text-muted hover:text-brand-text-primary">Start over</button>
        </div>
      )}

      <p className="text-sm text-brand-text-muted">
        Want the numbers behind the seeds? <Link href="/rankings/running-gags/" className="text-brand-gold hover:underline">All running gags, scored</Link>.
      </p>
    </div>
  );
}
