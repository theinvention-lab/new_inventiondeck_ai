import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { PitchSlideEditor } from '../../components/deck/PitchSlideEditor';
import { PitchDeckPreview } from '../../components/deck/PitchDeckPreview';
import { TemplatePicker } from '../../components/shared/TemplatePicker';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useToast } from '../../components/ui/Toast';
import { buildDefaultPitchSlides } from '../../ai/planEngine';
import { getTemplate } from '../../data/designTemplates';
import { exportPitchDeckPpt } from '../../lib/exportPpt';
import { makeId } from '../../lib/id';

type DeckTab = 'slides' | 'design';

export function DeckPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const currentEmail = useAuthStore((s) => s.currentEmail);

  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const updateDeck = useProjectStore((s) => s.updateDeck);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [tab, setTab] = useState<DeckTab>('slides');
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const [genProgress, setGenProgress] = useState<number | null>(null);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const missingFields = useMemo(() => {
    if (!project) return [];
    const b = project.builder;
    const missing: string[] = [];
    if (!b.targetCustomer) missing.push('타겟 고객');
    if (!b.userProblem) missing.push('사용자 문제');
    if (!b.solution) missing.push('해결 방안');
    return missing;
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

  const deck = project.deck;
  const template = getTemplate(deck.designTemplateId);
  const activeSlide = deck.pitchSlides.find((s) => s.id === activeSlideId) ?? deck.pitchSlides[0];

  const genPitchDeck = () => {
    setGeneratingPitch(true);
    setGenProgress(0);
    const interval = window.setInterval(() => {
      setGenProgress((v) => {
        const next = v !== null && v < 90 ? v + Math.round(8 + Math.random() * 10) : v;
        if (next !== null) updateDeck(project.id, { pitchDeckProgress: Math.min(next, 90) });
        return next;
      });
    }, 150);
    window.setTimeout(() => {
      window.clearInterval(interval);
      const slides = buildDefaultPitchSlides({ generator: project.generator, builder: project.builder, title: project.title });
      updateDeck(project.id, { pitchSlides: slides, pitchDeckGenerated: true, pitchDeckProgress: 100 });
      setActiveSlideId(slides[0]?.id ?? null);
      setGenProgress(100);
      window.setTimeout(() => setGenProgress(null), 500);
      setGeneratingPitch(false);
      toast.push('IR Deck 초안을 생성했습니다.');
    }, 1200);
  };

  const patchSlide = (id: string, patch: Partial<(typeof deck.pitchSlides)[number]>) => {
    updateDeck(project.id, { pitchSlides: deck.pitchSlides.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  };

  const addSlide = () => {
    const newSlide = { id: makeId('slide'), title: '새 슬라이드', bullets: [''], note: '', order: deck.pitchSlides.length, chart: 'none' as const };
    updateDeck(project.id, { pitchSlides: [...deck.pitchSlides, newSlide] });
    setActiveSlideId(newSlide.id);
  };

  const downloadPpt = () => {
    setDownloadProgress(0);
    const interval = window.setInterval(() => {
      setDownloadProgress((v) => (v !== null && v < 90 ? v + 15 : v));
    }, 120);
    window.setTimeout(async () => {
      window.clearInterval(interval);
      await exportPitchDeckPpt(project.title, deck.pitchSlides, template, project.title || 'ir-deck');
      setDownloadProgress(100);
      updateDeck(project.id, { lastExport: { type: 'ppt', at: new Date().toISOString(), filename: `${project.title}.pptx` } });
      window.setTimeout(() => setDownloadProgress(null), 600);
      toast.push('IR Deck PPT를 다운로드했습니다.');
    }, 900);
  };

  const completeProject = () => {
    updateProject(project.id, { stage: 'completed' });
    toast.push('프로젝트를 완료 처리했습니다.');
    navigate('/mypage');
  };

  return (
    <AppShell project={project} activeStage="deck">
      <div className="pb-20">
      <div className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-[20px] font-bold text-ink-strong">Deck · IR Deck 생성</h1>
            <p className="mt-1 text-[13px] text-ink-muted">투자자용 메시지 흐름을 슬라이드로 구조화하고 내보냅니다.</p>
          </div>
          <Button variant="outline" onClick={completeProject}>
            프로젝트 완료 처리
          </Button>
        </div>

        {missingFields.length > 0 && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 text-[13px] text-[#8a5a05]">
            <span>⚠️</span>
            <p>
              Builder 단계에서 다음 항목이 비어 있어요: <strong>{missingFields.join(', ')}</strong>. 채워두면 더 구체적인
              초안이 생성됩니다.{' '}
              <button className="font-bold underline" onClick={() => navigate(`/project/${project.id}/builder`)}>
                Builder로 이동
              </button>
            </p>
          </div>
        )}

        <Tabs
          items={[
            { id: 'slides', label: '① IR Deck' },
            { id: 'design', label: '② 디자인 템플릿' },
          ]}
          activeId={tab}
          onChange={(id) => setTab(id as DeckTab)}
          className="mb-5 border-b border-hairline"
        />

        {tab === 'slides' &&
          (deck.pitchSlides.length === 0 ? (
            <div className="flex flex-col gap-3">
              <EmptyState
                title="아직 IR Deck 초안이 없어요"
                description="표지부터 Ask(투자 요청)까지 10개 슬라이드의 메시지 흐름을 제안합니다."
                action={
                  <Button onClick={genPitchDeck} loading={generatingPitch}>
                    ✨ AI로 슬라이드 생성하기
                  </Button>
                }
              />
              {genProgress !== null && (
                <div className="mx-auto flex w-full max-w-xs items-center gap-3">
                  <span className="shrink-0 text-[12.5px] font-semibold text-ink-strong">생성 중…</span>
                  <ProgressBar value={genProgress} showLabel className="flex-1" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone="brand">{deck.pitchSlides.length}개 슬라이드</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                    슬라이드 미리보기
                  </Button>
                  <Button variant="outline" size="sm" onClick={genPitchDeck} loading={generatingPitch}>
                    🔄 전체 다시 생성
                  </Button>
                  <Button size="sm" onClick={downloadPpt}>
                    PPT 다운로드
                  </Button>
                </div>
              </div>
              {genProgress !== null && <ProgressBar value={genProgress} showLabel />}
              {downloadProgress !== null && <ProgressBar value={downloadProgress} showLabel />}

              <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
                <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
                  {deck.pitchSlides.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSlideId(s.id)}
                      className={`shrink-0 rounded-lg border px-3 py-2 text-left text-[12px] font-semibold transition-colors ${
                        activeSlide?.id === s.id ? 'border-brand bg-brand-soft/50 text-brand-strong' : 'border-hairline text-ink-muted hover:bg-white'
                      }`}
                    >
                      {idx + 1}. {s.title}
                    </button>
                  ))}
                  <button onClick={addSlide} className="shrink-0 rounded-lg border border-dashed border-hairline-strong px-3 py-2 text-[12px] text-ink-faint hover:bg-white">
                    + 슬라이드 추가
                  </button>
                </div>
                {activeSlide && <PitchSlideEditor slide={activeSlide} onChange={(patch) => patchSlide(activeSlide.id, patch)} />}
              </div>
            </div>
          ))}

        {tab === 'design' && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-ink-muted">선택한 템플릿은 미리보기와 PPT 다운로드 파일에 함께 적용됩니다.</p>
            <TemplatePicker activeId={deck.designTemplateId} onSelect={(id) => updateDeck(project.id, { designTemplateId: id })} />
          </div>
        )}
      </div>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} size="lg" title="IR Deck 미리보기">
        <PitchDeckPreview slides={deck.pitchSlides} template={template} />
      </Dialog>
      </div>
    </AppShell>
  );
}
