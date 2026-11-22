'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

export interface DraftPlayer { id: string; name: string; show: string; slug: string; war: number; eps: number; actor: string }

const ROUNDS = 5;
type Mode = 'index' | 'friends';
type Scoring = 'career' | 'per22';

/** Snake order for n teams: 0..n-1, n-1..0, repeating. */
function snake(n: number, rounds: number): number[] {
  const out: number[] = [];
  for (let r = 0; r < rounds; r++) {
    const row = Array.from({ length: n }, (_, i) => i);
    out.push(...(r % 2 ? row.reverse() : row));
  }
  return out;
}

export default function EnsembleDraft({ pool }: { pool: DraftPlayer[] }) {
  const [mode, setMode] = useState<Mode>('index');
  const [scoring, setScoring] = useState<Scoring>('career');
  const [indexFirst, setIndexFirst] = useState(false);
  const [names, setNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [players, setPlayers] = useState(2);
  const [started, setStarted] = useState(false);
  const [picks, setPicks] = useState<{ team: number; id: string }[]>([]);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(false);

  // Per-22: WAR per episode scaled to a 22-episode season, so a character who
  // was great for three seasons can beat one who was fine for nine. Runs under
  // 22 episodes aren't scaled up: they count what they actually did.
  const value = (p: DraftPlayer) => (scoring === 'career' ? p.war : Math.round((p.war / Math.max(22, p.eps)) * 22));
  const board = useMemo(() => [...pool].sort((a, b) => value(b) - value(a)), [pool, scoring]); // eslint-disable-line react-hooks/exhaustive-deps

  const teamNames = mode === 'index' ? (indexFirst ? ['The Index', 'You'] : ['You', 'The Index']) : names.slice(0, players);
  const indexTeam = mode === 'index' ? (indexFirst ? 0 : 1) : -1;
  const order = useMemo(() => snake(teamNames.length, ROUNDS), [teamNames.length]);

  const byId = useMemo(() => new Map(pool.map((p) => [p.id, p])), [pool]);
  const taken = new Set(picks.map((p) => p.id));
  const team = (t: number) => picks.filter((p) => p.team === t).map((p) => byId.get(p.id)!).filter(Boolean);
  const showsOf = (t: number) => new Set(team(t).map((p) => p.slug));
  const done = picks.length >= order.length;
  const turn = done ? null : order[picks.length];
  const total = (t: number) => team(t).reduce((a, p) => a + value(p), 0);

  function autoPick(current: { team: number; id: string }[]) {
    const out = [...current];
    while (out.length < order.length && order[out.length] === indexTeam) {
      const used = new Set(out.map((p) => p.id));
      const own = new Set(out.filter((p) => p.team === indexTeam).map((p) => byId.get(p.id)!.slug));
      const best = board.find((p) => !used.has(p.id) && !own.has(p.slug));
      if (!best) break;
      out.push({ team: indexTeam, id: best.id });
    }
    return out;
  }

  function start() {
    setPicks(autoPick([]));
    setStarted(true);
    setCopied(false);
  }

  function choose(p: DraftPlayer) {
    if (turn === null || turn === indexTeam || taken.has(p.id) || showsOf(turn).has(p.slug)) return;
    setPicks(autoPick(picks.concat({ team: turn, id: p.id })));
  }

  const totals = teamNames.map((_, t) => total(t));
  const best = Math.max(...totals);
  const winners = teamNames.filter((_, t) => totals[t] === best);
  const unit = scoring === 'career' ? 'Comedy WAR' : 'WAR per 22';

  async function share() {
    const lines = teamNames.map((n, t) => `${n}: ${team(t).map((p) => p.name).join(', ')} (${totals[t].toLocaleString()})`).join('\n');
    const head = winners.length > 1 ? 'A dead heat.' : `${winners[0]} ${winners[0] === 'You' ? 'win' : 'wins'}.`;
    const text = `The ensemble draft (${unit}). ${head}\n${lines}`;
    const url = `${window.location.origin}/draft/`;
    try {
      if (navigator.share) { await navigator.share({ title: 'The ensemble draft', text, url }); return; }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
    } catch { /* dismissed */ }
  }

  if (!started) {
    const pill = (on: boolean) => `rounded-lg px-3 py-1.5 text-sm ${on ? 'bg-brand-gold text-black font-medium' : 'border border-brand-border text-brand-text-secondary hover:text-brand-text-primary'}`;
    return (
      <div className="max-w-xl space-y-6 rounded-2xl border border-brand-border bg-brand-card p-6">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-brand-text-muted">Draft against</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={pill(mode === 'index')} onClick={() => setMode('index')}>The Index</button>
            <button type="button" className={pill(mode === 'friends')} onClick={() => setMode('friends')}>Friends, pass the phone</button>
          </div>
        </div>
        {mode === 'index' ? (
          <label className="flex items-center gap-2 text-sm text-brand-text-secondary">
            <input type="checkbox" checked={indexFirst} onChange={(e) => setIndexFirst(e.target.checked)} />
            The Index picks first
          </label>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              {[2, 3, 4].map((n) => <button key={n} type="button" className={pill(players === n)} onClick={() => setPlayers(n)}>{n} players</button>)}
            </div>
            {Array.from({ length: players }, (_, i) => (
              <input
                key={i}
                value={names[i]}
                maxLength={20}
                onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value || `Player ${i + 1}` : x)))}
                className="block w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-sm text-brand-text-primary"
                aria-label={`Player ${i + 1} name`}
              />
            ))}
          </div>
        )}
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-brand-text-muted">Scoring</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={pill(scoring === 'career')} onClick={() => setScoring('career')}>Career WAR</button>
            <button type="button" className={pill(scoring === 'per22')} onClick={() => setScoring('per22')}>Per season (WAR per 22 episodes)</button>
          </div>
          <p className="mt-2 text-xs text-brand-text-muted">
            {scoring === 'career' ? 'Rewards longevity: nine seasons of Dwight is a lot of WAR.' : 'Rewards peak: what a character adds in a 22-episode season, however long the show ran.'}
          </p>
        </div>
        <button type="button" onClick={start} className="rounded-lg bg-brand-gold px-5 py-2 font-medium text-black">Start the draft</button>
      </div>
    );
  }

  const visible = board.filter((p) => !filter || `${p.name} ${p.show} ${p.actor}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Phones: the teams ride along at the top while you scroll the board. */}
      <div className="lg:hidden sticky top-14 z-20 -mx-4 border-b border-brand-border bg-brand-dark/95 px-4 py-2 backdrop-blur">
        <div className="flex gap-3 overflow-x-auto text-xs">
          {teamNames.map((n, t) => (
            <span key={t} className={`shrink-0 ${t === turn ? 'text-brand-gold' : 'text-brand-text-secondary'}`}>
              {n} <span className="font-mono">{totals[t].toLocaleString()}</span> · {team(t).length}/{ROUNDS}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm text-brand-text-secondary">
            {done ? 'Draft complete.' : `${teamNames[turn!]} ${teamNames[turn!] === 'You' ? 'are' : 'is'} on the clock: round ${Math.floor(picks.length / teamNames.length) + 1} of ${ROUNDS}.`}
          </p>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name or show"
            className="w-44 rounded-lg border border-brand-border bg-brand-card px-3 py-1.5 text-sm text-brand-text-primary placeholder:text-brand-text-muted"
          />
        </div>
        <ul className="divide-y divide-brand-border rounded-xl border border-brand-border bg-brand-card">
          {visible.map((p) => {
            const gone = taken.has(p.id);
            const blocked = !gone && turn !== null && showsOf(turn).has(p.slug);
            const owner = picks.find((x) => x.id === p.id)?.team;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={gone || blocked || turn === null || turn === indexTeam}
                  onClick={() => choose(p)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left disabled:cursor-default hover:enabled:bg-brand-surface"
                >
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate ${gone ? 'text-brand-text-muted line-through' : 'text-brand-text-primary'}`}>{p.name}</span>
                    <span className="block truncate text-xs text-brand-text-muted">{p.show}{p.actor ? ` · ${p.actor}` : ''} · {p.eps} eps</span>
                  </span>
                  {owner !== undefined && <span className="text-[11px] uppercase tracking-wider text-brand-text-muted">{teamNames[owner]}</span>}
                  {blocked && <span className="text-[11px] text-brand-text-muted">show taken</span>}
                  <span className="font-mono text-sm text-brand-gold w-16 text-right">{value(p).toLocaleString()}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 self-start">
        {teamNames.map((n, t) => (
          <div key={t} className={`rounded-xl border p-4 ${t === turn ? 'border-brand-gold/60 bg-brand-gold/5' : 'border-brand-border bg-brand-card'}`}>
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] uppercase tracking-[0.2em] text-brand-text-muted">{n}</p>
              <p className="font-mono text-lg text-brand-gold">{totals[t].toLocaleString()}</p>
            </div>
            <ol className="mt-2 space-y-1 text-sm">
              {team(t).map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span className="truncate text-brand-text-primary">{p.name} <span className="text-brand-text-muted">· {p.show}</span></span>
                  <span className="font-mono text-xs text-brand-text-muted">{value(p).toLocaleString()}</span>
                </li>
              ))}
              {Array.from({ length: ROUNDS - team(t).length }, (_, i) => <li key={i} className="h-5 rounded bg-brand-border/40" />)}
            </ol>
          </div>
        ))}
        {done && (
          <div className="rounded-xl border border-brand-border bg-brand-card p-4 text-sm text-brand-text-secondary">
            <p className="font-serif italic text-xl text-brand-text-primary">
              {winners.length > 1 ? 'A dead heat.' : winners[0] === 'You' ? 'You beat the Index.' : winners[0] === 'The Index' ? 'The Index wins this one.' : `${winners[0]} wins the draft.`}
            </p>
            {mode === 'index' && <p className="mt-1">The Index always takes the best {unit} left, so beating it means reading the board better than a greedy machine.</p>}
            <div className="mt-3 flex gap-4">
              <button type="button" onClick={() => void share()} className="text-brand-gold hover:underline">{copied ? 'Copied' : 'Share the recap'}</button>
              <button type="button" onClick={() => { setStarted(false); setPicks([]); }} className="text-brand-text-muted hover:text-brand-text-primary">New draft</button>
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
