import { BUILDER_TEMPLATES } from '../../data/builderTemplates';
import type { BuilderTemplateId } from '../../types';

export function TemplateSelector({
  activeId,
  onSelect,
  filledCount,
}: {
  activeId: BuilderTemplateId;
  onSelect: (id: BuilderTemplateId) => void;
  filledCount: (id: BuilderTemplateId) => number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {BUILDER_TEMPLATES.map((t) => {
        const active = t.id === activeId;
        const count = filledCount(t.id);
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
              active ? 'border-brand bg-brand-soft/40 ring-2 ring-brand/20' : 'border-hairline bg-white hover:border-ink-muted/40'
            }`}
          >
            <div className="flex w-full items-start justify-between">
              <span className="text-[22px]">{t.icon}</span>
              {count > 0 && (
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10.5px] font-bold text-brand-strong">
                  {count}/{t.fields.length} 작성됨
                </span>
              )}
            </div>
            <div>
              <p className="text-[14px] font-bold text-ink-strong">
                {t.name} {active && <span className="text-brand">✓</span>}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{t.shortName}</p>
            </div>
            <p className="text-[12px] leading-relaxed text-ink-muted">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}
