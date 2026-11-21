import { getAgreePool } from '@/lib/data';
import { getSiteStats } from '@/lib/siteStats';
import { pageMeta, breadcrumbJsonLd } from '@/lib/seo';
import AgreeGame from '@/components/agree/AgreeGame';

export const dynamic = 'force-static';

export const metadata = pageMeta({
  title: 'Do You Agree With the Index? — The Humor Index',
  description:
    'Two real jokes from sitcoms and comedy movies. You pick the funnier one. Then we reveal which one the Humor Index scored higher. A blind test of one AI’s comedy taste against yours — see how often you agree.',
  path: '/agree',
  ogTitle: 'Do you agree with the Humor Index?',
});

export default async function AgreePage() {
  const [pool, stats] = await Promise.all([getAgreePool(), getSiteStats()]);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Agree?', path: '/agree' },
          ])),
        }}
      />

      <header className="mb-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-2">The Blind Test</p>
        <h1 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary mb-3">
          Do you agree with the Index?
        </h1>
        <p className="text-sm text-brand-text-secondary max-w-xl mx-auto leading-relaxed">
          Two real jokes, credited by character and show. Pick the funnier one. The scores stay hidden
          until you pick, so the number can’t lean on your answer; then we show which one the Index
          scored higher and keep a running tally.
        </p>
      </header>

      <AgreeGame pool={pool} jokeCount={stats.allJokes} />

      <p className="text-xs text-brand-text-muted leading-relaxed text-center max-w-xl mx-auto mt-10">
        Every joke here was scored by the same pipeline that powers the rest of the site, graded on
        impact (how hard it lands) from 1 to 10, drawn from {stats.allJokes.toLocaleString()} scored
        jokes. We don’t claim the Index is right; this is how we find out where it agrees with people
        and where it doesn’t. The tally restarted on November 21, 2026, when we stopped showing scores
        before the pick. Want to help more? <a href="/study/" className="text-brand-gold hover:underline">Rate jokes for the study</a>.
      </p>
    </main>
  );
}
