'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Seasonal lists people search for in late November and December. Shown by
// date in the browser, so the homepage switches without a deploy.
const WINDOWS = [
  { until: '2026-11-27T05:00:00Z', href: '/rankings/best-thanksgiving-episodes/', tag: 'Thanksgiving', text: 'The best Thanksgiving sitcom episodes, ranked: every Friends Thanksgiving and more.' },
  { until: '2027-01-01T05:00:00Z', href: '/rankings/best-christmas-episodes/', tag: 'Christmas', text: 'The best Christmas sitcom episodes, ranked by every joke.' },
];

export default function HolidayCallout() {
  const [w, setW] = useState<(typeof WINDOWS)[number] | null>(null);
  useEffect(() => { const now = Date.now(); setW(WINDOWS.find((x) => now < Date.parse(x.until)) ?? null); }, []);
  if (!w) return null;
  return (
    <Link href={w.href} className="group mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-brand-border bg-brand-card px-5 py-3 hover:border-brand-gold/40 transition-colors">
      <span className="text-[11px] uppercase tracking-[0.25em] text-brand-gold">{w.tag}</span>
      <span className="text-brand-text-primary group-hover:text-brand-gold transition-colors">{w.text}</span>
      <span className="text-sm text-brand-gold">See the list →</span>
    </Link>
  );
}
