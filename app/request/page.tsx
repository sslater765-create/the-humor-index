import PageHeader from '@/components/layout/PageHeader';
import RequestClient from './RequestClient';

export const metadata = {
  title: 'Request a Show — Vote for the Next Analysis',
  description: 'Vote for which sitcom The Humor Index should analyze next. The most-requested shows get scored first.',
  alternates: {
    canonical: 'https://thehumorindex.com/request',
  },
  openGraph: {
    title: 'Request a Show — Vote for the Next Analysis',
    description: 'Vote for which sitcom The Humor Index should analyze next. The most-requested shows get scored first.',
    images: ['/og-image.png'],
  },
};

export default function RequestPage() {
  return (
    <div>
      <PageHeader
        label="Community"
        title="Request a Show"
        subtitle="Vote for the next show we analyze. Top requests get scored first."
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <RequestClient />
      </div>
    </div>
  );
}
