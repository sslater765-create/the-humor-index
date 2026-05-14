'use client';
import { useEffect, useRef } from 'react';
import { trackEpisodeViewDeep } from '@/lib/analytics';

/**
 * Fires `episode_view_deep` once when the user has scrolled past 75% of the
 * page on an episode detail page. Dropped inside the server-rendered episode
 * page so the tracking is opt-in and silent if GA isn't loaded.
 */
export default function EpisodeDeepViewTracker({
  show,
  season,
  episode,
}: {
  show: string;
  season: number;
  episode: number;
}) {
  const fired = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (fired.current) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total > 0 && scrolled / total >= 0.75) {
        trackEpisodeViewDeep(show, season, episode);
        fired.current = true;
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Also check on mount in case the page is short
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [show, season, episode]);

  return null;
}
