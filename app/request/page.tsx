import RequestClient from './RequestClient';

export const metadata = {
  title: 'Request a Show — Vote for the Next Analysis',
  description: 'Vote for which sitcom The Humor Index should analyze next. The most-requested shows get scored first.',
  alternates: {
    canonical: 'https://www.thehumorindex.com/request/',
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
      {/* Editorial hero */}
      <section className="relative border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-gold mb-4">You Pick. We Score.</p>
          <h1 className="font-serif italic text-4xl sm:text-6xl text-brand-text-primary leading-[1.05] mb-4 max-w-3xl">
            What should we analyze next?
          </h1>
          <p className="text-base sm:text-lg text-brand-text-secondary max-w-2xl leading-relaxed">
            Every show on the index started as a vote. Cast yours below — the most-requested sitcoms get scored first.
            One show takes <span className="text-brand-text-primary">several hours</span> of analysis, three AI passes,
            thousands of jokes. Choose wisely.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <RequestClient />
      </div>
    </div>
  );
}
