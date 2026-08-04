import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Tabs } from '../../components/ui/Tabs';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { ChatPanel } from '../../components/builder/ChatPanel';
import { CriterionCard } from '../../components/builder/CriterionCard';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useUiStore } from '../../store/uiStore';
import { useToast } from '../../components/ui/Toast';
import { openingMessage, generateAiReply } from '../../ai/chatEngine';
import { makeId } from '../../lib/id';
import { relativeTime, formatDateTime } from '../../lib/format';
import type { CriterionEntry } from '../../types';

const AUTOSAVE_DELAY = 1000;

export function BuilderPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const currentEmail = useAuthStore((s) => s.currentEmail);
  const currentUser = useAuthStore((s) => s.currentUser());
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const updateBuilder = useProjectStore((s) => s.updateBuilder);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [tab, setTab] = useState<'start' | 'chat' | 'criteria'>('start');
  const [thinking, setThinking] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [newCriterionName, setNewCriterionName] = useState('');

  const saveTimer = useRef<number | null>(null);
  const dirtyRef = useRef(false);

  const builder = project?.builder;

  useEffect(() => {
    if (!project || !dirtyRef.current) return;
    updateBuilder(project.id, { autosaveStatus: 'saving' });
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      updateBuilder(project.id, { autosaveStatus: 'saved', lastSavedAt: new Date().toISOString() });
      dirtyRef.current = false;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, AUTOSAVE_DELAY);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    builder?.summary,
    builder?.targetCustomer,
    builder?.userProblem,
    builder?.solution,
    builder?.evidence,
    builder?.assumptions,
    builder?.currentConcerns,
    builder?.criteria,
  ]);

  const criteriaProgress = useMemo(() => {
    if (!builder) return 0;
    const met = builder.criteria.filter((c) => c.status === 'met').length;
    return builder.criteria.length ? Math.round((met / builder.criteria.length) * 100) : 0;
  }, [builder]);

  if (!project || !builder || project.ownerEmail !== currentEmail) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center">
          <EmptyState title="프로젝트를 찾을 수 없습니다" action={<Button onClick={() => navigate('/mypage')}>마이페이지로</Button>} />
        </div>
      </AppShell>
    );
  }

  const markDirty = (patch: Partial<typeof builder>) => {
    dirtyRef.current = true;
    updateBuilder(project.id, patch);
  };

  const handleManualSave = () => {
    updateBuilder(project.id, {
      autosaveStatus: 'saved',
      lastSavedAt: new Date().toISOString(),
      versions: [
        { id: makeId('bver'), label: `버전 ${builder.versions.length + 1}`, savedAt: new Date().toISOString(), savedBy: currentUser?.name ?? '나' },
        ...builder.versions,
      ],
    });
    toast.push('저장되었습니다.');
  };

  const startChat = () => {
    const msg = openingMessage(builder);
    updateBuilder(project.id, { chatMessages: [msg] });
  };

  const sendChat = (text: string) => {
    const userMsg = { id: makeId('msg'), role: 'user' as const, content: text, createdAt: new Date().toISOString() };
    const nextMessages = [...builder.chatMessages, userMsg];
    updateBuilder(project.id, { chatMessages: nextMessages });
    setThinking(true);
    window.setTimeout(() => {
      const reply = generateAiReply(builder, text);
      updateBuilder(project.id, { chatMessages: [...nextMessages, reply] });
      setThinking(false);
    }, 800 + Math.random() * 500);
  };

  const patchCriterion = (id: string, patch: Partial<CriterionEntry>) => {
    markDirty({ criteria: builder.criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  };

  const addCriterion = () => {
    if (!newCriterionName.trim()) return;
    const criterion: CriterionEntry = {
      id: makeId('crit'),
      name: newCriterionName.trim(),
      description: '사용자가 추가한 점검 기준입니다.',
      evidence: '',
      judgement: '',
      unresolved: '',
      nextAction: '',
      status: 'unmet',
      weight: 1,
      custom: true,
    };
    markDirty({ criteria: [...builder.criteria, criterion] });
    setNewCriterionName('');
  };

  const removeCriterion = (id: string) => {
    markDirty({ criteria: builder.criteria.filter((c) => c.id !== id) });
  };

  const importFromIdea = (ideaId: string) => {
    const idea = project.generator.ideas.find((i) => i.id === ideaId);
    if (!idea) return;
    markDirty({
      summary: idea.oneLiner,
      targetCustomer: idea.customer,
      userProblem: idea.problem,
      solution: idea.solution,
    });
    setShowImportDialog(false);
    toast.push('Generator 결과를 불러왔습니다.');
  };

  const sendToPlanner = () => {
    if (project.stage === 'builder') {
      updateProject(project.id, { stage: 'planner' });
    }
    toast.push('Planner로 전달했습니다.');
    navigate(`/project/${project.id}/planner`);
  };

  const autosaveLabel = {
    idle: '',
    saving: '저장 중…',
    saved: builder.lastSavedAt ? `${relativeTime(builder.lastSavedAt)} 저장됨` : '',
    error: '저장 실패',
  }[builder.autosaveStatus];

  return (
    <AppShell project={project} activeStage="builder">
      <div className="pb-20">
      <div className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-[20px] font-bold text-ink-strong">Builder · 아이디어 검증 및 고도화</h1>
            <p className="mt-1 text-[13px] text-ink-muted">AI 채팅과 점검 기준으로 아이디어의 빈틈을 함께 메워보세요.</p>
          </div>
          <div className="flex items-center gap-2">
            {autosaveLabel && (
              <span className={`text-[12px] ${builder.autosaveStatus === 'saving' ? 'text-ink-faint' : 'text-brand-strong'}`}>
                {builder.autosaveStatus === 'saving' && '● '}
                {autosaveLabel}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleManualSave}>
              지금 저장
            </Button>
          </div>
        </div>

        <Tabs
          items={[
            { id: 'start', label: '① 시작 정보' },
            { id: 'chat', label: '② AI 채팅 고도화', badge: builder.chatMessages.filter((m) => m.role === 'user').length },
            { id: 'criteria', label: '③ 점검 기준' },
          ]}
          activeId={tab}
          onChange={(id) => setTab(id as typeof tab)}
          className="mb-5 border-b border-hairline"
        />

        {tab === 'start' && (
          <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13.5px] font-bold text-ink-strong">아이디어 시작 정보</p>
              {project.generator.ideas.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
                  Generator 결과 불러오기
                </Button>
              )}
            </div>
            <Textarea label="아이디어 요약" rows={2} value={builder.summary} onChange={(e) => markDirty({ summary: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Textarea label="타겟 고객" rows={2} value={builder.targetCustomer} onChange={(e) => markDirty({ targetCustomer: e.target.value })} />
              <Textarea label="사용자 문제" rows={2} value={builder.userProblem} onChange={(e) => markDirty({ userProblem: e.target.value })} />
              <Textarea label="해결 방안" rows={2} value={builder.solution} onChange={(e) => markDirty({ solution: e.target.value })} />
              <Textarea label="보유 근거" rows={2} value={builder.evidence} onChange={(e) => markDirty({ evidence: e.target.value })} />
              <Textarea label="핵심 가정" rows={2} value={builder.assumptions} onChange={(e) => markDirty({ assumptions: e.target.value })} />
              <Textarea label="현재 고민" rows={2} value={builder.currentConcerns} onChange={(e) => markDirty({ currentConcerns: e.target.value })} />
            </div>

            {builder.versions.length > 0 && (
              <div className="mt-2 border-t border-hairline pt-3">
                <p className="mb-2 text-[12.5px] font-bold text-ink-muted">저장 이력</p>
                <ul className="flex flex-col gap-1">
                  {builder.versions.slice(0, 5).map((v) => (
                    <li key={v.id} className="text-[12px] text-ink-faint">
                      {v.label} · {v.savedBy} · {formatDateTime(v.savedAt)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === 'chat' && (
          <ChatPanel messages={builder.chatMessages} onSend={sendChat} onStart={startChat} thinking={thinking} />
        )}

        {tab === 'criteria' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-xl border border-hairline bg-white p-4">
              <div>
                <p className="text-[13.5px] font-bold text-ink-strong">점검 기준 충족률</p>
                <p className="text-[12px] text-ink-muted">충족 상태는 직접 판단하여 표시해주세요.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-hairline">
                  <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${criteriaProgress}%` }} />
                </div>
                <span className="text-[13px] font-bold text-brand-strong">{criteriaProgress}%</span>
              </div>
            </div>

            {builder.criteria.map((c) => (
              <CriterionCard
                key={c.id}
                criterion={c}
                onChange={(patch) => patchCriterion(c.id, patch)}
                onRemove={c.custom ? () => removeCriterion(c.id) : undefined}
              />
            ))}

            <div className="flex items-center gap-2 rounded-xl border border-dashed border-hairline-strong bg-white p-3">
              <input
                value={newCriterionName}
                onChange={(e) => setNewCriterionName(e.target.value)}
                placeholder="새로운 점검 기준 이름 (예: 규제 리스크)"
                className="h-9 flex-1 rounded-lg border border-hairline-strong bg-white px-3 text-[13px] outline-none focus:border-brand"
              />
              <Button size="sm" variant="outline" onClick={addCriterion}>
                + 기준 추가
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white/95 px-5 py-3 backdrop-blur transition-[left] duration-150 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Badge tone="outline">고도화 진행률 {criteriaProgress}%</Badge>
          <Button size="lg" onClick={sendToPlanner}>
            Planner로 전달 →
          </Button>
        </div>
      </div>

      <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)} title="Generator 결과 불러오기" size="md">
        <div className="flex flex-col gap-2">
          {project.generator.ideas.map((idea) => (
            <button
              key={idea.id}
              onClick={() => importFromIdea(idea.id)}
              className="rounded-lg border border-hairline p-3 text-left transition-colors hover:border-brand hover:bg-brand-soft/40"
            >
              <p className="text-[13.5px] font-bold text-ink-strong">{idea.title}</p>
              <p className="mt-0.5 text-[12px] text-ink-muted line-clamp-2">{idea.oneLiner}</p>
            </button>
          ))}
        </div>
      </Dialog>
      </div>
    </AppShell>
  );
}
