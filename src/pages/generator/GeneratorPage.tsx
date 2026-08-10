import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { CardLibrary } from '../../components/generator/CardLibrary';
import { CardTray } from '../../components/generator/CardTray';
import { CardDetailDialog } from '../../components/generator/CardDetailDialog';
import { RecommendedRail } from '../../components/generator/RecommendedRail';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useToast } from '../../components/ui/Toast';
import { useCardStore } from '../../store/cardStore';
import type { BizCard } from '../../types';
import { generateIdeas } from '../../ai/ideaEngine';
import { recommendCards } from '../../lib/recommend';
import { relativeTime } from '../../lib/format';

const IDEA_ACCENTS = ['#e4002b', '#0c43b7', '#16a34a', '#7c3aed'];

export function GeneratorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const currentEmail = useAuthStore((s) => s.currentEmail);

  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const updateGenerator = useProjectStore((s) => s.updateGenerator);
  const updateProject = useProjectStore((s) => s.updateProject);
  const updateBuilder = useProjectStore((s) => s.updateBuilder);

  const [step, setStep] = useState<'select' | 'results'>('select');
  const [detailCard, setDetailCard] = useState<BizCard | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState<number | null>(null);
  const [seedOffset, setSeedOffset] = useState(0);

  const startProgressTicker = () => {
    setGenProgress(0);
    const interval = window.setInterval(() => {
      setGenProgress((v) => (v !== null && v < 90 ? v + Math.round(8 + Math.random() * 10) : v));
    }, 150);
    return interval;
  };

  const allCards = useCardStore((s) => s.cards);

  const selectedCards = useMemo(() => {
    if (!project) return [];
    const idSet = new Set(project.generator.selectedCardIds);
    return allCards.filter((c) => idSet.has(c.id));
  }, [project, allCards]);

  const recommended = useMemo(() => {
    if (!project) return [];
    return recommendCards(allCards, project.generator.cardHistory, project.generator.selectedCardIds, 8);
  }, [project, allCards]);

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
  const selectedCategoryCount = new Set(selectedCards.map((c) => c.category)).size;
  const canGenerate = selectedCards.length >= 3 && selectedCategoryCount >= 3;

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
      toast.push('최소 3개 카테고리에서 카드를 3장 이상 선택해주세요.', 'error');
      return;
    }
    setGenerating(true);
    const interval = startProgressTicker();
    window.setTimeout(() => {
      window.clearInterval(interval);
      const ideas = generateIdeas({
        selectedCards,
        interest: gen.interest,
        problemFocus: gen.problemFocus,
        count: 3,
        seedOffset,
      });
      updateGenerator(project.id, { ideas, lastGeneratedAt: new Date().toISOString(), selectedIdeaId: null });
      setSeedOffset((v) => v + 1);
      setGenProgress(100);
      window.setTimeout(() => setGenProgress(null), 500);
      setGenerating(false);
      setStep('results');
      toast.push(`아이디어 ${ideas.length}개를 생성했습니다.`);
    }, 1100);
  };

  const handleRegenerate = () => {
    setGenerating(true);
    const interval = startProgressTicker();
    window.setTimeout(() => {
      window.clearInterval(interval);
      const ideas = generateIdeas({
        selectedCards,
        interest: gen.interest,
        problemFocus: gen.problemFocus,
        count: 3,
        seedOffset,
      });
      updateGenerator(project.id, { ideas, selectedIdeaId: null, lastGeneratedAt: new Date().toISOString() });
      setSeedOffset((v) => v + 1);
      setGenProgress(100);
      window.setTimeout(() => setGenProgress(null), 500);
      setGenerating(false);
      toast.push('새로운 아이디어로 다시 생성했습니다.');
    }, 900);
  };

  const selectAsAdopted = (ideaId: string) => {
    updateGenerator(project.id, { selectedIdeaId: ideaId });
  };

  const sendToBuilder = () => {
    if (!gen.selectedIdeaId) {
      toast.push('Builder로 전달할 아이디어를 먼저 채택해주세요.', 'error');
      return;
    }
    const idea = gen.ideas.find((i) => i.id === gen.selectedIdeaId);
    if (!idea) return;

    const builder = project.builder;
    updateBuilder(project.id, {
      summary: builder.summary || idea.oneLiner,
      targetCustomer: builder.targetCustomer || idea.customer,
      userProblem: builder.userProblem || idea.problem,
      solution: builder.solution || idea.solution,
    });
    if (project.stage === 'generator') {
      updateProject(project.id, { stage: 'builder' });
    }
    toast.push('Builder로 전달했습니다.');
    navigate(`/project/${project.id}/builder`);
  };

  return (
    <AppShell>
      <div className="pb-36">
      <div className="mx-auto max-w-6xl px-5 py-6">
        <h1 className="mb-5 text-[20px] font-bold text-ink-strong">Generator</h1>
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col rounded-none border border-hairline bg-white p-4">
            <Textarea
              label="관심 분야 / 해결하고 싶은 문제"
              rows={7}
              placeholder="예: 반려동물을 키우는 1인 가구를 위한 서비스를 만들고 싶어요"
              value={gen.interest}
              onChange={(e) => updateGenerator(project.id, { interest: e.target.value })}
              style={{ borderRadius: 0 }}
            />
          </div>
          <div className="flex flex-col rounded-none border border-hairline bg-white p-4">
            <p className="mb-3 text-[13px] font-bold text-ink-strong">✨ 추천 카드</p>
            <RecommendedRail cards={recommended} onAdd={toggleCard} onOpenDetail={setDetailCard} />
          </div>
        </div>

        <Tabs
          items={[
            { id: 'select', label: '① 카드 선택' },
            { id: 'results', label: '② 아이디어 결과', badge: gen.ideas.length },
          ]}
          activeId={step}
          onChange={(id) => setStep(id as 'select' | 'results')}
          className="mb-5 border-b border-hairline"
        />

        {step === 'select' ? (
          <CardLibrary selectedIds={gen.selectedCardIds} onToggle={toggleCard} onOpenDetail={setDetailCard} />
        ) : gen.ideas.length === 0 ? (
          <EmptyState
            title="아직 생성된 아이디어가 없어요"
            description="카드 선택 탭으로 이동해 3개 이상의 카테고리에서 카드를 3장 이상 담고 아이디어를 생성해보세요."
            action={<Button onClick={() => setStep('select')}>카드 선택하러 가기</Button>}
          />
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] text-ink-faint">
                {gen.lastGeneratedAt && `생성 시각: ${relativeTime(gen.lastGeneratedAt)}`}
              </p>
              <Button variant="outline" size="sm" onClick={handleRegenerate} loading={generating}>
                🔄 다시 생성
              </Button>
            </div>

            {genProgress !== null && <ProgressBar value={genProgress} showLabel className="max-w-xs" />}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gen.ideas.map((idea, idx) => {
                const adopted = gen.selectedIdeaId === idea.id;
                const accent = IDEA_ACCENTS[idx % IDEA_ACCENTS.length];
                return (
                  <div
                    key={idea.id}
                    className={`flex flex-col gap-3 rounded-none bg-white p-5 ${adopted ? 'border-2' : 'border'}`}
                    style={{ borderColor: accent }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                        style={{ backgroundColor: `${accent}1a`, color: accent }}
                      >
                        아이디어 {idx + 1}
                      </span>
                      {adopted && <Badge tone="brand">채택됨</Badge>}
                    </div>
                    <h3 className="text-[16px] font-bold text-ink-strong">{idea.title}</h3>
                    <div>
                      <p className="mb-1 text-[11px] font-bold text-ink-faint">한 줄 요약</p>
                      <p className="text-[13px] leading-relaxed text-ink-muted">{idea.oneLiner}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[11px] font-bold text-ink-faint">핵심 가치</p>
                      <p className="text-[13px] leading-relaxed text-ink-muted">{idea.valueProp}</p>
                    </div>
                    <Button
                      variant={adopted ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => selectAsAdopted(idea.id)}
                      className="mt-1"
                    >
                      {adopted ? '채택된 아이디어 ✓' : '이 아이디어 채택하기'}
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button size="lg" onClick={sendToBuilder} disabled={!gen.selectedIdeaId} className="self-end">
              Builder로 전달 →
            </Button>
          </div>
        )}

        {step === 'select' && (
          <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white/95 px-5 py-3 backdrop-blur left-[88px]`}>
            <div className="mx-auto flex max-w-6xl items-center gap-4">
              <CardTray cards={selectedCards} categoryCount={selectedCategoryCount} onRemove={removeCard} />
              {genProgress !== null && <ProgressBar value={genProgress} showLabel className="w-40 shrink-0" />}
              <Button size="sm" onClick={handleGenerate} loading={generating} disabled={!canGenerate} className="shrink-0">
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
