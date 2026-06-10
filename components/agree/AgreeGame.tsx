'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Kept local (not imported from lib/data) so this client bundle never pulls in fs.
interface AgreeJoke {
  id: number; t: string; s: number; c: number | null; q: number | null;
  who: string; show: string; slug: string; se: number; ep: number; et: string; jt: string | null;
}

const LS_KEY = 'humor_index_agree';
const MIN_GAP = 1.0; // ensure there's a defensible "funnier" answer

function loadLocal(): { agree: number; total: number; streak: number } {
  try {
    const r = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return { agree: Number(r.agree || 0), total: Number(r.total || 0), streak: Number(r.streak || 0) };
  } catch { return { agree: 0, total: 0, streak: 0 }; }
}

// Deterministic avatar color per show, drawn from the brand palette.
const AVATAR_COLORS = ['#378ADD', '#1D9E75', '#D85A30', '#7F77DD', '#D4537E', '#E8B931', '#E24B4A'];
function showColor(show: string): string {
  let h = 0;
  for (let i = 0; i < show.length; i++) h = (h * 31 + show.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(who: string): string {
  const parts = who.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AgreeGame({ pool, jokeCount }: { pool: AgreeJoke[]; jokeCount: number }) {
  const [pair, setPair] = useState<[AgreeJoke, AgreeJoke] | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [recent, setRecent] = useState<number[]>([]);
  const [local, setLocal] = useState({ agree: 0, total: 0, streak: 0 });
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
    const next = {
      agree: local.agree + (agreed ? 1 : 0),
      total: local.total + 1,
      streak: agreed ? local.streak + 1 : 0,
    };
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
  const gap = pair ? Math.abs(pair[0].s - pair[1].s).toFixed(1) : '0';
  const winner = pair ? (pair[0].id === winnerId ? pair[0] : pair[1]) : null;

  return (
    <div>
      {/* Scoreboard */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-stretch max-w-lg mx-auto">
        <div className="bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-center">
          <p className="font-serif italic text-3xl text-brand-gold leading-none">{myPct === null ? '—' : `${myPct}%`}</p>
          <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-1.5">
            You match {local.total ? `· ${local.total} call${local.total === 1 ? '' : 's'}` : ''}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center px-1">
          <span className={`text-xl leading-none ${local.streak > 0 ? '' : 'opacity-30 grayscale'}`}>🔥</span>
          <span className="font-serif text-lg text-brand-text-primary leading-none mt-1">{local.streak}</span>
          <span className="text-[9px] uppercase tracking-[0.15em] text-brand-text-muted mt-1">streak</span>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-center">
          <p className="font-serif italic text-3xl text-brand-text-primary leading-none">{globalPct === null ? '—' : `${globalPct}%`}</p>
          <p className="text-[10px] uppercase tracking-widest text-brand-text-muted mt-1.5">
            Everyone {globalTotal ? `· ${globalTotal.toLocaleString()}` : ''}
          </p>
        </div>
      </div>
      {/* Agreement bar */}
      <div className="max-w-lg mx-auto mt-3">
        <div className="h-1.5 rounded-full bg-brand-gold/10 overflow-hidden">
          <div className="h-full bg-brand-gold transition-all duration-500" style={{ width: `${myPct ?? 0}%` }} />
        </div>
        <div className="flex justify-between text-[10px] tracking-wider text-brand-text-muted mt-1.5">
          <span>YOUR AGREEMENT RATE</span>
          {globalPct !== null && <span>crowd avg {globalPct}%</span>}
        </div>
      </div>

      <p className="text-center text-xs uppercase tracking-[0.2em] text-brand-text-muted mt-9 mb-4">
        {revealed ? 'The Index has spoken' : 'Which one is funnier?'}
      </p>

      {/* The two jokes */}
      <div className="grid sm:grid-cols-2 gap-3">
        {pair?.map((j) => {
          const isPick = picked === j.id;
          const isWinner = winnerId === j.id;
          const stateClass = !revealed
            ? 'border-brand-border hover:border-brand-gold hover:-translate-y-0.5 cursor-pointer'
            : isWinner
              ? 'border-brand-gold shadow-[0_0_0_1px_#E8B931,0_18px_50px_-20px_rgba(232,185,49,0.55)]'
              : 'border-brand-border opacity-60';
          return (
            <button
              key={j.id}
              onClick={() => choose(j)}
              disabled={revealed}
              className={`relative text-left bg-brand-card border rounded-2xl transition-all flex flex-col min-h-[210px] overflow-hidden ${stateClass}`}
            >
              {revealed && isPick && (
                <span className="absolute top-3 right-3 text-[9px] font-bold tracking-[0.15em] text-black bg-brand-gold px-2 py-1 rounded-md z-10">
                  YOUR PICK
                </span>
              )}

              {/* Attribution — always visible */}
              <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-brand-border">
                <span
                  className="w-10 h-10 rounded-lg flex-none flex items-center justify-center font-serif text-base font-bold text-black"
                  style={{ background: showColor(j.show) }}
                >
                  {initials(j.who)}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[13px] font-semibold text-brand-text-primary truncate">{j.who}</span>
                  <span className="text-[10.5px] text-brand-text-muted truncate">
                    <span className="text-brand-text-secondary font-semibold">{j.show}</span>
                    {' · '}S{j.se}E{j.ep}{j.et ? ` “${j.et}”` : ''}
                  </span>
                </span>
              </div>

              {/* Quote */}
              <p className="font-serif italic text-lg text-brand-text-primary leading-snug flex-1 px-5 py-4">“{j.t}”</p>

              {/* Score footer — number blurred until pick */}
              <div className="flex items-center justify-between px-5 pb-4">
                <span className="flex items-baseline gap-1.5">
                  <span
                    className={`font-serif text-2xl leading-none transition-all duration-500 ${isWinner ? 'text-brand-gold' : 'text-brand-text-secondary'} ${revealed ? '' : 'blur-[7px] opacity-50'}`}
                  >
                    {j.s.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-brand-text-muted">/10</span>
                  <span className="text-[9px] uppercase tracking-widest text-brand-text-muted ml-1">Impact</span>
                </span>
                {!revealed && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-brand-gold border border-brand-gold/40 rounded-lg px-3 py-2">
                    Tap to pick
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Verdict + next */}
      {revealed && winner && (
        <div className="mt-6 text-center max-w-lg mx-auto">
          <span
            className={`inline-block text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full mb-3 border ${
              picked === winnerId
                ? 'text-brand-gold bg-brand-gold/15 border-brand-gold/40'
                : 'text-brand-text-secondary bg-white/5 border-brand-border'
            }`}
          >
            {picked === winnerId ? 'You agree with the Index' : 'You diverge from the Index'}
          </span>
          <p className="font-serif italic text-lg text-brand-text-primary">
            {picked === winnerId
              ? `Same read. The Index scored your pick higher by ${gap} points.`
              : `The Index gave it to ${winner.who}, by ${gap} points.`}
          </p>
          <button
            onClick={next}
            className="mt-5 bg-brand-gold text-black text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-brand-gold-dim transition-colors"
          >
            Next pair →
          </button>
        </div>
      )}

      {!revealed && jokeCount > 0 && (
        <p className="text-center text-[11px] text-brand-text-muted mt-6">
          Pulled blind from {jokeCount.toLocaleString()} scored jokes.
        </p>
      )}
    </div>
  );
}
