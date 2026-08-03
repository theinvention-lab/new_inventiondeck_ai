import type { BizCard } from '../../types';
import { CATEGORY_LABEL } from '../../data/taxonomy';

export function RecommendedRail({ cards, onAdd }: { cards: BizCard[]; onAdd: (id: string) => void }) {
  if (cards.length === 0) return null;
  return (
    <div className="rounded-xl border border-hairline bg-brand-soft/30 p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="text-[13px] font-bold text-ink-strong">✨ 회원님을 위한 추천 카드</span>
        <span className="text-[11.5px] text-ink-faint">선택 이력을 바탕으로 골랐어요</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {cards.map((card) => (
          <div key={card.id} className="flex w-56 shrink-0 flex-col gap-1.5 rounded-none border border-hairline bg-white p-3">
            <span className="w-fit rounded-full bg-canvas-sunken px-2 py-0.5 text-[10px] font-bold text-ink-muted">
              {CATEGORY_LABEL[card.category]}
            </span>
            <p className="text-[12.5px] font-bold leading-snug text-ink-strong line-clamp-2">{card.title}</p>
            <button
              onClick={() => onAdd(card.id)}
              className="mt-auto self-start rounded-full bg-brand/10 px-2.5 py-1 text-[11.5px] font-semibold text-brand-strong hover:bg-brand/20"
            >
              + 아이데이션에 추가
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
