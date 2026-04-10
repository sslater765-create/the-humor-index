interface Props {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}

export default function ScoreCard({ label, value, sub, highlight }: Props) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5">
      <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">{label}</p>
      <p className={`font-mono text-2xl font-medium ${highlight ? 'text-brand-gold' : 'text-brand-text-primary'}`}>
        {typeof value === 'number' ? value.toFixed(1) : value}
      </p>
      {sub && <p className="text-xs text-brand-text-muted mt-1">{sub}</p>}
    </div>
  );
}
