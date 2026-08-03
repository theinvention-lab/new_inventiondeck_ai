import type { BizCard } from '../types';
import { getAllCards, getCardsByIds } from '../data/cards';

export function recommendCards(history: string[], excludeIds: string[], limit = 8): BizCard[] {
  const historyCards = getCardsByIds(history.slice(-20));
  if (historyCards.length === 0) return [];

  const tagWeight = new Map<string, number>();
  for (const c of historyCards) {
    for (const tag of c.tags) {
      tagWeight.set(tag, (tagWeight.get(tag) ?? 0) + 1);
    }
  }

  const exclude = new Set(excludeIds);
  const scored: { card: BizCard; score: number }[] = [];

  for (const card of getAllCards()) {
    if (exclude.has(card.id)) continue;
    let score = 0;
    for (const tag of card.tags) {
      score += tagWeight.get(tag) ?? 0;
    }
    if (score === 0) continue;
    score += card.popularity / 100;
    scored.push({ card, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.card);
}
