import Link from 'next/link';
import { getAllShows, getEpisodes } from '@/lib/data';
import PageHeader from '@/components/layout/PageHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { SITE_URL } from '@/lib/site';
import { rankable } from '@/lib/scale';
import { formatIndex } from '@/lib/scoring';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Where the Jokes and the Fans Disagree: Humor Index vs IMDb',
  description:
    'The episodes fans rate highest that our joke-by-joke scoring ranks low, and the reverse. Each episode is compared within its own show, so a show’s overall popularity doesn’t decide it.',
  alternates: { canonical: `${SITE_URL}/rankings/index-vs-imdb/` },
};

interface Row {
  show: string; slug: string; season: number; ep: number; title: string;
  hi: number; imdb: number; hiPct: number; imdbPct: number; gap: number;
}

/** Percentile rank of v within xs (0 = lowest, 100 = highest). */
function pct(v: number, xs: number[]): number {
  const below = xs.filter(x => x < v).length;
  const equal = xs.filter(x => x === v).length;
  return Math.round(((below + equal / 2) / xs.length) * 100);
}

export default async function IndexVsImdbPage() {
  const shows = rankable(await getAllShows());
  const rows: Row[] = [];
  for (const s of shows) {
    let eps;
    try { eps = (await getEpisodes(s.slug)).filter(e => e.humor_index > 0 && e.imdb_rating); } catch { continue; }
    if (eps.length < 10) continue; // too few episodes for a within-show comparison
    const his = eps.map(e => e.humor_index), ims = eps.map(e => e.imdb_rating as number);
    for (const e of eps) {
      const hiPct = pct(e.humor_index, his), imdbPct = pct(e.imdb_rating as number, ims);
      rows.push({ show: s.name, slug: s.slug, season: e.season, ep: e.episode_number, title: e.title,
        hi: e.humor_index, imdb: e.imdb_rating as number, hiPct, imdbPct, gap: imdbPct - hiPct });
    }
  }
  const fansLove = [...rows].sort((a, b) => b.gap - a.gap).slice(0, 15);
  // Pearson r across every episode, computed live so the number never goes stale.
  const n = rows.length;
  const mx = rows.reduce((t, r) => t + r.hi, 0) / n, my = rows.reduce((t, r) => t + r.imdb, 0) / n;
  const cov = rows.reduce((t, r) => t + (r.hi - mx) * (r.imdb - my), 0);
  const sx = Math.sqrt(rows.reduce((t, r) => t + (r.hi - mx) ** 2, 0)), sy = Math.sqrt(rows.reduce((t, r) => t + (r.imdb - my) ** 2, 0));
  const corr = sx && sy ? cov / (sx * sy) : 0;
  const jokesWin = [...rows].sort((a, b) => a.gap - b.gap).slice(0, 15);

  const List = ({ items, side }: { items: Row[]; side: 'fans' | 'jokes' }) => (
    <ol className="space-y-2.5">
      {items.map((r, i) => (
        <li key={`${r.slug}-${r.season}-${r.ep}`}>
          <Link href={`/shows/${r.slug}/${r.season}/${r.ep}/`}
            className="flex items-center gap-4 rounded-xl border border-brand-border bg-brand-card p-4 hover:border-brand-gold/40 transition-colors">
            <span className="font-mono text-sm text-brand-text-muted w-6 shrink-0">{i + 1}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-brand-text-primary truncate">{r.title}</span>
              <span className="block text-xs text-brand-text-muted">{r.show} · S{r.season}E{r.ep}</span>
            </span>
            <span className="text-right shrink-0 w-28">
              <span className="block text-xs text-brand-text-secondary">IMDb {r.imdb.toFixed(1)} <span className="text-brand-text-muted">· top {Math.max(1, 100 - r.imdbPct)}%</span></span>
              <span className="block text-xs text-brand-text-secondary">Index {formatIndex(r.hi)} <span className="text-brand-text-muted">· {side === 'fans' ? `bottom ${Math.max(1, r.hiPct)}%` : `top ${Math.max(1, 100 - r.hiPct)}%`}</span></span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );

  return (
    <div>
      <BreadcrumbJsonLd crumbs={[{ name: 'Rankings', path: '/rankings' }, { name: 'Index vs IMDb', path: '/rankings/index-vs-imdb' }]} />
      <PageHeader
        label="Rankings"
        title="Where the jokes and the fans disagree"
        subtitle={`Across ${n.toLocaleString()} rated episodes, the Humor Index and IMDb ratings correlate at r = ${corr.toFixed(2)}: ${Math.abs(corr) < 0.2 ? 'almost no relationship' : Math.abs(corr) < 0.4 ? 'a weak relationship' : 'a moderate relationship'}. These are the biggest disagreements, each episode compared only with the rest of its own show.`}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-serif italic text-2xl text-brand-text-primary mb-1">Fans love it, the jokes don&rsquo;t</h2>
          <p className="text-sm text-brand-text-secondary mb-4">High on IMDb for its show, low on the Humor Index. Usually big story episodes: weddings, finales, breakups, where the plot matters more than the joke count.</p>
          <List items={fansLove} side="fans" />
        </section>
        <section>
          <h2 className="font-serif italic text-2xl text-brand-text-primary mb-1">The jokes love it, fans don&rsquo;t</h2>
          <p className="text-sm text-brand-text-secondary mb-4">Low on IMDb for its show, high on the Humor Index. The underrated ones, if you trust the jokes.</p>
          <List items={jokesWin} side="jokes" />
        </section>
        <p className="lg:col-span-2 text-xs text-brand-text-muted leading-relaxed">
          Shows with fewer than 10 rated episodes are left out. Percentiles are within each show, so a middling episode of a beloved show can still top the fans&rsquo; list.
          IMDb ratings are from IMDb. <Link href="/methodology" className="text-brand-gold hover:underline">How we score</Link>.
        </p>
      </div>
    </div>
  );
}
