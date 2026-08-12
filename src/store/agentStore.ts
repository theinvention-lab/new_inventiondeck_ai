import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatMessage } from '../types';

/** 프로젝트 밖(홈·마이페이지 등)에서 연 대화를 담아두는 키 */
export const GENERAL_AGENT_SCOPE = 'general';

interface AgentStoreState {
  /** 대화는 프로젝트 단위로 나눠 보관한다 — 맥락이 섞이지 않도록 */
  messagesByScope: Record<string, ChatMessage[]>;

  getMessages: (scope: string) => ChatMessage[];
  appendMessages: (scope: string, messages: ChatMessage[]) => void;
  clearScope: (scope: string) => void;
}

export const useAgentStore = create<AgentStoreState>()(
  persist(
    (set, get) => ({
      messagesByScope: {},

      getMessages: (scope) => get().messagesByScope[scope] ?? [],

      appendMessages: (scope, messages) => {
        set((s) => ({
          messagesByScope: { ...s.messagesByScope, [scope]: [...(s.messagesByScope[scope] ?? []), ...messages] },
        }));
      },

      clearScope: (scope) => {
        set((s) => ({ messagesByScope: { ...s.messagesByScope, [scope]: [] } }));
      },
    }),
    {
      name: 'inventiondeck:agent',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
