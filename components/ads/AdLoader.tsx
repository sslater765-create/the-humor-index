'use client';
import { useEffect } from 'react';

/**
 * Loads the AdSense script only after a sign of a person: a scroll, a tap, a
 * key, or mouse movement. Bots that render pages without interacting (most of
 * the "direct" traffic since Oct 31, 2026) never load ads, so they never
 * create the invalid impressions Google holds publishers responsible for.
 * Slots wait for the "hi-ads-ready" event before asking for an ad.
 */
const EVENTS = ['scroll', 'pointerdown', 'keydown', 'touchstart', 'mousemove'] as const;

export default function AdLoader({ client }: { client: string }) {
  useEffect(() => {
    const w = window as unknown as { __hiAdsReady?: boolean };
    if (w.__hiAdsReady) return;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      EVENTS.forEach((e) => window.removeEventListener(e, go));
      const s = document.createElement('script');
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      s.onload = () => { w.__hiAdsReady = true; window.dispatchEvent(new Event('hi-ads-ready')); };
      document.head.appendChild(s);
    };
    EVENTS.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
    return () => EVENTS.forEach((e) => window.removeEventListener(e, go));
  }, [client]);
  return null;
}
