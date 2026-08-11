import type { BuilderTemplateDef, FormulaPart, TemplateSectionDef } from '../../data/builderTemplates';
import { Textarea } from '../ui/Textarea';

interface FormulaRow {
  lead?: string;
  blank: Extract<FormulaPart, { type: 'blank' }>;
  trail?: string;
}

// Splits a mad-libs formula into one row per blank, attaching the connector
// text that surrounds it. Text before the first blank becomes that row's lead;
// any other text trails the blank it follows.
function toRows(formula: FormulaPart[]): FormulaRow[] {
  const rows: FormulaRow[] = [];
  let pendingLead: string | undefined;

  for (const part of formula) {
    if (part.type === 'blank') {
      rows.push({ lead: pendingLead, blank: part });
      pendingLead = undefined;
    } else if (rows.length === 0) {
      pendingLead = (pendingLead ?? '') + part.text;
    } else {
      const last = rows[rows.length - 1];
      last.trail = (last.trail ?? '') + part.text;
    }
  }
  return rows;
}

function FormulaSection({
  section,
  values,
  onChange,
}: {
  section: TemplateSectionDef;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}) {
  const formula = section.formula!;
  const rows = toRows(formula);
  const filled = rows.filter((r) => values[r.blank.id]?.trim()).length;

  return (
    <>
      <div className="flex flex-col gap-3">
        {rows.map((row, idx) => (
          <div key={row.blank.id} className="grid gap-1.5 sm:grid-cols-[168px_minmax(0,1fr)] sm:items-start sm:gap-4">
            <div className="flex items-baseline gap-2 sm:pt-2.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center bg-canvas-sunken text-[10px] font-bold text-ink-faint">
                {idx + 1}
              </span>
              <span className="text-[12px] font-semibold leading-snug text-ink-strong">{row.blank.label}</span>
            </div>
            <div className="min-w-0">
              <Textarea
                rows={2}
                placeholder={row.blank.placeholder}
                value={values[row.blank.id] ?? ''}
                onChange={(e) => onChange(row.blank.id, e.target.value)}
                style={{ borderRadius: 0 }}
              />
              <p className="mt-1 text-[11px] text-ink-faint">
                {row.lead?.trim() && <span>{row.lead.trim()} </span>}
                <span className="text-ink-muted">___</span>
                {row.trail?.trim() && <span> {row.trail.trim()}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-l-2 border-brand bg-canvas-sunken/60 px-4 py-3">
        <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-faint">
          완성된 문장 · {filled}/{rows.length}
        </p>
        <p className="text-[13.5px] leading-relaxed text-ink-strong">
          {formula.map((part, i) =>
            part.type === 'text' ? (
              <span key={i} className="text-ink-muted">
                {part.text}
              </span>
            ) : values[part.id]?.trim() ? (
              <span key={i} className="font-bold">
                {values[part.id].trim()}
              </span>
            ) : (
              <span key={i} className="text-ink-faint">
                ______
              </span>
            ),
          )}
        </p>
      </div>
    </>
  );
}

// Maps each BMC field id to its area name in the classic Osterwalder canvas
// grid: Key Partners | Key Activities / Key Resources | Value Propositions |
// Customer Relationships / Channels | Customer Segments, with Cost Structure
// and Revenue Streams spanning the bottom row.
const BMC_AREAS: Record<string, string> = {
  keyPartners: 'partners',
  keyActivities: 'activities',
  keyResources: 'resources',
  valuePropositions: 'value',
  customerRelationships: 'relationships',
  channels: 'channels',
  customerSegments: 'segments',
  costStructure: 'cost',
  revenueStreams: 'revenue',
};

function BMCGrid({
  template,
  values,
  onChange,
}: {
  template: BuilderTemplateDef;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-none border border-hairline bg-hairline">
      <div
        className="grid min-w-[920px] gap-px"
        style={{
          gridTemplateColumns: 'repeat(5, minmax(160px, 1fr))',
          gridTemplateRows: 'minmax(170px, auto) minmax(170px, auto) minmax(130px, auto)',
          gridTemplateAreas: `"partners activities value relationships segments" "partners resources value channels segments" "cost cost revenue revenue revenue"`,
        }}
      >
        {template.fields.map((f) => (
          <div key={f.id} style={{ gridArea: BMC_AREAS[f.id] }} className="flex flex-col gap-1.5 bg-white p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-strong">{f.label}</p>
            <textarea
              className="w-full flex-1 resize-none border-0 bg-transparent p-0 text-[12px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
              placeholder={f.placeholder}
              value={values[f.id] ?? ''}
              onChange={(e) => onChange(f.id, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TemplateFieldsForm({
  template,
  values,
  onChange,
}: {
  template: BuilderTemplateDef;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}) {
  if (template.layout === 'grid-bmc') {
    return <BMCGrid template={template} values={values} onChange={onChange} />;
  }

  if (template.sections) {
    return (
      <div className="flex flex-col divide-y divide-hairline rounded-none border border-hairline bg-white px-7">
        {template.sections.map((section) => (
          <section key={section.id} className="py-6">
            <div className="mb-3.5">
              <h3 className="text-[14px] font-bold text-ink-strong">{section.title}</h3>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">{section.subtitle}</p>
            </div>

            {section.formula ? (
              <FormulaSection section={section} values={values} onChange={onChange} />
            ) : (
              section.textFieldId && (
                <Textarea
                  rows={3}
                  placeholder={section.textPlaceholder}
                  value={values[section.textFieldId] ?? ''}
                  onChange={(e) => onChange(section.textFieldId!, e.target.value)}
                  style={{ borderRadius: 0 }}
                />
              )
            )}
          </section>
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
