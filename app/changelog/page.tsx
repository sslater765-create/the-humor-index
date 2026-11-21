import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Changelog: Every Change to the Humor Index Scores',
  description: 'Dated record of rescores, method changes and corrections to the Humor Index, so a number you saw last month can be traced to today’s.',
  alternates: { canonical: `${SITE_URL}/changelog/` },
};

// Newest first. Add a line whenever a published score moves.
const LOG: Array<{ date: string; what: string; detail: string; link?: string }> = [
  { date: '2026-11-21', what: 'No more ties at 100', detail: 'The display scale used to clamp at 100, which tied 49 episodes at a perfect score. Above 98 it now bends toward 100 without reaching it. Episode scores above 98 moved down slightly; no show score changed.', link: '/methodology#model-card' },
  { date: '2026-11-21', what: 'Community rescored', detail: 'All 110 episodes rescored on the current model. Community enters the ranking at 91.9 (it was 77.9 on the earlier model).', link: '/shows/community/' },
  { date: '2026-11-20', what: 'Movies added', detail: 'The first ten comedy films scored reel by reel, with their own leaderboard. Fifteen more are being scored.', link: '/movies/' },
  { date: '2026-11-20', what: "It's Always Sunny rescored", detail: 'All 177 episodes rescored. Sunny moves from 79.2 to 87.5.', link: '/shows/its-always-sunny/' },
  { date: '2026-11-12', what: 'Friends rescored', detail: 'All 231 scored episodes rescored. Friends moves from 73.2 to 87.1 and off the bottom of the board.', link: '/shows/friends/' },
  { date: '2026-09-09', what: 'The Office rescored; data fixes', detail: 'The Office rescored on the current model (88.0) after a full transcript audit. Three 30 Rock episodes that held another show’s jokes were rescored, and five hour-long episodes scored twice were collapsed.', link: '/shows/the-office/' },
  { date: '2026-08-28', what: 'Database rebuilt', detail: 'The scoring database was rebuilt from published data after a loss. Some episode-level detail at the top of the scale was capped; recovered on 2026-11-21.' },
  { date: '2026-06-15', what: 'Scoring model changed', detail: 'Moved from Claude Sonnet 4 to Claude Sonnet 4.6 with three-run consensus. Rescored shows rose 8 to 15 points; shows not yet rescored are listed separately.', link: '/blog/what-the-rescore-changed' },
  { date: '2026-04-16', what: 'Format penalty removed', detail: 'The 15 to 25% impact penalty on multi-camera and laugh-track shows was removed after an audit found no real format effect.', link: '/blog/laugh-track-penalty' },
];

export default function ChangelogPage() {
  return (
    <div>
      <PageHeader label="Changelog" title="What changed, and when"
        subtitle="Scores on this site move when a show is rescored, when the method changes, or when we find a data error. Every change that moved a published number is listed here." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <ol className="divide-y divide-brand-border border border-brand-border rounded-xl overflow-hidden">
          {LOG.map(e => (
            <li key={e.date + e.what} className="grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-5 p-4 bg-brand-card">
              <p className="font-mono text-xs text-brand-text-muted pt-0.5">{e.date}</p>
              <div>
                <p className="text-brand-text-primary">{e.link ? <Link href={e.link} className="hover:text-brand-gold">{e.what}</Link> : e.what}</p>
                <p className="text-sm text-brand-text-secondary leading-relaxed mt-1">{e.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
