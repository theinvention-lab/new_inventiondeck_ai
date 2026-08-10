import type { BizCard } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CATEGORY_LABEL } from '../../data/taxonomy';

// Example text sometimes arrives as a single run-on line with inline
// "1. … 2. … 3. …" enumeration (Supabase-authored content isn't guaranteed
// to include real line breaks) — split those into separate entries so each
// numbered example can render in its own section instead of one dense block.
function splitExamples(text: string): string[] {
  return text
    .split(/(?=\d+\.\s)/)
    .map((s) => s.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

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
  const examples = card ? splitExamples(card.example) : [];

  return (
    <Dialog open={!!card} onClose={onClose} size="md">
      {card && (
        <div className="flex flex-col gap-2.5">
          <Badge tone="brand" className="w-fit">
            {CATEGORY_LABEL[card.category]}
          </Badge>
          <h2 className="text-[17.5px] font-bold text-ink-strong">{card.title}</h2>
          <p className="text-[13.5px] leading-relaxed text-ink-muted">{card.description}</p>
          {examples.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {examples.map((example, i) => (
                <div key={i} className="rounded-none bg-canvas-sunken p-2.5">
                  {examples.length > 1 && (
                    <p className="mb-0.5 text-[10.5px] font-bold text-ink-faint">예시 {i + 1}</p>
                  )}
                  <p className="text-[12.5px] leading-relaxed text-ink-muted">{example}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-1 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              닫기
            </Button>
            <Button
              size="sm"
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
