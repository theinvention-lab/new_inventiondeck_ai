import type { BizCard, CardCategory } from '../types';
import {
  THEME_CORE,
  SEGMENT_CORE,
  TREND_CORE,
  FEATURE_CORE,
  REVENUE_CORE,
  TECH_CORE,
  MODIFIERS,
  CARD_DESCRIPTION_TEMPLATE,
  CARD_EXAMPLE_TEMPLATE,
} from './taxonomy';

// Deterministic pseudo-random so the ~4,000 card library is stable across reloads.
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const CATEGORY_CORE: Record<CardCategory, string[]> = {
  theme: THEME_CORE,
  segment: SEGMENT_CORE,
  trend: TREND_CORE,
  feature: FEATURE_CORE,
  revenue: REVENUE_CORE,
  tech: TECH_CORE,
};

function buildCategory(category: CardCategory): BizCard[] {
  const cores = CATEGORY_CORE[category];
  const cards: BizCard[] = [];
  let counter = 0;
  for (const core of cores) {
    for (const mod of MODIFIERS) {
      counter += 1;
      const seed = counter * 97 + core.length * 13 + mod.length * 7;
      const popularity = Math.round(seededRandom(seed) * 100);
      const id = `${category}-${counter}`;
      cards.push({
        id,
        category,
        title: `${mod} ${core}`,
        description: CARD_DESCRIPTION_TEMPLATE[category](core, mod),
        example: CARD_EXAMPLE_TEMPLATE[category](core, mod),
        tags: [core, mod],
        popularity,
      });
    }
  }
  return cards;
}

let cache: BizCard[] | null = null;

export function getAllCards(): BizCard[] {
  if (cache) return cache;
  cache = (Object.keys(CATEGORY_CORE) as CardCategory[]).flatMap(buildCategory);
  return cache;
}

export function getCardById(id: string): BizCard | undefined {
  return getAllCards().find((c) => c.id === id);
}

export function getCardsByIds(ids: string[]): BizCard[] {
  const set = new Set(ids);
  return getAllCards().filter((c) => set.has(c.id));
}
