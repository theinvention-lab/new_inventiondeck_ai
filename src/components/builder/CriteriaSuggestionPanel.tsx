import type { CriterionSuggestion } from '../../ai/criteriaEngine';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function CriteriaSuggestionPanel({
  suggestions,
  selectedIds,
  onToggle,
  onAdd,
  onDismiss,
}: {
  suggestions: CriterionSuggestion[];
  selectedIds: string[];
  onToggle: (moduleId: string) => void;
  onAdd: () => void;
  onDismiss: () => void;
}) {
  if (suggestions.length === 0) {
    return (
      <div className="rounded-none border border-hairline bg-white p-5">
        <p className="text-[13px] text-ink-muted">
          지금 작성된 내용으로 추가로 담을 만한 기준을 찾지 못했어요. ①·② 탭 내용을 더 채운 뒤 다시 시도해보세요.
        </p>
        <div className="mt-3">
          <Button size="sm" variant="outline" onClick={onDismiss}>
            닫기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-none border border-brand bg-white">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
        <div>
          <p className="text-[13.5px] font-bold text-ink-strong">AI가 고른 점검 기준 {suggestions.length}개</p>
          <p className="mt-0.5 text-[12px] text-ink-muted">
            작성하신 아이디어에 필요한 기준만 골랐어요. 담을 항목을 선택해주세요.
          </p>
        </div>
        <button onClick={onDismiss} aria-label="닫기" className="text-ink-faint hover:text-ink-strong">
          ✕
        </button>
      </div>

      <div className="flex max-h-[420px] flex-col divide-y divide-hairline overflow-y-auto">
        {suggestions.map(({ module, reason }) => {
          const checked = selectedIds.includes(module.id);
          return (
            <label
              key={module.id}
              className={`flex cursor-pointer items-start gap-3 px-5 py-3.5 transition-colors ${
                checked ? 'bg-brand-soft/30' : 'hover:bg-canvas-sunken/60'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(module.id)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brand)]"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-bold text-ink-strong">{module.name}</span>
                  <Badge tone="outline">{module.group}</Badge>
                </div>
                <p className="mt-0.5 text-[12px] text-ink-muted">{module.description}</p>
                <p className="mt-1 text-[11.5px] text-brand-strong">→ {reason}</p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-hairline px-5 py-3">
        <span className="text-[12px] text-ink-faint">{selectedIds.length}개 선택됨</span>
        <Button size="sm" onClick={onAdd} disabled={selectedIds.length === 0}>
          선택한 기준 담기
        </Button>
      </div>
    </div>
  );
}
