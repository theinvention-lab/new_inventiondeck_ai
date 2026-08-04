import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UiStoreState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiStoreState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'inventiondeck:ui',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
