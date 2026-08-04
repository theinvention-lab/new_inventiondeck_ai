import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { IdeaSwitcher } from '../../components/home/IdeaSwitcher';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useToast } from '../../components/ui/Toast';
import { getAllCards } from '../../data/cards';
import { CATEGORY_COLOR, CATEGORY_ICON } from '../../data/taxonomy';
import { timeGreeting } from '../../lib/greeting';

const QUICK_MOVES = [
  { stage: 'generator' as const, name: 'Generator', desc: '카드로 아이디어 생성', icon: '✨', iconBg: '#fde7ea', color: '#e4002b' },
  { stage: 'builder' as const, name: 'Builder', desc: '템플릿으로 구체화', icon: '🧩', iconBg: '#eef2fc', color: '#0c43b7' },
  { stage: 'planner' as const, name: 'Planner', desc: '사업계획서 & IR Deck 작성', icon: '📄', iconBg: '#e6f7ec', color: '#16a34a' },
];

function sampleCards(n: number) {
  const all = getAllCards();
  const picked: typeof all = [];
  const used = new Set<number>();
  while (picked.length < n && used.size < all.length) {
    const idx = Math.floor(Math.random() * all.length);
    if (used.has(idx)) continue;
    used.add(idx);
    picked.push(all[idx]);
  }
  return picked;
}

export function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = useAuthStore((s) => s.currentUser());
  const email = currentUser?.email ?? '';

  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);
  const updateGenerator = useProjectStore((s) => s.updateGenerator);

  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [pendingAction, setPendingAction] = useState<'generator' | 'builder' | null>(null);
  const [keywordSeed, setKeywordSeed] = useState(0);

  const active = useMemo(
    () => projects.filter((p) => p.ownerEmail === email && !p.trashedAt).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [projects, email],
  );

  const savedIdeaCount = useMemo(() => active.reduce((sum, p) => sum + p.generator.ideas.length, 0), [active]);
  const recentProjects = active.slice(0, 3);
  const mostRecentProject = active[0];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const randomKeywords = useMemo(() => sampleCards(8), [keywordSeed]);

  const openCreateDialog = (action: 'generator' | 'builder') => {
    setPendingAction(action);
    setNewTitle('');
    setNewProjectOpen(true);
  };

  const confirmCreate = () => {
    const title = newTitle.trim() || '이름 없는 프로젝트';
    const project = createProject(email, title);
    setNewProjectOpen(false);
    navigate(`/project/${project.id}/${pendingAction ?? 'generator'}`);
  };

  const goToQuickMove = (stage: (typeof QUICK_MOVES)[number]['stage']) => {
    if (mostRecentProject) {
      navigate(`/project/${mostRecentProject.id}/${stage}`);
      return;
    }
    openCreateDialog(stage === 'generator' ? 'generator' : 'builder');
  };

  const startFromKeyword = (cardId: string) => {
    const project = createProject(email, '새로운 아이디어');
    updateGenerator(project.id, { selectedCardIds: [cardId], cardHistory: [cardId] });
    toast.push('선택한 키워드로 새 프로젝트를 시작했어요.');
    navigate(`/project/${project.id}/generator`);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 flex justify-end">
          <IdeaSwitcher projects={active} />
        </div>

        {/* Hero */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#161331] via-[#1c1840] to-[#241f52] px-8 py-9">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <span className="absolute left-[12%] top-[20%] h-1 w-1 rounded-full bg-white" />
            <span className="absolute left-[30%] top-[60%] h-1 w-1 rounded-full bg-white" />
            <span className="absolute left-[60%] top-[25%] h-1.5 w-1.5 rounded-full bg-white" />
            <span className="absolute left-[80%] top-[55%] h-1 w-1 rounded-full bg-white" />
            <span className="absolute left-[92%] top-[15%] h-1 w-1 rounded-full bg-white" />
          </div>
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-[14px] text-white/70">{timeGreeting()}</p>
              <h1 className="mt-1 text-[26px] font-bold text-white">{currentUser?.name ?? '게스트'}님의 워크스페이스</h1>
              <p className="mt-1.5 text-[13px] text-white/60">아이디어를 현실로 만드는 여정을 함께해요</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-7 py-4 text-center backdrop-blur">
              <p className="text-[26px] font-bold text-white">{savedIdeaCount}</p>
              <p className="mt-0.5 text-[12px] text-white/70">저장된 아이디어</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* Create panel */}
          <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-brand-soft/60 to-white p-6">
            <span className="text-[28px]">🥚</span>
            <div>
              <h2 className="text-[18px] font-bold text-ink-strong">오늘도 새로운 아이템을 만들어볼까요?</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                카드를 조합하면 AI가 나만의 비즈니스 아이디어를 만들어드려요
              </p>
            </div>
            <button
              onClick={() => openCreateDialog('generator')}
              className="flex items-center justify-between rounded-xl bg-brand px-4 py-3 text-[14px] font-bold text-white transition-colors hover:bg-brand-strong"
            >
              새 아이디어 만들기
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/mypage')}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-[13.5px] font-semibold text-ink-strong shadow-sm hover:bg-canvas-sunken"
            >
              기존 프로젝트 불러오기
              <span>📂</span>
            </button>
            <button
              onClick={() => openCreateDialog('builder')}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-[13.5px] font-semibold text-ink-strong shadow-sm hover:bg-canvas-sunken"
            >
              아이디어 직접 추가하기
              <span>✏️</span>
            </button>
          </div>

          {/* Quick moves */}
          <div>
            <p className="mb-3 text-[13px] font-bold text-ink-muted">빠른 이동</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {QUICK_MOVES.map((q) => (
                <button
                  key={q.stage}
                  onClick={() => goToQuickMove(q.stage)}
                  className="flex flex-col items-start gap-2 rounded-2xl bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-[18px]"
                    style={{ backgroundColor: q.iconBg }}
                  >
                    {q.icon}
                  </span>
                  <span className="text-[15px] font-bold text-ink-strong">{q.name}</span>
                  <span className="text-[12.5px] text-ink-muted">{q.desc}</span>
                  <span className="mt-1 text-[12.5px] font-semibold" style={{ color: q.color }}>
                    시작하기 →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent projects */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-ink-muted">📶 최근 프로젝트</p>
            <button onClick={() => navigate('/mypage')} className="text-[12.5px] font-semibold text-brand">
              전체보기 →
            </button>
          </div>
          {recentProjects.length === 0 ? (
            <EmptyState title="아직 프로젝트가 없어요" description="새 아이디어를 만들어 첫 프로젝트를 시작해보세요." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {recentProjects.map((p) => {
                const idea = p.generator.ideas.find((i) => i.id === p.generator.selectedIdeaId) ?? p.generator.ideas[0];
                return (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/project/${p.id}/${p.stage === 'completed' ? 'planner' : p.stage}`)}
                    className="flex flex-col gap-2 rounded-2xl bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14.5px] font-bold text-ink-strong">{p.title}</h3>
                      {idea && (
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10.5px] font-semibold text-brand-strong">
                          {idea.tags[0] ?? '아이디어'}
                        </span>
                      )}
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-ink-muted line-clamp-2">
                      {idea?.oneLiner ?? p.description ?? '아직 요약이 없습니다.'}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.tags.slice(0, 3).map((t) => (
                        <span key={t} className="rounded-full bg-canvas-sunken px-2 py-0.5 text-[11px] text-ink-faint">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Random keyword recommendation */}
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[16px]">🎲</span>
              <div>
                <p className="text-[13.5px] font-bold text-ink-strong">랜덤 키워드 추천</p>
                <p className="text-[12px] text-ink-faint">카드를 클릭해 새로운 아이디어 소재를 발견하세요</p>
              </div>
            </div>
            <button
              onClick={() => setKeywordSeed((v) => v + 1)}
              className="rounded-full bg-canvas-sunken px-3 py-1.5 text-[12px] font-semibold text-ink-muted hover:bg-hairline"
            >
              🔄 새로고침
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {randomKeywords.map((card) => (
              <button
                key={card.id}
                data-testid="keyword-chip"
                onClick={() => startFromKeyword(card.id)}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-transform hover:scale-105"
                style={{
                  color: CATEGORY_COLOR[card.category],
                  backgroundColor: `${CATEGORY_COLOR[card.category]}14`,
                  borderColor: `${CATEGORY_COLOR[card.category]}33`,
                }}
              >
                <span>{CATEGORY_ICON[card.category]}</span>
                {card.tags[0]}
              </button>
            ))}
          </div>
        </div>
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
          <Button fullWidth onClick={confirmCreate}>
            {pendingAction === 'builder' ? 'Builder에서 시작하기' : 'Generator에서 시작하기'}
          </Button>
        </div>
      </Dialog>
    </AppShell>
  );
}
