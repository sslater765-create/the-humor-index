import PageHeader from '@/components/layout/PageHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { SITE_URL } from '@/lib/site';
import { getAllShows } from '@/lib/data';
import { rankable } from '@/lib/scale';
import { runningGagsMeta } from '@/lib/runningGags';
import fs from 'fs';
import path from 'path';
import GagBracket, { type BracketGag } from '@/components/rankings/GagBracket';
import { BRACKET_FIELD } from '@/lib/bracket';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Running Gag Bracket: Pick the Best Running Gag in TV Comedy',
  description: 'Sixteen running gags, one round a week, seeded by Laughs Above Replacement. The crowd decides who advances; the champion is crowned December 20.',
  alternates: { canonical: `${SITE_URL}/rankings/running-gags/bracket/` },
};

export default async function BracketPage() {
  const ranked = new Set(rankable(await getAllShows()).map((s) => s.slug));
  const file = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'running-gags.json'), 'utf-8')) as {
    shows: Record<string, { name: string; gags: { name: string; lar: number; gp: number; hit: number; best: { text: string } }[] }>;
  };
  // The field is editorial (lib/bracket.ts): one gag per show, the one fans
  // would name. Seeds come from LAR, so the stat still sets the matchups.
  const best = Object.entries(BRACKET_FIELD)
    .map(([slug, name]) => {
      const s = file.shows[slug];
      const i = s ? s.gags.findIndex((g) => g.name === name) : -1;
      const g = i >= 0 ? s.gags[i] : null;
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
        subtitle={`Sixteen shows, one gag each: the one fans would name. Seeded by Laughs Above Replacement, played one round a week. Your votes decide who advances; the champion is crowned Sunday, December 20.`}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <GagBracket gags={best} />
        <p className="mt-10 text-xs text-brand-text-muted">Seeds from the running-gag data of {meta.generated || 'November 2026'}. The field is an editor’s pick, one gag per show; the seeds are the stat’s. Voting closes Sundays at 8 PM Eastern. A tied matchup goes to the higher seed.</p>
      </div>
    </div>
  );
}
