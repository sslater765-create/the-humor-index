import Link from 'next/link';
import { CHRISTMAS, getHolidayEpisodes } from '@/lib/holidays';
import HolidayRanking from '@/components/rankings/HolidayRanking';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Best Christmas Sitcom Episodes, Ranked by Every Joke',
  description:
    'The funniest Christmas episodes of The Office, Seinfeld, 30 Rock, Friends, The Simpsons and more, ranked by the Humor Index. Every joke scored for craft and impact.',
  alternates: { canonical: `${SITE_URL}/rankings/best-christmas-episodes/` },
  openGraph: {
    title: 'The Best Christmas Sitcom Episodes, Ranked',
    description: 'Every joke in 50+ Christmas sitcom episodes, scored. Here is the order.',
    images: [`/api/og?title=${encodeURIComponent('Best Christmas Sitcom Episodes')}&score=${encodeURIComponent('Ranked')}&subtitle=${encodeURIComponent('Every joke scored')}`],
  },
};

export default async function BestChristmasEpisodesPage() {
  const episodes = await getHolidayEpisodes(CHRISTMAS);
  const byShow = new Map<string, { name: string; slug: string; n: number }>();
  for (const e of episodes) {
    const cur = byShow.get(e.showSlug) ?? { name: e.showName, slug: e.showSlug, n: 0 };
    cur.n += 1;
    byShow.set(e.showSlug, cur);
  }
  const most = Array.from(byShow.values()).sort((a, b) => b.n - a.n).slice(0, 3);
  const office = episodes.filter(e => e.showSlug === 'the-office');
  const officeBest = [...office].sort((a, b) => a.rankInShow - b.rankInShow)[0];

  return (
    <HolidayRanking
      holiday="Christmas"
      path="/rankings/best-christmas-episodes"
      episodes={episodes}
      sibling={{ label: 'best Thanksgiving episodes', href: '/rankings/best-thanksgiving-episodes' }}
      intro={
        <>
          <p>
            Almost every long-running sitcom does a Christmas episode, and most of them coast on goodwill. We
            scored every joke in {episodes.length} of them, from {byShow.size} shows, to see which ones are
            actually funny and which ones are just cozy.
          </p>
          <p>
            {most.map((m, i) => (
              <span key={m.slug}>
                <Link href={`/shows/${m.slug}`} className="text-brand-gold hover:underline">{m.name}</Link> has {m.n}
                {i < most.length - 2 ? ', ' : i === most.length - 2 ? ' and ' : ''}
              </span>
            ))}
            , the most of any show here.
            {officeBest && (
              <> The Office made one nearly every year; its best by our numbers is &ldquo;{officeBest.title}&rdquo;.</>
            )}{' '}
            Under each episode is its funniest joke and where it stands against the rest of its own series.
          </p>
        </>
      }
    />
  );
}
