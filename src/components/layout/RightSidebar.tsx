import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore, TRASH_RETENTION_DAYS } from '../../store/projectStore';
import { useNoteStore } from '../../store/noteStore';
import { useToast } from '../ui/Toast';

const PANEL_TOP: Record<'projects' | 'notes', number> = {
  projects: 24,
  notes: 92,
};

function SlidePanel({
  open,
  onClose,
  title,
  topOffset,
  headerAction,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  topOffset: number;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="animate-slide-in-right fixed z-50 flex w-[360px] max-w-[calc(100vw-32px)] flex-col rounded-2xl border border-hairline bg-white shadow-lg"
        style={{ top: topOffset, right: 104, maxHeight: 'calc(100vh - 40px)' }}
      >
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-[14px] font-bold text-ink-strong">{title}</h2>
            {headerAction}
          </div>
          <button onClick={onClose} aria-label="닫기" className="text-ink-faint hover:text-ink-strong">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </>,
    document.body,
  );
}

export function RightSidebar() {
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = useAuthStore((s) => s.currentUser());
  const email = currentUser?.email ?? '';

  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);
  const softDeleteProject = useProjectStore((s) => s.softDeleteProject);

  const notes = useNoteStore((s) => s.notes);
  const createNote = useNoteStore((s) => s.createNote);
  const deleteNote = useNoteStore((s) => s.deleteNote);

  const [openPanel, setOpenPanel] = useState<'projects' | 'notes' | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [creatingNote, setCreatingNote] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const active = useMemo(
    () =>
      projects
        .filter((p) => p.ownerEmail === email && !p.trashedAt)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [projects, email],
  );

  const myNotes = useMemo(
    () =>
      notes
        .filter((n) => n.ownerEmail === email)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [notes, email],
  );

  const openProject = (id: string, stage: string) => {
    setOpenPanel(null);
    navigate(`/project/${id}/${stage === 'completed' ? 'planner' : stage}`);
  };

  const handleCreateProject = () => {
    const project = createProject(email, '새로운 프로젝트');
    setOpenPanel(null);
    navigate(`/project/${project.id}/generator`);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      softDeleteProject(confirmDeleteId);
      toast.push('휴지통으로 이동했습니다.');
    }
    setConfirmDeleteId(null);
  };

  const openNewNoteForm = () => {
    setTitle('');
    setContent('');
    setCreatingNote(true);
  };

  const submitNote = () => {
    if (!title.trim() && !content.trim()) return;
    createNote(email, title, content);
    toast.push('메모를 저장했어요.');
    setCreatingNote(false);
  };

  const closeNotesPanel = () => {
    setOpenPanel(null);
    setCreatingNote(false);
  };

  return (
    <>
      <aside className="sticky top-0 flex h-screen w-[88px] shrink-0 flex-col items-center gap-3 border-l border-hairline bg-white py-6">
        <button
          onClick={() => setOpenPanel((p) => (p === 'projects' ? null : 'projects'))}
          aria-label="내 프로젝트"
          className={`flex h-16 w-[72px] flex-col items-center justify-center gap-2 rounded-xl transition-colors ${
            openPanel === 'projects' ? 'bg-brand-soft text-brand-strong' : 'text-ink-muted hover:bg-canvas-sunken hover:text-ink-strong'
          }`}
        >
          <i className="fi fi-rr-layers text-[19px]" />
          <span className="text-[11px] font-semibold leading-none whitespace-nowrap">프로젝트</span>
        </button>
        <button
          onClick={() => setOpenPanel((p) => (p === 'notes' ? null : 'notes'))}
          aria-label="내 메모"
          className={`flex h-16 w-[72px] flex-col items-center justify-center gap-2 rounded-xl transition-colors ${
            openPanel === 'notes' ? 'bg-brand-soft text-brand-strong' : 'text-ink-muted hover:bg-canvas-sunken hover:text-ink-strong'
          }`}
        >
          <i className="fi fi-rr-paper-plane text-[19px]" />
          <span className="text-[11px] font-semibold leading-none whitespace-nowrap">메모</span>
        </button>
      </aside>

      <SlidePanel open={openPanel === 'projects'} onClose={() => setOpenPanel(null)} title="내 프로젝트" topOffset={PANEL_TOP.projects}>
        {active.length === 0 ? (
          <button
            onClick={handleCreateProject}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong px-6 py-12 text-center transition-colors hover:border-brand"
          >
            <span className="text-2xl">➕</span>
            <span className="text-[13.5px] font-bold text-ink-strong">새로운 프로젝트를 생성하기</span>
          </button>
        ) : (
          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
            {active.map((p) => {
              const idea = p.generator.ideas.find((i) => i.id === p.generator.selectedIdeaId) ?? p.generator.ideas[0];
              return (
                <div
                  key={p.id}
                  className="group relative flex flex-col gap-1 rounded-xl border border-hairline bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <button
                    onClick={() => setConfirmDeleteId(p.id)}
                    aria-label="프로젝트 삭제"
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-ink-faint hover:bg-canvas-sunken hover:text-danger"
                  >
                    ✕
                  </button>
                  <button onClick={() => openProject(p.id, p.stage)} className="flex flex-col gap-1 pr-5 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-[13.5px] font-bold text-ink-strong">{p.title}</h3>
                      <span className="shrink-0 rounded-full bg-canvas-sunken px-2 py-0.5 text-[10.5px] font-semibold text-ink-faint">
                        {p.stage === 'completed' ? '완료' : p.stage}
                      </span>
                    </div>
                    <p className="truncate text-[12px] text-ink-muted">{idea?.oneLiner ?? p.description ?? '아직 요약이 없습니다.'}</p>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </SlidePanel>

      <SlidePanel
        open={openPanel === 'notes'}
        onClose={closeNotesPanel}
        title="내 메모"
        topOffset={PANEL_TOP.notes}
        headerAction={
          !creatingNote && (
            <button onClick={openNewNoteForm} className="text-[12.5px] font-semibold text-brand hover:text-brand-strong">
              + 새 메모
            </button>
          )
        }
      >
        {creatingNote ? (
          <div className="flex flex-col gap-3">
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
            <div className="flex gap-2">
              <Button variant="outline" fullWidth onClick={() => setCreatingNote(false)}>
                취소
              </Button>
              <Button fullWidth onClick={submitNote}>
                메모 저장
              </Button>
            </div>
          </div>
        ) : (
          <>
            {myNotes.length === 0 ? (
              <button
                onClick={openNewNoteForm}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong px-6 py-12 text-center transition-colors hover:border-brand"
              >
                <span className="text-2xl">📝</span>
                <span className="text-[13.5px] font-bold text-ink-strong">새 메모 작성하기</span>
              </button>
            ) : (
              <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                {myNotes.map((n) => (
                  <div key={n.id} className="flex flex-col gap-1.5 rounded-xl border border-hairline bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-[13.5px] font-bold text-ink-strong">{n.title}</h3>
                      <button
                        onClick={() => deleteNote(n.id)}
                        aria-label="메모 삭제"
                        className="shrink-0 text-[11px] text-ink-faint hover:text-danger"
                      >
                        삭제
                      </button>
                    </div>
                    {n.content && <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-muted">{n.content}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </SlidePanel>

      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="프로젝트를 삭제할까요?"
        description={`휴지통으로 이동하며, ${TRASH_RETENTION_DAYS}일 후 자동으로 영구 삭제됩니다.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              취소
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              삭제
            </Button>
          </>
        }
      />
    </>
  );
}
