interface Props {
  rank: number;
}

export default function RankBadge({ rank }: Props) {
  const isTop = rank <= 3;
  return (
    <span
      className={`font-mono text-xs w-7 h-7 flex items-center justify-center rounded-full border ${
        isTop
          ? 'border-brand-gold text-brand-gold'
          : 'border-brand-border text-brand-text-muted'
      }`}
      aria-label={`Rank ${rank}`}
      role="img"
    >
      {rank}
    </span>
  );
}
