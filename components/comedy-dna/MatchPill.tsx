'use client';
import { useDna } from './DnaProvider';

/** "87% match" for a show, once the visitor has a Comedy DNA profile. Renders nothing otherwise. */
export default function MatchPill({ slug, className = '', variant = 'pill' }: { slug: string; className?: string; variant?: 'pill' | 'overlay' }) {
  const dna = useDna();
  if (!dna?.ready || !dna.hasProfile) return null;
  const m = dna.matchFor(slug);
  if (!m) return null;
  const strong = m.pct >= 70;
  const base = variant === 'overlay'
    ? 'bg-black/60 backdrop-blur-sm border-white/15 text-white'
    : strong ? 'bg-brand-teal/10 border-brand-teal/40 text-brand-teal' : 'bg-brand-surface border-brand-border text-brand-text-secondary';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider tabular-nums whitespace-nowrap ${base} ${className}`}
      title="How well this show fits the jokes you pick in Comedy DNA"
    >
      <svg width="9" height="9" viewBox="0 0 12 12" aria-hidden><path d="M3 1c0 3 6 4 6 10M9 1c0 3-6 4-6 10M3.6 3.5h4.8M3.6 8.5h4.8" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" /></svg>
      {m.pct}% match
    </span>
  );
}
