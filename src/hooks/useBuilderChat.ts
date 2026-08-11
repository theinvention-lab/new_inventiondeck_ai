import { useState } from 'react';
import type { BuilderState, ChatMessage } from '../types';
import { openingMessage, generateAiReply } from '../ai/chatEngine';
import { makeId } from '../lib/id';

export function useBuilderChat(
  projectId: string,
  builder: BuilderState,
  updateBuilder: (id: string, patch: Partial<BuilderState>) => void,
) {
  const [thinking, setThinking] = useState(false);

  const startChat = () => {
    const msg = openingMessage(builder);
    updateBuilder(projectId, { chatMessages: [msg] });
  };

  const sendChat = (text: string) => {
    const userMsg: ChatMessage = { id: makeId('msg'), role: 'user', content: text, createdAt: new Date().toISOString() };
    const nextMessages = [...builder.chatMessages, userMsg];
    updateBuilder(projectId, { chatMessages: nextMessages });
    setThinking(true);
    window.setTimeout(() => {
      const reply = generateAiReply(builder, text);
      updateBuilder(projectId, { chatMessages: [...nextMessages, reply] });
      setThinking(false);
    }, 800 + Math.random() * 500);
  };

  return { thinking, startChat, sendChat };
}
