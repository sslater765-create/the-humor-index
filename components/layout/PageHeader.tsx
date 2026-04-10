interface Props {
  label?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ label, title, subtitle, children }: Props) {
  return (
    <div className="border-b border-brand-border bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {label && (
          <p className="text-xs uppercase tracking-widest text-brand-text-muted mb-2">{label}</p>
        )}
        <h1 className="text-2xl sm:text-3xl font-medium text-brand-text-primary">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-brand-text-secondary text-sm">{subtitle}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
