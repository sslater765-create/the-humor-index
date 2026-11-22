import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { getPeople } from '@/lib/people';
import { formatIndex } from '@/lib/scoring';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Funniest Sitcom Writers and Directors, Ranked by Every Joke',
  description: 'Every credited writer and director across the shows we rank, by how their episodes scored against the rest of the same show.',
  alternates: { canonical: `${SITE_URL}/people/` },
};

const MIN = 10;

export default async function PeoplePage() {
  const people = await getPeople();
  const writers = people.filter(p => p.writerCount >= MIN).sort((a, b) => b.plus - a.plus);
  const directors = people.filter(p => p.directorCount >= MIN).sort((a, b) => b.plus - a.plus);
  const Table = ({ rows, role }: { rows: typeof people; role: 'writer' | 'director' }) => (
    <ol className="divide-y divide-brand-border border border-brand-border rounded-xl overflow-hidden">
      {rows.slice(0, 40).map((p, i) => (
        <li key={p.slug}>
          <Link href={`/people/${p.slug}/`} className="flex items-center gap-4 px-4 py-3 bg-brand-card hover:bg-brand-surface transition-colors">
            <span className="font-mono text-sm text-brand-text-muted w-6">{i + 1}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-brand-text-primary truncate">{p.name}</span>
              <span className="block text-xs text-brand-text-muted truncate">{p.shows.join(', ')} · {role === 'writer' ? p.writerCount : p.directorCount} episodes</span>
            </span>
            <span className="text-right shrink-0">
              <span className={`block font-mono text-lg ${p.plus >= 0 ? 'text-brand-gold' : 'text-rose-400'}`}>{p.plus >= 0 ? '+' : ''}{p.plus.toFixed(1)}</span>
              <span className="block font-mono text-[11px] text-brand-text-muted">±{p.plusCi.toFixed(1)} · avg {formatIndex(p.avg)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
  return (
    <div>
      <PageHeader label="People" title="The writers and directors behind the jokes"
        subtitle={`Credited writers and directors across the shows we rank, ranked by points above their own show’s average episode. A raw average mostly tells you which show someone wrote for; this tells you how their episodes did against the rest of that show. Minimum ${MIN} episodes; the ± is a 95% interval, so a +1.0 with ±2.0 could be zero.`} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-2xl text-brand-text-primary mb-4">Writers</h2>
          <Table rows={writers} role="writer" />
        </section>
        <section>
          <h2 className="font-serif text-2xl text-brand-text-primary mb-4">Directors</h2>
          <Table rows={directors} role="director" />
        </section>
      </div>
    </div>
  );
}
