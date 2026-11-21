import Link from 'next/link';
import { fmtLar, seasonSpan, type RunningGag } from '@/lib/runningGags';

/** A show's running gags with their stat lines. Server component. */
export default function RunningGagsPanel({ slug, name, gags }: { slug: string; name: string; gags: RunningGag[] }) {
  if (gags.length === 0) return null;
  const top = [...gags].sort((a, b) => b.lar - a.lar).slice(0, 6);
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-brand-text-primary">Running gags</h2>
          <p className="text-sm text-brand-text-secondary mt-1">
            The bits {name} kept coming back to, and whether they kept landing.
          </p>
        </div>
        <Link href="/rankings/running-gags/" className="shrink-0 text-sm text-brand-gold hover:underline">All shows →</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {top.map((g) => (
          <div key={g.name} className="rounded-xl border border-brand-border bg-brand-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-brand-text-primary font-medium">{g.name}</p>
                <p className="text-xs text-brand-text-muted">{seasonSpan(g)} · first in S{g.first.season}E{g.first.episode}</p>
              </div>
              <span className={`font-mono text-sm shrink-0 ${g.lar >= 0 ? 'text-brand-gold' : 'text-rose-400'}`} title="Laughs Above Replacement">
                {fmtLar(g.lar)} LAR
              </span>
            </div>
            <p className="mt-2 font-mono text-xs text-brand-text-muted">
              {g.gp} GP · {Math.round(g.hit * 100)}% hit · {g.avg.toFixed(2)} avg
              {g.trend !== null && Math.abs(g.trend) >= 0.25 && <> · {g.trend > 0 ? 'improved' : 'faded'} over the run</>}
            </p>
            <Link href={`/shows/${slug}/${g.best.season}/${g.best.episode}/`} className="mt-2 block text-sm text-brand-text-secondary hover:text-brand-gold line-clamp-2">
              “{g.best.text}”
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-brand-text-muted">
        LAR is Laughs Above Replacement: each appearance’s margin over {name}’s median joke, added up.
      </p>
    </section>
  );
}
