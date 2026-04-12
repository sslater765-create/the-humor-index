'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const links = [
  { href: '/shows', label: 'Shows' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/compare', label: 'Compare' },
  { href: '/blog', label: 'Blog' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/request', label: 'Request' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);


  return (
    <nav className="sticky top-0 z-50 border-b border-brand-border bg-brand-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-brand-text-primary font-medium tracking-tight text-sm">
          THE HUMOR INDEX
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${
                pathname.startsWith(l.href)
                  ? 'text-brand-gold border-b border-brand-gold pb-0.5'
                  : 'text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/search"
            className={`transition-colors ${
              pathname === '/search'
                ? 'text-brand-gold'
                : 'text-brand-text-muted hover:text-brand-text-primary'
            }`}
            aria-label="Search jokes"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-brand-text-secondary p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`block h-0.5 bg-current transition-transform ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-transform ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu panel — slides down from nav */}
      {open && (
        <div className="sm:hidden border-t border-brand-border bg-brand-dark">
          <div className="px-4 py-3 space-y-1">
            {[...links, { href: '/search', label: 'Search' }].map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname.startsWith(l.href)
                    ? 'text-brand-gold bg-brand-gold/10'
                    : 'text-brand-text-primary active:bg-brand-surface'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
