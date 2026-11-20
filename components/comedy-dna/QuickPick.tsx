'use client';
// One-tap "Which is funnier?" card. Lives on the homepage, the leaderboard and
// show pages. Every pick goes into the same saved Comedy DNA profile the full
// quiz uses, so a visitor can build a read without ever opening /comedy-dna.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import { nextPair, readLevel, showStyle, tileText, isEdgy, titleHref, type QuizJoke } from '@/lib/comedyDna';
import { useDna } from './DnaProvider';

interface Props {
  jokes: QuizJoke[];
  /** Pin one side of every face-off to this show (show pages). */
  focus?: string;
  /** analytics label: where the card lives */
  source: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function QuickPick({ jokes, focus, source, title = 'Which joke is funnier?', subtitle, className = '' }: Props) {
  const dna = useDna();
  // Keep edgier lines out of these drive-by cards unless a show has too few clean ones.
  const pool = useMemo(() => {
    const clean = jokes.filter(j => !isEdgy(j));
    if (focus && clean.filter(j => j.slug === focus).length < 3) return jokes;
    return clean.length >= 6 ? clean : jokes;
  }, [jokes, focus]);
  const shown = useRef(new Set<number>());
  const [pair, setPair] = useState<[QuizJoke, QuizJoke] | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [sessionPicks, setSessionPicks] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draw = useCallback(() => {
    if (!dna) return;
    let p = nextPair(pool, dna.profile, dna.matches, { focus, exclude: shown.current });
    if (!p) { shown.current.clear(); p = nextPair(pool, dna.profile, dna.matches, { focus }); }
    if (p) { shown.current.add(p[0].id); shown.current.add(p[1].id); }
    setPair(p);
    setChosen(null);
  }, [dna, pool, focus]);

  // First pair once the saved profile is loaded (so a returning visitor gets fresh jokes).
  useEffect(() => { if (dna?.ready && !pair) draw(); }, [dna?.ready, pair, draw]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (!dna || !pair) return <div className={`min-h-[320px] ${className}`} aria-hidden />;

  const choose = (i: 0 | 1) => {
    if (chosen !== null) return;
    const w = pair[i], l = pair[1 - i];
    dna.record(w, l);
    setChosen(w.id);
    setSessionPicks(n => n + 1);
    trackEvent('cdna_quick_pick', { source, winner: w.slug, picks: dna.profile.picks + 1 });
    timer.current = setTimeout(draw, 900);
  };

  const picks = dna.profile.picks;
  const top = dna.hasProfile ? dna.matches[0] : null;
  const level = readLevel(picks);

  return (
    <section className={`bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-7 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-1">Comedy DNA · one tap</p>
          <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary leading-tight">{title}</h2>
          <p className="text-sm text-brand-text-secondary mt-1.5 max-w-xl">
            {subtitle ?? 'Pick the one that lands harder for you. Every pick tunes your match % on every show across the site.'}
          </p>
        </div>
        <button onClick={() => { trackEvent('cdna_quick_skip', { source }); draw(); }}
          className="text-xs text-brand-text-muted hover:text-brand-text-primary border border-brand-border hover:border-brand-text-muted rounded-full px-3 py-1.5 transition">
          Skip this pair
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pair.map((j, i) => {
          const st = showStyle(j.slug);
          const isPick = chosen === j.id;
          const dim = chosen !== null && !isPick;
          return (
            <button key={j.id} onClick={() => choose(i as 0 | 1)} disabled={chosen !== null}
              aria-label={`Option ${i + 1}: "${j.text}"${j.speaker ? `, ${j.speaker}` : ''}, ${j.show ?? ''}`}
              className={`text-left rounded-xl border-[1.5px] bg-brand-surface px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-3 min-h-[150px] transition-all duration-300
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold
                ${isPick ? 'border-brand-teal shadow-[0_0_0_2px_rgba(29,158,117,.25)]' : dim ? 'border-brand-border opacity-45' : 'border-brand-border hover:border-brand-gold motion-safe:hover:-translate-y-0.5'}`}>
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 h-[20px] rounded-md text-[10px] font-extrabold tracking-wide uppercase" style={{ background: st.c, color: tileText(st.c) }}>{j.show}</span>
                {isPick && <span className="text-[10px] font-extrabold uppercase tracking-wide text-brand-teal">Your pick</span>}
              </span>
              <span className="text-[15px] sm:text-base font-semibold leading-snug text-brand-text-primary">
                <span className="text-brand-gold">&ldquo;</span>{j.text}<span className="text-brand-gold">&rdquo;</span>
              </span>
              {j.speaker && <span className="mt-auto text-xs text-brand-text-muted">{j.speaker}{j.ep ? ` · ${j.ep}` : ''}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-brand-border flex flex-wrap items-center justify-between gap-3 text-sm" aria-live="polite">
        {top ? (
          <p className="text-brand-text-secondary">
            <span className="text-brand-text-primary font-medium tabular-nums">{picks} {picks === 1 ? 'pick' : 'picks'}</span>
            {' · '}{level.label}{' · '}Top match so far:{' '}
            <Link href={titleHref(top)} className="text-brand-teal font-semibold hover:underline">{top.name} {top.pct}%</Link>
          </p>
        ) : (
          <p className="text-brand-text-muted">No sign-up. Your picks stay on this device{' '}
            <span className="hidden sm:inline">(and follow your account if you&apos;re signed in)</span>.</p>
        )}
        <Link href="/comedy-dna" onClick={() => trackEvent('cdna_quick_to_quiz', { source, picks })}
          className={`rounded-full font-semibold px-4 py-2 transition ${sessionPicks >= 3 || picks >= 5 ? 'bg-brand-gold text-brand-dark hover:brightness-110' : 'border border-brand-border text-brand-text-primary hover:border-brand-gold'}`}>
          {picks >= 5 ? 'See your full Comedy DNA →' : 'Take the full quiz →'}
        </Link>
      </div>
    </section>
  );
}
