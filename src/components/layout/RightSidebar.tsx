import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useNoteStore } from '../../store/noteStore';
import { useToast } from '../ui/Toast';
import type { Note } from '../../types';

export function RightSidebar() {
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = useAuthStore((s) => s.currentUser());
  const email = currentUser?.email ?? '';

  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);

  const notes = useNoteStore((s) => s.notes);
  const createNote = useNoteStore((s) => s.createNote);
  const deleteNote = useNoteStore((s) => s.deleteNote);

  const [openPanel, setOpenPanel] = useState<'projects' | 'notes' | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
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

  const openNewNoteDialog = () => {
    setOpenPanel(null);
    setTitle('');
    setContent('');
    setNoteDialogOpen(true);
  };

  const submitNote = () => {
    if (!title.trim() && !content.trim()) return;
    createNote(email, title, content);
    toast.push('메모를 저장했어요.');
    setNoteDialogOpen(false);
  };

  const sendNoteToGenerator = (note: Note) => {
    setOpenPanel(null);
    navigate(`/home?mode=generator&noteId=${note.id}`);
  };

  return (
    <>
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col items-center gap-2 border-l border-hairline bg-white py-5">
        <button
          onClick={() => setOpenPanel('projects')}
          aria-label="내 프로젝트"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-canvas-sunken hover:text-ink-strong"
        >
          <span className="text-[19px]">📁</span>
        </button>
        <button
          onClick={() => setOpenPanel('notes')}
          aria-label="내 메모"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-canvas-sunken hover:text-ink-strong"
        >
          <span className="text-[19px]">📝</span>
        </button>
      </aside>

      <Dialog open={openPanel === 'projects'} onClose={() => setOpenPanel(null)} title="내 프로젝트" size="lg">
        {active.length === 0 ? (
          <button
            onClick={handleCreateProject}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong px-6 py-12 text-center transition-colors hover:border-brand"
          >
            <span className="text-2xl">➕</span>
            <span className="text-[13.5px] font-bold text-ink-strong">새로운 프로젝트를 생성하기</span>
          </button>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
            {active.map((p) => {
              const idea = p.generator.ideas.find((i) => i.id === p.generator.selectedIdeaId) ?? p.generator.ideas[0];
              return (
                <button
                  key={p.id}
                  onClick={() => openProject(p.id, p.stage)}
                  className="flex flex-col gap-1 rounded-xl border border-hairline bg-white px-4 py-3 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-[13.5px] font-bold text-ink-strong">{p.title}</h3>
                    <span className="shrink-0 rounded-full bg-canvas-sunken px-2 py-0.5 text-[10.5px] font-semibold text-ink-faint">
                      {p.stage === 'completed' ? '완료' : p.stage}
                    </span>
                  </div>
                  <p className="truncate text-[12px] text-ink-muted">{idea?.oneLiner ?? p.description ?? '아직 요약이 없습니다.'}</p>
                </button>
              );
            })}
          </div>
        )}
      </Dialog>

      <Dialog open={openPanel === 'notes'} onClose={() => setOpenPanel(null)} title="내 메모" size="lg">
        <div className="mb-4 flex justify-end">
          <Button size="sm" onClick={openNewNoteDialog}>
            + 새 메모
          </Button>
        </div>
        {myNotes.length === 0 ? (
          <button
            onClick={openNewNoteDialog}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong px-6 py-12 text-center transition-colors hover:border-brand"
          >
            <span className="text-2xl">📝</span>
            <span className="text-[13.5px] font-bold text-ink-strong">새 메모 작성하기</span>
          </button>
        ) : (
          <div className="grid max-h-[55vh] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
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
                <button
                  onClick={() => sendNoteToGenerator(n)}
                  className="mt-1 w-fit rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-strong hover:bg-brand-soft/70"
                >
                  ✨ Generator로 보내기
                </button>
              </div>
            ))}
          </div>
        )}
      </Dialog>

      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} title="새 메모" size="sm">
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
          <Button fullWidth onClick={submitNote}>
            메모 저장
          </Button>
        </div>
      </Dialog>
    </>
  );
}
