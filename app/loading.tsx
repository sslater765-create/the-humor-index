import { LAUGH_MAP_BARS } from '@/components/brand/LaughMapMark';

// Shown while a dynamic page (profiles, lists) loads: the Laugh Map mark,
// bars rising in turn.
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="flex h-10 items-end gap-1">
        {LAUGH_MAP_BARS.map((h, i) => (
          <span
            key={i}
            className="w-1.5 rounded-sm bg-brand-gold animate-pulse"
            style={{ height: `${20 + h * 80}%`, opacity: 0.35 + h * 0.65, animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
