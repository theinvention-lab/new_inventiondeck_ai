import type { PitchSlide } from '../../types';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';

function updateBullet(bullets: string[], idx: number, value: string): string[] {
  const next = [...bullets];
  next[idx] = value;
  return next;
}

export function PitchSlideEditor({
  slide,
  onChange,
}: {
  slide: PitchSlide;
  onChange: (patch: Partial<PitchSlide>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-none border border-hairline bg-white p-4">
      <input
        value={slide.title}
        onChange={(e) => onChange({ title: e.target.value })}
        className="bg-transparent text-[15px] font-bold text-ink-strong outline-none"
      />
      <div className="flex flex-col gap-2">
        {slide.bullets.map((b, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-ink-faint">•</span>
            <input
              value={b}
              onChange={(e) => onChange({ bullets: updateBullet(slide.bullets, idx, e.target.value) })}
              className="flex-1 rounded-md border border-hairline-strong bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
            />
            <button
              onClick={() => onChange({ bullets: slide.bullets.filter((_, i) => i !== idx) })}
              className="text-[11px] text-danger"
            >
              삭제
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange({ bullets: [...slide.bullets, ''] })}
          className="w-fit text-[12px] font-semibold text-brand"
        >
          + 항목 추가
        </button>
      </div>
      <Textarea label="발표 노트" rows={2} value={slide.note} onChange={(e) => onChange({ note: e.target.value })} />
      <Select label="차트 유형" value={slide.chart ?? 'none'} onChange={(e) => onChange({ chart: e.target.value as PitchSlide['chart'] })}>
        <option value="none">차트 없음</option>
        <option value="bar">막대 그래프</option>
        <option value="line">선 그래프</option>
      </Select>
    </div>
  );
}
