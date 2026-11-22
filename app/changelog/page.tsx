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
  { date: '2026-11-22', what: 'Fifteen more movies', detail: 'Borat, Napoleon Dynamite, Hot Fuzz, Bridesmaids, 21 Jump Street, Office Space, The Big Lebowski, Dumb and Dumber, Groundhog Day, Austin Powers, Ferris Bueller\u2019s Day Off, This Is Spinal Tap, Caddyshack, Airplane! and Monty Python and the Holy Grail are scored, 25 films in all.', link: '/movies/' },
  { date: '2026-11-21', what: 'The fame test', detail: 'We tested whether the scorer rewards famous lines: 99 famous lines and equal-scored deep cuts, rescored alone with and without names. Names make no difference; judged alone, famous lines do slightly better. Impact descriptions corrected: the scorer never rated \u201ccultural footprint.\u201d', link: '/blog/does-the-index-reward-famous-lines/' },
  { date: '2026-11-21', what: 'Show pages lead with rank and tier', detail: 'Each show page opens with its best lines, then its rank and tier. The \u201cIs it funny? Yes\u201d boilerplate is gone, and the scale is explained: every ranked show scores between 80 and 97.5.', link: '/shows/the-office/' },
  { date: '2026-11-21', what: 'Best seasons and a Play page', detail: 'A cross-show list of the best seasons, and one page for every game: the bracket, the draft, Comedy DNA, the blind test and the study.', link: '/play/' },
  { date: '2026-11-21', what: 'Fan favorites: matching fix', detail: 'A famous line now counts only when the joke it is attached to is about it. "A Festivus for the rest of us" had been ranked by the bagel joke it was attached to; it is now marked as not scored on its own. A handful of other ranks moved.', link: '/blog/index-is-wrong-about-festivus/' },
  { date: '2026-11-21', what: 'Named tiers and Best 22', detail: 'Leaderboard tiers are named, from the Pantheon down, and a Best 22 view ranks each show by its 22 best episodes. Runs under 22 episodes are marked.', link: '/methodology#peak' },
  { date: '2026-11-21', what: 'The bracket is a tournament', detail: 'An editor picked one gag per show; LAR still sets the seeds. One round a week, decided by votes, champion crowned December 20. Earlier test votes were cleared.', link: '/rankings/running-gags/bracket/' },
  { date: '2026-11-21', what: 'Draft with friends, by season', detail: 'The ensemble draft takes two to four players on one phone and can score by WAR per 22 episodes instead of career WAR.', link: '/draft/' },
  { date: '2026-11-21', what: 'Most rewatchable episodes', detail: 'A new list ranks episodes by how many lines earn the Rewatch star.', link: '/rankings/most-rewatchable/' },
  { date: '2026-11-21', what: 'Writers: intervals and a 10-episode minimum', detail: 'Writers and directors now need 10 credited episodes to be ranked, and each carries a 95% interval on points above their show.', link: '/people/' },
  { date: '2026-11-21', what: 'Study: show hidden until you rate', detail: 'The rating study hides the show and character until after each rating and serves the least-rated jokes first.', link: '/study/' },
  { date: '2026-11-21', what: 'Intervals on the leaderboard', detail: 'Each show now carries a 95% interval from the spread of its episode scores. Shows whose intervals reach the tier leader\u2019s are grouped as a statistical tie.', link: '/' },
  { date: '2026-11-21', what: 'Running gag bracket and ensemble draft', detail: 'Two ways to argue with the data: a 16-gag bracket seeded by LAR, and a snake draft against the Index using Comedy WAR. Neither changes any score.', link: '/rankings/running-gags/bracket/' },
  { date: '2026-11-21', what: 'Data fix: George Sr.', detail: 'Arrested Development\u2019s George Sr. was credited to Taran Killam, who played him only in flashbacks. Now Jeffrey Tambor.', link: '/shows/arrested-development/' },
  { date: '2026-11-21', what: 'Reliability of the 3-run average measured', detail: 'Measured from the three stored runs of 701 episodes, with no re-scoring: ICC 0.76 to 0.84 within a show. Two single runs of the same episode differ by 3.2 points on average.', link: '/methodology#model-card' },
  { date: '2026-11-21', what: 'Blind test made blind; tally restarted', detail: 'The blind test showed each joke\u2019s score before the pick, which anchored answers. Scores now stay hidden until after you choose, and the agreement tally restarted from zero.', link: '/agree/' },
  { date: '2026-11-21', what: 'Writers ranked against their own show', detail: 'Writers and directors are now ranked by points above their show\u2019s average episode, not by raw average, which mostly measured which show someone wrote for.', link: '/people/' },
  { date: '2026-11-21', what: 'Earlier-model shows get estimated ranges', detail: 'Curb, The Simpsons, Futurama, Taxi and Fresh Prince stay unranked. Each now shows an estimated current-model range from the gains of the three shows rescored so far (8.3 to 14.0 points).', link: '/shows/' },
  { date: '2026-11-21', what: 'Running gags scored', detail: 'A new stat line for running gags, including Laughs Above Replacement. It does not change any Humor Index.', link: '/rankings/running-gags/' },
  { date: '2026-11-21', what: 'Fan favorites checked', detail: 'Each show page now lists the lines fans quote and where the scorer ranked them, or that it missed them.', link: '/shows/seinfeld/' },
  { date: '2026-11-21', what: 'Diary, lists and public profiles', detail: 'Signed-in readers can log episodes and movies, rate them, make lists and share a public profile. No scores changed.', link: '/my/' },
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
