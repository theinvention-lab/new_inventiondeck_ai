import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { BizPlanEditor } from '../../components/planner/BizPlanEditor';
import { PitchSlideEditor } from '../../components/planner/PitchSlideEditor';
import { PitchDeckPreview } from '../../components/planner/PitchDeckPreview';
import { TemplatePicker } from '../../components/shared/TemplatePicker';
import { BizPlanPreview } from '../../components/planner/BizPlanPreview';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useToast } from '../../components/ui/Toast';
import { buildDefaultBizPlanSections, buildDefaultPitchSlides } from '../../ai/planEngine';
import { getTemplate } from '../../data/designTemplates';
import { exportBizPlanPdf } from '../../lib/exportPdf';
import { exportPitchDeckPpt } from '../../lib/exportPpt';
import { makeId } from '../../lib/id';

type PlannerTab = 'bizplan' | 'pitch' | 'design';

export function PlannerPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const currentEmail = useAuthStore((s) => s.currentEmail);

  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const updatePlanner = useProjectStore((s) => s.updatePlanner);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [tab, setTab] = useState<PlannerTab>('bizplan');
  const [generatingBiz, setGeneratingBiz] = useState(false);
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const [bizGenProgress, setBizGenProgress] = useState<number | null>(null);
  const [pitchGenProgress, setPitchGenProgress] = useState<number | null>(null);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState<'bizplan' | 'pitch' | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ type: 'pdf' | 'ppt'; value: number } | null>(null);

  const missingFields = useMemo(() => {
    if (!project) return [];
    const b = project.builder;
    const missing: string[] = [];
    if (!b.targetCustomer) missing.push('타겟 고객');
    if (!b.userProblem) missing.push('사용자 문제');
    if (!b.solution) missing.push('해결 방안');
    if (!b.evidence) missing.push('보유 근거');
    if (b.criteria.every((c) => c.status === 'unmet')) missing.push('점검 기준 검증 결과');
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

  const planner = project.planner;
  const template = getTemplate(planner.designTemplateId);
  const activeSlide = planner.pitchSlides.find((s) => s.id === activeSlideId) ?? planner.pitchSlides[0];

  const genBizPlan = () => {
    setGeneratingBiz(true);
    setBizGenProgress(0);
    const interval = window.setInterval(() => {
      setBizGenProgress((v) => (v !== null && v < 90 ? v + Math.round(8 + Math.random() * 10) : v));
    }, 150);
    window.setTimeout(() => {
      window.clearInterval(interval);
      const sections = buildDefaultBizPlanSections({ generator: project.generator, builder: project.builder, title: project.title });
      updatePlanner(project.id, { bizPlanSections: sections, bizPlanGenerated: true, bizPlanProgress: 100 });
      setBizGenProgress(100);
      window.setTimeout(() => setBizGenProgress(null), 500);
      setGeneratingBiz(false);
      toast.push('사업계획서 초안을 생성했습니다.');
    }, 1200);
  };

  const genPitchDeck = () => {
    setGeneratingPitch(true);
    setPitchGenProgress(0);
    const interval = window.setInterval(() => {
      setPitchGenProgress((v) => (v !== null && v < 90 ? v + Math.round(8 + Math.random() * 10) : v));
    }, 150);
    window.setTimeout(() => {
      window.clearInterval(interval);
      const slides = buildDefaultPitchSlides({ generator: project.generator, builder: project.builder, title: project.title });
      updatePlanner(project.id, { pitchSlides: slides, pitchDeckGenerated: true, pitchDeckProgress: 100 });
      setActiveSlideId(slides[0]?.id ?? null);
      setPitchGenProgress(100);
      window.setTimeout(() => setPitchGenProgress(null), 500);
      setGeneratingPitch(false);
      toast.push('IR Deck 초안을 생성했습니다.');
    }, 1200);
  };

  const patchSection = (id: string, patch: Partial<(typeof planner.bizPlanSections)[number]>) => {
    updatePlanner(project.id, { bizPlanSections: planner.bizPlanSections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  };

  const patchSlide = (id: string, patch: Partial<(typeof planner.pitchSlides)[number]>) => {
    updatePlanner(project.id, { pitchSlides: planner.pitchSlides.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  };

  const addSlide = () => {
    const newSlide = { id: makeId('slide'), title: '새 슬라이드', bullets: [''], note: '', order: planner.pitchSlides.length, chart: 'none' as const };
    updatePlanner(project.id, { pitchSlides: [...planner.pitchSlides, newSlide] });
    setActiveSlideId(newSlide.id);
  };

  const downloadPdf = () => {
    setDownloadProgress({ type: 'pdf', value: 0 });
    const interval = window.setInterval(() => {
      setDownloadProgress((p) => (p && p.value < 90 ? { ...p, value: p.value + 15 } : p));
    }, 120);
    window.setTimeout(async () => {
      window.clearInterval(interval);
      await exportBizPlanPdf(project.title, planner.bizPlanSections, template, project.title || 'business-plan');
      setDownloadProgress({ type: 'pdf', value: 100 });
      updatePlanner(project.id, { lastExport: { type: 'pdf', at: new Date().toISOString(), filename: `${project.title}.pdf` } });
      window.setTimeout(() => setDownloadProgress(null), 600);
      toast.push('사업계획서 PDF를 다운로드했습니다.');
    }, 900);
  };

  const downloadPpt = () => {
    setDownloadProgress({ type: 'ppt', value: 0 });
    const interval = window.setInterval(() => {
      setDownloadProgress((p) => (p && p.value < 90 ? { ...p, value: p.value + 15 } : p));
    }, 120);
    window.setTimeout(async () => {
      window.clearInterval(interval);
      await exportPitchDeckPpt(project.title, planner.pitchSlides, template, project.title || 'ir-deck');
      setDownloadProgress({ type: 'ppt', value: 100 });
      updatePlanner(project.id, { lastExport: { type: 'ppt', at: new Date().toISOString(), filename: `${project.title}.pptx` } });
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
    <AppShell>
      <div className="pb-20">
      <div className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-[20px] font-bold text-ink-strong">Planner · 사업계획서 &amp; IR Deck</h1>
            <p className="mt-1 text-[13px] text-ink-muted">검증된 내용을 바탕으로 문서와 슬라이드를 구조화하고 내보냅니다.</p>
          </div>
          <Button variant="outline" onClick={completeProject}>
            프로젝트 완료 처리
          </Button>
        </div>

        {missingFields.length > 0 && (
          <div className="mb-5 flex items-start gap-2 rounded-none border border-warning/40 bg-warning-soft px-4 py-3 text-[13px] text-[#8a5a05]">
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
            { id: 'bizplan', label: '① 사업계획서' },
            { id: 'pitch', label: '② IR Deck (피치덱)' },
            { id: 'design', label: '③ 디자인 템플릿' },
          ]}
          activeId={tab}
          onChange={(id) => setTab(id as PlannerTab)}
          className="mb-5 border-b border-hairline"
        />

        {tab === 'bizplan' &&
          (planner.bizPlanSections.length === 0 ? (
            <div className="flex flex-col gap-3">
              <EmptyState
                title="아직 사업계획서 초안이 없어요"
                description="AI가 경영진 요약부터 리스크 대응까지 8개 섹션의 목차와 초안 문장을 제안합니다."
                action={
                  <Button onClick={genBizPlan} loading={generatingBiz}>
                    ✨ AI로 목차 · 초안 생성하기
                  </Button>
                }
              />
              {bizGenProgress !== null && (
                <div className="mx-auto flex w-full max-w-xs items-center gap-3">
                  <span className="shrink-0 text-[12.5px] font-semibold text-ink-strong">생성 중…</span>
                  <ProgressBar value={bizGenProgress} showLabel className="flex-1" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone="brand">{planner.bizPlanSections.length}개 섹션</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreviewOpen('bizplan')}>
                    미리보기
                  </Button>
                  <Button variant="outline" size="sm" onClick={genBizPlan} loading={generatingBiz}>
                    🔄 전체 다시 생성
                  </Button>
                  <Button size="sm" onClick={downloadPdf}>
                    PDF 다운로드
                  </Button>
                </div>
              </div>
              {bizGenProgress !== null && <ProgressBar value={bizGenProgress} showLabel />}
              {downloadProgress?.type === 'pdf' && <ProgressBar value={downloadProgress.value} showLabel />}
              <BizPlanEditor sections={planner.bizPlanSections} onChange={patchSection} />
            </div>
          ))}

        {tab === 'pitch' &&
          (planner.pitchSlides.length === 0 ? (
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
              {pitchGenProgress !== null && (
                <div className="mx-auto flex w-full max-w-xs items-center gap-3">
                  <span className="shrink-0 text-[12.5px] font-semibold text-ink-strong">생성 중…</span>
                  <ProgressBar value={pitchGenProgress} showLabel className="flex-1" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone="brand">{planner.pitchSlides.length}개 슬라이드</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreviewOpen('pitch')}>
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
              {pitchGenProgress !== null && <ProgressBar value={pitchGenProgress} showLabel />}
              {downloadProgress?.type === 'ppt' && <ProgressBar value={downloadProgress.value} showLabel />}

              <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
                <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
                  {planner.pitchSlides.map((s, idx) => (
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
            <p className="text-[13px] text-ink-muted">선택한 템플릿은 미리보기와 PDF·PPT 다운로드 파일에 함께 적용됩니다.</p>
            <TemplatePicker activeId={planner.designTemplateId} onSelect={(id) => updatePlanner(project.id, { designTemplateId: id })} />
          </div>
        )}
      </div>

      <Dialog open={previewOpen === 'bizplan'} onClose={() => setPreviewOpen(null)} size="lg" title="사업계획서 미리보기">
        <BizPlanPreview title={project.title} sections={planner.bizPlanSections} template={template} />
      </Dialog>
      <Dialog open={previewOpen === 'pitch'} onClose={() => setPreviewOpen(null)} size="lg" title="IR Deck 미리보기">
        <PitchDeckPreview slides={planner.pitchSlides} template={template} />
      </Dialog>
      </div>
    </AppShell>
  );
}
