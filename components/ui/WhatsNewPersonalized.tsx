'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLastVisitTimestamp } from './RecentlyViewedTracker';

interface NewItem {
  href: string;
  label: string;
  labelColor: string;
  title: string;
  subtitle: string;
  date: string;
}

// These are the site's content items with their publish dates
const ALL_ITEMS: NewItem[] = [
  { href: '/blog/comedy-war', label: 'Latest Blog', labelColor: 'text-brand-gold', title: 'Michael Scott Is the Most Valuable Comedy Character in Television History', subtitle: 'Apr 13, 2026', date: '2026-04-13' },
  { href: '/blog/seinfeld-vs-the-office', label: 'Blog', labelColor: 'text-brand-gold', title: 'Seinfeld Has Better Jokes. The Office Is Funnier.', subtitle: 'Apr 12, 2026', date: '2026-04-12' },
  { href: '/blog/imdb-vs-humor-index', label: 'Blog', labelColor: 'text-brand-gold', title: 'IMDb Ratings vs. The Humor Index', subtitle: 'Apr 12, 2026', date: '2026-04-12' },
  { href: '/shows/seinfeld', label: 'Recently Completed', labelColor: 'text-emerald-400', title: 'Seinfeld — All 172 Episodes', subtitle: '9,828 jokes analyzed', date: '2026-04-11' },
  { href: '/shows/friends', label: 'In Progress', labelColor: 'text-amber-400', title: 'Friends — Analysis Underway', subtitle: '236 episodes queued', date: '2026-04-10' },
];

export default function WhatsNewPersonalized() {
  const [newSinceLabel, setNewSinceLabel] = useState<string | null>(null);
  const [newItems, setNewItems] = useState<NewItem[]>([]);

  useEffect(() => {
    const lastVisit = getLastVisitTimestamp();
    if (lastVisit > 0) {
      const since = new Date(lastVisit);
      const label = since.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fresh = ALL_ITEMS.filter(item => {
        const itemDate = new Date(item.date + 'T23:59:59').getTime();
        return itemDate > lastVisit;
      });
      if (fresh.length > 0) {
        setNewSinceLabel(label);
        setNewItems(fresh.slice(0, 3));
      }
    }
  }, []);

  // Default items for first-time/no-new-content visitors
  const displayItems = newItems.length > 0 ? newItems : ALL_ITEMS.slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
      <div className="flex items-baseline gap-2 mb-4">
        <p className="text-xs uppercase tracking-widest text-brand-text-muted">What&apos;s New</p>
        {newSinceLabel && (
          <span className="text-[10px] bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full px-2 py-0.5">
            Since {newSinceLabel}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {displayItems.map(item => (
          <Link key={item.href} href={item.href} className="bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/40 transition-colors group">
            <p className={`text-[10px] ${item.labelColor} mb-1`}>{item.label}</p>
            <p className="text-sm font-medium text-brand-text-primary group-hover:text-brand-gold transition-colors line-clamp-2">{item.title}</p>
            <p className="text-xs text-brand-text-muted mt-1">{item.subtitle}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
