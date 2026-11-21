import { getAgreePool } from '@/lib/data';
import { pageMeta } from '@/lib/seo';
import StudyGame from '@/components/study/StudyGame';

export const dynamic = 'force-static';

export const metadata = pageMeta({
  title: 'Rate Jokes for the Humor Index Study',
  description:
    'Help test the Humor Index: rate real sitcom jokes from 1 to 10 without seeing any score. We publish how closely people and the model agree.',
  path: '/study',
});

const SIZE = 300;

export default async function StudyPage() {
  // A fixed set of 300 TV jokes spread evenly across the score range, so every
  // rater draws from the same sample and the result can be compared over time.
  const pool = (await getAgreePool()).filter((j) => j.se > 0).sort((a, b) => a.s - b.s || a.id - b.id);
  const step = Math.max(1, pool.length / SIZE);
  const set = Array.from({ length: Math.min(SIZE, pool.length) }, (_, i) => pool[Math.floor(i * step)]);
  const jokes = set.map((j) => ({ id: j.id, t: j.t, who: j.who, show: j.show, se: j.se, ep: j.ep, et: j.et, s: j.s }));

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-2">The rating study</p>
        <h1 className="font-serif italic text-3xl sm:text-4xl text-brand-text-primary mb-3">How funny is this joke?</h1>
        <p className="text-sm text-brand-text-secondary leading-relaxed">
          The Humor Index is one AI model’s judgment. This study checks it against people. Rate each line from 1 to 10.
          You won’t see the model’s score, so it can’t sway you. Rate as many as you like; ten takes about two minutes.
        </p>
      </header>
      <StudyGame jokes={jokes} />
    </main>
  );
}
