interface TabItem {
  id: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, activeId, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex items-center gap-1 overflow-x-auto ${className}`} role="tablist">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`relative flex shrink-0 items-center gap-1.5 px-3 py-2 text-[14px] font-semibold transition-colors ${
              active ? 'text-ink-strong' : 'text-ink-faint hover:text-ink-muted'
            }`}
          >
            {item.label}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[11px] font-bold text-brand-strong">
                {item.badge}
              </span>
            )}
            {active && <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-brand" />}
          </button>
        );
      })}
    </div>
  );
}
