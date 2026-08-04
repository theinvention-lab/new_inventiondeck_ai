import { useMemo, useState } from 'react';
import type { BizCard, CardCategory } from '../../types';
import { useCardStore } from '../../store/cardStore';
import { CATEGORY_LABEL, CATEGORY_ORDER } from '../../data/taxonomy';
import { CardTile } from './CardTile';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

type SortMode = 'relevance' | 'popular' | 'title';

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
  const [sort, setSort] = useState<SortMode>('relevance');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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
    if (sort === 'popular') sorted.sort((a, b) => b.popularity - a.popularity);
    else if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    else if (q) {
      sorted.sort((a, b) => {
        const aScore = a.title.toLowerCase().startsWith(q) ? 1 : 0;
        const bScore = b.title.toLowerCase().startsWith(q) ? 1 : 0;
        return bScore - aScore || b.popularity - a.popularity;
      });
    } else {
      sorted.sort((a, b) => b.popularity - a.popularity);
    }
    return sorted;
  }, [allCards, category, query, sort]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="키워드로 카드 검색 (예: 헬스케어, 구독, 시니어…)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          className="sm:w-80"
        />
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="w-full sm:w-40">
          <option value="relevance">관련도순</option>
          <option value="popular">인기순</option>
          <option value="title">이름순</option>
        </Select>
      </div>

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
        <div className="rounded-xl border border-dashed border-hairline-strong bg-white py-14 text-center text-[13.5px] text-ink-muted">
          조건에 맞는 카드가 없습니다. 검색어나 카테고리를 조정해보세요.
        </div>
      ) : (
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
      )}

      {visibleCount < filtered.length && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
            더 보기 ({filtered.length - visibleCount}장 남음)
          </Button>
        </div>
      )}
    </div>
  );
}
