import PageHeader from '@/components/layout/PageHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { SITE_URL } from '@/lib/site';
import { getAllShows } from '@/lib/data';
import { rankable } from '@/lib/scale';
import { runningGagsMeta } from '@/lib/runningGags';
import fs from 'fs';
import path from 'path';
import GagBracket, { type BracketGag } from '@/components/rankings/GagBracket';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Running Gag Bracket: Pick the Best Running Gag in TV Comedy',
  description: 'Sixteen running gags, seeded by Laughs Above Replacement. Pick every matchup, crown a champion, and see where the crowd split.',
  alternates: { canonical: `${SITE_URL}/rankings/running-gags/bracket/` },
};

export default async function BracketPage() {
  const ranked = new Set(rankable(await getAllShows()).map((s) => s.slug));
  const file = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'running-gags.json'), 'utf-8')) as {
    shows: Record<string, { name: string; gags: { name: string; lar: number; gp: number; hit: number; best: { text: string } }[] }>;
  };
  // One gag per show at most, so the bracket isn't four Office bits; best LAR first.
  const best = Object.entries(file.shows)
    .map(([slug, s]) => {
      const i = s.gags.reduce((bi, g, gi) => (g.lar > s.gags[bi].lar ? gi : bi), 0);
      const g = s.gags[i];
      return g ? { id: `${slug}:${i}`, slug, show: s.name, name: g.name, lar: g.lar, gp: g.gp, hit: g.hit, line: g.best.text, legacy: !ranked.has(slug) } : null;
    })
    .filter((g): g is BracketGag => !!g)
    .sort((a, b) => b.lar - a.lar)
    .slice(0, 16)
    .map((g, i) => ({ ...g, seed: i + 1 }));
  const meta = runningGagsMeta();

  return (
    <div>
      <BreadcrumbJsonLd crumbs={[{ name: 'Rankings', path: '/rankings' }, { name: 'Running gags', path: '/rankings/running-gags' }, { name: 'Bracket', path: '/rankings/running-gags/bracket' }]} />
      <PageHeader
        label="Running gags"
        title="The running gag bracket"
        subtitle={`Sixteen shows, each represented by its most valuable running gag, seeded by Laughs Above Replacement. The stat picked the field; you pick the winner. After each pick you see how everyone else voted.`}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <GagBracket gags={best} />
        <p className="mt-10 text-xs text-brand-text-muted">Seeds from the running-gag data of {meta.generated || 'November 2026'}. One gag per show.</p>
      </div>
    </div>
  );
}
