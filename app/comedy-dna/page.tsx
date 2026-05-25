import type { Metadata } from 'next';
import { getComedyDnaQuiz, getComedyDnaFingerprints, getAllShows } from '@/lib/data';
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <ComedyDnaQuiz quiz={quiz} fingerprints={fingerprints} comingSoon={comingSoon} />
    </main>
  );
}
