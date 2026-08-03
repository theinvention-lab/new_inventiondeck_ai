import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteHeader } from '../../components/layout/SiteHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs } from '../../components/ui/Tabs';
import { ProjectCard } from '../../components/mypage/ProjectCard';
import { FolderSidebar } from '../../components/mypage/FolderSidebar';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore, TRASH_RETENTION_DAYS } from '../../store/projectStore';
import { useToast } from '../../components/ui/Toast';
import { formatDate, relativeTime } from '../../lib/format';

const FOLDER_COLORS = ['#03c75a', '#0c43b7', '#f5a524', '#e0343f', '#7c3aed', '#0891b2'];
const PAGE_SIZE = 12;

export function MyPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = useAuthStore((s) => s.currentUser());
  const email = currentUser?.email ?? '';

  const projects = useProjectStore((s) => s.projects);
  const folders = useProjectStore((s) => s.folders);
  const createProject = useProjectStore((s) => s.createProject);
  const softDeleteProject = useProjectStore((s) => s.softDeleteProject);
  const restoreProject = useProjectStore((s) => s.restoreProject);
  const permanentlyDeleteProject = useProjectStore((s) => s.permanentlyDeleteProject);
  const createFolder = useProjectStore((s) => s.createFolder);
  const deleteFolder = useProjectStore((s) => s.deleteFolder);
  const assignFolder = useProjectStore((s) => s.assignFolder);
  const toggleHallShare = useProjectStore((s) => s.toggleHallShare);

  const [view, setView] = useState<'active' | 'trash'>('active');
  const [activeFolder, setActiveFolder] = useState<string | 'all' | 'unfiled'>('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const active = useMemo(() => projects.filter((p) => p.ownerEmail === email && !p.trashedAt), [projects, email]);
  const trashed = useMemo(() => projects.filter((p) => p.ownerEmail === email && p.trashedAt), [projects, email]);

  const filtered = useMemo(() => {
    let list = active;
    if (activeFolder === 'unfiled') list = list.filter((p) => !p.folderId);
    else if (activeFolder !== 'all') list = list.filter((p) => p.folderId === activeFolder);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)));
    return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [active, activeFolder, query]);

  const visible = filtered.slice(0, visibleCount);

  const counts = useMemo(
    () => ({
      all: active.length,
      unfiled: active.filter((p) => !p.folderId).length,
      byFolder: Object.fromEntries(folders.map((f) => [f.id, active.filter((p) => p.folderId === f.id).length])),
    }),
    [active, folders],
  );

  const handleCreateProject = () => {
    const title = newTitle.trim() || '이름 없는 프로젝트';
    const project = createProject(email, title);
    setNewProjectOpen(false);
    setNewTitle('');
    navigate(`/project/${project.id}/generator`);
  };

  return (
    <div className="min-h-screen bg-canvas-sunken">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[21px] font-bold text-ink-strong">마이페이지</h1>
            <p className="mt-1 text-[13px] text-ink-muted">{currentUser?.name}님, 진행 중인 프로젝트를 관리하세요.</p>
          </div>
          <Button onClick={() => setNewProjectOpen(true)}>+ 새 프로젝트</Button>
        </div>

        <Tabs
          items={[
            { id: 'active', label: '내 프로젝트', badge: active.length },
            { id: 'trash', label: '휴지통', badge: trashed.length },
          ]}
          activeId={view}
          onChange={(id) => setView(id as 'active' | 'trash')}
          className="mb-5 border-b border-hairline"
        />

        {view === 'active' ? (
          <div className="flex flex-col gap-5 sm:flex-row">
            <FolderSidebar
              folders={folders}
              activeFolderId={activeFolder}
              onSelectFolder={(id) => {
                setActiveFolder(id);
                setVisibleCount(PAGE_SIZE);
              }}
              counts={counts}
              onCreateFolder={(name) => createFolder(name, FOLDER_COLORS[folders.length % FOLDER_COLORS.length])}
              onDeleteFolder={(id) => {
                deleteFolder(id);
                if (activeFolder === id) setActiveFolder('all');
              }}
              onDropOnFolder={(folderId, projectId) => {
                assignFolder(projectId, folderId);
                toast.push(folderId ? '폴더로 이동했습니다.' : '미분류로 이동했습니다.');
              }}
            />

            <div className="flex-1">
              <Input
                placeholder="프로젝트 제목 또는 태그로 검색"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="mb-4 max-w-sm"
              />

              {filtered.length === 0 ? (
                <EmptyState
                  title="프로젝트가 없어요"
                  description="새 프로젝트를 만들어 첫 아이디어를 시작해보세요."
                  action={<Button onClick={() => setNewProjectOpen(true)}>+ 새 프로젝트</Button>}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((p) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/project-id', p.id)}
                        onDelete={() => setConfirmDeleteId(p.id)}
                        onToggleHall={() => {
                          toggleHallShare(p.id);
                          toast.push(p.sharedToHall ? '명예의 전당 공유를 취소했습니다.' : '명예의 전당에 공유했습니다.');
                        }}
                      />
                    ))}
                  </div>
                  {visibleCount < filtered.length && (
                    <div className="mt-5 flex justify-center">
                      <Button variant="outline" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
                        더 보기
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-[12.5px] text-ink-faint">삭제된 프로젝트는 {TRASH_RETENTION_DAYS}일 후 자동으로 영구 삭제됩니다.</p>
            {trashed.length === 0 ? (
              <EmptyState title="휴지통이 비어 있어요" />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {trashed.map((p) => (
                  <div key={p.id} className="flex flex-col gap-2 rounded-xl border border-hairline bg-white p-4">
                    <h3 className="text-[14px] font-bold text-ink-strong line-clamp-1">{p.title}</h3>
                    <p className="text-[12px] text-ink-faint">
                      삭제일 {formatDate(p.trashedAt!)} · {relativeTime(p.trashedAt!)}
                    </p>
                    <div className="mt-1 flex gap-2">
                      <Button size="sm" variant="outline" fullWidth onClick={() => restoreProject(p.id)}>
                        복구
                      </Button>
                      <Button size="sm" variant="danger" fullWidth onClick={() => permanentlyDeleteProject(p.id)}>
                        영구 삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={newProjectOpen} onClose={() => setNewProjectOpen(false)} title="새 프로젝트 만들기" size="sm">
        <div className="flex flex-col gap-4">
          <Input
            label="프로젝트 이름"
            placeholder="예: 반려동물 케어 서비스"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <Button fullWidth onClick={handleCreateProject}>
            Generator에서 시작하기
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="프로젝트를 삭제할까요?"
        description="휴지통으로 이동하며, 7일 후 자동으로 영구 삭제됩니다."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              취소
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirmDeleteId) {
                  softDeleteProject(confirmDeleteId);
                  toast.push('휴지통으로 이동했습니다.');
                }
                setConfirmDeleteId(null);
              }}
            >
              삭제
            </Button>
          </>
        }
      />
    </div>
  );
}
