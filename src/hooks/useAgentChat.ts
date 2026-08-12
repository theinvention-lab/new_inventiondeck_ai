import { useState } from 'react';
import type { ChatMessage } from '../types';
import { useAgentStore } from '../store/agentStore';
import { agentGreeting, generateAgentReply, type AgentAttachment } from '../ai/agentEngine';
import { makeId } from '../lib/id';

export function useAgentChat(scope: string) {
  const messages = useAgentStore((s) => s.messagesByScope[scope] ?? EMPTY);
  const appendMessages = useAgentStore((s) => s.appendMessages);
  const clearScope = useAgentStore((s) => s.clearScope);
  const [thinking, setThinking] = useState(false);

  const send = (text: string, attachments: AgentAttachment[]) => {
    const attachmentNote = attachments.length
      ? `\n\n[첨부] ${attachments.map((a) => `${a.label}: ${a.value}`).join(' / ')}`
      : '';
    const userMsg: ChatMessage = {
      id: makeId('msg'),
      role: 'user',
      content: `${text}${attachmentNote}`,
      createdAt: new Date().toISOString(),
    };
    // 첫 질문이면 인사말을 앞에 붙여 대화 맥락을 열어준다.
    const opening = messages.length === 0 ? [agentGreeting()] : [];
    appendMessages(scope, [...opening, userMsg]);

    setThinking(true);
    window.setTimeout(() => {
      appendMessages(scope, [generateAgentReply(text, attachments)]);
      setThinking(false);
    }, 700 + Math.random() * 500);
  };

  return { messages, thinking, send, clear: () => clearScope(scope) };
}

const EMPTY: ChatMessage[] = [];
