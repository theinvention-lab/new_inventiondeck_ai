import type { PlanSection } from '../../types';
import { Textarea } from '../ui/Textarea';

export function BizPlanEditor({
  sections,
  onChange,
}: {
  sections: PlanSection[];
  onChange: (id: string, patch: Partial<PlanSection>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {sections.map((section, idx) => (
        <div key={section.id} className="rounded-none border border-hairline bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[11px] font-bold text-ink-muted">
              {idx + 1}
            </span>
            <input
              value={section.title}
              onChange={(e) => onChange(section.id, { title: e.target.value })}
              className="flex-1 bg-transparent text-[14.5px] font-bold text-ink-strong outline-none"
            />
          </div>
          <Textarea rows={4} value={section.content} onChange={(e) => onChange(section.id, { content: e.target.value })} />
        </div>
      ))}
    </div>
  );
}
