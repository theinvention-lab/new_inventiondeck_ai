import type { IdeaDraft, IdeaSection } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { makeId } from '../../lib/id';

export function IdeaResultCard({
  idea,
  onChange,
}: {
  idea: IdeaDraft;
  onChange: (patch: Partial<IdeaDraft>) => void;
}) {
  const updateSection = (id: string, patch: Partial<IdeaSection>) => {
    onChange({ sections: idea.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  };

  const removeSection = (id: string) => {
    onChange({ sections: idea.sections.filter((s) => s.id !== id) });
  };

  const moveSection = (id: string, dir: -1 | 1) => {
    const idx = idea.sections.findIndex((s) => s.id === id);
    const target = idx + dir;
    if (target < 0 || target >= idea.sections.length) return;
    const next = [...idea.sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange({ sections: next });
  };

  const addSection = () => {
    onChange({ sections: [...idea.sections, { id: makeId('sec'), title: '새 섹션', content: '' }] });
  };

  return (
    <div className="flex flex-col gap-4">
      <Input label="아이디어 제목" value={idea.title} onChange={(e) => onChange({ title: e.target.value })} />
      <Textarea
        label="한 줄 요약"
        rows={2}
        value={idea.oneLiner}
        onChange={(e) => onChange({ oneLiner: e.target.value })}
      />

      <div className="flex flex-col gap-3">
        {idea.sections.map((section, idx) => (
          <div key={section.id} className="rounded-lg border border-hairline p-3.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <input
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="w-full bg-transparent text-[13.5px] font-bold text-ink-strong outline-none"
              />
              <div className="flex shrink-0 items-center gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => moveSection(section.id, -1)}
                  className="rounded p-1 text-[12px] text-ink-faint hover:bg-canvas-sunken disabled:opacity-30"
                  aria-label="위로 이동"
                >
                  ↑
                </button>
                <button
                  disabled={idx === idea.sections.length - 1}
                  onClick={() => moveSection(section.id, 1)}
                  className="rounded p-1 text-[12px] text-ink-faint hover:bg-canvas-sunken disabled:opacity-30"
                  aria-label="아래로 이동"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeSection(section.id)}
                  className="rounded p-1 text-[12px] text-danger hover:bg-danger-soft"
                  aria-label="섹션 삭제"
                >
                  삭제
                </button>
              </div>
            </div>
            <Textarea
              rows={3}
              value={section.content}
              onChange={(e) => updateSection(section.id, { content: e.target.value })}
            />
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addSection} className="self-start">
        + 섹션 추가
      </Button>
    </div>
  );
}
