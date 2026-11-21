'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

export interface DraftPlayer { id: string; name: string; show: string; slug: string; war: number; eps: number; actor: string }

const ROUNDS = 5;
// Snake order for two teams over ten picks: you, Index, Index, you, you, ...
const ORDER: Array<'you' | 'index'> = ['you', 'index', 'index', 'you', 'you', 'index', 'index', 'you', 'you', 'index'];

export default function EnsembleDraft({ pool }: { pool: DraftPlayer[] }) {
  const [picks, setPicks] = useState<{ team: 'you' | 'index'; id: string }[]>([]);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(false);

  const byId = useMemo(() => new Map(pool.map((p) => [p.id, p])), [pool]);
  const taken = new Set(picks.map((p) => p.id));
  const team = (t: 'you' | 'index') => picks.filter((p) => p.team === t).map((p) => byId.get(p.id)!).filter(Boolean);
  const showsOf = (t: 'you' | 'index') => new Set(team(t).map((p) => p.slug));
  const done = picks.length >= ROUNDS * 2;
  const turn = done ? null : ORDER[picks.length];

  function indexPick(current: { team: 'you' | 'index'; id: string }[]) {
    const out = [...current];
    while (out.length < ROUNDS * 2 && ORDER[out.length] === 'index') {
      const used = new Set(out.map((p) => p.id));
      const own = new Set(out.filter((p) => p.team === 'index').map((p) => byId.get(p.id)!.slug));
      const best = pool.find((p) => !used.has(p.id) && !own.has(p.slug));
      if (!best) break;
      out.push({ team: 'index', id: best.id });
    }
    return out;
  }

  function choose(p: DraftPlayer) {
    if (turn !== 'you' || taken.has(p.id) || showsOf('you').has(p.slug)) return;
    setPicks(indexPick(picks.concat({ team: 'you', id: p.id })));
  }

  const total = (t: 'you' | 'index') => team(t).reduce((a, p) => a + p.war, 0);
  const you = total('you'), idx = total('index');

  async function share() {
    const names = team('you').map((p) => `${p.name} (${p.show})`).join(', ');
    const text = `My sitcom ensemble: ${names}. ${you.toLocaleString()} Comedy WAR vs the Index's ${idx.toLocaleString()}.`;
    const url = `${window.location.origin}/draft/`;
    try {
      if (navigator.share) { await navigator.share({ title: 'The ensemble draft', text, url }); return; }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
    } catch { /* dismissed */ }
  }

  const visible = pool.filter((p) => !filter || `${p.name} ${p.show} ${p.actor}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm text-brand-text-secondary">
            {done ? 'Draft complete.' : turn === 'you' ? `Your pick: round ${Math.floor(picks.length / 2) + 1} of ${ROUNDS}.` : 'The Index is picking…'}
          </p>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name or show"
            className="w-48 rounded-lg border border-brand-border bg-brand-card px-3 py-1.5 text-sm text-brand-text-primary placeholder:text-brand-text-muted"
          />
        </div>
        <ul className="divide-y divide-brand-border rounded-xl border border-brand-border bg-brand-card">
          {visible.map((p) => {
            const gone = taken.has(p.id);
            const blocked = !gone && showsOf('you').has(p.slug);
            const owner = picks.find((x) => x.id === p.id)?.team;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={gone || blocked || turn !== 'you'}
                  onClick={() => choose(p)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left disabled:cursor-default hover:enabled:bg-brand-surface"
                >
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate ${gone ? 'text-brand-text-muted line-through' : 'text-brand-text-primary'}`}>{p.name}</span>
                    <span className="block truncate text-xs text-brand-text-muted">{p.show} · {p.actor} · {p.eps} eps</span>
                  </span>
                  {owner && <span className={`text-[11px] uppercase tracking-wider ${owner === 'you' ? 'text-brand-gold' : 'text-brand-text-muted'}`}>{owner === 'you' ? 'yours' : 'Index'}</span>}
                  {blocked && <span className="text-[11px] text-brand-text-muted">show taken</span>}
                  <span className="font-mono text-sm text-brand-gold w-16 text-right">{p.war.toLocaleString()}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 self-start">
        {(['you', 'index'] as const).map((t) => (
          <div key={t} className={`rounded-xl border p-4 ${t === 'you' ? 'border-brand-gold/50 bg-brand-gold/5' : 'border-brand-border bg-brand-card'}`}>
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] uppercase tracking-[0.2em] text-brand-text-muted">{t === 'you' ? 'Your ensemble' : 'The Index'}</p>
              <p className="font-mono text-lg text-brand-gold">{total(t).toLocaleString()}</p>
            </div>
            <ol className="mt-2 space-y-1 text-sm">
              {team(t).map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span className="truncate text-brand-text-primary">{p.name} <span className="text-brand-text-muted">· {p.show}</span></span>
                  <span className="font-mono text-xs text-brand-text-muted">{p.war.toLocaleString()}</span>
                </li>
              ))}
              {Array.from({ length: ROUNDS - team(t).length }, (_, i) => <li key={i} className="h-5 rounded bg-brand-border/40" />)}
            </ol>
          </div>
        ))}
        {done && (
          <div className="rounded-xl border border-brand-border bg-brand-card p-4 text-sm text-brand-text-secondary">
            <p className="font-serif italic text-xl text-brand-text-primary">{you > idx ? 'You beat the Index.' : you === idx ? 'A dead heat.' : 'The Index wins this one.'}</p>
            <p className="mt-1">{Math.abs(you - idx).toLocaleString()} WAR {you >= idx ? 'ahead' : 'behind'}. The Index always takes the highest WAR left, so beating it means reading the board better than a greedy machine.</p>
            <div className="mt-3 flex gap-4">
              <button type="button" onClick={() => void share()} className="text-brand-gold hover:underline">{copied ? 'Copied' : 'Share your ensemble'}</button>
              <button type="button" onClick={() => { setPicks([]); setCopied(false); }} className="text-brand-text-muted hover:text-brand-text-primary">Draft again</button>
            </div>
          </div>
        )}
        <p className="text-xs text-brand-text-muted">
          Comedy WAR comes from each show’s character data. <Link href="/rankings/funniest-characters/" className="text-brand-gold hover:underline">Funniest characters</Link> · <Link href="/methodology/" className="text-brand-gold hover:underline">How WAR works</Link>
        </p>
      </aside>
    </div>
  );
}
