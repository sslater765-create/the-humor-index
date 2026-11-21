/**
 * The Humor Index mark: a tiny Laugh Map. Bars run left to right like an
 * episode's runtime; taller and brighter means funnier, with a slump in the
 * middle and the peak late, the way the best episodes build. Same drawing as
 * app/icon.svg and the share-card stamp.
 */
export const LAUGH_MAP_BARS: ReadonlyArray<number> = [0.45, 0.7, 0.3, 0.55, 0.8, 1, 0.6];

export default function LaughMapMark({ size = 18, className = '' }: { size?: number; className?: string }) {
  const n = LAUGH_MAP_BARS.length;
  const w = 24 / n;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      {LAUGH_MAP_BARS.map((h, i) => {
        const height = 4 + h * 18;
        return (
          <rect
            key={i}
            x={i * w + 0.5}
            y={22 - height}
            width={w - 1}
            height={height}
            rx={0.8}
            fill="#E8B931"
            fillOpacity={0.35 + h * 0.65}
          />
        );
      })}
    </svg>
  );
}
