import PageHeader from '@/components/layout/PageHeader';
import { SITE_URL } from '@/lib/site';
import { getAllShows, getCharacters } from '@/lib/data';
import { rankable } from '@/lib/scale';
import EnsembleDraft, { type DraftPlayer } from '@/components/draft/EnsembleDraft';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Sitcom Ensemble Draft: Draft Against the Humor Index',
  description: 'Snake-draft a five-person sitcom ensemble against the Humor Index, using Comedy WAR, then see whose cast wins.',
  alternates: { canonical: `${SITE_URL}/draft/` },
};

export default async function DraftPage() {
  const shows = rankable(await getAllShows());
  const pool: DraftPlayer[] = [];
  for (const s of shows) {
    let chars;
    try { chars = await getCharacters(s.slug); } catch { continue; }
    for (const c of chars) {
      if ((c.episodes_appeared ?? 0) < 10 || c.war === undefined || c.war === null) continue;
      pool.push({ id: `${s.slug}:${c.name}`, name: c.name, show: s.name, slug: s.slug, war: Math.round(c.war), eps: c.episodes_appeared, actor: c.actor ?? '' });
    }
  }
  pool.sort((a, b) => b.war - a.war);

  return (
    <div>
      <PageHeader
        label="Draft"
        title="The ensemble draft"
        subtitle="Five rounds, snake order, you against the Index. Every character carries their Comedy WAR: the laughs they added over a replacement-level character across their show. One character per show on each team. Highest total wins."
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <EnsembleDraft pool={pool.slice(0, 60)} />
      </div>
    </div>
  );
}
