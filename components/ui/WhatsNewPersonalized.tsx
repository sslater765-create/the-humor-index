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
  { href: '/shows/flight-of-the-conchords', label: 'Recently Completed', labelColor: 'text-emerald-400', title: 'Flight of the Conchords — All 22 Episodes (S1–S2)', subtitle: '1,322 jokes analyzed · Debuts at #7', date: '2026-06-02' },
  { href: '/shows/its-always-sunny', label: 'Recently Completed', labelColor: 'text-emerald-400', title: "It's Always Sunny in Philadelphia — All 177 Episodes (S1–S17)", subtitle: '8,786 jokes analyzed · Debuts at #5', date: '2026-05-30' },
  { href: '/shows/veep', label: 'Recently Completed', labelColor: 'text-emerald-400', title: 'Veep — All 65 Episodes', subtitle: '4,873 jokes analyzed · Debuts tied at #3 (79.9)', date: '2026-05-28' },
  { href: '/shows/the-simpsons', label: 'Recently Completed', labelColor: 'text-emerald-400', title: 'The Simpsons — All 226 Episodes (S1–S10)', subtitle: '14,352 jokes analyzed · Debuts at #3', date: '2026-05-26' },
  { href: '/blog/community-gas-leak-year', label: 'Latest Blog', labelColor: 'text-brand-gold', title: 'You Can See Exactly When Dan Harmon Left Community', subtitle: 'May 24, 2026', date: '2026-05-24' },
  { href: '/shows/community', label: 'Recently Completed', labelColor: 'text-emerald-400', title: 'Community — All 110 Episodes', subtitle: '6,565 jokes analyzed · Debuts at #5', date: '2026-05-24' },
  { href: '/blog/humor-index-vs-imdb-three-ways', label: 'Latest Blog', labelColor: 'text-brand-gold', title: "We Recomputed Our IMDb Correlation Three Ways. At the Show Level, It's Negative.", subtitle: 'May 16, 2026', date: '2026-05-16' },
  { href: '/blog/taxi-launch', label: 'Blog', labelColor: 'text-brand-gold', title: 'Taxi Lands at 77.4 — A 1978 Show Inside the Same Tier as Seinfeld', subtitle: 'May 16, 2026', date: '2026-05-16' },
  { href: '/shows/taxi', label: 'Recently Completed', labelColor: 'text-emerald-400', title: 'Taxi — All 114 Episodes', subtitle: '4,776 jokes analyzed · Debuts at #7', date: '2026-05-16' },
  { href: '/blog/war-reconciliation', label: 'Blog', labelColor: 'text-brand-gold', title: 'WAR Reconciliation: Jerry Seinfeld Is Now #1 Cross-Show', subtitle: 'May 15, 2026', date: '2026-05-15' },
  { href: '/blog/display-scale-recalibration', label: 'Blog', labelColor: 'text-brand-gold', title: "We Just Recalibrated the Display Scale. Here's What Changed.", subtitle: 'May 15, 2026', date: '2026-05-15' },
  { href: '/blog/30-rock-takes-the-crown', label: 'Blog', labelColor: 'text-brand-gold', title: "30 Rock Just Took #1. By the Biggest Gap We've Measured.", subtitle: 'May 14, 2026', date: '2026-05-14' },
  { href: '/shows/30-rock', label: 'Recently Completed', labelColor: 'text-emerald-400', title: '30 Rock — All 138 Episodes', subtitle: '9,283 jokes analyzed · Now ranked #1', date: '2026-05-14' },
  { href: '/blog/arrested-development-takes-the-crown', label: 'Blog', labelColor: 'text-brand-gold', title: 'Arrested Development Just Took the #1 Spot.', subtitle: 'May 4, 2026', date: '2026-05-04' },
  { href: '/blog/character-comedy-spectrum', label: 'Blog', labelColor: 'text-brand-gold', title: 'Modern Sitcoms Are More Character-Driven Than the Classics', subtitle: 'May 3, 2026', date: '2026-05-03' },
  { href: '/blog/schitts-creek-last-on-board-first-on-impact', label: 'Blog', labelColor: 'text-brand-gold', title: "Schitt's Creek: Last on the Board, First on Impact", subtitle: 'May 2, 2026', date: '2026-05-02' },
  { href: '/blog/parks-passes-office', label: 'Blog', labelColor: 'text-brand-gold', title: 'Parks and Rec Just Took the #1 Spot from The Office.', subtitle: 'Apr 30, 2026', date: '2026-04-30' },
  { href: '/blog/comedy-war', label: 'Blog', labelColor: 'text-brand-gold', title: 'Jerry Seinfeld Is the Most Valuable Comedy Character in Television History', subtitle: 'Apr 16, 2026', date: '2026-04-16' },
  { href: '/blog/seinfeld-vs-the-office', label: 'Blog', labelColor: 'text-brand-gold', title: "Seinfeld Just Passed The Office on Our Humor Index.", subtitle: 'Apr 16, 2026', date: '2026-04-16' },
  { href: '/shows/arrested-development', label: 'Recently Completed', labelColor: 'text-emerald-400', title: 'Arrested Development — All 84 Episodes', subtitle: '4,908 jokes analyzed', date: '2026-05-04' },
  { href: '/shows/schitts-creek', label: 'Recently Completed', labelColor: 'text-emerald-400', title: "Schitt's Creek — All 80 Episodes", subtitle: '4,239 jokes analyzed', date: '2026-05-02' },
  { href: '/shows/parks-and-recreation', label: 'Recently Completed', labelColor: 'text-emerald-400', title: 'Parks and Recreation — All 124 Episodes', subtitle: 'Now ranked #2', date: '2026-04-30' },
  { href: '/shows/friends', label: 'Recently Completed', labelColor: 'text-emerald-400', title: 'Friends — All 235 Episodes', subtitle: '14,227 jokes analyzed', date: '2026-04-16' },
  { href: '/shows/seinfeld', label: 'Recently Completed', labelColor: 'text-emerald-400', title: 'Seinfeld — All 172 Episodes', subtitle: '9,828 jokes analyzed', date: '2026-04-11' },
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
