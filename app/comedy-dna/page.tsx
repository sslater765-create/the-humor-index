import type { Metadata } from 'next';
import Link from 'next/link';
import { getComedyDnaQuiz, getComedyDnaFingerprints, getAllShows } from '@/lib/data';
import { archetypeExemplars, emblemSVG, EMBLEMS } from '@/lib/comedyDna';
import ComedyDnaQuiz from '@/components/comedy-dna/ComedyDnaQuiz';

const OG_IMAGE =
  '/api/og?title=' + encodeURIComponent("What's Your Comedy DNA?") +
  '&subtitle=' + encodeURIComponent('Pick which joke is funnier — find your comedy type');

export const metadata: Metadata = {
  title: "What's Your Comedy DNA?",
  description:
    "Pick which joke is funnier and we'll map your comedy taste — your archetype, the shows built for you, and the jokes you'll love. A face-off through the funniest sitcoms ever scored.",
  alternates: { canonical: 'https://thehumorindex.com/comedy-dna/' },
  openGraph: {
    title: "What's Your Comedy DNA?",
    description:
      "A 1v1 'which joke is funnier' game that maps your comedy taste and the shows built for it.",
    url: 'https://thehumorindex.com/comedy-dna/',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "What's Your Comedy DNA?" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "What's Your Comedy DNA?",
    description: 'Pick which joke is funnier. Get your comedy archetype + the shows built for your taste.',
    images: [OG_IMAGE],
  },
};

export default async function ComedyDnaPage() {
  const [quiz, fingerprints, shows] = await Promise.all([
    getComedyDnaQuiz(),
    getComedyDnaFingerprints(),
    getAllShows(),
  ]);
  const comingSoon = shows
    .filter(s => s.humor_index <= 0)
    .map(s => ({ slug: s.slug, name: s.name }));
  // Same joke-count computation the homepage uses, so the numbers always match.
  const jokeCount = shows.reduce((sum, s) => sum + (s.total_jokes_analyzed || 0), 0);
  const exemplars = archetypeExemplars(fingerprints);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <ComedyDnaQuiz quiz={quiz} fingerprints={fingerprints} comingSoon={comingSoon} jokeCount={jokeCount} />

      {/* Static, crawlable archetype content — citable by search + AI answer engines,
          and a real internal-link surface into /shows. */}
      <section className="mt-14 border-t border-brand-border pt-10">
        <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">The six comedy archetypes</p>
        <h2 className="text-2xl font-bold tracking-tight mb-2">What your taste says about you</h2>
        <p className="text-brand-text-secondary max-w-2xl mb-8">
          Every comedy fan leans toward a type. Comedy DNA places you in one of six archetypes based on which jokes you pick, then matches you to the shows built for it. Here are the six — each with the scored sitcom that embodies it most.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {exemplars.map(({ arche, slug, name }) => (
            <div key={arche.name} className="bg-brand-card border border-brand-border rounded-xl p-5 flex gap-4">
              <span
                className="shrink-0 inline-flex items-center justify-center rounded-full border-[2.5px] bg-brand-surface"
                style={{ borderColor: EMBLEMS[arche.emblem].c, width: 56, height: 56 }}
                aria-hidden
                dangerouslySetInnerHTML={{ __html: emblemSVG(arche.emblem, 34) }}
              />
              <div>
                <h3 className="font-bold text-lg text-brand-text-primary">
                  <Link href={`/comedy-dna/${arche.slug}/`} className="hover:text-brand-gold">{arche.name}</Link>
                </h3>
                <p className="text-brand-gold text-sm font-semibold mb-1">{arche.tag}</p>
                <p className="text-sm text-brand-text-secondary mb-2">{arche.blurb}</p>
                {slug && (
                  <p className="text-sm text-brand-text-secondary">
                    Most exemplified by{' '}
                    <Link href={`/shows/${slug}/`} className="text-brand-gold hover:underline">{name}</Link>.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8">
          <Link href="/shows/" className="text-brand-gold hover:underline">See all scored shows →</Link>
        </p>
      </section>
    </main>
  );
}
