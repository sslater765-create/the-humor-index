import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { SITE_URL } from '@/lib/site';
import { getSiteStats } from '@/lib/siteStats';
import { allRunningGags } from '@/lib/runningGags';

export const dynamic = 'force-static';

export const metadata = {
  title: 'The Box Score for Comedy — Why The Humor Index Exists',
  description:
    'Every argument about which comedy is funnier runs on taste, nostalgia and fan votes. Baseball settled its arguments by counting. The Humor Index counts every joke and grades each one on the same rubric.',
  alternates: { canonical: `${SITE_URL}/why/` },
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif italic text-2xl sm:text-3xl text-brand-text-primary mt-14 mb-4">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-brand-text-secondary leading-relaxed mb-4">{children}</p>;
}

export default async function WhyPage() {
  const stats = await getSiteStats();
  const gags = allRunningGags().length;

  return (
    <div>
      <BreadcrumbJsonLd crumbs={[{ name: 'Why', path: '/why' }]} />
      <PageHeader
        label="Why this exists"
        title="The box score for comedy"
        subtitle="Every argument about which show is funnier runs on taste, nostalgia and fan votes. Baseball had the same problem and solved it by counting. So do we."
      />
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <H>The argument nobody can win</H>
        <P>
          Is Seinfeld funnier than The Office? Is season 4 of Arrested Development a disaster or underrated? People have
          argued about this for thirty years, and the arguments never end because there is nothing to check. Each side
          brings its own memory of its favorite episodes, a few quotes, and the shows it watched at nineteen.
        </P>
        <P>
          The scores people reach for to settle it don’t settle it either. They measure who showed up to vote.
        </P>

        <H>What fan scores actually measure</H>
        <P>
          An IMDb rating is an average of whoever chose to rate. When the film-data analyst Stephen Follows last checked, 81.7% of IMDb votes
          came from men. FiveThirtyEight found that on TV shows rated evenly by men and women, men scored them a full
          point lower on average, which drags down whole genres. Rotten Tomatoes’ audience score has been review-bombed
          often enough that the site changed its rules, and the critics’ Tomatometer is the share of reviews that were
          positive, not how good anything is.
        </P>
        <P>
          None of that makes fan scores useless. They tell you what a crowd felt. They can’t tell you how many jokes an
          episode had, whether they were built well, or whether a beloved episode is beloved for its jokes or for its
          wedding. Across every episode we can compare, the Humor Index and IMDb barely move together
          (<Link href="/rankings/index-vs-imdb/" className="text-brand-gold hover:underline">see where they disagree</Link>). They are measuring different things.
        </P>

        <H>What baseball figured out</H>
        <P>
          Baseball spent a century arguing about players on reputation, then started counting what actually happened on
          the field. The stats didn’t replace watching the game. They settled the questions that could be settled by
          counting, so the arguments that were left were about things that matter.
        </P>
        <P>
          Comedy has never had a box score. Nobody counted the jokes. The Humor Index does: {stats.allJokes.toLocaleString()} jokes
          so far, each one found in the script and graded on the same five-part craft rubric and an impact score.
          Then we add them up the way a box score adds up at-bats.
        </P>

        <H>The stat line</H>
        <ul className="space-y-3 mb-4 text-brand-text-secondary leading-relaxed">
          <li><span className="font-mono text-brand-gold">JPM</span>, jokes per minute: volume. How hard the show is swinging.</li>
          <li><span className="font-mono text-brand-gold">Craft</span>: originality, structure, character, economy and whether the laugh was earned, each scored per joke.</li>
          <li><span className="font-mono text-brand-gold">Impact</span>: how hard the joke lands.</li>
          <li><span className="font-mono text-brand-gold">Humor Index</span>: the three combined into one number per episode, season and show.</li>
          <li>
            <span className="font-mono text-brand-gold">LAR</span>, Laughs Above Replacement: for{' '}
            <Link href="/rankings/running-gags/" className="text-brand-gold hover:underline">{gags} running gags</Link>, how much each one added over the show’s ordinary joke across its whole run.
          </li>
        </ul>
        <P>
          A show can’t win by being popular, by being on a prestige network, or by having a loud fanbase. The rubric
          doesn’t know which shows are cool. It reads the jokes.
        </P>

        <H>What it isn’t</H>
        <P>
          It isn’t free of bias, and we won’t claim it is. The grader is an AI model, and a model has tastes of its own.
          We chose the rubric and its weights, and those choices favor some kinds of comedy over others. When we changed
          models, some shows moved. What the Index offers instead is consistency and receipts: the same judge and the same
          rubric for every joke in every show, the model named, the changes logged, and every scored joke published so you can
          check our work.
        </P>
        <P>
          That is all a batting average promises too. Somebody decided a walk isn’t a hit. The number is useful because
          it is counted the same way for everyone.
        </P>

        <H>Argue with it</H>
        <P>
          The point isn’t to end the argument. It’s to give it something to stand on. Play{' '}
          <Link href="/agree/" className="text-brand-gold hover:underline">the blind test</Link> to see how often you agree with the
          scoring. Keep a <Link href="/my/#diary" className="text-brand-gold hover:underline">diary</Link> and we’ll show how closely
          your own ratings track the Index. Read <Link href="/methodology/" className="text-brand-gold hover:underline">the methodology</Link> and
          the <Link href="/methodology/#model-card" className="text-brand-gold hover:underline">model card</Link>. Then tell us where we’re wrong.
        </P>

        <p className="mt-12 text-xs text-brand-text-muted leading-relaxed">
          Sources: Stephen Follows, “How one-star and ten-star votes break IMDb’s user score” (stephenfollows.com);
          Walt Hickey, “Men Are Sabotaging The Online Reviews Of TV Shows Aimed At Women,” FiveThirtyEight, 2016;
          Rotten Tomatoes audience-score changes reported by CNET and SYFY Wire, 2019.
        </p>
      </article>
    </div>
  );
}
