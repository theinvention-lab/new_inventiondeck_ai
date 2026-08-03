import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { CardLibrary } from '../../components/generator/CardLibrary';
import { CardTray } from '../../components/generator/CardTray';
import { CardDetailDialog } from '../../components/generator/CardDetailDialog';
import { RecommendedRail } from '../../components/generator/RecommendedRail';
import { IdeaResultCard } from '../../components/generator/IdeaResultCard';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useToast } from '../../components/ui/Toast';
import { getCardsByIds } from '../../data/cards';
import type { BizCard, IdeaDraft } from '../../types';
import { generateIdeas } from '../../ai/ideaEngine';
import { recommendCards } from '../../lib/recommend';
import { makeId } from '../../lib/id';
import { relativeTime } from '../../lib/format';

export function GeneratorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const currentEmail = useAuthStore((s) => s.currentEmail);

  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const updateGenerator = useProjectStore((s) => s.updateGenerator);
  const updateProject = useProjectStore((s) => s.updateProject);
  const updateDeveloper = useProjectStore((s) => s.updateDeveloper);

  const [step, setStep] = useState<'select' | 'results'>('select');
  const [detailCard, setDetailCard] = useState<BizCard | null>(null);
  const [generating, setGenerating] = useState(false);
  const [viewingIdeaId, setViewingIdeaId] = useState<string | null>(null);
  const [seedOffset, setSeedOffset] = useState(0);

  const selectedCards = useMemo(
    () => (project ? getCardsByIds(project.generator.selectedCardIds) : []),
    [project],
  );

  const recommended = useMemo(() => {
    if (!project) return [];
    return recommendCards(project.generator.cardHistory, project.generator.selectedCardIds, 8);
  }, [project]);

  if (!project || project.ownerEmail !== currentEmail) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center">
          <EmptyState title="프로젝트를 찾을 수 없습니다" action={<Button onClick={() => navigate('/mypage')}>마이페이지로</Button>} />
        </div>
      </AppShell>
    );
  }

  const gen = project.generator;
  const canGenerate = gen.selectedCardIds.length >= 2;
  const viewingIdea = gen.ideas.find((i) => i.id === viewingIdeaId) ?? gen.ideas[0] ?? null;

  const toggleCard = (id: string) => {
    const exists = gen.selectedCardIds.includes(id);
    const nextIds = exists ? gen.selectedCardIds.filter((c) => c !== id) : [...gen.selectedCardIds, id];
    const nextHistory = exists ? gen.cardHistory : [...gen.cardHistory, id];
    updateGenerator(project.id, { selectedCardIds: nextIds, cardHistory: nextHistory });
  };

  const removeCard = (id: string) => {
    updateGenerator(project.id, { selectedCardIds: gen.selectedCardIds.filter((c) => c !== id) });
  };

  const handleGenerate = () => {
    if (!canGenerate) {
      toast.push('최소 2개의 카드를 선택해주세요.', 'error');
      return;
    }
    setGenerating(true);
    window.setTimeout(() => {
      const ideas = generateIdeas({
        selectedCards,
        interest: gen.interest,
        problemFocus: gen.problemFocus,
        count: 3,
        seedOffset,
      });
      updateGenerator(project.id, { ideas, lastGeneratedAt: new Date().toISOString(), selectedIdeaId: null });
      setViewingIdeaId(ideas[0]?.id ?? null);
      setSeedOffset((v) => v + 1);
      setGenerating(false);
      setStep('results');
      toast.push(`아이디어 ${ideas.length}개를 생성했습니다.`);
    }, 1100);
  };

  const handleRegenerate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      const ideas = generateIdeas({
        selectedCards,
        interest: gen.interest,
        problemFocus: gen.problemFocus,
        count: 3,
        seedOffset,
      });
      updateGenerator(project.id, { ideas, selectedIdeaId: null, lastGeneratedAt: new Date().toISOString() });
      setViewingIdeaId(ideas[0]?.id ?? null);
      setSeedOffset((v) => v + 1);
      setGenerating(false);
      toast.push('새로운 아이디어로 다시 생성했습니다.');
    }, 900);
  };

  const patchIdea = (ideaId: string, patch: Partial<IdeaDraft>) => {
    updateGenerator(project.id, {
      ideas: gen.ideas.map((i) => (i.id === ideaId ? { ...i, ...patch } : i)),
    });
  };

  const selectAsAdopted = (ideaId: string) => {
    updateGenerator(project.id, { selectedIdeaId: ideaId });
  };

  const saveVersion = () => {
    if (!viewingIdea) return;
    const version = {
      id: makeId('ver'),
      label: `버전 ${gen.versions.length + 1}`,
      savedAt: new Date().toISOString(),
      snapshot: viewingIdea,
    };
    updateGenerator(project.id, { versions: [version, ...gen.versions] });
    toast.push('버전을 저장했습니다.');
  };

  const restoreVersion = (versionId: string) => {
    const version = gen.versions.find((v) => v.id === versionId);
    if (!version) return;
    updateGenerator(project.id, {
      ideas: gen.ideas.map((i) => (i.id === version.snapshot.id ? version.snapshot : i)),
    });
    toast.push(`${version.label}으로 복원했습니다.`);
  };

  const sendToDeveloper = () => {
    if (!gen.selectedIdeaId) {
      toast.push('Developer로 전달할 아이디어를 먼저 채택해주세요.', 'error');
      return;
    }
    const idea = gen.ideas.find((i) => i.id === gen.selectedIdeaId);
    if (!idea) return;

    const dev = project.developer;
    updateDeveloper(project.id, {
      summary: dev.summary || idea.oneLiner,
      targetCustomer: dev.targetCustomer || idea.customer,
      userProblem: dev.userProblem || idea.problem,
      solution: dev.solution || idea.solution,
    });
    if (project.stage === 'generator') {
      updateProject(project.id, { stage: 'developer' });
    }
    toast.push('Developer로 전달했습니다.');
    navigate(`/project/${project.id}/developer`);
  };

  return (
    <AppShell project={project} activeStage="generator">
      <div className="pb-24">
      <CardTray cards={selectedCards} onRemove={removeCard} />

      <div className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-ink-strong">Generator · AI 기반 아이디어 생성</h1>
            <p className="mt-1 text-[13px] text-ink-muted">
              카드를 조합하고 관심사를 입력하면 AI가 서로 다른 사업 아이디어 초안을 제안합니다.
            </p>
          </div>
          <Badge tone={gen.ideas.length > 0 ? 'brand' : 'neutral'}>{gen.ideas.length}개 생성됨</Badge>
        </div>

        <Tabs
          items={[
            { id: 'select', label: '① 카드 선택 & 조건 입력' },
            { id: 'results', label: '② 아이디어 결과', badge: gen.ideas.length },
          ]}
          activeId={step}
          onChange={(id) => setStep(id as 'select' | 'results')}
          className="mb-5 border-b border-hairline"
        />

        {step === 'select' ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-3 rounded-xl border border-hairline bg-white p-4 sm:grid-cols-2">
              <Textarea
                label="관심 분야 / 해결하고 싶은 문제"
                rows={2}
                placeholder="예: 반려동물을 키우는 1인 가구를 위한 서비스를 만들고 싶어요"
                value={gen.interest}
                onChange={(e) => updateGenerator(project.id, { interest: e.target.value })}
              />
              <Textarea
                label="선호 조건 (선택)"
                rows={2}
                placeholder="예: 초기 투자 비용이 적고, 6개월 내 검증 가능한 아이디어였으면 해요"
                value={gen.problemFocus}
                onChange={(e) => updateGenerator(project.id, { problemFocus: e.target.value })}
              />
            </div>

            <RecommendedRail cards={recommended} onAdd={toggleCard} />

            <CardLibrary selectedIds={gen.selectedCardIds} onToggle={toggleCard} onOpenDetail={setDetailCard} />
          </div>
        ) : gen.ideas.length === 0 ? (
          <EmptyState
            title="아직 생성된 아이디어가 없어요"
            description="카드 선택 탭으로 이동해 2개 이상의 카드를 담고 아이디어를 생성해보세요."
            action={<Button onClick={() => setStep('select')}>카드 선택하러 가기</Button>}
          />
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              {gen.ideas.map((idea, idx) => (
                <button
                  key={idea.id}
                  onClick={() => setViewingIdeaId(idea.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    viewingIdea?.id === idea.id
                      ? 'border-ink-strong bg-ink-strong text-white'
                      : 'border-hairline-strong bg-white text-ink-muted hover:bg-canvas-sunken'
                  }`}
                >
                  아이디어 {idx + 1}
                  {gen.selectedIdeaId === idea.id && <span className="text-brand">✓ 채택</span>}
                </button>
              ))}
              <Button variant="outline" size="sm" onClick={handleRegenerate} loading={generating}>
                🔄 다시 생성
              </Button>
            </div>

            {viewingIdea && (
              <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                <div className="rounded-xl border border-hairline bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[13px] text-ink-faint">
                      {gen.lastGeneratedAt && `생성 시각: ${relativeTime(gen.lastGeneratedAt)}`}
                    </p>
                    <Button
                      size="sm"
                      variant={gen.selectedIdeaId === viewingIdea.id ? 'primary' : 'outline'}
                      onClick={() => selectAsAdopted(viewingIdea.id)}
                    >
                      {gen.selectedIdeaId === viewingIdea.id ? '채택된 아이디어 ✓' : '이 아이디어 채택하기'}
                    </Button>
                  </div>
                  <IdeaResultCard idea={viewingIdea} onChange={(patch) => patchIdea(viewingIdea.id, patch)} />
                </div>

                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-hairline bg-white p-4">
                    <p className="mb-2 text-[13px] font-bold text-ink-strong">태그</p>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingIdea.tags.map((t) => (
                        <Badge key={t} tone="outline">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-hairline bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[13px] font-bold text-ink-strong">버전 기록</p>
                      <Button size="sm" variant="ghost" onClick={saveVersion}>
                        + 저장
                      </Button>
                    </div>
                    {gen.versions.length === 0 ? (
                      <p className="text-[12px] text-ink-faint">아직 저장된 버전이 없습니다.</p>
                    ) : (
                      <ul className="flex flex-col gap-1.5">
                        {gen.versions.slice(0, 5).map((v) => (
                          <li key={v.id} className="flex items-center justify-between text-[12px] text-ink-muted">
                            <span>
                              {v.label} · {relativeTime(v.savedAt)}
                            </span>
                            <button className="font-semibold text-brand" onClick={() => restoreVersion(v.id)}>
                              복원
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <Button size="lg" fullWidth onClick={sendToDeveloper}>
                    Developer로 전달 →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'select' && (
          <div className="fixed inset-x-0 bottom-0 left-64 z-30 border-t border-hairline bg-white/95 px-5 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <p className="text-[13px] text-ink-muted">
                {canGenerate ? `${gen.selectedCardIds.length}개 카드로 아이디어를 생성할 수 있어요` : '카드를 2개 이상 선택해주세요'}
              </p>
              <Button size="lg" onClick={handleGenerate} loading={generating} disabled={!canGenerate}>
                ✨ AI 아이디어 생성하기
              </Button>
            </div>
          </div>
        )}
      </div>

      <CardDetailDialog
        card={detailCard}
        selected={!!detailCard && gen.selectedCardIds.includes(detailCard.id)}
        onClose={() => setDetailCard(null)}
        onToggle={() => detailCard && toggleCard(detailCard.id)}
      />
      </div>
    </AppShell>
  );
}
