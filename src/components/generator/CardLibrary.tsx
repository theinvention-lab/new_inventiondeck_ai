import { useEffect, useMemo, useRef, useState } from 'react';
import type { BizCard, CardCategory } from '../../types';
import { useCardStore } from '../../store/cardStore';
import { CATEGORY_LABEL, CATEGORY_ORDER } from '../../data/taxonomy';
import { CardTile } from './CardTile';
import { Input } from '../ui/Input';

const PAGE_SIZE = 30;

export function CardLibrary({
  selectedIds,
  onToggle,
  onOpenDetail,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onOpenDetail: (card: BizCard) => void;
}) {
  const [category, setCategory] = useState<CardCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const allCards = useCardStore((s) => s.cards);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = allCards;
    if (category !== 'all') list = list.filter((c) => c.category === category);
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          c.description.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (q) {
      sorted.sort((a, b) => {
        const aScore = a.title.toLowerCase().startsWith(q) ? 1 : 0;
        const bScore = b.title.toLowerCase().startsWith(q) ? 1 : 0;
        return bScore - aScore || b.popularity - a.popularity;
      });
    } else {
      sorted.sort((a, b) => b.popularity - a.popularity);
    }
    return sorted;
  }, [allCards, category, query]);

  const visible = filtered.slice(0, visibleCount);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visibleCount >= filtered.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((v) => Math.min(v + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="키워드로 카드 검색 (예: 헬스케어, 구독, 시니어…)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setVisibleCount(PAGE_SIZE);
        }}
        className="sm:w-80"
        style={{ borderRadius: 0 }}
      />

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => {
            setCategory('all');
            setVisibleCount(PAGE_SIZE);
          }}
          className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
            category === 'all' ? 'bg-ink-strong text-white' : 'bg-canvas-sunken text-ink-muted hover:bg-hairline'
          }`}
        >
          전체 {allCards.length.toLocaleString()}
        </button>
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setVisibleCount(PAGE_SIZE);
            }}
            className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
              category === cat ? 'bg-ink-strong text-white' : 'bg-canvas-sunken text-ink-muted hover:bg-hairline'
            }`}
          >
            {CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>

      <p className="text-[12.5px] text-ink-faint">{filtered.length.toLocaleString()}장의 카드가 검색되었습니다</p>

      {visible.length === 0 ? (
        <div className="rounded-none border border-dashed border-hairline-strong bg-white py-14 text-center text-[13.5px] text-ink-muted">
          조건에 맞는 카드가 없습니다. 검색어나 카테고리를 조정해보세요.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((card) => (
              <CardTile
                key={card.id}
                card={card}
                selected={selectedIds.includes(card.id)}
                onToggle={() => onToggle(card.id)}
                onOpenDetail={() => onOpenDetail(card)}
              />
            ))}
          </div>
          {visibleCount < filtered.length ? (
            <div ref={sentinelRef} className="h-10" />
          ) : (
            <p className="pt-2 text-center text-[12px] text-ink-faint">모든 카드를 확인했어요.</p>
          )}
        </>
      )}
    </div>
  );
}
