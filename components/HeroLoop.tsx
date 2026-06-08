'use client';

// Homepage hero loop — Steamed Hams "Aurora Borealis" scene with joke-score
// overlays + animated HI score card. Performance-safe:
//   - The poster (next/image, priority) is the LCP element and paints instantly.
//   - The <video> is preload="none" and only loads/plays when scrolled into view
//     (IntersectionObserver), then fades in over the poster.
//   - prefers-reduced-motion: renders the poster only, no video.
// Assets live in /public/hero/ (see APPLY.md).

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function HeroLoop({ className = '' }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const v = videoRef.current;
    if (!v || mq.matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`relative w-full aspect-video overflow-hidden rounded-2xl border border-brand-border bg-brand-surface ${className}`}
    >
      <Image
        src="/hero/hero-poster.webp"
        alt="The Simpsons scored 79.9 on the Humor Index"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 768px"
        className="object-cover"
      />
      {!reduced && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster="/hero/hero-poster.webp"
          aria-label="The Humor Index scores the Steamed Hams scene from The Simpsons in real time"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500"
          onLoadedData={(e) => {
            (e.currentTarget as HTMLVideoElement).style.opacity = '1';
          }}
        >
          <source src="/hero/hero-loop.webm" type="video/webm" />
          <source src="/hero/hero-loop.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
