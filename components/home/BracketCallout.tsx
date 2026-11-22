'use client';
import Link from 'next/link';
import { ROUND_CLOSES, ROUND_NAMES, openRound } from '@/lib/bracket';

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', timeZone: 'America/New_York' }) + ' ET';

/** The bracket's current round, worked out in the browser so it stays right between deploys. */
export default function BracketCallout({ top, bottom }: { top: string; bottom: string }) {
  const r = openRound();
  const live = r < 4;
  return (
    <Link href="/rankings/running-gags/bracket/" className="group block rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-5 hover:border-brand-gold transition-colors">
      <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold">The running gag bracket{live ? ` · ${ROUND_NAMES[r]}` : ''}</p>
      <p className="mt-1 text-lg text-brand-text-primary group-hover:text-brand-gold transition-colors">
        {r === 0 ? <>1 seed {top} against 16 seed {bottom}, and seven more matchups.</> : live ? <>{ROUND_NAMES[r]} are open. Your votes decide who advances.</> : <>The champion is crowned. See how it played out.</>}
      </p>
      {live && <p className="mt-1 text-sm text-brand-text-secondary">Voting closes {fmt(ROUND_CLOSES[r])}. One vote per matchup; the crowd decides.</p>}
    </Link>
  );
}
