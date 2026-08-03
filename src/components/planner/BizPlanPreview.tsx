import type { PlanSection } from '../../types';
import type { DesignTemplate } from '../../data/designTemplates';

export function BizPlanPreview({ title, sections, template }: { title: string; sections: PlanSection[]; template: DesignTemplate }) {
  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-hairline shadow-sm" style={{ backgroundColor: template.bg }}>
      <div className="px-8 py-10" style={{ backgroundColor: template.primary }}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">Business Plan</p>
        <h1 className="mt-2 text-[26px] font-bold text-white">{title || '사업계획서'}</h1>
        <p className="mt-2 text-[12px] text-white/70">{new Date().toLocaleDateString('ko-KR')}</p>
      </div>
      <div className="flex flex-col gap-6 px-8 py-8">
        {sections.map((s, idx) => (
          <div key={s.id}>
            <h2 className="text-[14.5px] font-bold" style={{ color: template.primary }}>
              {idx + 1}. {s.title}
            </h2>
            <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed" style={{ color: template.ink }}>
              {s.content || '(작성된 내용이 없습니다)'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
