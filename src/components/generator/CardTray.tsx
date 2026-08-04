import type { BizCard } from '../../types';
import { CATEGORY_COLOR } from '../../data/taxonomy';

export function CardTray({ cards, onRemove }: { cards: BizCard[]; onRemove: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-[12.5px] font-bold text-ink-muted">
        선택한 카드 <span className="text-brand">{cards.length}</span>
        <span className="text-ink-faint">/최소 2</span>
      </span>
      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
        {cards.length === 0 ? (
          <span className="text-[12.5px] text-ink-faint">카드를 담으면 여기에 표시됩니다</span>
        ) : (
          cards.map((c) => (
            <span
              key={c.id}
              className="flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-2.5 pr-1.5 text-[12px] font-medium text-white"
              style={{ backgroundColor: CATEGORY_COLOR[c.category] }}
            >
              {c.title}
              <button
                onClick={() => onRemove(c.id)}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[10px] hover:bg-white/40"
                aria-label={`${c.title} 제거`}
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
