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
