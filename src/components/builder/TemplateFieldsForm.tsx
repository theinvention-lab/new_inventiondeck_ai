import type { BuilderTemplateDef, TemplateSectionDef } from '../../data/builderTemplates';
import { Textarea } from '../ui/Textarea';

export function TemplateFieldsForm({
  template,
  values,
  onChange,
  onDraftSection,
}: {
  template: BuilderTemplateDef;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  onDraftSection?: (section: TemplateSectionDef) => void;
}) {
  if (template.sections) {
    return (
      <div className="flex flex-col gap-4 rounded-none border border-hairline bg-white p-5">
        <div className="flex items-center gap-2">
          <span className="text-[20px]">{template.icon}</span>
          <div>
            <p className="text-[14.5px] font-bold text-ink-strong">{template.name}</p>
            <p className="text-[12px] text-ink-muted">{template.description}</p>
          </div>
        </div>

        {template.sections.map((section) => (
          <div key={section.id} className="rounded-none border border-hairline bg-canvas-sunken/40 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[13.5px] font-bold text-brand-strong">{section.title}</p>
                <p className="text-[11.5px] text-ink-muted">{section.subtitle}</p>
              </div>
              {onDraftSection && (
                <button
                  onClick={() => onDraftSection(section)}
                  aria-label={`${section.title} AI로 초안 작성`}
                  title="AI로 초안 작성"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-none bg-ink-strong text-[12.5px] text-white hover:opacity-80"
                >
                  ✨
                </button>
              )}
            </div>

            {section.formula && (
              <div className="mb-3 flex flex-wrap items-end gap-x-2 gap-y-2 border border-hairline bg-white p-3 text-[12.5px] leading-relaxed">
                {section.formula.map((part, i) =>
                  part.type === 'text' ? (
                    <span key={i} className="pb-1.5 text-ink-muted">
                      {part.text}
                    </span>
                  ) : (
                    <div key={i} className="flex w-56 max-w-full flex-col gap-0.5 rounded-none bg-canvas-sunken px-2 py-1.5">
                      <span className="text-[9.5px] font-semibold text-ink-faint">{part.label}</span>
                      <textarea
                        rows={2}
                        value={values[part.id] ?? ''}
                        onChange={(e) => onChange(part.id, e.target.value)}
                        className="w-full resize-none bg-transparent text-[12.5px] font-semibold leading-snug text-ink-strong outline-none"
                      />
                    </div>
                  ),
                )}
              </div>
            )}

            <Textarea
              rows={3}
              placeholder={section.textPlaceholder}
              value={values[section.textFieldId] ?? ''}
              onChange={(e) => onChange(section.textFieldId, e.target.value)}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-none border border-hairline bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[20px]">{template.icon}</span>
        <div>
          <p className="text-[14.5px] font-bold text-ink-strong">{template.name}</p>
          <p className="text-[12px] text-ink-muted">{template.description}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {template.fields.map((f) => (
          <Textarea
            key={f.id}
            label={f.label}
            rows={3}
            placeholder={f.placeholder}
            value={values[f.id] ?? ''}
            onChange={(e) => onChange(f.id, e.target.value)}
          />
        ))}
      </div>
    </div>
  );
}
