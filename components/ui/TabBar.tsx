'use client';

interface Tab {
  id: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export default function TabBar({ tabs, active, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl w-fit">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`text-sm px-4 py-1.5 rounded-lg transition-all ${
            active === tab.id
              ? 'bg-brand-gold text-black font-medium'
              : 'text-brand-text-secondary hover:text-brand-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
