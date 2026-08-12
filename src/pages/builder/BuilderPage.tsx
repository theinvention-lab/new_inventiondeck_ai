import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Tabs } from '../../components/ui/Tabs';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { CriterionCard } from '../../components/builder/CriterionCard';
import { CriteriaSuggestionPanel } from '../../components/builder/CriteriaSuggestionPanel';
import { StartInfoSourcePicker, type ProjectIdeaOption } from '../../components/builder/StartInfoSourcePicker';
import { TemplateSelector } from '../../components/builder/TemplateSelector';
import { TemplateFieldsForm } from '../../components/builder/TemplateFieldsForm';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useToast } from '../../components/ui/Toast';
import { generateTemplateDraft } from '../../ai/templateDraftEngine';
import { suggestCriteria, criterionFromModule, type CriterionSuggestion } from '../../ai/criteriaEngine';
import { makeId } from '../../lib/id';
import { relativeTime, formatDateTime } from '../../lib/format';
import { getBuilderTemplate } from '../../data/builderTemplates';
import type { CriterionEntry, BuilderTemplateId, IdeaDraft, StartInfoSource } from '../../types';

const AUTOSAVE_DELAY = 1000;
const SIMULATED_FAILURE_RATE = 0.12;

// 아이디어에서 시작 정보로 그대로 옮길 수 있는 항목만 추린다. 나머지(근거·
// 가정·고민)는 사용자가 직접 채우는 몫이라 건드리지 않는다.
function startInfoFromIdea(idea: IdeaDraft) {
  return {
    summary: idea.oneLiner,
    targetCustomer: idea.customer,
    userProblem: idea.problem,
    solution: idea.solution,
  };
}

export function BuilderPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const currentEmail = useAuthStore((s) => s.currentEmail);
  const currentUser = useAuthStore((s) => s.currentUser());

  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const projects = useProjectStore((s) => s.projects);
  const updateBuilder = useProjectStore((s) => s.updateBuilder);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [tab, setTab] = useState<'start' | 'template' | 'criteria'>('start');
  const [newCriterionName, setNewCriterionName] = useState('');
  const [draggedCriterionId, setDraggedCriterionId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CriterionSuggestion[] | null>(null);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);

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

  // 가져오기 후보 — 아이디어를 가진 내 프로젝트들. 현재 프로젝트를 맨 앞에 둔다.
  const projectIdeaOptions = useMemo<ProjectIdeaOption[]>(() => {
    const mine = projects.filter((p) => p.ownerEmail === currentEmail && !p.trashedAt);
    const ordered = [...mine].sort((a, b) => Number(b.id === projectId) - Number(a.id === projectId));
    return ordered.flatMap((p) => p.generator.ideas.map((idea) => ({ project: p, idea, isCurrent: p.id === projectId })));
  }, [projects, currentEmail, projectId]);

  // Case 1 — Generator에서 막 넘어온 경우, 손대지 않은 시작 정보라면
  // 고른 아이디어를 그대로 반영해준다.
  const autoCarriedRef = useRef(false);
  useEffect(() => {
    if (autoCarriedRef.current || !project || !builder) return;
    if (builder.startInfoSource !== 'manual' || builder.sourceIdeaId) return;
    const untouched = ![builder.summary, builder.targetCustomer, builder.userProblem, builder.solution].some((v) => v.trim());
    if (!untouched) return;
    const idea =
      project.generator.ideas.find((i) => i.id === project.generator.selectedIdeaId) ??
      (project.generator.ideas.length === 1 ? project.generator.ideas[0] : undefined);
    if (!idea) return;
    autoCarriedRef.current = true;
    updateBuilder(project.id, {
      startInfoSource: 'project',
      sourceIdeaId: idea.id,
      sourceProjectId: project.id,
      ...startInfoFromIdea(idea),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

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
          {
            id: makeId('bver'),
            label: `버전 ${builder.versions.length + 1}`,
            savedAt: new Date().toISOString(),
            savedBy: currentUser?.name ?? '나',
            snapshot: {
              summary: builder.summary,
              targetCustomer: builder.targetCustomer,
              userProblem: builder.userProblem,
              solution: builder.solution,
              templateValues: builder.templateValues,
              criteria: builder.criteria,
            },
          },
          ...builder.versions,
        ],
      });
      dirtyRef.current = false;
      toast.push('저장되었습니다.');
    }, 500);
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

  const applyProjectIdea = (fromProjectId: string, ideaId: string) => {
    const option = projectIdeaOptions.find((o) => o.project.id === fromProjectId && o.idea.id === ideaId);
    if (!option) return;
    markDirty({
      startInfoSource: 'project',
      sourceIdeaId: option.idea.id,
      sourceProjectId: option.project.id,
      ...startInfoFromIdea(option.idea),
    });
    toast.push(`"${option.idea.title}" 내용을 시작 정보로 가져왔어요.`);
  };

  const selectStartInfoSource = (source: StartInfoSource) => {
    if (source === builder.startInfoSource) return;
    if (source === 'manual') {
      markDirty({ startInfoSource: 'manual', sourceIdeaId: null, sourceProjectId: null });
      return;
    }
    // 후보가 하나뿐이면 굳이 한 번 더 고르게 하지 않는다.
    if (projectIdeaOptions.length === 1) {
      applyProjectIdea(projectIdeaOptions[0].project.id, projectIdeaOptions[0].idea.id);
      return;
    }
    markDirty({ startInfoSource: 'project', sourceIdeaId: null, sourceProjectId: null });
  };

  const runCriteriaSuggestion = () => {
    const hasStartInfo = [builder.summary, builder.targetCustomer, builder.userProblem, builder.solution].some((v) => v.trim());
    if (!hasStartInfo) {
      toast.push('먼저 ① 시작 정보 탭에서 아이디어 내용을 입력해주세요.', 'error');
      return;
    }
    setSuggesting(true);
    window.setTimeout(() => {
      const next = suggestCriteria(builder);
      setSuggestions(next);
      setSelectedSuggestionIds(next.map((s) => s.module.id));
      setSuggesting(false);
    }, 700);
  };

  const toggleSuggestion = (moduleId: string) => {
    setSelectedSuggestionIds((ids) => (ids.includes(moduleId) ? ids.filter((id) => id !== moduleId) : [...ids, moduleId]));
  };

  const addSelectedSuggestions = () => {
    if (!suggestions) return;
    const picked = suggestions.filter((s) => selectedSuggestionIds.includes(s.module.id)).map((s) => criterionFromModule(s.module));
    if (picked.length === 0) return;
    markDirty({ criteria: [...builder.criteria, ...picked], criteriaSuggestedAt: new Date().toISOString() });
    setSuggestions(null);
    setSelectedSuggestionIds([]);
    toast.push(`점검 기준 ${picked.length}개를 담았어요.`);
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
              <div className="flex flex-col gap-5">
                <StartInfoSourcePicker
                  source={builder.startInfoSource}
                  options={projectIdeaOptions}
                  sourceIdeaId={builder.sourceIdeaId}
                  onSelectSource={selectStartInfoSource}
                  onSelectIdea={applyProjectIdea}
                />

                <div className="flex flex-col gap-4 rounded-none border border-hairline bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[13.5px] font-bold text-ink-strong">아이디어 시작 정보</p>
                  {builder.startInfoSource === 'project' && builder.sourceIdeaId && (
                    <span className="text-[12px] text-ink-faint">프로젝트 아이디어에서 가져옴 · 나머지 항목을 채워주세요</span>
                  )}
                </div>
                <Textarea label="아이디어 요약" dragLabel="아이디어 요약" rows={2} value={builder.summary} onChange={(e) => markDirty({ summary: e.target.value })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Textarea label="타겟 고객" dragLabel="타겟 고객" rows={2} value={builder.targetCustomer} onChange={(e) => markDirty({ targetCustomer: e.target.value })} />
                  <Textarea label="사용자 문제" dragLabel="사용자 문제" rows={2} value={builder.userProblem} onChange={(e) => markDirty({ userProblem: e.target.value })} />
                  <Textarea label="해결 방안" dragLabel="해결 방안" rows={2} value={builder.solution} onChange={(e) => markDirty({ solution: e.target.value })} />
                  <Textarea label="보유 근거" dragLabel="보유 근거" rows={2} value={builder.evidence} onChange={(e) => markDirty({ evidence: e.target.value })} />
                  <Textarea label="핵심 가정" dragLabel="핵심 가정" rows={2} value={builder.assumptions} onChange={(e) => markDirty({ assumptions: e.target.value })} />
                  <Textarea label="현재 고민" dragLabel="현재 고민" rows={2} value={builder.currentConcerns} onChange={(e) => markDirty({ currentConcerns: e.target.value })} />
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
              </div>
            )}

            {tab === 'template' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] text-ink-muted">
                    사업 특성에 맞는 구체화 템플릿을 선택하고, 항목별로 작성해보세요. 템플릿을 바꿔도 이전에 작성한 내용은 유지됩니다.
                  </p>
                  <Button variant="outline" size="sm" onClick={draftTemplateFromStartInfo} className="shrink-0">
                    ✨ 시작 정보로 채우기
                  </Button>
                </div>
                <TemplateSelector activeId={builder.activeTemplateId} onSelect={selectTemplate} filledCount={filledCount} />
                <TemplateFieldsForm template={activeTemplate} values={activeTemplateValues} onChange={updateTemplateField} />
              </div>
            )}

            {tab === 'criteria' && (
              <div className="flex flex-col gap-4">
                {builder.criteria.length > 0 && (
                  <div className="flex items-center justify-between rounded-none border border-hairline bg-white p-4">
                    <div>
                      <p className="text-[13.5px] font-bold text-ink-strong">점검 기준 충족률</p>
                      <p className="text-[12px] text-ink-muted">충족 상태는 직접 판단하여 표시해주세요.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={runCriteriaSuggestion} loading={suggesting}>
                        ✨ 기준 더 찾기
                      </Button>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-hairline">
                          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${criteriaProgress}%` }} />
                        </div>
                        <span className="text-[13px] font-bold text-brand-strong">{criteriaProgress}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {suggestions && (
                  <CriteriaSuggestionPanel
                    suggestions={suggestions}
                    selectedIds={selectedSuggestionIds}
                    onToggle={toggleSuggestion}
                    onAdd={addSelectedSuggestions}
                    onDismiss={() => {
                      setSuggestions(null);
                      setSelectedSuggestionIds([]);
                    }}
                  />
                )}

                {builder.criteria.length === 0 && !suggestions && (
                  <div className="flex flex-col items-center gap-3 rounded-none border border-dashed border-hairline-strong bg-white px-6 py-14 text-center">
                    <span className="text-3xl">🧭</span>
                    <p className="text-[14px] font-bold text-ink-strong">아이디어에 맞는 점검 기준을 골라드릴게요</p>
                    <p className="max-w-md text-[12.5px] leading-relaxed text-ink-muted">
                      ① 시작 정보와 ② 구체화 템플릿에 작성하신 내용을 읽고, 점검 기준 모듈 중에서 이 아이디어에 꼭 필요한
                      항목만 추려 제안합니다.
                    </p>
                    <Button onClick={runCriteriaSuggestion} loading={suggesting}>
                      ✨ AI로 점검 기준 추천받기
                    </Button>
                  </div>
                )}

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

                {builder.criteria.length > 0 && (
                  <div className="flex items-center gap-2 rounded-none border border-dashed border-hairline-strong bg-white p-3">
                    <input
                      value={newCriterionName}
                      onChange={(e) => setNewCriterionName(e.target.value)}
                      placeholder="직접 추가할 점검 기준 이름 (예: 규제 리스크)"
                      className="h-9 flex-1 rounded-none border border-hairline-strong bg-white px-3 text-[13px] outline-none focus:border-brand"
                    />
                    <Button size="sm" variant="outline" onClick={addCriterion}>
                      + 기준 추가
                    </Button>
                  </div>
                )}
              </div>
            )}
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

      </div>
    </AppShell>
  );
}
