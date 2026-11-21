'use client';
import { useState } from 'react';

/** Five stars in half steps. Click the same value again to clear it. */
export default function StarInput({
  value,
  onChange,
  size = 26,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  size?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)} role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = shown >= n ? 1 : shown >= n - 0.5 ? 0.5 : 0;
        return (
          <span key={n} className="relative inline-block" style={{ width: size, height: size }}>
            <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="absolute inset-0">
              <defs>
                <linearGradient id={`star-half-${n}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
                className={fill > 0 ? 'text-brand-gold' : 'text-brand-text-muted'}
                fill={fill === 1 ? 'currentColor' : fill === 0.5 ? `url(#star-half-${n})` : 'none'}
                stroke="currentColor"
                strokeWidth={1.4}
              />
            </svg>
            {[n - 0.5, n].map((v, i) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={value === v}
                aria-label={`${v} star${v === 1 ? '' : 's'}`}
                className={`absolute top-0 h-full w-1/2 ${i === 0 ? 'left-0' : 'right-0'}`}
                onMouseEnter={() => setHover(v)}
                onClick={() => onChange(value === v ? null : v)}
              />
            ))}
          </span>
        );
      })}
      <span className="ml-2 w-8 font-mono text-sm text-brand-text-secondary">{value !== null ? value.toFixed(1) : ''}</span>
    </div>
  );
}
