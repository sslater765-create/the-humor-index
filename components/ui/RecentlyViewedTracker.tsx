'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const VIEWED_KEY = 'humor_index_viewed';
const MAX_ITEMS = 50;

export interface ViewedItem {
  path: string;
  title: string;
  ts: number;
}

export function getViewedItems(): ViewedItem[] {
  try {
    return JSON.parse(localStorage.getItem(VIEWED_KEY) || '[]');
  } catch { return []; }
}

export function getLastVisitTimestamp(): number {
  const items = getViewedItems();
  if (items.length < 2) return 0;
  // Sort by timestamp descending, second item is "last visit before current session"
  const sorted = [...items].sort((a, b) => b.ts - a.ts);
  // Find the most recent item that's older than 1 hour (different session)
  const sessionCutoff = Date.now() - 60 * 60 * 1000;
  const lastSession = sorted.find(i => i.ts < sessionCutoff);
  return lastSession?.ts || 0;
}

export default function RecentlyViewedTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // Only track meaningful pages
    if (pathname === '/' || pathname.startsWith('/privacy') || pathname.startsWith('/terms')) return;

    try {
      const items = getViewedItems();
      const title = document.title.replace(' | The Humor Index', '').replace(" — The Science of What's Funny", '');
      const existing = items.findIndex(i => i.path === pathname);
      if (existing >= 0) items.splice(existing, 1);
      items.unshift({ path: pathname, title, ts: Date.now() });
      if (items.length > MAX_ITEMS) items.length = MAX_ITEMS;
      localStorage.setItem(VIEWED_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  }, [pathname]);

  return null;
}
