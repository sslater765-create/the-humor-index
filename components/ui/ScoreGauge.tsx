interface Props {
  score: number;
  size?: number;
  label?: string;
}

export default function ScoreGauge({ score, size = 120, label }: Props) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / 100, 1);
  const strokeDashoffset = circumference * (1 - progress);

  // Color based on score
  const color = score >= 85 ? '#E8B931' : score >= 75 ? '#BA7517' : score >= 65 ? '#378ADD' : score >= 55 ? '#888780' : '#5F5E5A';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label={`Score: ${score.toFixed(1)} out of 100`}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2D2D2D"
            strokeWidth={6}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-medium" style={{ color }}>
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] text-brand-text-muted">/ 100</span>
        </div>
      </div>
      {label && (
        <p className="text-xs uppercase tracking-widest text-brand-text-muted mt-2">{label}</p>
      )}
    </div>
  );
}
