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
import { TemplateSelector } from '../../components/builder/TemplateSelector';
import { TemplateFieldsForm } from '../../components/builder/TemplateFieldsForm';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useToast } from '../../components/ui/Toast';
import { openingMessage, generateAiReply } from '../../ai/chatEngine';
import { generateTemplateDraft } from '../../ai/templateDraftEngine';
import { makeId } from '../../lib/id';
import { relativeTime, formatDateTime } from '../../lib/format';
import { getBuilderTemplate } from '../../data/builderTemplates';
import type { CriterionEntry, BuilderTemplateId } from '../../types';

const AUTOSAVE_DELAY = 1000;
const SIMULATED_FAILURE_RATE = 0.12;

export function BuilderPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const currentEmail = useAuthStore((s) => s.currentEmail);
  const currentUser = useAuthStore((s) => s.currentUser());

  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const updateBuilder = useProjectStore((s) => s.updateBuilder);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [tab, setTab] = useState<'start' | 'template' | 'criteria'>('start');
  const [thinking, setThinking] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [newCriterionName, setNewCriterionName] = useState('');
  const [draggedCriterionId, setDraggedCriterionId] = useState<string | null>(null);

  const saveTimer = useRef<number | null>(null);
  const dirtyRef = useRef(false);

  const builder = project?.builder;

  useEffect(() => {
    if (!project || !dirtyRef.current) return;
    updateBuilder(project.id, { autosaveStatus: 'saving' });
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      if (Math.random() < SIMULATED_FAILURE_RATE) {
        updateBuilder(project.id, { autosaveStatus: 'error' });
        return;
      }
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
    builder?.templateValues,
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
    updateBuilder(project.id, { autosaveStatus: 'saving' });
    window.setTimeout(() => {
      if (Math.random() < SIMULATED_FAILURE_RATE) {
        updateBuilder(project.id, { autosaveStatus: 'error' });
        toast.push('저장에 실패했습니다. 네트워크를 확인하고 다시 시도해주세요.', 'error');
        return;
      }
      updateBuilder(project.id, {
        autosaveStatus: 'saved',
        lastSavedAt: new Date().toISOString(),
        versions: [
          { id: makeId('bver'), label: `버전 ${builder.versions.length + 1}`, savedAt: new Date().toISOString(), savedBy: currentUser?.name ?? '나' },
          ...builder.versions,
        ],
      });
      dirtyRef.current = false;
      toast.push('저장되었습니다.');
    }, 500);
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
      attachments: [],
    };
    markDirty({ criteria: [...builder.criteria, criterion] });
    setNewCriterionName('');
  };

  const removeCriterion = (id: string) => {
    markDirty({ criteria: builder.criteria.filter((c) => c.id !== id) });
  };

  const reorderCriteria = (targetId: string) => {
    if (!draggedCriterionId || draggedCriterionId === targetId) return;
    const list = [...builder.criteria];
    const fromIdx = list.findIndex((c) => c.id === draggedCriterionId);
    const toIdx = list.findIndex((c) => c.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    markDirty({ criteria: list });
  };

  const activeTemplate = getBuilderTemplate(builder.activeTemplateId);
  const activeTemplateValues = builder.templateValues[builder.activeTemplateId] ?? {};

  const selectTemplate = (id: BuilderTemplateId) => {
    updateBuilder(project.id, { activeTemplateId: id });
  };

  const updateTemplateField = (fieldId: string, value: string) => {
    dirtyRef.current = true;
    updateBuilder(project.id, {
      templateValues: {
        ...builder.templateValues,
        [builder.activeTemplateId]: { ...activeTemplateValues, [fieldId]: value },
      },
    });
  };

  const filledCount = (id: BuilderTemplateId) => {
    const values = builder.templateValues[id] ?? {};
    return Object.values(values).filter((v) => v && v.trim().length > 0).length;
  };

  const applyTemplateDraft = (fieldIds?: string[]) => {
    const hasStartInfo = [builder.summary, builder.targetCustomer, builder.userProblem, builder.solution].some((v) => v.trim());
    if (!hasStartInfo) {
      toast.push('먼저 ① 시작 정보 탭에서 아이디어 내용을 입력해주세요.', 'error');
      return;
    }
    const draft = generateTemplateDraft(builder.activeTemplateId, {
      summary: builder.summary,
      targetCustomer: builder.targetCustomer,
      userProblem: builder.userProblem,
      solution: builder.solution,
      evidence: builder.evidence,
      assumptions: builder.assumptions,
      currentConcerns: builder.currentConcerns,
    });
    const entries = fieldIds ? fieldIds.map((id) => [id, draft[id]] as const) : Object.entries(draft);
    const merged = { ...activeTemplateValues };
    let filledAny = false;
    for (const [fieldId, value] of entries) {
      if (value !== undefined && (!merged[fieldId] || !merged[fieldId].trim())) {
        merged[fieldId] = value;
        filledAny = true;
      }
    }
    if (!filledAny) {
      toast.push('이미 모든 항목이 작성되어 있어요.');
      return;
    }
    dirtyRef.current = true;
    updateBuilder(project.id, { templateValues: { ...builder.templateValues, [builder.activeTemplateId]: merged } });
    toast.push('시작 정보를 바탕으로 초안을 작성했어요.');
  };

  const draftTemplateFromStartInfo = () => applyTemplateDraft();

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
    toast.push('프로젝트 정보를 불러왔습니다.');
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
    <AppShell>
      <div className="pb-20">
      <div className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-[20px] font-bold text-ink-strong">Builder</h1>
          <div className="flex items-center gap-2">
            {autosaveLabel && (
              <span
                className={`text-[12px] ${
                  builder.autosaveStatus === 'saving'
                    ? 'text-ink-faint'
                    : builder.autosaveStatus === 'error'
                      ? 'text-danger'
                      : 'text-brand-strong'
                }`}
              >
                {builder.autosaveStatus === 'saving' && '● '}
                {autosaveLabel}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleManualSave} loading={builder.autosaveStatus === 'saving'}>
              지금 저장
            </Button>
          </div>
        </div>

        {builder.autosaveStatus === 'error' && (
          <div className="mb-5 flex items-center gap-2 rounded-none border border-danger/40 bg-danger-soft px-4 py-3 text-[13px] text-danger">
            <span>⚠️</span>
            <p className="flex-1">저장 중 네트워크 오류가 발생했습니다. 변경사항은 남아 있어요 — 다시 시도해주세요.</p>
            <Button size="sm" variant="danger" onClick={handleManualSave}>
              다시 시도
            </Button>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <Tabs
              items={[
                { id: 'start', label: '① 시작 정보' },
                { id: 'template', label: '② 구체화 템플릿' },
                { id: 'criteria', label: '③ 점검 기준' },
              ]}
              activeId={tab}
              onChange={(id) => setTab(id as typeof tab)}
              className="mb-5 border-b border-hairline"
            />

            {tab === 'start' && (
              <div className="flex flex-col gap-4 rounded-none border border-hairline bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[13.5px] font-bold text-ink-strong">아이디어 시작 정보</p>
                  {project.generator.ideas.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
                      프로젝트 불러오기
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

            {tab === 'template' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] text-ink-muted">
                    사업 특성에 맞는 구체화 템플릿을 선택하고, 항목별로 작성해보세요. 템플릿을 바꿔도 이전에 작성한 내용은 유지됩니다.
                  </p>
                  <Button variant="outline" size="sm" onClick={draftTemplateFromStartInfo} className="shrink-0">
                    ✨ 시작 정보로 초안 작성
                  </Button>
                </div>
                <TemplateSelector activeId={builder.activeTemplateId} onSelect={selectTemplate} filledCount={filledCount} />
                <TemplateFieldsForm template={activeTemplate} values={activeTemplateValues} onChange={updateTemplateField} />
              </div>
            )}

            {tab === 'criteria' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-none border border-hairline bg-white p-4">
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
                    draggable
                    dragging={draggedCriterionId === c.id}
                    onDragStart={() => setDraggedCriterionId(c.id)}
                    onDragOver={() => reorderCriteria(c.id)}
                    onDrop={() => setDraggedCriterionId(null)}
                    onDragEnd={() => setDraggedCriterionId(null)}
                  />
                ))}

                <div className="flex items-center gap-2 rounded-none border border-dashed border-hairline-strong bg-white p-3">
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

          <div className="flex flex-col lg:sticky lg:top-6 lg:h-[calc(100vh-140px)]">
            <ChatPanel messages={builder.chatMessages} onSend={sendChat} onStart={startChat} thinking={thinking} />
          </div>
        </div>
      </div>

      <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white/95 px-5 py-3 backdrop-blur left-[88px]`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Badge tone="outline">고도화 진행률 {criteriaProgress}%</Badge>
          <Button size="lg" onClick={sendToPlanner}>
            Planner로 전달 →
          </Button>
        </div>
      </div>

      <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)} title="프로젝트 불러오기" size="md">
        <div className="flex flex-col gap-2">
          {project.generator.ideas.map((idea) => (
            <button
              key={idea.id}
              onClick={() => importFromIdea(idea.id)}
              className="rounded-none border border-hairline p-3 text-left transition-colors hover:border-brand hover:bg-brand-soft/40"
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
