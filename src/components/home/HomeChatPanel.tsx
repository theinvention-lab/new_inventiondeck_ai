import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../types';
import type { ChatMode } from '../../ai/homeChatEngine';
import { MODE_COPY } from '../../ai/homeChatEngine';

export function HomeChatPanel({
  mode,
  messages,
  thinking,
  onSend,
  onCta,
}: {
  mode: ChatMode;
  messages: ChatMessage[];
  thinking: boolean;
  onSend: (text: string) => void;
  onCta: () => void;
}) {
  const copy = MODE_COPY[mode];
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasUserMessage = messages.some((m) => m.role === 'user');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, thinking]);

  useEffect(() => {
    setDraft('');
  }, [mode]);

  const submit = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft('');
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col rounded-2xl border border-hairline bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-hairline px-4 py-3">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[15px]"
            style={{ backgroundColor: `${copy.accent}1a`, color: copy.accent }}
          >
            {copy.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12.5px] text-ink-muted">{copy.subtitle}</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex h-[320px] flex-col gap-3 overflow-y-auto px-4 py-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                  m.role === 'user' ? 'text-white' : 'bg-canvas-sunken text-ink'
                }`}
                style={m.role === 'user' ? { backgroundColor: copy.accent } : undefined}
              >
                {m.content}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl bg-canvas-sunken px-3.5 py-2.5">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint" />
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint [animation-delay:0.15s]" />
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint [animation-delay:0.3s]" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-hairline p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
            placeholder={copy.placeholder}
            className="h-10 flex-1 rounded-full border border-hairline-strong bg-white px-4 text-[13.5px] outline-none focus:border-brand"
          />
          <button
            onClick={submit}
            disabled={!draft.trim()}
            className="flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-[13.5px] font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: copy.accent }}
          >
            전송
          </button>
        </div>

        {hasUserMessage && (
          <div className="border-t border-hairline px-4 py-3">
            <button
              onClick={onCta}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: copy.accent }}
            >
              {copy.ctaLabel}
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
