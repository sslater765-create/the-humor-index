import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { getAllShows, getEpisodes, getEpisodeDetail } from '@/lib/data';
import { rankable } from '@/lib/scale';
import { formatIndex, worthRewatch } from '@/lib/scoring';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Most Rewatchable Sitcom Episodes, by Count of Lines Worth Rewatching',
  description: 'Sitcom episodes ranked by how many of their jokes earn the Rewatch star: lines that reward a second viewing and that people quote.',
  alternates: { canonical: `${SITE_URL}/rankings/most-rewatchable/` },
};

interface Row { show: string; slug: string; season: number; episode: number; title: string; hi: number; stars: number; jokes: number; best?: string }

export default async function MostRewatchablePage() {
  const rows: Row[] = [];
  for (const s of rankable(await getAllShows())) {
    let eps;
    try { eps = await getEpisodes(s.slug); } catch { continue; }
    for (const e of eps) {
      if (!(e.humor_index > 0)) continue;
      const d = await getEpisodeDetail(s.slug, e.season, e.episode_number).catch(() => null);
      if (!d?.jokes?.length) continue;
      const starred = d.jokes.filter((j) => worthRewatch(j));
      if (!starred.length) continue;
      const top = [...starred].sort((a, b) => ((b.craft_total || 0) + (b.impact_score || 0)) - ((a.craft_total || 0) + (a.impact_score || 0)))[0];
      rows.push({ show: s.name, slug: s.slug, season: e.season, episode: e.episode_number, title: e.title, hi: e.humor_index, stars: starred.length, jokes: d.jokes.length, best: top?.text });
    }
  }
  rows.sort((a, b) => b.stars - a.stars || b.hi - a.hi);
  const list = rows.slice(0, 50);

  return (
    <div>
      <BreadcrumbJsonLd crumbs={[{ name: 'Rankings', path: '/rankings' }, { name: 'Most rewatchable', path: '/rankings/most-rewatchable' }]} />
      <PageHeader
        label="Rankings"
        title="The most rewatchable episodes"
        subtitle="Ranked by how many lines earn the Rewatch star: jokes that pay off more the second time (callbacks, setups you only catch once you know the ending) and that score high on quotability. Long episodes have more chances, so the joke count is shown beside each."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <ol className="divide-y divide-brand-border rounded-xl border border-brand-border bg-brand-card">
          {list.map((r, i) => (
            <li key={`${r.slug}-${r.season}-${r.episode}`}>
              <Link href={`/shows/${r.slug}/${r.season}/${r.episode}/`} className="flex gap-4 px-4 py-3.5 hover:bg-brand-surface transition-colors">
                <span className="w-7 shrink-0 font-mono text-sm text-brand-text-muted">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-brand-text-primary">{r.title}</span>
                  <span className="block text-xs text-brand-text-muted">{r.show} · S{r.season}E{r.episode} · Index {formatIndex(r.hi)}</span>
                  {r.best && <span className="mt-1 block text-sm italic text-brand-text-secondary line-clamp-2">“{r.best}”</span>}
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-lg text-brand-gold">★ {r.stars}</span>
                  <span className="block font-mono text-[11px] text-brand-text-muted">of {r.jokes} jokes</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
