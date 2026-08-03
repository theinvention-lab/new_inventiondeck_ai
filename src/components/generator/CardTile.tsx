import type { BizCard } from '../../types';
import { CATEGORY_COLOR, CATEGORY_LABEL } from '../../data/taxonomy';

interface CardTileProps {
  card: BizCard;
  selected: boolean;
  onToggle: () => void;
  onOpenDetail: () => void;
}

export function CardTile({ card, selected, onToggle, onOpenDetail }: CardTileProps) {
  const color = CATEGORY_COLOR[card.category];
  return (
    <div
      className={`group relative flex h-full flex-col gap-2 rounded-xl border p-3.5 transition-all ${
        selected ? 'border-brand bg-brand-soft/50 shadow-sm' : 'border-hairline bg-white hover:border-ink-muted/40 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10.5px] font-bold"
          style={{ color, backgroundColor: `${color}1a` }}
        >
          {CATEGORY_LABEL[card.category]}
        </span>
        {card.popularity >= 80 && (
          <span className="text-[10.5px] font-bold text-warning" title="인기 카드">
            🔥
          </span>
        )}
      </div>
      <button onClick={onOpenDetail} className="text-left">
        <h3 className="text-[13.5px] font-bold leading-snug text-ink-strong line-clamp-2">{card.title}</h3>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted line-clamp-2">{card.description}</p>
      </button>
      <div className="mt-auto flex items-center justify-between pt-1.5">
        <div className="flex flex-wrap gap-1">
          {card.tags.slice(0, 2).map((t) => (
            <span key={t} className="rounded-full bg-canvas-sunken px-1.5 py-0.5 text-[10px] text-ink-faint">
              #{t}
            </span>
          ))}
        </div>
        <button
          onClick={onToggle}
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
            selected ? 'bg-brand text-white' : 'bg-canvas-sunken text-ink-muted hover:bg-hairline'
          }`}
        >
          {selected ? '선택됨 ✓' : '담기'}
        </button>
      </div>
    </div>
  );
}
