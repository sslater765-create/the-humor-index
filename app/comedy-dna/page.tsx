import type { Metadata } from 'next';
import Link from 'next/link';
import { getComedyDnaQuiz, getComedyDnaFingerprints, getAllShows } from '@/lib/data';
import { archetypeExemplars, emblemSVG, EMBLEMS } from '@/lib/comedyDna';
import ComedyDnaQuiz from '@/components/comedy-dna/ComedyDnaQuiz';

// Hero illustrated card per show (the most quotable joke's art), shown as the
// banner on each archetype card so it matches the "exemplified by" show.
const HERO_BY_SLUG: Record<string, string> = { "30-rock": "54940", "arrested-development": "45683", "community": "68764", "flight-of-the-conchords": "99310", "friends": "20897", "its-always-sunny": "92162", "parks-and-recreation": "39411", "schitts-creek": "43543", "seinfeld": "9626", "taxi": "60857", "the-fresh-prince-of-bel-air": "109663", "the-larry-sanders-show": "102932", "the-office": "office-bankruptcy", "veep": "87155" };

// Manual exemplar overrides (archetype slug -> show) where the auto-pick reads off.
const EXEMPLAR_OVERRIDE: Record<string, { slug: string; name: string }> = {
  wordsmith: { slug: 'seinfeld', name: 'Seinfeld' },
};

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
  const exemplars = archetypeExemplars(fingerprints).map(e =>
    EXEMPLAR_OVERRIDE[e.arche.slug] ? { ...e, ...EXEMPLAR_OVERRIDE[e.arche.slug] } : e
  );

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
          {exemplars.map(({ arche, slug, name }) => {
            const hero = slug ? HERO_BY_SLUG[slug] : undefined;
            const c = EMBLEMS[arche.emblem].c;
            return (
            <div key={arche.name} className="bg-brand-card border border-brand-border rounded-xl overflow-hidden flex flex-col transition hover:border-brand-gold/60">
              {hero && (
                <div className="relative h-32 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/cards/${hero}.png`} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-card" />
                  <span className="absolute top-3 left-3 h-1.5 w-10 rounded-full" style={{ backgroundColor: c }} />
                </div>
              )}
              <div className="p-5 flex gap-4">
                <span
                  className="shrink-0 inline-flex items-center justify-center rounded-full border-[2.5px] bg-brand-surface"
                  style={{ borderColor: c, width: 56, height: 56 }}
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
            </div>
            );
          })}
        </div>
        <p className="mt-8">
          <Link href="/shows/" className="text-brand-gold hover:underline">See all scored shows →</Link>
        </p>
      </section>
    </main>
  );
}
