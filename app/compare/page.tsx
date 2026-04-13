import { getAllShows } from '@/lib/data';
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
  return (
    <div>
      <PageHeader
        label="Head-to-Head"
        title="Compare Shows"
        subtitle="Select two shows to compare across every dimension."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <CompareClient shows={shows} />
      </div>
    </div>
  );
}
