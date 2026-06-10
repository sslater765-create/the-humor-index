import { getAgreePool } from '@/lib/data';
import { getSiteStats } from '@/lib/siteStats';
import { pageMeta, breadcrumbJsonLd } from '@/lib/seo';
import AgreeGame from '@/components/agree/AgreeGame';

export const dynamic = 'force-static';

export const metadata = pageMeta({
  title: 'Do You Agree With the Index? — The Humor Index',
  description:
    'Two real sitcom jokes. You pick the funnier one. Then we reveal which one the Humor Index scored higher. A blind test of one AI’s comedy taste against yours — see how often you agree.',
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
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-2">The Blind Test</p>
        <h1 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary mb-3">
          Do you agree with the Index?
        </h1>
        <p className="text-sm text-brand-text-secondary max-w-xl mx-auto leading-relaxed">
          The Humor Index is one AI’s aesthetic, applied systematically. So here’s the honest test:
          two real jokes, blind. You pick the funnier one — then we reveal which one the algorithm
          scored higher. See how often your gut matches the machine.
        </p>
      </header>

      <AgreeGame pool={pool} jokeCount={stats.totalJokes} />

      <p className="text-xs text-brand-text-muted leading-relaxed text-center max-w-xl mx-auto mt-10">
        Every joke here was scored by the same pipeline that powers the rest of the site — graded on
        impact (how hard it lands) from 1–10, drawn from {stats.totalJokes.toLocaleString()} scored
        jokes. We don’t claim the Index is right; this is how we find out where it agrees with people
        and where it doesn’t.
      </p>
    </main>
  );
}
