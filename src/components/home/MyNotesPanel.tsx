import { useState } from 'react';
import type { Note } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

export function MyNotesPanel({
  notes,
  onCreate,
  onDelete,
  onSendToGenerator,
}: {
  notes: Note[];
  onCreate: (title: string, content: string) => void;
  onDelete: (id: string) => void;
  onSendToGenerator: (note: Note) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const openDialog = () => {
    setTitle('');
    setContent('');
    setOpen(true);
  };

  const submit = () => {
    if (!title.trim() && !content.trim()) return;
    onCreate(title, content);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-ink-strong">내 메모</h2>
        <button onClick={openDialog} className="text-[12.5px] font-semibold text-brand">
          + 새 메모
        </button>
      </div>

      {notes.length === 0 ? (
        <button
          onClick={openDialog}
          className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong bg-white px-6 py-10 text-center transition-colors hover:border-brand"
        >
          <span className="text-2xl">📝</span>
          <span className="text-[13.5px] font-bold text-ink-strong">새 메모 작성하기</span>
          <span className="text-[12px] text-ink-muted">떠오른 아이디어를 짧게 남겨두세요</span>
        </button>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notes.map((n) => (
            <div key={n.id} className="flex flex-col gap-1.5 rounded-xl bg-white px-4 py-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-[13.5px] font-bold text-ink-strong">{n.title}</h3>
                <button
                  onClick={() => onDelete(n.id)}
                  aria-label="메모 삭제"
                  className="shrink-0 text-[11px] text-ink-faint hover:text-danger"
                >
                  삭제
                </button>
              </div>
              {n.content && <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-muted">{n.content}</p>}
              <button
                onClick={() => onSendToGenerator(n)}
                className="mt-1 w-fit rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-strong hover:bg-brand-soft/70"
              >
                ✨ Generator로 보내기
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="새 메모" size="sm">
        <div className="flex flex-col gap-4">
          <Input
            label="제목"
            name="title"
            placeholder="예: 반려동물 산책 매칭 아이디어"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <Textarea
            label="내용"
            name="content"
            placeholder="떠오른 생각을 자유롭게 적어보세요…"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button fullWidth onClick={submit}>
            메모 저장
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
