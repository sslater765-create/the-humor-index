'use client';
import { useEffect, useRef } from 'react';

/**
 * One display ad. Renders nothing at all until both the publisher id
 * (NEXT_PUBLIC_ADSENSE_ID, e.g. "ca-pub-123...") and this placement's slot id
 * are set, so pages look finished with or without ads.
 *
 * Placements and their env vars (create one ad unit per placement in AdSense):
 *   in-article  NEXT_PUBLIC_AD_SLOT_IN_ARTICLE   episode, blog, best-jokes pages
 *   sidebar     NEXT_PUBLIC_AD_SLOT_SIDEBAR      sticky right rail on desktop
 *   in-feed     NEXT_PUBLIC_AD_SLOT_IN_FEED      between sections on show pages
 *
 * Each slot reserves its height before the ad loads so the page doesn't jump.
 *
 * NEXT_PUBLIC_ADS_ON=1 turns the slots on. Leave it unset until AdSense approves
 * the site: before approval Google serves nothing and the page would show empty
 * "Advertisement" boxes. Slots Google leaves unfilled collapse (globals.css).
 */
export type AdPlacement = 'in-article' | 'sidebar' | 'in-feed';

const ADS_ON = process.env.NEXT_PUBLIC_ADS_ON === '1';
const PUBLISHER_ID = ADS_ON ? process.env.NEXT_PUBLIC_ADSENSE_ID || '' : '';
const SLOTS: Record<AdPlacement, string> = {
  'in-article': process.env.NEXT_PUBLIC_AD_SLOT_IN_ARTICLE || '',
  sidebar: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || '',
  'in-feed': process.env.NEXT_PUBLIC_AD_SLOT_IN_FEED || '',
};
const MIN_HEIGHT: Record<AdPlacement, string> = {
  'in-article': 'min-h-[280px]',
  sidebar: 'min-h-[600px]',
  'in-feed': 'min-h-[250px]',
};

export function adsEnabled(placement: AdPlacement): boolean {
  return !!PUBLISHER_ID && !!SLOTS[placement];
}

export default function AdSlot({ placement, className = '' }: { placement: AdPlacement; className?: string }) {
  const pushed = useRef(false);
  const slot = SLOTS[placement];

  useEffect(() => {
    if (!PUBLISHER_ID || !slot || pushed.current) return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      /* script blocked or not loaded yet */
    }
  }, [slot]);

  if (!PUBLISHER_ID || !slot) return null;

  return (
    <aside aria-label="Advertisement" className={`not-prose ${className}`}>
      <p className="text-[9px] uppercase tracking-[0.2em] text-brand-text-muted/70 mb-1.5 text-center">Advertisement</p>
      <div className={`${MIN_HEIGHT[placement]} w-full bg-brand-surface/40 rounded-lg overflow-hidden`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={slot}
          data-ad-format={placement === 'sidebar' ? 'vertical' : 'auto'}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
