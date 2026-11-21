import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { SITE_URL } from '@/lib/site';
import { getAllShows } from '@/lib/data';
import { rankable } from '@/lib/scale';
import { allRunningGags, fmtLar, seasonSpan, type RunningGag } from '@/lib/runningGags';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Best Running Gags in TV Comedy, Scored',
  description:
    'Every running gag we could find across the sitcoms we score, with a stat line for each: episodes, hit rate, and Laughs Above Replacement, the margin each gag adds over the show’s ordinary joke.',
  alternates: { canonical: `${SITE_URL}/rankings/running-gags/` },
};

type Row = RunningGag & { slug: string; show: string };

function Stat({ k, v, tone = '' }: { k: string; v: string; tone?: string }) {
  return (
    <span className="inline-flex flex-col items-end">
      <span className="text-[10px] uppercase tracking-wider text-brand-text-muted">{k}</span>
      <span className={`font-mono text-sm ${tone || 'text-brand-text-primary'}`}>{v}</span>
    </span>
  );
}

function GagRow({ g, i }: { g: Row; i: number }) {
  return (
    <li className="rounded-xl border border-brand-border bg-brand-card p-4">
      <div className="flex items-start gap-4">
        <span className="font-mono text-sm text-brand-text-muted w-6 shrink-0 pt-0.5">{i + 1}</span>
        <div className="min-w-0 flex-1">
          <p className="text-brand-text-primary font-medium">{g.name}</p>
          <p className="text-xs text-brand-text-muted">
            <Link href={`/shows/${g.slug}/`} className="hover:text-brand-gold">{g.show}</Link> · {seasonSpan(g)}
          </p>
          {g.summary && <p className="mt-1.5 text-sm text-brand-text-secondary">{g.summary}</p>}
          <Link href={`/shows/${g.slug}/${g.best.season}/${g.best.episode}/`} className="mt-2 block text-sm text-brand-text-secondary hover:text-brand-gold">
            <span className="text-brand-text-muted">Best hit, S{g.best.season}E{g.best.episode}:</span> “{g.best.text}”
          </Link>
        </div>
        <div className="hidden sm:grid grid-cols-4 gap-4 shrink-0">
          <Stat k="GP" v={String(g.gp)} />
          <Stat k="Hit%" v={`${Math.round(g.hit * 100)}`} />
          <Stat k="Avg" v={g.avg.toFixed(2)} />
          <Stat k="LAR" v={fmtLar(g.lar)} tone={g.lar >= 0 ? 'text-brand-gold' : 'text-rose-400'} />
        </div>
      </div>
      <div className="sm:hidden mt-3 flex justify-end gap-5">
        <Stat k="GP" v={String(g.gp)} />
        <Stat k="Hit%" v={`${Math.round(g.hit * 100)}`} />
        <Stat k="Avg" v={g.avg.toFixed(2)} />
        <Stat k="LAR" v={fmtLar(g.lar)} tone={g.lar >= 0 ? 'text-brand-gold' : 'text-rose-400'} />
      </div>
    </li>
  );
}

export default async function RunningGagsPage() {
  const ranked = new Set(rankable(await getAllShows()).map((s) => s.slug));
  const gags = allRunningGags().filter((g) => ranked.has(g.slug));
  const byLar = [...gags].sort((a, b) => b.lar - a.lar).slice(0, 40);
  const reliable = [...gags].filter((g) => g.j >= 6).sort((a, b) => b.hit - a.hit || b.lar - a.lar).slice(0, 10);
  const improved = [...gags].filter((g) => g.trend !== null && g.j >= 8).sort((a, b) => (b.trend ?? 0) - (a.trend ?? 0)).slice(0, 8);
  const faded = [...gags].filter((g) => g.trend !== null && g.j >= 8).sort((a, b) => (a.trend ?? 0) - (b.trend ?? 0)).slice(0, 8);
  const showCount = new Set(gags.map((g) => g.slug)).size;

  return (
    <div>
      <BreadcrumbJsonLd crumbs={[{ name: 'Rankings', path: '/rankings' }, { name: 'Running gags', path: '/rankings/running-gags' }]} />
      <PageHeader
        label="Rankings"
        title="The running gags, scored"
        subtitle={`${gags.length} running gags across ${showCount} shows, each with a stat line. Every joke on the Index is scored on its own, which tells you nothing about a bit the writers kept coming back to. This page does.`}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-14">
        <section className="rounded-xl border border-brand-border bg-brand-card p-5 text-sm text-brand-text-secondary leading-relaxed">
          <p className="text-brand-text-primary font-medium mb-2">How to read the stat line</p>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            <div><dt className="inline font-mono text-brand-gold">GP</dt> <dd className="inline">episodes the gag appears in.</dd></div>
            <div><dt className="inline font-mono text-brand-gold">Hit%</dt> <dd className="inline">share of its jokes that beat the show’s median joke.</dd></div>
            <div><dt className="inline font-mono text-brand-gold">Avg</dt> <dd className="inline">mean joke score, craft and impact averaged, out of 10.</dd></div>
            <div><dt className="inline font-mono text-brand-gold">LAR</dt> <dd className="inline">Laughs Above Replacement: every appearance’s margin over the show’s ordinary joke, added up. A gag that runs long and keeps landing scores high. One that runs long on average jokes goes negative.</dd></div>
          </dl>
        </section>

        <section>
          <h2 className="font-serif italic text-2xl text-brand-text-primary mb-1">Most valuable running gags</h2>
          <p className="text-sm text-brand-text-secondary mb-4">Ranked by LAR: how much each gag added over the show’s ordinary joke, across its whole run.</p>
          <ol className="space-y-3">{byLar.map((g, i) => <GagRow key={`${g.slug}:${g.name}`} g={g} i={i} />)}</ol>
        </section>

        <div className="grid gap-10 lg:grid-cols-3">
          <section>
            <h2 className="font-serif italic text-xl text-brand-text-primary mb-1">Most reliable</h2>
            <p className="text-xs text-brand-text-muted mb-3">Highest hit rate, at least six jokes.</p>
            <ol className="space-y-2 text-sm">
              {reliable.map((g) => (
                <li key={`${g.slug}:${g.name}`} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-brand-text-secondary"><span className="text-brand-text-primary">{g.name}</span> · {g.show}</span>
                  <span className="font-mono text-brand-gold shrink-0">{Math.round(g.hit * 100)}%</span>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="font-serif italic text-xl text-brand-text-primary mb-1">Got better with reps</h2>
            <p className="text-xs text-brand-text-muted mb-3">Later appearances outscore the early ones.</p>
            <ol className="space-y-2 text-sm">
              {improved.map((g) => (
                <li key={`${g.slug}:${g.name}`} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-brand-text-secondary"><span className="text-brand-text-primary">{g.name}</span> · {g.show}</span>
                  <span className="font-mono text-brand-gold shrink-0">{fmtLar(g.trend ?? 0)}</span>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="font-serif italic text-xl text-brand-text-primary mb-1">Ran out of steam</h2>
            <p className="text-xs text-brand-text-muted mb-3">Later appearances score below the early ones.</p>
            <ol className="space-y-2 text-sm">
              {faded.map((g) => (
                <li key={`${g.slug}:${g.name}`} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-brand-text-secondary"><span className="text-brand-text-primary">{g.name}</span> · {g.show}</span>
                  <span className="font-mono text-rose-400 shrink-0">{fmtLar(g.trend ?? 0)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <p className="text-xs text-brand-text-muted leading-relaxed">
          How gags are found: we look for phrases that come back across at least four episodes of one show but rarely anywhere else, then a model reads
          sample lines and keeps only deliberate recurring bits, merging variants of the same gag. Storylines that get mentioned every scene are left out.
          The stats come straight from the scored jokes. Running gags do not change any show’s Humor Index.{' '}
          <Link href="/methodology/" className="text-brand-gold hover:underline">How we score</Link>.
        </p>
      </div>
    </div>
  );
}
