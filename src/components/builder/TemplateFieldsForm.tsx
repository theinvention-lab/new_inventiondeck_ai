import type { BuilderTemplateDef } from '../../data/builderTemplates';
import { Textarea } from '../ui/Textarea';

export function TemplateFieldsForm({
  template,
  values,
  onChange,
}: {
  template: BuilderTemplateDef;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}) {
  if (template.sections) {
    return (
      <div className="flex flex-col gap-4 rounded-none border border-hairline bg-white px-8 py-5">
        <div className="flex flex-col divide-y divide-hairline">
          {template.sections.map((section) => (
            <div key={section.id} className="py-4 first:pt-0 last:pb-0">
              <div className="mb-3">
                <p className="text-[13.5px] font-bold text-brand-strong">{section.title}</p>
                <p className="text-[11.5px] text-ink-muted">{section.subtitle}</p>
              </div>

              {section.formula && (
                <div className="flex flex-wrap items-end gap-x-2 gap-y-2 text-[12.5px] leading-relaxed">
                  {section.formula.map((part, i) =>
                    part.type === 'text' ? (
                      <span key={i} className="pb-1.5 text-ink-muted">
                        {part.text}
                      </span>
                    ) : (
                      <div key={i} className="flex w-72 max-w-full flex-col gap-0.5 rounded-none bg-canvas-sunken px-2.5 py-2">
                        <span className="text-center text-[9.5px] font-semibold text-ink-faint">{part.label}</span>
                        <textarea
                          rows={3}
                          placeholder={part.placeholder}
                          value={values[part.id] ?? ''}
                          onChange={(e) => onChange(part.id, e.target.value)}
                          className="w-full resize-none bg-transparent text-center text-[12.5px] font-semibold leading-snug text-ink-strong outline-none placeholder:font-normal placeholder:text-ink-faint"
                        />
                      </div>
                    ),
                  )}
                </div>
              )}

              {section.textFieldId && (
                <Textarea
                  rows={3}
                  placeholder={section.textPlaceholder}
                  value={values[section.textFieldId] ?? ''}
                  onChange={(e) => onChange(section.textFieldId!, e.target.value)}
                  className="mt-3"
                />
              )}
            </div>
          ))}
        </div>
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
