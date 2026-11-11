import Link from 'next/link';
import { AWAITING_RESCORE } from '@/lib/scale';

/**
 * One-line scope statement for any cross-show ranking. Rankings only cover
 * shows on the current scoring model; this says so and disappears on its own
 * once lib/scale.ts lists no shows awaiting a rescore.
 */
export default function ScaleNote({ bare = false }: { bare?: boolean }) {
  const n = AWAITING_RESCORE.size;
  if (n === 0) return null;
  const note = (
    <p id="scale-note" className="text-sm text-brand-text-muted border border-brand-border rounded-md px-4 py-3 mb-6">
      This ranking covers the shows scored on our current model. {n} more are fully scored on the earlier
      model and join it as each is rescored, because numbers from the two models are not comparable.{' '}
      <Link href="/methodology" className="text-brand-gold hover:underline">How we score →</Link>
    </p>
  );
  return bare ? note : <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">{note}</div>;
}
