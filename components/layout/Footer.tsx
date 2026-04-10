import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-brand-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-brand-text-muted">
          THE HUMOR INDEX — comedy analytics, not corporate sponsorship
        </span>
        <div className="flex gap-6">
          <Link href="/methodology" className="text-xs text-brand-text-muted hover:text-brand-text-secondary transition-colors">
            Methodology
          </Link>
          <Link href="/compare" className="text-xs text-brand-text-muted hover:text-brand-text-secondary transition-colors">
            Compare Shows
          </Link>
        </div>
      </div>
    </footer>
  );
}
