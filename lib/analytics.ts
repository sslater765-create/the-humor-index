/**
 * Thin wrapper over window.gtag. Safe in SSR (no-op), safe when GA isn't loaded.
 * Call from 'use client' components after any meaningful user action we want
 * to track as a key event (conversion) in GA4.
 */

type GtagEventParams = {
  [key: string]: string | number | boolean | undefined;
};

export function trackEvent(name: string, params: GtagEventParams = {}) {
  if (typeof window === 'undefined') return;
  const g = (window as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof g !== 'function') return;
  g('event', name, params);
}

// Convenience wrappers for our most important events
export const trackNewsletterSignup = (method: string) =>
  trackEvent('newsletter_signup', { method });

export const trackCompareShows = (showA: string, showB: string) =>
  trackEvent('compare_shows', { show_a: showA, show_b: showB });

export const trackEpisodeViewDeep = (show: string, season: number, episode: number) =>
  trackEvent('episode_view_deep', { show, season, episode });

export const trackShareClick = (platform: string, url: string) =>
  trackEvent('share_click', { platform, page_url: url });
