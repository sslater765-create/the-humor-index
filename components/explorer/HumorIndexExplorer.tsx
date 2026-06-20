'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { EpisodeScore } from '@/lib/types';
import { scoreToColor, formatIndex } from '@/lib/scoring';
import { getTier } from '@/lib/tiers';
import { getExplorerConfig } from '@/lib/explorerPresets';
import { cutHumorIndex } from '@/lib/explorerScore';
import ShareButton from '@/components/ui/ShareButton';
import {
  trackExplorerPresetApplied,
  trackExplorerLinkCopied,
  trackExplorerCutChanged,
} from '@/lib/analytics';

interface Props {
  slug: string;
  showName: string;
  episodes: EpisodeScore[];
  /** Official show-level Humor Index (composite) — used for the full-series cut. */
  seriesIndex: number;
  /** Official per-season Humor Index, keyed by season number. */
  seasonIndex: Record<number, number>;
}

// t critical values (two-sided 95%) by degrees of freedom — avoids a stats dep.
const T95: Record<number, number> = {
  1: 12.71, 2: 4.30, 3: 3.18, 4: 2.78, 5: 2.57, 6: 2.45, 7: 2.36, 8: 2.31, 9: 2.26,
  10: 2.23, 11: 2.20, 12: 2.18, 13: 2.16, 14: 2.14, 15: 2.13, 16: 2.12, 17: 2.11,
  18: 2.10, 19: 2.09, 20: 2.09,
};
function tval(df: number): number {
  if (df <= 0) return 0;
  return T95[df] ?? (df < 30 ? 2.05 : 1.98);
}
const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
function stdev(a: number[]): number {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1));
}

// Encode / decode a selection (set of indices) as compact ranges for the URL.
function encodeSel(sel: Set<number>): string {
  const idx = Array.from(sel).sort((a, b) => a - b);
  const parts: string[] = [];
  let start: number | null = null, prev = -2;
  for (const i of idx) {
    if (start === null) { start = prev = i; }
    else if (i === prev + 1) { prev = i; }
    else { parts.push(start === prev ? `${start}` : `${start}-${prev}`); start = prev = i; }
  }
  if (start !== null) parts.push(start === prev ? `${start}` : `${start}-${prev}`);
  return parts.join(',');
}
function decodeSel(str: string, max: number): Set<number> {
  const s = new Set<number>();
  for (const p of str.split(',')) {
    if (p.includes('-')) {
      const [a, b] = p.split('-').map(Number);
      for (let i = a; i <= b; i++) if (i >= 0 && i < max) s.add(i);
    } else if (p !== '') {
      const n = Number(p);
      if (n >= 0 && n < max) s.add(n);
    }
  }
  return s;
}

export default function HumorIndexExplorer({ slug, showName, episodes, seriesIndex, seasonIndex }: Props) {
  const config = getExplorerConfig(slug);

  // Stable airing order → index used for ranges + selection.
  const eps = useMemo(
    () => [...episodes].sort((a, b) => a.season - b.season || a.episode_number - b.episode_number),
    [episodes]
  );
  const seasons = useMemo(() => Array.from(new Set(eps.map(e => e.season))).sort((a, b) => a - b), [eps]);
  // Full-series baseline is the show's OFFICIAL Humor Index (not the episode
  // mean), so the Explorer agrees with the show page and leaderboard.
  const seriesAvg = seriesIndex;
  const idxBySeason = useMemo(() => {
    const m = new Map<number, number[]>();
    eps.forEach((e, i) => { if (!m.has(e.season)) m.set(e.season, []); m.get(e.season)!.push(i); });
    return m;
  }, [eps]);

  const [selected, setSelected] = useState<Set<number>>(() => new Set(eps.map((_, i) => i)));
  const [preview, setPreview] = useState<[number, number] | null>(null);
  const [cutA, setCutA] = useState<{ n: number; avg: number } | null>(null);
  const [cutB, setCutB] = useState<{ n: number; avg: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [tip, setTip] = useState<{ ep: EpisodeScore; x: number; y: number } | null>(null);

  const draggingRef = useRef(false);
  const startRef = useRef(-1);
  const movedRef = useRef(false);
  const hydrated = useRef(false);

  // Load selection from URL hash once on mount.
  useEffect(() => {
    const m = typeof window !== 'undefined' && window.location.hash.match(/sel=([0-9,\-]+)/);
    if (m) {
      const s = decodeSel(m[1], eps.length);
      if (s.size) setSelected(s);
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync selection → URL hash.
  useEffect(() => {
    if (!hydrated.current) return;
    const enc = encodeSel(selected);
    history.replaceState(null, '', enc ? `${window.location.pathname}#sel=${enc}` : window.location.pathname);
  }, [selected]);

  // Fire one `explorer_cut_changed` event per (session, show) the first time
  // the user moves off the default "everything selected" cut. Keeps event
  // volume sane while still flagging real interaction.
  const cutTracked = useRef(false);
  useEffect(() => {
    if (!hydrated.current || cutTracked.current) return;
    if (selected.size !== eps.length) {
      cutTracked.current = true;
      trackExplorerCutChanged(slug, selected.size);
    }
  }, [selected, eps.length, slug]);

  // Global pointerup resolves a click (toggle one) vs a drag (select a run).
  useEffect(() => {
    const onUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cell = el && (el as HTMLElement).closest?.('[data-idx]');
      if (movedRef.current && cell) {
        const cur = Number((cell as HTMLElement).dataset.idx);
        const lo = Math.min(startRef.current, cur), hi = Math.max(startRef.current, cur);
        const n = new Set<number>();
        for (let i = lo; i <= hi; i++) n.add(i);
        setSelected(n);
      } else if (!movedRef.current) {
        const i = startRef.current;
        setSelected(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; });
      }
      draggingRef.current = false;
      setPreview(null);
    };
    window.addEventListener('pointerup', onUp);
    return () => window.removeEventListener('pointerup', onUp);
  }, []);

  const onCellDown = useCallback((i: number) => {
    draggingRef.current = true; startRef.current = i; movedRef.current = false;
  }, []);
  const onGridMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el && (el as HTMLElement).closest?.('[data-idx]');
    if (!cell) return;
    const cur = Number((cell as HTMLElement).dataset.idx);
    if (cur !== startRef.current) movedRef.current = true;
    setPreview([Math.min(startRef.current, cur), Math.max(startRef.current, cur)]);
  }, []);

  const toggleSeason = (s: number) => {
    const ids = idxBySeason.get(s) ?? [];
    setSelected(prev => {
      const n = new Set(prev);
      const allIn = ids.every(i => n.has(i));
      ids.forEach(i => allIn ? n.delete(i) : n.add(i));
      return n;
    });
  };
  const applyPick = (pick: (ep: EpisodeScore) => boolean) =>
    setSelected(new Set(eps.map((e, i) => (pick(e) ? i : -1)).filter(i => i >= 0)));
  const selectAll = () => setSelected(new Set(eps.map((_, i) => i)));
  const clear = () => setSelected(new Set());
  const topN = (k: number) =>
    setSelected(new Set(Array.from(eps.keys()).sort((a, b) => eps[b].humor_index - eps[a].humor_index).slice(0, k)));

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelected(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; });
    }
  };

  // ---- derived readout ----
  const r = useMemo(() => {
    const idx = Array.from(selected);
    const v = idx.map(i => eps[i].humor_index);
    const n = v.length;
    if (!n) return null;
    // Official score where one exists (full series / whole season / single
    // episode); plain episode-mean for custom mixed cuts.
    const avg = cutHumorIndex(idx.map(i => eps[i]), eps, seriesIndex, seasonIndex);
    const ci = n > 1 ? tval(n - 1) * stdev(v) / Math.sqrt(n) : null;
    const jpm = mean(idx.map(i => eps[i].jpm));
    const imv = idx.map(i => eps[i].imdb_rating).filter((x): x is number => x != null);
    const imdb = imv.length ? mean(imv) : null;
    let bi = idx[0], wi = idx[0];
    idx.forEach(i => { if (eps[i].humor_index > eps[bi].humor_index) bi = i; if (eps[i].humor_index < eps[wi].humor_index) wi = i; });
    const pct = Math.round(100 * eps.filter(e => e.humor_index <= avg).length / eps.length);
    return { n, avg, ci, jpm, imdb, best: eps[bi], worst: eps[wi], delta: avg - seriesAvg, tier: getTier(avg), pct };
  }, [selected, eps, seriesAvg, seriesIndex, seasonIndex]);

  const copyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      trackExplorerLinkCopied(slug, selected.size);
    }
  };

  const previewHas = (i: number) => preview != null && i >= preview[0] && i <= preview[1];

  return (
    <div>
      {/* dynamic answer line — also good for humans */}
      <p className="text-sm text-brand-text-secondary leading-relaxed mb-5">
        {r ? (
          <>Your {showName} cut ({r.n} of {eps.length} episodes) averages{' '}
            <span className="text-brand-gold font-medium">{formatIndex(r.avg)}</span>
            {r.ci != null && <> (95% CI ±{r.ci.toFixed(1)})</>} —{' '}
            {r.delta >= 0 ? '+' : ''}{r.delta.toFixed(1)} vs the full series ({formatIndex(seriesAvg)}),{' '}
            <span className={r.tier.badgeText}>{r.tier.label}</span> tier. Higher than {r.pct}% of all {showName} episodes.</>
        ) : 'Select at least one episode to see its Humor Index.'}
      </p>

      <div id="explorer-capture" className="bg-brand-dark">
        <div className="grid md:grid-cols-[280px_1fr] gap-4 mb-4">
          {/* readout */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
            {r && (
              <span className={`inline-block text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${r.tier.badgeBg} ${r.tier.badgeText} ${r.tier.badgeBorder}`}>
                {r.tier.label}
              </span>
            )}
            <div className="flex items-baseline gap-3 mt-2">
              <span className="font-mono text-5xl font-bold text-brand-text-primary">{r ? formatIndex(r.avg) : '—'}</span>
            </div>
            <div className="text-xs text-brand-text-muted mt-1 h-4">
              {r?.ci != null ? `95% CI ±${r.ci.toFixed(1)}` : r?.n === 1 ? 'single episode — no interval' : ''}
            </div>
            <div className="text-sm text-brand-text-muted mt-2">{r ? `${r.n} of ${eps.length} episodes` : 'nothing selected'}</div>
          </div>

          {/* stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { k: 'vs full series', v: r ? `${r.delta >= 0 ? '+' : ''}${r.delta.toFixed(1)}` : '—', sub: `series ${formatIndex(seriesAvg)}`, cls: r ? (r.delta >= 0 ? 'text-brand-gold' : 'text-rose-400') : '' },
              { k: 'Episodes', v: r ? String(r.n) : '—' },
              { k: 'Jokes / min', v: r ? r.jpm.toFixed(2) : '—' },
              { k: 'Audience (IMDb)', v: r?.imdb != null ? r.imdb.toFixed(2) : '—', sub: r?.imdb != null ? 'out of 10' : undefined },
              { k: 'Best in cut', v: r ? formatIndex(r.best.humor_index) : '—', sub: r?.best.title },
              { k: 'Worst in cut', v: r ? formatIndex(r.worst.humor_index) : '—', sub: r?.worst.title },
            ].map((s, i) => (
              <div key={i} className="bg-brand-card border border-brand-border rounded-xl p-3">
                <div className="text-[10.5px] uppercase tracking-wide text-brand-text-muted">{s.k}</div>
                <div className={`font-mono text-lg font-semibold mt-0.5 ${s.cls ?? ''}`}>{s.v}</div>
                {s.sub && <div className="text-[11px] text-brand-text-muted truncate">{s.sub}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* small-sample note */}
        {r && r.n > 0 && r.n <= 4 && (
          <div className="text-[13px] text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3.5 py-2.5 mb-4">
            Heads up: {r.n} episode{r.n > 1 ? 's' : ''} is a small sample — episode scores carry roughly ±4 points of noise, so read this as a vibe, not a verdict (note the wide confidence interval).
          </div>
        )}

        {/* heatmap */}
        {/* touch-none: lets a touch DRAG select a run of episodes instead of
            being eaten by native scroll (cells flex-wrap, so no h-scroll lost). */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-4 touch-none select-none" onPointerMove={onGridMove}>
          {seasons.map(s => (
            <div key={s} className="flex items-center gap-1.5 mb-1.5">
              <span className="font-mono text-xs text-brand-text-muted w-7 shrink-0">S{s}</span>
              <div className="flex gap-1 flex-wrap">
                {(idxBySeason.get(s) ?? []).map(i => {
                  const ep = eps[i];
                  const sel = selected.has(i);
                  return (
                    <button
                      key={i}
                      data-idx={i}
                      aria-label={`S${ep.season}E${ep.episode_number} ${ep.title}, Humor Index ${formatIndex(ep.humor_index)}${sel ? ', in cut' : ''}`}
                      onPointerDown={() => onCellDown(i)}
                      onKeyDown={e => onKey(e, i)}
                      onMouseEnter={e => { const rc = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTip({ ep, x: rc.left, y: rc.top }); }}
                      onMouseLeave={() => setTip(null)}
                      className="w-[26px] h-[26px] rounded-md transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                      style={{
                        backgroundColor: scoreToColor(ep.humor_index),
                        opacity: sel ? 1 : 0.25,
                        boxShadow: sel ? '0 0 0 2px #FBF7F0, 0 0 0 4px rgba(0,0,0,.4)' : previewHas(i) ? '0 0 0 2px #E8B931' : 'none',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* legend */}
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-brand-border text-xs text-brand-text-muted">
            <span>Score</span>
            {[{ l: '85+', c: '#E8B931' }, { l: '75+', c: '#BA7517' }, { l: '65+', c: '#378ADD' }, { l: '55+', c: '#888780' }, { l: '<55', c: '#5F5E5A' }].map(t => (
              <span key={t.l} className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.c }} />{t.l}</span>
            ))}
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: '#E8B931', boxShadow: '0 0 0 2px #FBF7F0' }} />in your cut</span>
          </div>
        </div>
      </div>

      {/* quick views */}
      <div className="flex flex-wrap items-center gap-2 mt-5">
        <span className="text-[11.5px] uppercase tracking-wide text-brand-text-muted mr-1">Quick views</span>
        <button onClick={selectAll} className="font-medium text-[12.5px] px-3 py-1.5 rounded-lg bg-brand-gold text-brand-dark">Full series</button>
        {(config.storyPresets ?? []).map(p => (
          <button key={p.id} onClick={() => { applyPick(p.pick); trackExplorerPresetApplied(slug, p.id); }} title={p.blurb}
            className="font-medium text-[12.5px] px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-brand-text-primary hover:border-brand-text-muted">
            {p.label}
          </button>
        ))}
        <button onClick={() => topN(10)} className="font-medium text-[12.5px] px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-brand-text-primary hover:border-brand-text-muted">Top 10 episodes</button>
      </div>

      {/* season chips */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-[11.5px] uppercase tracking-wide text-brand-text-muted mr-1">Seasons</span>
        {seasons.map(s => {
          const any = (idxBySeason.get(s) ?? []).some(i => selected.has(i));
          return (
            <button key={s} onClick={() => toggleSeason(s)}
              className={`font-medium text-[13px] px-3 py-1.5 rounded-full border transition-colors ${any ? 'bg-brand-surface border-brand-border text-brand-text-primary' : 'bg-transparent border-brand-border text-brand-text-muted'}`}>
              S{s}{config.eras?.[s] && <span className="text-[9px] opacity-70 ml-1.5">{config.eras[s]}</span>}
            </button>
          );
        })}
      </div>

      {/* actions */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button onClick={clear} className="text-[12.5px] px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-brand-text-primary hover:border-brand-text-muted">Clear</button>
        <button onClick={copyLink} className="text-[12.5px] px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-brand-text-primary hover:border-brand-text-muted">{copied ? 'Link copied!' : 'Copy link to this cut'}</button>
        <button onClick={() => r && setCutA({ n: r.n, avg: r.avg })} className="text-[12.5px] px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-brand-text-primary hover:border-brand-text-muted">Set as A</button>
        <button onClick={() => r && setCutB({ n: r.n, avg: r.avg })} className="text-[12.5px] px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-brand-text-primary hover:border-brand-text-muted">Set as B</button>
        <ShareButton targetId="explorer-capture" filename={`${slug}-cut`} />
        <span className="text-xs text-brand-text-muted">Click a cell to toggle · drag to grab a run · chip to toggle a season</span>
      </div>

      {/* compare */}
      {(cutA || cutB) && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 mt-4 grid grid-cols-[1fr_60px_1fr] items-center gap-3 max-w-md">
          <div className="text-center">
            <div className="font-mono text-2xl font-bold">{cutA ? formatIndex(cutA.avg) : '—'}</div>
            <div className="text-xs text-brand-text-muted">{cutA ? `Cut A — ${cutA.n} eps` : 'Cut A — not set'}</div>
          </div>
          <div className="text-center text-xs text-brand-text-muted">
            vs
            {cutA && cutB && (
              <div className={`font-mono text-lg font-semibold ${cutB.avg - cutA.avg >= 0 ? 'text-brand-gold' : 'text-rose-400'}`}>
                {cutB.avg - cutA.avg >= 0 ? '+' : ''}{(cutB.avg - cutA.avg).toFixed(1)}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl font-bold">{cutB ? formatIndex(cutB.avg) : '—'}</div>
            <div className="text-xs text-brand-text-muted">{cutB ? `Cut B — ${cutB.n} eps` : 'Cut B — not set'}</div>
          </div>
        </div>
      )}

      {/* tooltip */}
      {tip && (
        <div className="fixed z-50 pointer-events-none bg-brand-surface border border-brand-border rounded-lg px-3 py-2 shadow-xl"
          style={{ left: tip.x + 8, top: tip.y - 56 }}>
          <p className="text-xs font-medium text-brand-text-primary">S{tip.ep.season}E{tip.ep.episode_number} — {tip.ep.title}</p>
          <p className="font-mono text-xs text-brand-gold">{formatIndex(tip.ep.humor_index)} · IMDb {tip.ep.imdb_rating ?? '—'}</p>
        </div>
      )}
    </div>
  );
}
