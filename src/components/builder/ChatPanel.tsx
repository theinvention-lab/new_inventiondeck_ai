import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../types';
import { Button } from '../ui/Button';

const KIND_LABEL: Record<NonNullable<ChatMessage['kind']>, { label: string; tone: string }> = {
  question: { label: '확인 질문', tone: 'bg-info-soft text-info' },
  gap: { label: '누락 정보', tone: 'bg-warning-soft text-[#8a5a05]' },
  alternative: { label: '대안 제시', tone: 'bg-brand-soft text-brand-strong' },
  suggestion: { label: '표현 개선', tone: 'bg-canvas-sunken text-ink-muted' },
  normal: { label: '', tone: '' },
};

export function ChatPanel({
  messages,
  onSend,
  onStart,
  thinking,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onStart: () => void;
  thinking: boolean;
}) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, thinking]);

  const submit = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft('');
  };

  return (
    <div className="flex h-full flex-col rounded-none border border-hairline bg-white">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="text-3xl">💬</span>
            <p className="text-[13.5px] font-semibold text-ink-strong">AI와 함께 아이디어를 점검해보세요</p>
            <p className="max-w-xs text-[12.5px] text-ink-muted">
              고객 정의, 문제 적합성, 경쟁 환경, 수익 구조, 실행 가능성을 순서대로 확인 질문과 대안을 제시합니다.
            </p>
            <Button onClick={onStart}>AI 고도화 대화 시작</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {m.role === 'ai' && m.kind && m.kind !== 'normal' && (
                    <span className={`w-fit rounded-full px-2 py-0.5 text-[10.5px] font-bold ${KIND_LABEL[m.kind].tone}`}>
                      {KIND_LABEL[m.kind].label}
                    </span>
                  )}
                  <div
                    className={`rounded-none px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                      m.role === 'user' ? 'bg-brand text-white' : 'bg-canvas-sunken text-ink'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-none bg-canvas-sunken px-3.5 py-2.5">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint" />
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint [animation-delay:0.3s]" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-hairline p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
          placeholder={messages.length === 0 ? '먼저 대화를 시작해주세요' : '답변을 입력하세요…'}
          disabled={messages.length === 0}
          className="h-10 flex-1 rounded-full border border-hairline-strong bg-white px-4 text-[13.5px] outline-none focus:border-brand disabled:bg-canvas-sunken"
        />
        <Button size="md" onClick={submit} disabled={messages.length === 0 || !draft.trim()}>
          전송
        </Button>
      </div>
    </div>
  );
}
