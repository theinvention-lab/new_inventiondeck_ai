import type { BizCard } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CATEGORY_LABEL } from '../../data/taxonomy';

export function CardDetailDialog({
  card,
  selected,
  onClose,
  onToggle,
}: {
  card: BizCard | null;
  selected: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  return (
    <Dialog open={!!card} onClose={onClose} size="sm">
      {card && (
        <div className="flex flex-col gap-3">
          <Badge tone="brand" className="w-fit">
            {CATEGORY_LABEL[card.category]}
          </Badge>
          <h2 className="text-[18px] font-bold text-ink-strong">{card.title}</h2>
          <p className="text-[13.5px] leading-relaxed text-ink-muted">{card.description}</p>
          <div className="rounded-lg bg-canvas-sunken p-3 text-[12.5px] leading-relaxed text-ink-muted">
            {card.example}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {card.tags.map((t) => (
              <span key={t} className="rounded-full bg-white border border-hairline px-2 py-0.5 text-[11px] text-ink-muted">
                #{t}
              </span>
            ))}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
            <Button
              onClick={() => {
                onToggle();
                onClose();
              }}
            >
              {selected ? '선택 해제' : '조합에 담기'}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
