'use client';

// Homepage hero — portrait "how the Humor Index works" explainer.
// Click-to-play (no autoplay): the poster (next/image, priority) is the LCP
// element; the video is preload="none" and only loads when the user clicks
// play. Loops once started.
// Assets live in /public/hero/ (hero-explainer.*, hero-explainer-poster.webp).

import { useRef, useState } from 'react';
import Image from 'next/image';

export default function HeroLoop({ className = '' }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    setStarted(true);
    v.play().catch(() => {});
  };

  return (
    <div
      className={`group relative aspect-[4/5] overflow-hidden rounded-2xl border border-brand-border bg-brand-surface ${className}`}
    >
      <Image
        src="/hero/hero-explainer-poster.webp"
        alt="How the Humor Index scores a joke: five-axis craft rubric"
        fill
        priority
        sizes="(max-width: 1024px) 90vw, 380px"
        className="object-cover"
      />

      <video
        ref={videoRef}
        playsInline
        preload="none"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          started ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src="/hero/hero-explainer.mp4" type="video/mp4" />
        <source src="/hero/hero-explainer.webm" type="video/webm" />
      </video>

      {!started && (
        <button
          type="button"
          onClick={play}
          aria-label="Play: how the Humor Index works"
          className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors hover:bg-black/25"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold shadow-lg transition-transform group-hover:scale-105">
            <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
              <path d="M2 2 L20 12 L2 22 Z" fill="#0F0F0F" />
            </svg>
          </span>
          <span className="absolute inset-x-0 bottom-4 text-center text-xs uppercase tracking-[0.2em] text-brand-text-primary/90">
            Watch how it works
          </span>
        </button>
      )}
    </div>
  );
}
