import { DESIGN_TEMPLATES } from '../../data/designTemplates';
import type { DesignTemplateId } from '../../types';

export function TemplatePicker({
  activeId,
  onSelect,
}: {
  activeId: DesignTemplateId;
  onSelect: (id: DesignTemplateId) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {DESIGN_TEMPLATES.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`flex flex-col gap-3 rounded-none border p-4 text-left transition-all ${
            activeId === t.id ? 'border-brand ring-2 ring-brand/20' : 'border-hairline hover:border-ink-muted/40'
          }`}
        >
          <div className="h-20 overflow-hidden rounded-lg" style={{ backgroundColor: t.bg }}>
            <div className="h-6" style={{ backgroundColor: t.primary }} />
            <div className="flex gap-1.5 p-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: t.primary }} />
              <div className="h-2 w-10 rounded-full" style={{ backgroundColor: t.accent }} />
            </div>
            <div className="mx-2 h-1.5 w-3/4 rounded-full" style={{ backgroundColor: t.ink, opacity: 0.15 }} />
          </div>
          <div>
            <p className="text-[13.5px] font-bold text-ink-strong">
              {t.name} {activeId === t.id && <span className="text-brand">✓</span>}
            </p>
            <p className="mt-0.5 text-[12px] text-ink-muted">{t.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
