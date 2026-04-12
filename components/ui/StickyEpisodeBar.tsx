'use client';
import { useState, useEffect } from 'react';
import { formatIndex } from '@/lib/scoring';

interface Props {
  title: string;
  season: number;
  episode: number;
  humorIndex: number;
}

export default function StickyEpisodeBar({ title, season, episode, humorIndex }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 280);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`sm:hidden fixed top-14 left-0 right-0 z-30 bg-brand-dark/95 backdrop-blur-md border-b border-brand-border transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="truncate">
          <span className="text-xs text-brand-text-muted">
            S{season}E{String(episode).padStart(2, '0')}
          </span>
          <span className="text-sm text-brand-text-primary ml-2 truncate">{title}</span>
        </div>
        <span className="font-mono text-sm text-brand-gold font-medium shrink-0 ml-3">
          {formatIndex(humorIndex)}
        </span>
      </div>
    </div>
  );
}
