import type { BizCard } from '../../types';
import { CATEGORY_LABEL } from '../../data/taxonomy';

export function RecommendedRail({
  cards,
  onAdd,
  onOpenDetail,
}: {
  cards: BizCard[];
  onAdd: (id: string) => void;
  onOpenDetail: (card: BizCard) => void;
}) {
  if (cards.length === 0) {
    return (
      <p className="text-[12.5px] leading-relaxed text-ink-faint">
        카드를 선택하면 선택 이력을 바탕으로 관련 카드를 추천해드려요.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {cards.map((card) => (
        <div key={card.id} className="flex items-center gap-2.5 rounded-none border border-hairline bg-white p-2.5">
          <button onClick={() => onOpenDetail(card)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
            <span className="shrink-0 rounded-full bg-canvas-sunken px-2 py-0.5 text-[10px] font-bold text-ink-muted">
              {CATEGORY_LABEL[card.category]}
            </span>
            <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink-strong">{card.title}</p>
          </button>
          <button
            onClick={() => onAdd(card.id)}
            className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand-strong hover:bg-brand/20"
          >
            + 추가
          </button>
        </div>
      ))}
    </div>
  );
}
