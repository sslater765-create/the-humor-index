interface Props {
  label: React.ReactNode;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}

export default function ScoreCard({ label, value, sub, highlight }: Props) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-3 sm:p-5">
      <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-text-muted mb-1 sm:mb-2">{label}</p>
      <p className={`font-mono text-xl sm:text-2xl font-medium ${highlight ? 'text-brand-gold' : 'text-brand-text-primary'}`}>
        {typeof value === 'number' ? (Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)) : value}
      </p>
      {sub && <p className="text-[10px] sm:text-xs text-brand-text-muted mt-1 hidden sm:block">{sub}</p>}
    </div>
  );
}
