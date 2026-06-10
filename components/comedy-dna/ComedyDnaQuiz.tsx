'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import {
  DNA_TYPES, ARCHES, AXES, EMBLEMS, emblemSVG, showStyle, tileText,
  buildBaseline, normalizeFingerprints, meanFingerprint, buildWeights,
  rankArchetypes, rankShows, whyText, dot, axisValue, wcos,
  type QuizData, type QuizJoke, type ShowFingerprint,
} from '@/lib/comedyDna';
import { MemeScene } from './MemeScene';

const N_BASE = 10, N_MAX = 30, N_STEP = 10;
const SHOW_URL = (slug: string) => `https://www.thehumorindex.com/shows/${slug}/`;

const DARK_IDX = DNA_TYPES.indexOf('dark_subversive');
const AWK_IDX = DNA_TYPES.indexOf('awkward_silence');
const EDGY_RE = /\b(kill|killed|waterboard|ebola|prostitut|suicide|murder|corpse|funeral|dead|die)\b/i;
const isEdgy = (j: QuizJoke) => j.vec[DARK_IDX] === 1 || j.vec[AWK_IDX] === 1 || EDGY_RE.test(j.text);

interface Pick { a: QuizJoke; b: QuizJoke; winner: 'a' | 'b' | null; }
interface ResultPayload { archeIdx: number; axes: number[]; shows: { name: string; slug: string; pct: number }[]; }

function Emblem({ i, size }: { i: number; size: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border-[2.5px] bg-brand-surface"
      style={{ borderColor: EMBLEMS[i].c, width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: emblemSVG(i, Math.round(size * 0.62)) }}
    />
  );
}
function Tile({ slug, size = 34 }: { slug: string; size?: number }) {
  const s = showStyle(slug);
  return (
    <span
      className="inline-flex items-center justify-center rounded-[9px] font-black shrink-0"
      style={{ background: s.c, color: tileText(s.c), width: size, height: size, fontSize: size * 0.38 }}
    >{s.m}</span>
  );
}

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function manhattan(a: number[], b: number[]) { let d = 0; for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]); return d; }

function decodeResult(s: string): ResultPayload | null { try { return JSON.parse(decodeURIComponent(escape(atob(s)))) as ResultPayload; } catch { return null; } }

export default function ComedyDnaQuiz({ quiz, fingerprints, comingSoon = [], jokeCount = 0 }: { quiz: QuizData; fingerprints: ShowFingerprint[]; comingSoon?: { slug: string; name: string }[]; jokeCount?: number }) {
  // precomputed math inputs
  const normFps = useMemo(() => normalizeFingerprints(fingerprints), [fingerprints]);
  const baseline = useMemo(() => buildBaseline(quiz.pool), [quiz.pool]);
  const meanFp = useMemo(() => meanFingerprint(normFps), [normFps]);
  const weights = useMemo(() => buildWeights(meanFp), [meanFp]);

  const [screen, setScreen] = useState<'intro' | 'battle' | 'extend' | 'results'>('intro');
  const [cleanMode, setCleanMode] = useState(false);
  const [pairs, setPairs] = useState<{ a: QuizJoke; b: QuizJoke }[]>([]);
  const [totalRounds, setTotalRounds] = useState(N_BASE);
  const [cur, setCur] = useState(0);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [revealed, setRevealed] = useState(false);
  // Reveal beat: after a pick, hold for ~2.4s on the reveal card (episode + why) before advancing.
  // A second click/key skips the dwell. Driven by the chosen card's transition.
  const [revealing, setRevealing] = useState(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [challenger, setChallenger] = useState<ResultPayload | null>(null);
  const [emailDone, setEmailDone] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [suggestDone, setSuggestDone] = useState(false);
  const [note, setNote] = useState('');
  const [episodes, setEpisodes] = useState<{ slug: string; s: number; e: number; t: string; fp: number[] }[] | null>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLCanvasElement>(null);

  // friend challenge from URL
  useEffect(() => {
    const m = window.location.hash.match(/c=([^&]+)/);
    if (m) { const c = decodeResult(m[1]); if (c) setChallenger(c); }
  }, []);

  // accumulated preference + win counts
  const { pref, winCounts, totalPicks, seenIds } = useMemo(() => {
    const p = new Array(DNA_TYPES.length).fill(0);
    const wc = new Array(DNA_TYPES.length).fill(0);
    const seen = new Set<number>();
    let n = 0;
    for (const pk of picks) {
      if (!pk) continue;
      seen.add(pk.a.id); seen.add(pk.b.id);
      if (!pk.winner) continue;
      const w = pk.winner === 'a' ? pk.a : pk.b, l = pk.winner === 'a' ? pk.b : pk.a;
      for (let d = 0; d < DNA_TYPES.length; d++) { p[d] += (w.vec[d] - baseline[d]) - (l.vec[d] - baseline[d]); wc[d] += w.vec[d]; }
      n++;
    }
    return { pref: p, winCounts: wc, totalPicks: n, seenIds: seen };
  }, [picks, baseline]);

  const buildPairs = useCallback((clean: boolean, hard = false) => {
    const src = shuffle(clean ? quiz.pool.filter(j => !isEdgy(j)) : quiz.pool);
    const used = new Set<number>();
    const out: { a: QuizJoke; b: QuizJoke }[] = [];
    const cap = Math.min(N_MAX, Math.floor(src.length / 2));
    for (let r = 0; r < cap; r++) {
      const A = src.find(j => !used.has(j.id)); if (!A) break; used.add(A.id);
      // Default: pair with most-dissimilar joke (clearer choice). Hard mode: pair with most-similar (tighter face-off).
      let best: QuizJoke | null = null, bd = hard ? Infinity : -1;
      for (const j of src) {
        if (used.has(j.id)) continue;
        const d = manhattan(A.vec, j.vec) + Math.random() * 0.6;
        if (hard ? d < bd : d > bd) { bd = d; best = j; }
      }
      if (!best) break; used.add(best.id);
      out.push(Math.random() < 0.5 ? { a: A, b: best } : { a: best, b: A });
    }
    return out;
  }, [quiz.pool]);

  const startWith = useCallback((rounds: number, hard: boolean) => {
    const ps = buildPairs(cleanMode, hard);
    setPairs(ps); setTotalRounds(Math.min(rounds, ps.length)); setCur(0); setPicks([]); setRevealed(false); setRevealing(false);
    if (revealTimer.current) { clearTimeout(revealTimer.current); revealTimer.current = null; }
    setScreen('battle'); trackEvent('cdna_start', { clean: cleanMode, hard, rounds });
  }, [buildPairs, cleanMode]);
  const start = useCallback(() => startWith(N_BASE, false), [startWith]);

  const advance = useCallback((nextCur: number) => {
    if (nextCur >= totalRounds) {
      if (totalRounds < N_MAX && pairs.length > totalRounds) { setScreen('extend'); trackEvent('cdna_reach_extend'); }
      else { setScreen('results'); }
    } else setCur(nextCur);
  }, [totalRounds, pairs.length]);

  const advanceClearReveal = useCallback((nextCur: number) => {
    if (revealTimer.current) { clearTimeout(revealTimer.current); revealTimer.current = null; }
    setRevealing(false);
    advance(nextCur);
  }, [advance]);

  const choose = useCallback((side: 'a' | 'b') => {
    if (revealing) { advanceClearReveal(cur + 1); return; } // tap-through during reveal
    const R = pairs[cur]; if (!R) return;
    setPicks(prev => { const next = [...prev]; next[cur] = { a: R.a, b: R.b, winner: side }; return next; });
    trackEvent('cdna_pick', { round: cur + 1, winner: (side === 'a' ? R.a : R.b).slug });
    setRevealing(true);
    revealTimer.current = setTimeout(() => advanceClearReveal(cur + 1), 2400);
  }, [pairs, cur, revealing, advanceClearReveal]);

  const skip = useCallback(() => {
    if (revealing) { advanceClearReveal(cur + 1); return; }
    const R = pairs[cur]; if (!R) return;
    setPicks(prev => { const next = [...prev]; next[cur] = { a: R.a, b: R.b, winner: null }; return next; });
    advance(cur + 1);
  }, [pairs, cur, revealing, advance, advanceClearReveal]);

  const back = useCallback(() => {
    if (revealTimer.current) { clearTimeout(revealTimer.current); revealTimer.current = null; }
    setRevealing(false);
    if (cur === 0) return;
    setPicks(prev => { const n = [...prev]; n[cur - 1] = undefined as unknown as Pick; return n; });
    setCur(cur - 1);
  }, [cur]);

  // Clear any pending reveal timer on unmount.
  useEffect(() => () => { if (revealTimer.current) clearTimeout(revealTimer.current); if (shareTimer.current) clearTimeout(shareTimer.current); }, []);

  // Share "I picked A over B" — Web Share API on mobile, clipboard fallback elsewhere.
  // Called from the reveal-state chosen card; stops propagation so it doesn't tap-through to advance.
  const shareThisPick = useCallback((e: React.MouseEvent, winner: QuizJoke, loser: QuizJoke) => {
    e.stopPropagation(); e.preventDefault();
    const trim = (s: string, n = 90) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
    const txt = `I picked "${trim(winner.text)}" over "${trim(loser.text)}" — which one would you pick? https://www.thehumorindex.com/comedy-dna`;
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    if (nav?.share) {
      nav.share({ text: txt, url: 'https://www.thehumorindex.com/comedy-dna' }).catch(() => { /* user dismissed */ });
    } else if (nav?.clipboard?.writeText) {
      nav.clipboard.writeText(txt).then(() => {
        setShareCopied(true);
        if (shareTimer.current) clearTimeout(shareTimer.current);
        shareTimer.current = setTimeout(() => setShareCopied(false), 1900);
      }).catch(() => { /* clipboard denied */ });
    }
    trackEvent('cdna_share_pick', { round: cur + 1, winner: winner.slug });
  }, [cur]);

  // keyboard
  useEffect(() => {
    if (screen !== 'battle') return;
    const h = (e: KeyboardEvent) => {
      if (revealing) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === '1' || e.key === '2') {
          e.preventDefault(); advanceClearReveal(cur + 1);
        }
        return;
      }
      if (e.key === '1' || e.key === 'ArrowLeft') choose('a');
      else if (e.key === '2' || e.key === 'ArrowRight') choose('b');
      else if (e.key === 'Backspace') { e.preventDefault(); back(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [screen, choose, back, revealing, cur, advanceClearReveal]);

  // ---- results derivations ----
  const result = useMemo(() => {
    if (screen !== 'results') return null;
    const aRank = rankArchetypes(pref, weights);
    const best = aRank[0].arche, second = aRank[1].arche, margin = aRank[0].score - aRank[1].score;
    const conf = margin > 0.18 ? 'Strongly' : margin > 0.08 ? 'Clearly' : 'Leaning';
    const totT = winCounts.reduce((a, b) => a + b, 0) || 1;
    const frac = winCounts.map(c => c / totT);
    const axisVals = AXES.map(ax => {
      const ls = ax.l.reduce((s, t) => s + frac[DNA_TYPES.indexOf(t)], 0);
      const rs = ax.r.reduce((s, t) => s + frac[DNA_TYPES.indexOf(t)], 0);
      let pr = (ls + rs) > 0 ? rs / (ls + rs) : 0.5; pr = 0.5 + (pr - 0.5) * 1.5;
      pr = Math.max(0.06, Math.min(0.94, pr));
      const avg = normFps.length ? normFps.reduce((s, f) => s + axisValue(f.fp, ax), 0) / normFps.length : 0.5;
      return { ...ax, pr, avg };
    });
    // Comparative headline vs. the scored shows, on the user's most pronounced axis.
    let compare: { label: string; n: number; total: number } | null = null;
    if (normFps.length) {
      const ext = axisVals.reduce((b, a) => Math.abs(a.pr - 0.5) > Math.abs(b.pr - 0.5) ? a : b, axisVals[0]);
      const right = ext.pr >= 0.5;
      const sp = normFps.map(f => axisValue(f.fp, ext));
      const n = right ? sp.filter(p => p < ext.pr).length : sp.filter(p => p > ext.pr).length;
      compare = { label: (right ? ext.right : ext.left).toLowerCase(), n, total: normFps.length };
    }
    const shows = rankShows(pref, normFps, meanFp, weights);
    // signature jokes
    const cands = [...quiz.reco, ...quiz.pool.filter(j => !seenIds.has(j.id))].filter(j => !cleanMode || !isEdgy(j));
    const ranked = cands.map(j => ({ j, s: dot(j.vec.map((v, d) => v - baseline[d]), pref) + (j.quot || 0) * 0.04 })).sort((a, b) => b.s - a.s);
    const sig: QuizJoke[] = []; const per: Record<string, number> = {};
    for (const r of ranked) { if ((per[r.j.slug] || 0) >= 1) continue; per[r.j.slug] = 1; sig.push(r.j); if (sig.length >= 4) break; }
    const payload: ResultPayload = { archeIdx: ARCHES.indexOf(best), axes: axisVals.map(a => +a.pr.toFixed(2)), shows: shows.slice(0, 3).map(s => ({ name: s.name, slug: s.slug, pct: s.pct })) };
    return { best, second, margin, conf, axisVals, compare, shows, sig, payload };
  }, [screen, pref, winCounts, weights, normFps, meanFp, baseline, quiz.reco, quiz.pool, seenIds, cleanMode]);

  // Lazy-load episode fingerprints once the user reaches results (keeps initial load light).
  useEffect(() => {
    if (screen !== 'results' || episodes) return;
    let on = true;
    fetch('/data/comedy-dna-episodes.json').then(r => r.ok ? r.json() : []).then(d => { if (on) setEpisodes(Array.isArray(d) ? d : []); }).catch(() => { if (on) setEpisodes([]); });
    return () => { on = false; };
  }, [screen, episodes]);

  // Episodes whose joke mix best matches the user's taste (max 2 per show, top 5).
  const epRecs = useMemo(() => {
    if (!episodes || !episodes.length || screen !== 'results') return [];
    const base = DNA_TYPES.map((_, d) => episodes.reduce((s, ep) => s + (ep.fp[d] || 0), 0) / episodes.length);
    const nameOf: Record<string, string> = Object.fromEntries(fingerprints.map(f => [f.slug, f.name]));
    const scored = episodes.map(ep => ({ ep, s: wcos(pref, ep.fp.map((v, d) => v - base[d]), weights) })).sort((a, b) => b.s - a.s);
    const out: { slug: string; s: number; e: number; t: string; show: string }[] = [];
    const per: Record<string, number> = {};
    for (const r of scored) {
      const sl = r.ep.slug;
      if ((per[sl] || 0) >= 2) continue;
      per[sl] = (per[sl] || 0) + 1;
      out.push({ slug: r.ep.slug, s: r.ep.s, e: r.ep.e, t: r.ep.t, show: nameOf[sl] || sl });
      if (out.length >= 5) break;
    }
    return out;
  }, [episodes, pref, weights, fingerprints, screen]);

  // fire analytics + confetti + reveal on entering results
  useEffect(() => {
    if (screen !== 'results' || !result) return;
    trackEvent('cdna_complete', { archetype: result.best.name, picks: totalPicks, top_show: result.shows[0]?.slug, clean: cleanMode });
    const t = setTimeout(() => setRevealed(true), 60);
    const c = setTimeout(() => confetti(), 240);
    return () => { clearTimeout(t); clearTimeout(c); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, result]);

  function confetti() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const cv = confettiRef.current; if (!cv) return;
    const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.style.display = 'block'; cv.width = W * dpr; cv.height = H * dpr;
    const x = cv.getContext('2d'); if (!x) return; x.scale(dpr, dpr);
    const cols = ['#E8B931', '#1D9E75', '#D85A30', '#7F77DD', '#378ADD', '#D4537E'];
    const P = Array.from({ length: 150 }, (_, i) => ({ x: W / 2 + (Math.random() - 0.5) * W * 0.55, y: -20 - Math.random() * 140, vx: (Math.random() - 0.5) * 7, vy: 2 + Math.random() * 4.5, s: 6 + Math.random() * 7, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.32, c: cols[i % cols.length] }));
    const start = performance.now();
    const frame = (t: number) => {
      x.clearRect(0, 0, W, H); let alive = false;
      for (const p of P) { p.vy += 0.06; p.x += p.vx; p.y += p.vy; p.r += p.vr; if (p.y < H + 20) alive = true; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.globalAlpha = Math.max(0, 1 - ((t - start) / 2600) * 0.7); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.62); x.restore(); }
      if (alive && t - start < 2600) requestAnimationFrame(frame); else cv.style.display = 'none';
    };
    requestAnimationFrame(frame);
  }

  // ---- share card (dark, branded) ----
  const loadImg = (src: string) => new Promise<HTMLImageElement | null>(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  function roundRect(x: CanvasRenderingContext2D, X: number, Y: number, W: number, H: number, r: number) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
  async function drawCard() {
    if (!result) return; const cv = cardRef.current; if (!cv) return; const x = cv.getContext('2d'); if (!x) return;
    const A = ARCHES[result.payload.archeIdx];
    x.fillStyle = '#0F0F0F'; x.fillRect(0, 0, 1080, 1080);
    x.fillStyle = '#E8B931'; x.save(); x.translate(70, 80); x.rotate(Math.PI / 4); x.fillRect(0, 0, 26, 26); x.restore();
    x.fillStyle = '#F5F5F5'; x.font = '800 34px Inter, sans-serif'; x.fillText('THE HUMOR INDEX', 120, 102);
    const emb = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(emblemSVG(A.emblem, 220)));
    const ex = 940, ey = 120, er = 78;
    x.beginPath(); x.arc(ex, ey, er, 0, Math.PI * 2); x.fillStyle = '#1A1A1A'; x.fill(); x.lineWidth = 5; x.strokeStyle = EMBLEMS[A.emblem].c; x.stroke();
    if (emb) x.drawImage(emb, ex - er * 0.72, ey - er * 0.72, er * 1.44, er * 1.44);
    x.fillStyle = '#E8B931'; x.font = '800 26px Inter, sans-serif'; x.fillText('MY COMEDY DNA', 70, 248);
    x.fillStyle = '#F5F5F5'; x.font = '900 86px Inter, sans-serif';
    wrap(x, A.name, 70, 348, 760, 92);
    x.fillStyle = '#E8B931'; x.font = '600 34px Inter, sans-serif'; x.fillText(A.tag, 70, 486);
    x.fillStyle = '#A0A0A0'; x.font = '800 24px Inter, sans-serif'; x.fillText('SHOWS BUILT FOR ME', 70, 606);
    result.payload.shows.forEach((s, i) => {
      const y = 648 + i * 96, st = showStyle(s.slug);
      x.fillStyle = st.c; roundRect(x, 70, y, 64, 64, 14); x.fill();
      x.fillStyle = tileText(st.c); x.font = '900 26px Inter, sans-serif'; x.textAlign = 'center'; x.fillText(st.m, 102, y + 42); x.textAlign = 'left';
      const bx = 160, bw = 850;
      x.fillStyle = '#2D2D2D'; roundRect(x, bx, y + 6, bw, 52, 10); x.fill();
      x.fillStyle = '#1D9E75'; roundRect(x, bx, y + 6, bw * (s.pct / 100), 52, 10); x.fill();
      x.fillStyle = '#F5F5F5'; x.font = '800 30px Inter, sans-serif'; x.fillText(`${i + 1}. ${s.name}`, bx + 22, y + 44);
      x.textAlign = 'right'; x.fillText(`${s.pct}%`, bx + bw - 20, y + 44); x.textAlign = 'left';
    });
    x.fillStyle = '#A0A0A0'; x.font = '600 26px Inter, sans-serif'; x.fillText("What's yours?  thehumorindex.com/comedy-dna", 70, 1014);
  }
  function wrap(ctx: CanvasRenderingContext2D, text: string, xx: number, yy: number, maxW: number, lh: number) { const words = text.split(' '); let line = '', y = yy; for (const w of words) { const test = line + w + ' '; if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line.trim(), xx, y); line = w + ' '; y += lh; } else line = test; } ctx.fillText(line.trim(), xx, y); }

  async function shareCard() {
    if (!result) return; trackEvent('cdna_share'); await drawCard();
    cardRef.current?.toBlob(async (blob) => {
      if (!blob) return; const file = new File([blob], 'comedy-dna.png', { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
      if (nav.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'My Comedy DNA', text: `I'm ${ARCHES[result.payload.archeIdx].name} on The Humor Index. What's your comedy DNA?` }); return; } catch { /* fall through to download */ } }
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'comedy-dna.png'; a.click(); URL.revokeObjectURL(url);
    }, 'image/png');
  }
  async function challenge() {
    if (!result) return; trackEvent('cdna_share_link');
    const d = encodeURIComponent(JSON.stringify({
      a: result.payload.archeIdx,
      c: result.conf,
      x: result.payload.axes,
      s: result.payload.shows.map(s => [s.slug, s.name, s.pct]),
    }));
    const link = `${window.location.origin}/comedy-dna/p?d=${d}`;
    try { await navigator.clipboard.writeText(link); flash('Your Comedy DNA link is copied — share it!'); } catch { window.prompt('Copy your Comedy DNA link:', link); }
  }
  function flash(msg: string) { setNote(msg); setTimeout(() => setNote(''), 3500); }

  async function submitEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem('email') as HTMLInputElement);
    const v = input?.value.trim(); if (!v) return;
    setEmailValue(v); trackEvent('cdna_email', { archetype: result?.best.slug });
    try { await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v, archetype: result?.best.slug, source: 'comedy-dna' }) }); } catch { /* non-blocking */ }
    setEmailDone(true);
  }

  async function voteShow(slug: string) {
    if (voted.has(slug)) return;
    setVoted(prev => new Set(prev).add(slug)); trackEvent('cdna_vote', { slug });
    try { await fetch('/api/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, email: emailValue || undefined }) }); } catch { /* non-blocking */ }
  }
  async function suggestShow(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem('suggest') as HTMLInputElement);
    const v = input?.value.trim(); if (!v) return;
    setSuggestDone(true); trackEvent('cdna_vote_custom');
    try { await fetch('/api/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customShow: v, email: emailValue || undefined }) }); } catch { /* non-blocking */ }
  }

  const kicker = 'text-brand-gold text-xs font-extrabold tracking-[0.14em] uppercase';
  const btnPrimary = 'rounded-full bg-brand-gold text-brand-dark font-bold px-6 py-3.5 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold';
  const btnLine = 'rounded-full border border-brand-border text-brand-text-primary font-semibold px-6 py-3.5 transition hover:border-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold';

  // ===================== RENDER =====================
  return (
    <div className="text-brand-text-primary">
      <canvas ref={confettiRef} aria-hidden className="fixed inset-0 w-full h-full pointer-events-none z-50 hidden" />
      <canvas ref={cardRef} width={1080} height={1080} aria-hidden className="hidden" />

      <div className="flex items-center gap-2.5 font-extrabold tracking-tight text-sm">
        <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-brand-coral rotate-45" />
        THE HUMOR INDEX <span className="text-brand-text-secondary font-semibold">· comedy DNA</span>
      </div>

      {/* INTRO */}
      {screen === 'intro' && (
        <section className="mt-8">
          <span className={kicker}>Find your comedy DNA</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-3 mb-3">Which joke is funnier?</h1>
          <p className="text-lg text-brand-text-secondary max-w-xl mb-3">
            You&apos;ll see two real jokes from the funniest sitcoms ever scored. Pick whichever lands harder for <em>you</em> — no wrong answers. After a quick run of face-offs, we&apos;ll map your taste and the shows and jokes built for it.
          </p>
          <p className="text-sm text-brand-text-muted max-w-xl mb-6">
            Every joke scored 3 times by AI for consensus, on craft + impact + memorability. <a href="/methodology" className="text-brand-gold hover:text-brand-text-primary font-semibold underline-offset-2 hover:underline">How we did it &rarr;</a>
          </p>

          {/* The 6 archetypes preview — anchors the experience by showing what you're working toward */}
          <div className="mb-7">
            <span className={`${kicker} block mb-2.5`}>One of these is you</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {ARCHES.map((a, i) => (
                <a key={a.slug} href={`/comedy-dna/${a.slug}`} title={a.tag}
                   className="bg-brand-card border border-brand-border hover:border-brand-gold transition rounded-xl p-2.5 flex flex-col items-center gap-1.5 text-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
                  <Emblem i={i} size={36} />
                  <span className="text-[11px] font-bold leading-tight">{a.name.replace(/^The /, '')}</span>
                  <span className="text-[10px] text-brand-text-muted leading-tight hidden sm:block">{a.tag}</span>
                </a>
              ))}
            </div>
          </div>

          <label className="inline-flex items-center gap-3 mb-6 cursor-pointer text-brand-text-secondary font-semibold select-none">
            <input type="checkbox" className="peer sr-only" checked={cleanMode} onChange={e => setCleanMode(e.target.checked)} />
            <span className="w-11 h-6 rounded-full bg-brand-border relative transition peer-checked:bg-brand-teal after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
            Keep it clean <span className="font-normal">(skip the darker, edgier jokes)</span>
          </label>
          <div><button className={btnPrimary} onClick={start}>Start the face-offs</button></div>
          <div className="flex gap-7 mt-8 flex-wrap">
            {[[`${N_BASE}`, 'quick face-offs'], [jokeCount ? jokeCount.toLocaleString() : '70,000+', 'jokes scored'], [`${fingerprints.length}`, 'shows ranked']].map(([b, s]) => (
              <div key={s} className="flex flex-col"><b className="text-2xl font-black">{b}</b><span className="text-xs text-brand-text-muted uppercase tracking-wider font-semibold">{s}</span></div>
            ))}
          </div>
          {challenger && ARCHES[challenger.archeIdx] && (
            <p className="mt-6 text-brand-text-secondary">A friend who&apos;s <b className="text-brand-text-primary">{ARCHES[challenger.archeIdx].name}</b> challenged you — play to see if your taste matches.</p>
          )}
          <div className="flex gap-2.5 items-center mt-7 flex-wrap" aria-hidden>
            <span className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Which are you?</span>
            {ARCHES.map((_, i) => <span key={i} className="opacity-60 hover:opacity-100 transition"><Emblem i={i} size={40} /></span>)}
          </div>
        </section>
      )}

      {/* BATTLE */}
      {screen === 'battle' && pairs[cur] && (
        <section className="mt-2">
          <div className="flex items-center justify-between gap-3 mb-4">
            <button className="text-sm font-bold text-brand-text-secondary disabled:opacity-30 px-2 py-1.5" onClick={back} disabled={cur === 0}>&larr; Back</button>
            <div className="flex-1 h-1.5 rounded-full bg-brand-border overflow-hidden"><div className="h-full bg-brand-gold transition-all duration-300" style={{ width: `${(cur / totalRounds) * 100}%` }} /></div>
            <span className="text-sm font-extrabold tabular-nums whitespace-nowrap">{cur + 1} / {totalRounds}</span>
          </div>

          {/* Mid-battle archetype peek — first peek at round 3 (early engagement reward), then every 6. */}
          {!revealing && (totalPicks === 3 || (totalPicks >= 6 && totalPicks % 6 === 0)) && (() => {
            const lead = rankArchetypes(pref, weights)[0]?.arche; if (!lead) return null;
            const li = ARCHES.indexOf(lead);
            return (
              <div className="mb-5 bg-brand-card border border-brand-border rounded-xl px-4 py-3 flex items-center gap-3">
                <Emblem i={li} size={40} />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-brand-text-muted">{totalPicks} picks in</span>
                  <p className="text-[14px] mt-0.5 leading-snug">So far you&apos;re leaning <b style={{ color: EMBLEMS[li]?.c }}>{lead.name}</b></p>
                </div>
              </div>
            );
          })()}

          <div className="text-center mb-5 min-h-[70px]">
            {!revealing ? (
              <>
                <span className={`${kicker} block mb-1.5`}>Round {cur + 1}</span>
                <h2 className="text-2xl md:text-3xl font-extrabold">Which one&apos;s funnier to you?</h2>
              </>
            ) : (
              <>
                <span className={`${kicker} block mb-1.5 text-brand-teal`}>Locked in</span>
                <h2 className="text-xl md:text-2xl font-extrabold">Tap any card to continue &rarr;</h2>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['a', 'b'] as const).map((side, idx) => {
              const j = pairs[cur][side];
              const chosen = picks[cur]?.winner === side;
              const isLoser = revealing && !chosen;
              const st = showStyle(j.slug);
              const sceneLabel = `${j.scene || 'scene'} backdrop · ${j.show ?? ''}`;
              return (
                <button key={side} onClick={() => choose(side)}
                  aria-label={revealing
                    ? `${chosen ? 'Your pick' : 'Other option'}: ${j.text}${j.show ? ` — ${j.show}` : ''}${j.ep ? `, ${j.ep}` : ''}`
                    : `Option ${idx + 1}: "${j.text}"${j.speaker ? `, said by ${j.speaker}` : ''}`}
                  className={`group relative text-left rounded-2xl overflow-hidden flex flex-col bg-brand-surface border-[1.5px] shadow-lg
                    transition-all duration-300 ease-out motion-reduce:transition-none
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold
                    ${chosen ? 'border-brand-teal shadow-[0_0_0_2px_rgba(29,158,117,.25)]' : isLoser ? 'border-brand-border opacity-55' : 'border-brand-border hover:border-brand-gold motion-safe:hover:-translate-y-0.5'}`}>

                  {/* Scene art: smaller + muted during the vote (joke wins the eye); larger + full-color on reveal. */}
                  <div className="relative">
                    <MemeScene
                      scene={j.scene}
                      color={st.c}
                      mono={st.m}
                      props={j.props}
                      jokeId={j.id}
                      muted={!revealing}
                      ariaLabel={sceneLabel}
                      className={`block w-full transition-all duration-300 motion-reduce:transition-none ${revealing ? 'h-[340px]' : 'h-[320px]'}`} />

                    {/* Show chip (top-left) — full-card context during the vote */}
                    {!revealing && j.show && (
                      <span className="absolute top-2 left-2.5 inline-flex items-center px-2.5 h-[22px] rounded-md text-[10px] font-extrabold tracking-wide uppercase shadow-sm" style={{ background: st.c, color: tileText(st.c) }}>{j.show}</span>
                    )}
                    {/* Option number chip during vote; chosen badge during reveal */}
                    {!revealing && (
                      <span className="absolute top-2 right-2.5 w-[22px] h-[22px] rounded-md bg-black/55 backdrop-blur-sm border border-white/25 text-white text-xs font-extrabold flex items-center justify-center">{idx + 1}</span>
                    )}
                    {chosen && (
                      <span className="absolute top-2 left-2.5 inline-flex items-center gap-1 px-2 h-[22px] rounded-md bg-brand-teal text-white text-[10px] font-extrabold tracking-wide uppercase">
                        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden><path d="M1 6l3 3 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Your pick
                      </span>
                    )}

                    {/* Speaker chip — always visible (character context aids comprehension without revealing the show) */}
                    {j.speaker && (
                      <span className="absolute bottom-2 right-2.5 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm border border-white/15 rounded-full pl-1 pr-2.5 py-1 text-white text-xs font-semibold">
                        <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: st.c, color: tileText(st.c) }}>{st.m}</span>
                        {j.speaker}
                      </span>
                    )}
                  </div>

                  {/* Body: VOTE shows only the joke (vertical-centered, big). REVEAL shows show + ep + why-it-lands. */}
                  <div className="px-4 sm:px-5 py-4 flex flex-col flex-1 justify-center min-h-[150px]">
                    {!revealing ? (
                      <p className="text-[15px] md:text-[16.5px] font-semibold leading-snug">
                        <span className="text-brand-gold">&ldquo;</span>{j.text}<span className="text-brand-gold">&rdquo;</span>
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10.5px] font-bold uppercase tracking-wide text-brand-text-muted">
                          {j.show}{j.ep ? ` · ${j.ep}` : ''}{j.etitle ? ` · “${j.etitle}”` : ''}
                        </span>
                        <p className="text-[14px] md:text-[15px] font-semibold leading-snug line-clamp-3">
                          <span className="text-brand-gold">&ldquo;</span>{j.text}<span className="text-brand-gold">&rdquo;</span>
                        </p>
                        {chosen && j.why ? (
                          <div className="mt-1 pt-2 border-t border-brand-border">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-brand-teal block mb-1">Why it lands</span>
                            <p className="text-[12.5px] text-brand-text-secondary leading-relaxed">{j.why}</p>
                          </div>
                        ) : null}
                        {chosen && (
                          <button type="button"
                            onClick={(e) => shareThisPick(e, j, side === 'a' ? pairs[cur].b : pairs[cur].a)}
                            className="mt-2 inline-flex items-center gap-1.5 self-start text-[10.5px] font-bold uppercase tracking-wide text-brand-text-muted hover:text-brand-gold transition px-2.5 py-1.5 rounded-md border border-brand-border hover:border-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                            aria-label="Share this matchup">
                            {shareCopied ? (
                              <><svg width="11" height="11" viewBox="0 0 12 12" aria-hidden><path d="M1 6l3 3 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>Copied to clipboard</>
                            ) : (
                              <><svg width="11" height="11" viewBox="0 0 16 16" aria-hidden><path d="M8 1v9M4 5l4-4 4 4M2 11v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>Share this matchup</>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Between cards: VS + promoted skip — only during vote */}
          {!revealing && (
            <div className="flex flex-col items-center my-5 gap-3">
              <div className="flex items-center gap-3 w-full max-w-xs">
                <span className="h-px flex-1 bg-brand-border" />
                <svg width={40} height={40} viewBox="0 0 64 64" aria-hidden><rect x="14" y="14" width="36" height="36" rx="9" transform="rotate(45 32 32)" fill="#E8B931" /><text x="32" y="38" textAnchor="middle" fontSize="17" fontWeight="900" fill="#0F0F0F" fontFamily="Inter,sans-serif">VS</text></svg>
                <span className="h-px flex-1 bg-brand-border" />
              </div>
              <button onClick={skip}
                className="text-brand-text-secondary font-semibold text-[13.5px] hover:text-brand-text-primary px-3.5 py-2 rounded-lg border border-brand-border hover:border-brand-text-muted transition">
                Too close to call &mdash; skip &rarr;
              </button>
            </div>
          )}

          {/* Keyboard hint stays only during vote */}
          {!revealing && (
            <p className="text-center text-brand-text-muted text-sm mt-1.5" aria-hidden>Tip: press <b>1</b> or <b>2</b> (or &larr; / &rarr;) to choose</p>
          )}
        </section>
      )}

      {/* EXTEND */}
      {screen === 'extend' && (() => {
        // Stepped extend: each "Keep going" adds N_STEP rounds, capped at min(N_MAX, available pairs).
        const nextTotal = Math.min(N_MAX, pairs.length, totalRounds + N_STEP);
        const moreRounds = nextTotal - totalRounds;
        const canExtend = moreRounds > 0;
        return (
          <section className="mt-8">
            <div className="bg-brand-card border border-brand-border rounded-2xl text-center px-7 py-9">
              <span className={kicker}>Nice picks</span>
              <h2 className="text-2xl font-extrabold mt-2.5 mb-2">Want a sharper read?</h2>
              <p className="text-brand-text-secondary max-w-md mx-auto mb-5">
                {totalRounds} picks in — enough to map your taste now. {canExtend ? <>Or play <b>{moreRounds} more</b> to refine it further.</> : null}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button className={btnPrimary} onClick={() => setScreen('results')}>See my results</button>
                {canExtend && (
                  <button className={btnLine} onClick={() => { setTotalRounds(nextTotal); setScreen('battle'); }}>
                    {moreRounds} more face-offs &rarr;
                  </button>
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {/* RESULTS */}
      {screen === 'results' && result && (
        <section className="mt-6">
          {challenger && ARCHES[challenger.archeIdx] && (
            <div className="bg-brand-card border border-brand-border border-l-4 border-l-brand-gold rounded-2xl px-6 py-5 mb-5">
              <span className={kicker}>You vs. {ARCHES[challenger.archeIdx].name.replace(/^The /, '')}</span>
              <div className="mt-2 text-[15px] flex justify-between border-b border-brand-border py-2"><span className="text-brand-text-secondary">Archetype</span><b>{challenger.archeIdx === result.payload.archeIdx ? `Same type! ${result.best.name}` : `${result.best.name} vs ${ARCHES[challenger.archeIdx].name}`}</b></div>
              <div className="text-[15px] flex justify-between py-2"><span className="text-brand-text-secondary">Taste match</span><b>{Math.round(100 * (1 - result.payload.axes.reduce((s, v, i) => s + Math.abs(v - (challenger.axes?.[i] ?? 0.5)), 0) / 4))}%</b></div>
            </div>
          )}

          <div className="bg-brand-card border border-brand-border rounded-2xl text-center px-7 py-9">
            <span className={kicker}>Your comedy DNA</span>
            <div className="my-2 flex justify-center"><Emblem i={result.best.emblem} size={88} /></div>
            <div className="text-brand-teal text-xs font-extrabold tracking-widest uppercase">{result.conf} your type</div>
            <div className="text-4xl md:text-5xl font-black tracking-tight my-2">{result.best.name}</div>
            <div className="text-brand-gold text-lg font-bold">{result.best.tag}</div>
            {result.margin <= 0.18 && <div className="text-sm text-brand-text-secondary mt-1">…with a {result.second.name.replace(/^The /, '')} streak.</div>}
            <p className="max-w-xl mx-auto text-brand-text-secondary mt-3">{result.best.blurb}</p>
            <div className="flex gap-1.5 flex-wrap justify-center mt-3">{result.best.tags.map(t => <span key={t} className="text-[11px] font-semibold text-brand-text-secondary bg-brand-surface border border-brand-border px-2.5 py-1 rounded-full">{t}</span>)}</div>
            {result.shows[0] && (
              <div className="mt-4 pt-4 border-t border-brand-border text-[15px] text-brand-text-secondary">
                Top match: <a href={SHOW_URL(result.shows[0].slug)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('cdna_show_click', { slug: result.shows[0].slug, from: 'hero' })} className="text-brand-teal font-bold hover:underline">{result.shows[0].name}</a>
                {result.compare && <> · you lean more <b className="text-brand-text-primary">{result.compare.label}</b> than {result.compare.n} of {result.compare.total} shows</>}
              </div>
            )}
            <div className="flex gap-2.5 justify-center flex-wrap mt-4">
              <button className={btnPrimary} onClick={shareCard}>Share my card</button>
              <button className={`${btnLine} !border-brand-teal`} onClick={challenge}>Challenge a friend &rarr;</button>
            </div>
            <p className="text-xs text-brand-text-muted mt-2.5">The challenge link plays them through the same face-offs — see how your tastes differ.</p>
          </div>

          <div className="mt-10 mb-1 text-center"><span className="text-[11px] uppercase tracking-[0.14em] text-brand-text-muted">The full breakdown</span></div>

          {/* axes */}
          <div className="mt-3">
            <span className={`${kicker} block mb-3.5`}>Your taste, on four axes</span>
            {result.compare && (
              <p className="text-brand-text-secondary mb-4 -mt-1">You lean more <b className="text-brand-text-primary">{result.compare.label}</b> than {result.compare.n} of the {result.compare.total} shows we&apos;ve scored.</p>
            )}
            {result.axisVals.map(ax => {
              const leftOn = ax.pr < 0.5;
              return (
                <div key={ax.left} className="my-4">
                  <div className="flex justify-between text-[13px] font-bold text-brand-text-secondary mb-1.5"><span className={leftOn ? 'text-brand-text-primary' : ''}>{ax.left}</span><span className={!leftOn ? 'text-brand-text-primary' : ''}>{ax.right}</span></div>
                  <div className="relative h-2.5 bg-brand-border rounded-full">
                    <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3.5 bg-brand-text-muted" style={{ left: `${ax.avg * 100}%` }} title="Average scored show" />
                    <div className="absolute top-1/2 w-[18px] h-[18px] rounded-full bg-brand-gold -translate-x-1/2 -translate-y-1/2 transition-all duration-700" style={{ left: `${(revealed ? ax.pr : 0.5) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            <p className="text-[11px] text-brand-text-muted mt-2">Gold dot = you · faint marker = average scored show</p>
          </div>

          {/* shows */}
          <div className="mt-8">
            <span className={`${kicker} block mb-3.5`}>Shows built for your taste</span>
            <div className="bg-brand-card border border-brand-border rounded-2xl px-5 py-2">
              {result.shows.map((s, i) => (
                <div key={s.slug} className={`flex items-center gap-3.5 py-2.5 ${i < result.shows.length - 1 ? 'border-b border-brand-border' : ''}`}>
                  <span className="tabular-nums font-black text-brand-text-muted w-6 text-[15px]">{i + 1}</span>
                  <Tile slug={s.slug} />
                  <a href={SHOW_URL(s.slug)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('cdna_show_click', { slug: s.slug, from: 'ranking' })} className={`font-bold w-32 sm:w-48 shrink-0 truncate hover:underline ${i === 0 ? 'text-brand-teal' : 'text-brand-text-primary'}`}>{s.name}</a>
                  <span className="flex-1 h-[22px] bg-brand-border rounded-md overflow-hidden"><span className="block h-full bg-brand-teal rounded-md transition-all duration-700" style={{ width: `${revealed ? s.pct : 0}%` }} /></span>
                  <span className="tabular-nums font-black w-12 text-right text-[15px]">{s.pct}%</span>
                </div>
              ))}
            </div>
            <div className="text-[13.5px] text-brand-text-secondary mt-2.5 px-3.5 py-2.5 bg-brand-surface rounded-xl border border-brand-border">{whyText(result.shows[0], pref, weights, meanFp)}</div>
          </div>

          {/* signature jokes */}
          <div className="mt-8">
            <span className={`${kicker} block mb-3.5`}>Signature jokes for you</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {result.sig.map(j => (
                <div key={j.id} className="bg-brand-surface border border-brand-border rounded-xl px-5 py-5 flex flex-col">
                  <div className="text-base font-medium leading-snug mb-3"><span className="text-brand-gold">&ldquo;</span>{j.text}<span className="text-brand-gold">&rdquo;</span></div>
                  <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                    <Tile slug={j.slug} size={22} />
                    <a href={SHOW_URL(j.slug)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('cdna_show_click', { slug: j.slug, from: 'signature' })} className="text-brand-gold hover:underline">{j.show}</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* episodes for your taste */}
          {epRecs.length > 0 && (
            <div className="mt-8">
              <span className={`${kicker} block mb-1`}>Episodes for your taste</span>
              <p className="text-brand-text-secondary text-sm mb-3.5">Episodes whose joke mix best matches your picks — a place to start watching.</p>
              <div className="bg-brand-card border border-brand-border rounded-2xl px-5 py-1">
                {epRecs.map(ep => (
                  <a key={`${ep.slug}-${ep.s}-${ep.e}`} href={`https://www.thehumorindex.com/shows/${ep.slug}/${ep.s}/${ep.e}/`} target="_blank" rel="noopener noreferrer"
                    onClick={() => trackEvent('cdna_ep_click', { slug: ep.slug, s: ep.s, e: ep.e })}
                    className="flex items-center gap-3.5 py-2.5 border-b border-brand-border last:border-0 hover:bg-brand-surface -mx-3 px-3 rounded transition">
                    <Tile slug={ep.slug} size={30} />
                    <span className="flex-1 min-w-0"><span className="font-bold text-brand-text-primary block truncate">{ep.t}</span><span className="text-xs text-brand-text-muted">{ep.show} · S{ep.s} E{ep.e}</span></span>
                    <span className="text-brand-gold text-sm shrink-0">Watch &rarr;</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* share / capture */}
          <div className="mt-8 bg-brand-card border border-brand-border rounded-2xl px-6 py-7 text-center">
            <span className={kicker}>Keep exploring</span>
            <h2 className="text-xl font-extrabold mt-2 mb-1">Get the shows that match your taste</h2>
            <p className="text-brand-text-secondary max-w-md mx-auto mb-3.5">Dive into your top match, or have the shows built for your comedy DNA sent to your inbox.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a className={btnPrimary} href={SHOW_URL(result.shows[0].slug)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('cdna_show_click', { slug: result.shows[0].slug, from: 'cta' })}>Explore {result.shows[0].name} &rarr;</a>
            </div>
            <div className="mt-5">
              {emailDone ? (
                <p className="text-brand-teal font-semibold">You&apos;re on the list. We&apos;ll send the shows that match your taste.</p>
              ) : (
                <>
                  <p className="font-bold mb-2">Want the shows that match, in your inbox?</p>
                  <form className="flex gap-2 max-w-md mx-auto" onSubmit={submitEmail}>
                    <input name="email" type="email" required placeholder="you@email.com" aria-label="Email address" className="flex-1 px-4 py-3 rounded-full bg-brand-surface border border-brand-border text-brand-text-primary placeholder:text-brand-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal" />
                    <button className={`${btnPrimary} !bg-brand-teal !text-white`} type="submit">Get them</button>
                  </form>
                </>
              )}
              <p className="text-[13px] text-brand-text-muted mt-2 min-h-[1.2em]">{note || 'A weekly comedy drop from The Humor Index. No spam.'}</p>
            </div>
          </div>

          {/* vote for next show */}
          {comingSoon.length > 0 && (
            <div className="mt-8 bg-brand-card border border-brand-border rounded-2xl px-6 py-7 text-center">
              <span className={kicker}>Help pick what&apos;s next</span>
              <h2 className="text-xl font-extrabold mt-2 mb-1">Which show should we score next?</h2>
              <p className="text-brand-text-secondary max-w-md mx-auto mb-4">We&apos;re adding shows all the time. Vote for the ones you want in the mix.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {comingSoon.map(s => {
                  const v = voted.has(s.slug);
                  return (
                    <button key={s.slug} onClick={() => voteShow(s.slug)} disabled={v}
                      className={`text-sm font-semibold px-3.5 py-2 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${v ? 'border-brand-teal text-brand-teal bg-brand-teal/10' : 'border-brand-border text-brand-text-primary hover:border-brand-gold'}`}>
                      {v ? '✓ ' : ''}{s.name}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                {suggestDone ? (
                  <p className="text-brand-teal font-semibold text-sm">Thanks — we&apos;ll add it to the list.</p>
                ) : (
                  <form className="flex gap-2 max-w-sm mx-auto" onSubmit={suggestShow}>
                    <input name="suggest" type="text" placeholder="Don't see it? Suggest a show" aria-label="Suggest a show" className="flex-1 px-4 py-2.5 rounded-full bg-brand-surface border border-brand-border text-brand-text-primary placeholder:text-brand-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold text-sm" />
                    <button className={`${btnLine} !py-2.5`} type="submit">Add</button>
                  </form>
                )}
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-brand-border text-center">
            <span className={`${kicker} block mb-2`}>Keep going</span>
            <p className="text-brand-text-secondary text-sm max-w-md mx-auto mb-4">Liked it? Try the tougher cut — face-offs between jokes with similar comedic DNA, so every pick is a real call.</p>
            <div className="flex gap-2.5 justify-center flex-wrap">
              <button className={btnPrimary} onClick={() => startWith(10, true)}>Play 10 more &mdash; hard mode</button>
              <button className={btnLine} onClick={() => { setScreen('intro'); setPicks([]); setCur(0); }}>Start over</button>
            </div>
          </div>

          <p className="mt-6 text-xs text-brand-text-muted text-center leading-relaxed max-w-2xl mx-auto">
            Taste profile inferred from your {totalPicks} picks across a balanced pool of {quiz.pool.length} jokes. Show matches use each show&apos;s joke-type fingerprint vs. your preference vector (inverse-frequency-weighted cosine, with small-sample shrinkage). A just-for-fun entertainment tool, not any kind of assessment. Jokes are short quotations from their respective series, shown for commentary and criticism.
          </p>
        </section>
      )}
    </div>
  );
}
