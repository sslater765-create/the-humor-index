'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import AccountMenu from '@/components/auth/AccountMenu';

// Five destinations in the bar; the rest sit under "More" on desktop and in
// the full list on mobile.
const primary = [
  { href: '/shows', label: 'Shows' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/compare', label: 'Compare' },
  { href: '/comedy-dna', label: 'Comedy DNA' },
  { href: '/blog', label: 'Blog' },
];
const secondary = [
  { href: '/explore', label: 'Explore' },
  { href: '/agree', label: 'Agree?' },
  { href: '/my', label: 'My Index' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/request', label: 'Request a show' },
];
const links = [...primary, ...secondary];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);


  return (
    <nav className="sticky top-0 z-50 border-b border-brand-border bg-brand-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-brand-text-primary font-medium tracking-tight text-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="12" width="3" height="10" rx="1" fill="#E8B931"/>
            <rect x="7" y="8" width="3" height="14" rx="1" fill="#E8B931"/>
            <rect x="12" y="4" width="3" height="18" rx="1" fill="#E8B931"/>
            <rect x="17" y="9" width="3" height="13" rx="1" fill="#E8B931"/>
          </svg>
          THE HUMOR INDEX
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-5 lg:gap-7">
          {primary.map(l => (
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
          <div className="relative" onMouseLeave={() => setMoreOpen(false)}>
            <button
              type="button"
              onClick={() => setMoreOpen(v => !v)}
              onMouseEnter={() => setMoreOpen(true)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              className={`text-sm transition-colors flex items-center gap-1 ${
                secondary.some(l => pathname.startsWith(l.href))
                  ? 'text-brand-gold'
                  : 'text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              More
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full pt-3 w-44">
                <div className="rounded-xl border border-brand-border bg-brand-dark shadow-xl py-1.5">
                  {secondary.map(l => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        pathname.startsWith(l.href)
                          ? 'text-brand-gold'
                          : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-surface'
                      }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link
            href="/search"
            prefetch={false}
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
          <AccountMenu />
        </div>

        {/* Mobile: search + hamburger */}
        <div className="sm:hidden flex items-center gap-1">
          <Link
            href="/search"
            prefetch={false}
            className={`p-2 transition-colors ${
              pathname === '/search'
                ? 'text-brand-gold'
                : 'text-brand-text-secondary hover:text-brand-text-primary'
            }`}
            aria-label="Search jokes"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
          <button
            className="text-brand-text-secondary p-1"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <div className="w-5 h-4 flex flex-col justify-between" aria-hidden="true">
              <span className={`block h-0.5 bg-current transition-transform ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-transform ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>
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
            <AccountMenu mobile />
          </div>
        </div>
      )}
    </nav>
  );
}
