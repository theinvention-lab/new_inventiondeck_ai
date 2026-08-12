import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../types';
import type { AgentAttachment } from '../../ai/agentEngine';
import { Button } from '../ui/Button';
import { readFieldDragData } from '../../lib/fieldDrag';
import { makeId } from '../../lib/id';

const SAMPLE_QUESTIONS = [
  '초기 고객을 어떻게 좁혀야 할까요?',
  '가격은 어떤 기준으로 정하나요?',
  '이 아이디어를 가장 싸게 검증하는 방법은?',
];

export function AgentPanel({
  messages,
  thinking,
  onSend,
}: {
  messages: ChatMessage[];
  thinking: boolean;
  onSend: (text: string, attachments: AgentAttachment[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<AgentAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, thinking]);

  const submit = (text?: string) => {
    const value = (text ?? draft).trim();
    if (!value && attachments.length === 0) return;
    onSend(value || '이 내용을 봐주세요.', attachments);
    setDraft('');
    setAttachments([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const payload = readFieldDragData(e);
    if (!payload || !payload.value.trim()) return;
    setAttachments((prev) => [...prev, { id: makeId('att'), label: payload.label, value: payload.value }]);
  };

  return (
    <div
      className="relative flex h-full flex-col bg-white"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
      }}
      onDrop={handleDrop}
    >
      {dragOver && (
        <div className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center border-2 border-dashed border-brand bg-brand-soft/70">
          <p className="text-[13px] font-bold text-brand-strong">여기에 놓으면 질문에 첨부됩니다</p>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="text-3xl">🤖</span>
            <p className="text-[13.5px] font-semibold text-ink-strong">무엇이든 물어보세요</p>
            <p className="max-w-xs text-[12.5px] leading-relaxed text-ink-muted">
              고객 정의, 문제 검증, 수익 구조, 경쟁 환경 같은 사업 고민에 답해드립니다. 작성 중인 입력 칸을 이 창으로 끌어다
              놓으면 그 내용을 함께 봅니다.
            </p>
            <div className="mt-1 flex flex-col gap-1.5">
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => submit(q)}
                  className="rounded-none border border-hairline px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-brand hover:text-brand-strong"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-none px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                    m.role === 'user' ? 'bg-brand text-white' : 'bg-canvas-sunken text-ink'
                  }`}
                >
                  {m.content}
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

      <div className="border-t border-hairline p-3">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((a) => (
              <span
                key={a.id}
                className="flex max-w-full items-center gap-1.5 rounded-none border border-hairline bg-canvas-sunken px-2 py-1"
              >
                <span className="text-[11px] font-bold text-ink-strong">{a.label}</span>
                <span className="max-w-[140px] truncate text-[11px] text-ink-faint">{a.value}</span>
                <button
                  onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                  aria-label={`${a.label} 첨부 제거`}
                  className="text-[11px] text-ink-faint hover:text-danger"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
            placeholder="궁금한 점을 입력하세요…"
            className="h-10 min-w-0 flex-1 rounded-none border border-hairline-strong bg-white px-3.5 text-[13.5px] outline-none focus:border-brand"
          />
          <Button size="md" onClick={() => submit()} disabled={!draft.trim() && attachments.length === 0}>
            전송
          </Button>
        </div>
      </div>
    </div>
  );
}
