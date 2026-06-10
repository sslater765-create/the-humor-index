'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Kept local (not imported from lib/data) so this client bundle never pulls in fs.
interface AgreeJoke {
  id: number; t: string; s: number; c: number | null; q: number | null;
  who: string; show: string; slug: string; se: number; ep: number; et: string; jt: string | null;
}

const LS_KEY = 'humor_index_agree';
const MIN_GAP = 1.0; // ensure there's a defensible "funnier" answer

function loadLocal(): { agree: number; total: number } {
  try {
    const r = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return { agree: Number(r.agree || 0), total: Number(r.total || 0) };
  } catch { return { agree: 0, total: 0 }; }
}

export default function AgreeGame({ pool, jokeCount }: { pool: AgreeJoke[]; jokeCount: number }) {
  const [pair, setPair] = useState<[AgreeJoke, AgreeJoke] | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [recent, setRecent] = useState<number[]>([]);
  const [local, setLocal] = useState({ agree: 0, total: 0 });
  const [globalPct, setGlobalPct] = useState<number | null>(null);
  const [globalTotal, setGlobalTotal] = useState<number>(0);

  const draw = useCallback((avoid: number[]) => {
    if (pool.length < 2) return;
    const avoidSet = new Set(avoid.slice(-40));
    for (let tries = 0; tries < 400; tries++) {
      const a = pool[Math.floor(Math.random() * pool.length)];
      const b = pool[Math.floor(Math.random() * pool.length)];
      if (a.id === b.id) continue;
      if (avoidSet.has(a.id) || avoidSet.has(b.id)) continue;
      if (Math.abs(a.s - b.s) < MIN_GAP) continue;
      // randomize left/right
      setPair(Math.random() < 0.5 ? [a, b] : [b, a]);
      return;
    }
    // fallback: any distinct pair with a gap
    for (let i = 0; i < pool.length; i++)
      for (let j = i + 1; j < pool.length; j++)
        if (Math.abs(pool[i].s - pool[j].s) >= MIN_GAP) { setPair([pool[i], pool[j]]); return; }
  }, [pool]);

  useEffect(() => {
    setLocal(loadLocal());
    draw([]);
    fetch('/api/agree').then(r => r.json()).then(d => {
      if (typeof d.pct === 'number') setGlobalPct(d.pct);
      if (typeof d.total === 'number') setGlobalTotal(d.total);
    }).catch(() => {});
  }, [draw]);

  const winnerId = useMemo(() => {
    if (!pair) return null;
    return pair[0].s >= pair[1].s ? pair[0].id : pair[1].id;
  }, [pair]);

  function choose(j: AgreeJoke) {
    if (picked !== null || !pair) return;
    setPicked(j.id);
    const agreed = j.id === winnerId;
    const next = { agree: local.agree + (agreed ? 1 : 0), total: local.total + 1 };
    setLocal(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
    setRecent(r => [...r, pair[0].id, pair[1].id]);
    fetch('/api/agree', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agree: agreed }),
    }).then(r => r.json()).then(d => {
      if (typeof d.pct === 'number') setGlobalPct(d.pct);
      if (typeof d.total === 'number') setGlobalTotal(d.total);
    }).catch(() => {});
  }

  function next() {
    setPicked(null);
    draw(recent);
  }

  if (pool.length < 2) {
    return <p className="text-center text-sm text-brand-text-muted">The joke pool is being prepared. Check back shortly.</p>;
  }

  const myPct = local.total ? Math.round((local.agree / local.total) * 100) : null;
  const revealed = picked !== null && pair !== null;

  return (
    <div>
      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-3 mb-7">
        <div className="bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-center">
          <p className="font-serif italic text-3xl text-brand-gold leading-none">{myPct === null ? '—' : `${myPct}%`}</p>
          <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-1.5">
            You agree {local.total ? `· ${local.total} call${local.total === 1 ? '' : 's'}` : ''}
          </p>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-center">
          <p className="font-serif italic text-3xl text-brand-text-primary leading-none">{globalPct === null ? '—' : `${globalPct}%`}</p>
          <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-1.5">
            Everyone {globalTotal ? `· ${globalTotal.toLocaleString()}` : ''}
          </p>
        </div>
      </div>

      <p className="text-center text-xs uppercase tracking-[0.2em] text-brand-text-muted mb-4">
        {revealed ? 'The Index has spoken' : 'Which one is funnier?'}
      </p>

      {/* The two jokes */}
      <div className="grid sm:grid-cols-2 gap-3">
        {pair?.map((j) => {
          const isPick = picked === j.id;
          const isWinner = winnerId === j.id;
          const stateClass = !revealed
            ? 'border-brand-border hover:border-brand-gold hover:bg-brand-gold/5 cursor-pointer'
            : isWinner
              ? 'border-brand-gold bg-brand-gold/10'
              : 'border-brand-border opacity-70';
          return (
            <button
              key={j.id}
              onClick={() => choose(j)}
              disabled={revealed}
              className={`text-left bg-brand-card border rounded-2xl p-5 transition-all flex flex-col min-h-[170px] ${stateClass}`}
            >
              <p className="font-serif text-lg text-brand-text-primary leading-snug flex-1">“{j.t}”</p>

              {revealed ? (
                <div className="mt-4 pt-3 border-t border-brand-border">
                  <div className="flex items-baseline justify-between">
                    <span className={`font-mono text-2xl ${isWinner ? 'text-brand-gold' : 'text-brand-text-secondary'}`}>
                      {j.s.toFixed(1)}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-brand-text-muted">Impact</span>
                  </div>
                  <p className="text-xs text-brand-text-muted mt-2">
                    {j.who} · <span className="italic">{j.show}</span>
                    {isWinner && <span className="text-brand-gold not-italic"> · Index pick</span>}
                    {isPick && <span className="not-italic"> · your pick</span>}
                  </p>
                </div>
              ) : (
                <span className="mt-4 text-[10px] uppercase tracking-widest text-brand-text-muted">Tap to pick</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Verdict + next */}
      {revealed && (
        <div className="mt-5 text-center">
          <p className="font-serif italic text-lg mb-4">
            {picked === winnerId
              ? <span className="text-brand-gold">You agreed with the Index.</span>
              : <span className="text-brand-text-secondary">You and the Index disagreed.</span>}
          </p>
          <button
            onClick={next}
            className="bg-brand-gold text-black text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-brand-gold-dim transition-colors"
          >
            Next pair →
          </button>
        </div>
      )}

      {!revealed && jokeCount > 0 && (
        <p className="text-center text-[11px] text-brand-text-muted mt-5">
          Pulled blind from {jokeCount.toLocaleString()} scored jokes.
        </p>
      )}
    </div>
  );
}
