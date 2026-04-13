import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
      <p className="font-mono text-6xl text-brand-gold mb-4">404</p>
      <h1 className="text-2xl font-medium text-brand-text-primary mb-3">
        This page has the comedic timing of a laugh track.
      </h1>
      <p className="text-sm text-brand-text-secondary mb-8">
        It doesn&apos;t exist. Our Humor Index for this URL: <span className="font-mono text-brand-text-muted">0.0</span>
      </p>
      <div className="flex justify-center gap-3">
        <Link
          href="/"
          className="bg-brand-gold text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-brand-gold-dim transition-colors"
        >
          Back to home
        </Link>
        <Link
          href="/rankings/funniest-episodes"
          className="border border-brand-border text-brand-text-secondary text-sm px-5 py-2.5 rounded-lg hover:border-brand-text-muted transition-colors"
        >
          See what&apos;s actually funny
        </Link>
      </div>
    </div>
  );
}
