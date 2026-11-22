import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { getAllShows, getSeasons } from '@/lib/data';
import { rankable } from '@/lib/scale';
import { formatIndex } from '@/lib/scoring';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Best Sitcom Seasons, Ranked Across Every Show',
  description: 'Every season of every ranked sitcom on one list, by Humor Index. Seasons under eight episodes are listed separately.',
  alternates: { canonical: `${SITE_URL}/rankings/best-seasons/` },
};

const MIN_EPS = 8;

export default async function BestSeasonsPage() {
  const rows: { show: string; slug: string; season: number; hi: number; eps: number; jokes: number; imdb?: number }[] = [];
  for (const s of rankable(await getAllShows())) {
    let seasons;
    try { seasons = await getSeasons(s.slug); } catch { continue; }
    for (const se of seasons) {
      if (!(se.humor_index > 0)) continue;
      rows.push({ show: s.name, slug: s.slug, season: se.season, hi: se.humor_index, eps: se.episodes_analyzed ?? 0, jokes: se.total_jokes, imdb: se.avg_imdb_rating });
    }
  }
  rows.sort((a, b) => b.hi - a.hi);
  const full = rows.filter((r) => r.eps >= MIN_EPS);
  const short = rows.filter((r) => r.eps < MIN_EPS);

  const List = ({ items, start = 0 }: { items: typeof rows; start?: number }) => (
    <ol className="divide-y divide-brand-border rounded-xl border border-brand-border bg-brand-card">
      {items.map((r, i) => (
        <li key={`${r.slug}-${r.season}`}>
          <Link href={`/shows/${r.slug}/arc/`} className="flex items-center gap-4 px-4 py-3 hover:bg-brand-surface transition-colors">
            <span className="w-7 shrink-0 font-mono text-sm text-brand-text-muted">{start + i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-brand-text-primary">{r.show}, season {r.season}</span>
              <span className="block text-xs text-brand-text-muted">{r.eps} episodes · {r.jokes.toLocaleString()} jokes{r.imdb ? ` · IMDb ${r.imdb.toFixed(1)}` : ''}</span>
            </span>
            <span className="font-mono text-lg text-brand-gold">{formatIndex(r.hi)}</span>
          </Link>
        </li>
      ))}
    </ol>
  );

  return (
    <div>
      <BreadcrumbJsonLd crumbs={[{ name: 'Rankings', path: '/rankings' }, { name: 'Best seasons', path: '/rankings/best-seasons' }]} />
      <PageHeader
        label="Rankings"
        title="The best seasons, across every show"
        subtitle={`Every season of the ${new Set(rows.map((r) => r.slug)).size} ranked shows on one list. Early Office against late Office is a lookup here, not an argument. Seasons with fewer than ${MIN_EPS} scored episodes are listed separately: a short season’s average rests on very little.`}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <List items={full.slice(0, 60)} />
        {short.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl text-brand-text-primary mb-3">Short seasons</h2>
            <List items={short} />
          </section>
        )}
      </div>
    </div>
  );
}
