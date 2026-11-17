import Link from 'next/link';
import { THANKSGIVING, getHolidayEpisodes } from '@/lib/holidays';
import HolidayRanking from '@/components/rankings/HolidayRanking';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Best Thanksgiving Sitcom Episodes, Ranked (Every Friends One Too)',
  description:
    'All ten Friends Thanksgiving episodes plus the best from Seinfeld, Veep, The Simpsons and more, ranked by the Humor Index. Every joke scored for craft and impact.',
  alternates: { canonical: `${SITE_URL}/rankings/best-thanksgiving-episodes/` },
  openGraph: {
    title: 'The Best Thanksgiving Sitcom Episodes, Ranked',
    description: 'All ten Friends Thanksgivings and more, every joke scored.',
    images: [`/api/og?title=${encodeURIComponent('Best Thanksgiving Sitcom Episodes')}&score=${encodeURIComponent('Ranked')}&subtitle=${encodeURIComponent('Every joke scored')}`],
  },
};

export default async function BestThanksgivingEpisodesPage() {
  const episodes = await getHolidayEpisodes(THANKSGIVING);
  const friends = episodes
    .filter(e => e.showSlug === 'friends')
    .map(e => ({ ...e }))
    .sort((a, b) => a.rankInShow - b.rankInShow);
  const fBest = friends[0];
  const fWorst = friends[friends.length - 1];

  return (
    <HolidayRanking
      holiday="Thanksgiving"
      path="/rankings/best-thanksgiving-episodes"
      episodes={episodes}
      sibling={{ label: 'best Christmas episodes', href: '/rankings/best-christmas-episodes' }}
      intro={
        <>
          <p>
            Thanksgiving belongs to <Link href="/shows/friends" className="text-brand-gold hover:underline">Friends</Link>,
            which made one every season for ten years. We scored every joke in all {friends.length} of them, plus
            the Thanksgiving episodes of the other shows we cover, {episodes.length} in all.
          </p>
          {fBest && fWorst && fBest !== fWorst && (
            <p>
              The best Friends Thanksgiving by our numbers is &ldquo;{fBest.title}&rdquo;; the weakest is
              &ldquo;{fWorst.title}&rdquo;. Under each episode is its funniest joke and where it stands against the
              rest of its own series.
            </p>
          )}
        </>
      }
    />
  );
}
