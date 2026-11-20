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
    // Scrolls sideways on narrow phones instead of widening the page.
    <div className="flex gap-1 p-1 bg-brand-surface border border-brand-border rounded-xl w-fit max-w-full overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`shrink-0 whitespace-nowrap text-sm px-4 py-1.5 rounded-lg transition-all ${
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
