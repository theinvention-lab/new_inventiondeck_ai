import { create } from 'zustand';
import type { BizCard } from '../types';
import { getAllCards as getLocalCards } from '../data/cards';
import { fetchSupabaseCards } from '../lib/supabaseCards';

interface CardStoreState {
  cards: BizCard[];
  source: 'local' | 'supabase';
  status: 'idle' | 'loading' | 'ready' | 'error';
  loadCards: () => Promise<void>;
}

export const useCardStore = create<CardStoreState>((set, get) => ({
  cards: getLocalCards(),
  source: 'local',
  status: 'idle',

  loadCards: async () => {
    if (get().status === 'loading' || get().source === 'supabase') return;
    set({ status: 'loading' });
    try {
      const remote = await fetchSupabaseCards();
      if (remote.length > 0) {
        set({ cards: remote, source: 'supabase', status: 'ready' });
      } else {
        set({ status: 'ready' });
      }
    } catch (err) {
      console.warn('[cardStore] Supabase card fetch failed, staying on the local dataset.', err);
      set({ status: 'error' });
    }
  },
}));
