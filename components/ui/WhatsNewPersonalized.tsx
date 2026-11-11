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
  { href: '/blog/chappelles-show-sketch-advantage', label: 'Latest Blog', labelColor: 'text-brand-gold', title: 'A Sketch Show Has Four of Our Five Top-Ranked Episodes', subtitle: 'Nov 11, 2026', date: '2026-11-11' },
  { href: '/blog/density-vs-craft', label: 'Blog', labelColor: 'text-brand-gold', title: 'Two Shows Tell the Same Number of Jokes Per Minute. One Scores 10 Points Higher.', subtitle: 'Aug 19, 2026', date: '2026-08-19' },
  { href: '/shows/broad-city', label: 'Show Launch', labelColor: 'text-amber-400', title: 'Broad City', subtitle: 'Fully scored · Jun 17, 2026', date: '2026-06-17' },
  { href: '/shows/chappelles-show', label: 'Show Launch', labelColor: 'text-emerald-400', title: "Chappelle's Show", subtitle: 'Fully scored · Jun 10, 2026', date: '2026-06-10' },
  { href: '/shows/freaks-and-geeks', label: 'Show Launch', labelColor: 'text-emerald-400', title: 'Freaks and Geeks', subtitle: 'Fully scored · Jun 9, 2026', date: '2026-06-09' },
  { href: '/shows/the-simpsons', label: 'Show Launch', labelColor: 'text-emerald-400', title: 'The Simpsons', subtitle: 'Fully scored · Jun 9, 2026', date: '2026-06-09' },
  { href: '/shows/the-fresh-prince-of-bel-air', label: 'Show Launch', labelColor: 'text-emerald-400', title: 'The Fresh Prince of Bel-Air', subtitle: 'Fully scored · Jun 5, 2026', date: '2026-06-05' },
  { href: '/shows/the-larry-sanders-show', label: 'Show Launch', labelColor: 'text-emerald-400', title: 'The Larry Sanders Show', subtitle: 'Fully scored · Jun 5, 2026', date: '2026-06-05' },
  { href: '/shows/flight-of-the-conchords', label: 'Show Launch', labelColor: 'text-emerald-400', title: 'Flight of the Conchords', subtitle: 'Fully scored · Jun 2, 2026', date: '2026-06-02' },
  { href: '/shows/its-always-sunny', label: 'Show Launch', labelColor: 'text-emerald-400', title: "It's Always Sunny in Philadelphia", subtitle: 'Fully scored · May 30, 2026', date: '2026-05-30' },
  { href: '/shows/veep', label: 'Show Launch', labelColor: 'text-emerald-400', title: 'Veep', subtitle: 'Fully scored · May 28, 2026', date: '2026-05-28' },
  { href: '/shows/community', label: 'Show Launch', labelColor: 'text-emerald-400', title: 'Community', subtitle: 'Fully scored · May 24, 2026', date: '2026-05-24' },
  { href: '/shows/taxi', label: 'Show Launch', labelColor: 'text-emerald-400', title: 'Taxi', subtitle: 'Fully scored · May 16, 2026', date: '2026-05-16' },
  { href: '/shows/30-rock', label: 'Show Launch', labelColor: 'text-emerald-400', title: '30 Rock', subtitle: 'Fully scored · May 14, 2026', date: '2026-05-14' },
  { href: '/shows/arrested-development', label: 'Show Launch', labelColor: 'text-emerald-400', title: 'Arrested Development', subtitle: 'Fully scored · May 4, 2026', date: '2026-05-04' },
  { href: '/shows/schitts-creek', label: 'Show Launch', labelColor: 'text-emerald-400', title: "Schitt's Creek", subtitle: 'Fully scored · May 2, 2026', date: '2026-05-02' },
  { href: '/shows/parks-and-recreation', label: 'Show Launch', labelColor: 'text-emerald-400', title: 'Parks and Recreation', subtitle: 'Fully scored · Apr 30, 2026', date: '2026-04-30' },
  { href: '/shows/friends', label: 'Show Launch', labelColor: 'text-emerald-400', title: 'Friends', subtitle: 'Fully scored · Apr 16, 2026', date: '2026-04-16' },
  { href: '/shows/seinfeld', label: 'Show Launch', labelColor: 'text-emerald-400', title: 'Seinfeld', subtitle: 'Fully scored · Apr 11, 2026', date: '2026-04-11' },
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
