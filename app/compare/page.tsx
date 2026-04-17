import { getAllShows, getComedyDna } from '@/lib/data';
import PageHeader from '@/components/layout/PageHeader';
import CompareClient from './CompareClient';

export const metadata = {
  title: 'Compare Shows — The Humor Index',
  description: 'Head-to-head comparison of comedy show Humor Index scores.',
  alternates: {
    canonical: 'https://thehumorindex.com/compare',
  },
  openGraph: {
    title: 'Compare Shows — The Humor Index',
    description: 'Head-to-head comparison of comedy show Humor Index scores.',
    images: ['/og-image.png'],
  },
};

export const dynamic = 'force-static';

export default async function ComparePage() {
  const shows = await getAllShows();

  // Pre-fetch Comedy DNA for every show so the client component doesn't rely on mocks.
  const dnaBySlug: Record<string, Record<string, number>> = {};
  for (const s of shows) {
    const dna = await getComedyDna(s.slug);
    if (dna && Object.keys(dna).length > 0) dnaBySlug[s.slug] = dna;
  }

  return (
    <div>
      <PageHeader
        label="Head-to-Head"
        title="Compare Shows"
        subtitle="Select two shows to compare across every dimension."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <CompareClient shows={shows} dnaBySlug={dnaBySlug} />
      </div>
    </div>
  );
}
