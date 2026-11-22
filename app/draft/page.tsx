import PageHeader from '@/components/layout/PageHeader';
import { SITE_URL } from '@/lib/site';
import { getAllShows, getCharacters } from '@/lib/data';
import { rankable } from '@/lib/scale';
import EnsembleDraft, { type DraftPlayer } from '@/components/draft/EnsembleDraft';
import Link from 'next/link';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Sitcom Ensemble Draft: Draft Against the Humor Index',
  description: 'Snake-draft a five-person sitcom ensemble against the Humor Index or up to three friends, by career Comedy WAR or per-season WAR, then see whose cast wins.',
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
  // The board: the top 60 by career WAR plus the top 60 by WAR per 22 episodes,
  // so the per-season mode has its short-run stars to pick from.
  const per22 = (p: DraftPlayer) => p.war / Math.max(22, p.eps);
  const ids = new Set([...pool].sort((a, b) => b.war - a.war).slice(0, 60).concat([...pool].sort((a, b) => per22(b) - per22(a)).slice(0, 60)).map((p) => p.id));
  const board = pool.filter((p) => ids.has(p.id)).sort((a, b) => b.war - a.war);

  return (
    <div>
      <PageHeader
        label="Draft"
        title="The ensemble draft"
        subtitle="Five rounds, snake order, against the Index or up to three friends on one phone. Every character carries their Comedy WAR: the laughs they added over a replacement-level character. Score by career or by season. One character per show on each team. Highest total wins."
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <EnsembleDraft pool={board} />
        <p className="mt-10 text-sm text-brand-text-muted">
          Scouting report: <Link href="/rankings/funniest-characters/" className="text-brand-gold hover:underline">the funniest characters</Link> ·{' '}
          <Link href="/rankings/least-funny-characters/" className="text-brand-gold hover:underline">the least funny</Link> ·{' '}
          <Link href="/rankings/running-gags/bracket/" className="text-brand-gold hover:underline">vote in the running gag bracket</Link>
        </p>
      </div>
    </div>
  );
}
