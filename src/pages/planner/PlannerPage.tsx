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
import { TemplatePicker } from '../../components/shared/TemplatePicker';
import { BizPlanPreview } from '../../components/planner/BizPlanPreview';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useUiStore } from '../../store/uiStore';
import { useToast } from '../../components/ui/Toast';
import { buildDefaultBizPlanSections } from '../../ai/planEngine';
import { getTemplate } from '../../data/designTemplates';
import { exportBizPlanPdf } from '../../lib/exportPdf';

type PlannerTab = 'bizplan' | 'design';

export function PlannerPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const currentEmail = useAuthStore((s) => s.currentEmail);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const updatePlanner = useProjectStore((s) => s.updatePlanner);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [tab, setTab] = useState<PlannerTab>('bizplan');
  const [generatingBiz, setGeneratingBiz] = useState(false);
  const [genProgress, setGenProgress] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

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

  const genBizPlan = () => {
    setGeneratingBiz(true);
    setGenProgress(0);
    const interval = window.setInterval(() => {
      setGenProgress((v) => {
        const next = v !== null && v < 90 ? v + Math.round(8 + Math.random() * 10) : v;
        if (next !== null) updatePlanner(project.id, { bizPlanProgress: Math.min(next, 90) });
        return next;
      });
    }, 150);
    window.setTimeout(() => {
      window.clearInterval(interval);
      const sections = buildDefaultBizPlanSections({ generator: project.generator, builder: project.builder, title: project.title });
      updatePlanner(project.id, { bizPlanSections: sections, bizPlanGenerated: true, bizPlanProgress: 100 });
      setGenProgress(100);
      window.setTimeout(() => setGenProgress(null), 500);
      setGeneratingBiz(false);
      toast.push('사업계획서 초안을 생성했습니다.');
    }, 1200);
  };

  const patchSection = (id: string, patch: Partial<(typeof planner.bizPlanSections)[number]>) => {
    updatePlanner(project.id, { bizPlanSections: planner.bizPlanSections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  };

  const downloadPdf = () => {
    setDownloadProgress(0);
    const interval = window.setInterval(() => {
      setDownloadProgress((v) => (v !== null && v < 90 ? v + 15 : v));
    }, 120);
    window.setTimeout(async () => {
      window.clearInterval(interval);
      await exportBizPlanPdf(project.title, planner.bizPlanSections, template, project.title || 'business-plan');
      setDownloadProgress(100);
      updatePlanner(project.id, { lastExport: { type: 'pdf', at: new Date().toISOString(), filename: `${project.title}.pdf` } });
      window.setTimeout(() => setDownloadProgress(null), 600);
      toast.push('사업계획서 PDF를 다운로드했습니다.');
    }, 900);
  };

  const sendToDeck = () => {
    if (project.stage === 'planner') {
      updateProject(project.id, { stage: 'deck' });
    }
    toast.push('Deck로 전달했습니다.');
    navigate(`/project/${project.id}/deck`);
  };

  return (
    <AppShell project={project} activeStage="planner">
      <div className="pb-20">
      <div className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-[20px] font-bold text-ink-strong">Planner · 사업계획서 작성</h1>
            <p className="mt-1 text-[13px] text-ink-muted">검증된 내용을 바탕으로 사업계획서를 구조화하고 내보냅니다.</p>
          </div>
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
            { id: 'bizplan', label: '① 사업계획서' },
            { id: 'design', label: '② 디자인 템플릿' },
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
                <Badge tone="brand">{planner.bizPlanSections.length}개 섹션</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
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
              {genProgress !== null && <ProgressBar value={genProgress} showLabel />}
              {downloadProgress !== null && <ProgressBar value={downloadProgress} showLabel />}
              <BizPlanEditor sections={planner.bizPlanSections} onChange={patchSection} />
            </div>
          ))}

        {tab === 'design' && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-ink-muted">선택한 템플릿은 미리보기와 PDF 다운로드 파일에 함께 적용됩니다.</p>
            <TemplatePicker activeId={planner.designTemplateId} onSelect={(id) => updatePlanner(project.id, { designTemplateId: id })} />
          </div>
        )}
      </div>

      <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white/95 px-5 py-3 backdrop-blur transition-[left] duration-150 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Badge tone="outline">{planner.bizPlanGenerated ? '사업계획서 초안 완료' : '초안 생성 전'}</Badge>
          <Button size="lg" onClick={sendToDeck}>
            Deck로 전달 →
          </Button>
        </div>
      </div>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} size="lg" title="사업계획서 미리보기">
        <BizPlanPreview title={project.title} sections={planner.bizPlanSections} template={template} />
      </Dialog>
      </div>
    </AppShell>
  );
}
