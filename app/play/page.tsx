import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Play: The Bracket, the Draft, Comedy DNA and the Blind Test',
  description: 'Every way to argue with the Humor Index: vote in the running gag bracket, draft a sitcom ensemble, find your Comedy DNA, take the blind test, or rate jokes for the study.',
  alternates: { canonical: `${SITE_URL}/play/` },
};

const GAMES = [
  { href: '/rankings/running-gags/bracket/', label: 'The running gag bracket', blurb: 'Sixteen gags, one round a week. Your votes decide who advances; the champion is crowned December 20.', tag: 'This week' },
  { href: '/draft/', label: 'The ensemble draft', blurb: 'Snake-draft a five-character sitcom cast against the Index or up to three friends on one phone.' },
  { href: '/comedy-dna/', label: 'Comedy DNA', blurb: 'Pick the funnier of two jokes a few times and get a match % for every show on the board.' },
  { href: '/agree/', label: 'The blind test', blurb: 'Two jokes, no scores. Pick the funnier one, then see whether the Index agreed.' },
  { href: '/study/', label: 'The rating study', blurb: 'Rate jokes from 1 to 10 without seeing a score or the show. Your ratings check the Index against people.' },
  { href: '/explore/', label: 'Build a cut', blurb: 'Pick any seasons or episodes of a show and see how funny that slice scores.' },
  { href: '/request/', label: 'Vote on the next show', blurb: 'Brooklyn Nine-Nine, Modern Family, The Good Place: the most-requested shows get scored first.' },
];

export default function PlayPage() {
  return (
    <div>
      <PageHeader label="Play" title="Argue with the Index" subtitle="The numbers are one judge’s read. These are the ways to push back, pick sides, or just find out what makes you laugh." />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid gap-4 sm:grid-cols-2">
        {GAMES.map((g) => (
          <Link key={g.href} href={g.href} className="group block rounded-xl border border-brand-border bg-brand-card p-5 hover:border-brand-gold/50 transition-colors">
            {g.tag && <p className="text-[11px] uppercase tracking-[0.25em] text-brand-gold mb-1">{g.tag}</p>}
            <p className="text-lg text-brand-text-primary group-hover:text-brand-gold transition-colors">{g.label}</p>
            <p className="mt-1 text-sm text-brand-text-secondary">{g.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
