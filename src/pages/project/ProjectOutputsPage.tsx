import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { BUILDER_TEMPLATES } from '../../data/builderTemplates';
import { formatDateTime, relativeTime } from '../../lib/format';
import type { BuilderTemplateId, IdeaDraft, PlanSection, PitchSlide, Project } from '../../types';

type OutputTab = 'idea' | 'template' | 'plan';

export function ProjectOutputsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const currentEmail = useAuthStore((s) => s.currentEmail);
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));

  const [tab, setTab] = useState<OutputTab>('idea');

  if (!project || project.ownerEmail !== currentEmail) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center">
          <EmptyState title="프로젝트를 찾을 수 없습니다" action={<Button onClick={() => navigate('/mypage')}>마이페이지로</Button>} />
        </div>
      </AppShell>
    );
  }

  const counts = {
    idea: project.generator.ideas.length,
    template: BUILDER_TEMPLATES.filter((t) => filledCount(project, t.id) > 0).length,
    plan: (project.planner.bizPlanGenerated ? 1 : 0) + (project.planner.pitchDeckGenerated ? 1 : 0),
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-6 pb-16">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold text-ink-faint">프로젝트 산출물</p>
            <h1 className="mt-0.5 text-[20px] font-bold text-ink-strong">{project.title}</h1>
            <p className="mt-1 text-[12px] text-ink-muted">최근 수정 {relativeTime(project.updatedAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/project/${project.id}/generator`)}>
              Generator
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/project/${project.id}/builder`)}>
              Builder
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/project/${project.id}/planner`)}>
              Planner
            </Button>
          </div>
        </div>

        <Tabs
          items={[
            { id: 'idea', label: '아이디어', badge: counts.idea },
            { id: 'template', label: '구체화 템플릿', badge: counts.template },
            { id: 'plan', label: '사업계획서 · IR Deck', badge: counts.plan },
          ]}
          activeId={tab}
          onChange={(id) => setTab(id as OutputTab)}
          className="mb-5 border-b border-hairline"
        />

        {tab === 'idea' && <IdeaOutputs project={project} onGo={() => navigate(`/project/${project.id}/generator`)} />}
        {tab === 'template' && <TemplateOutputs project={project} onGo={() => navigate(`/project/${project.id}/builder`)} />}
        {tab === 'plan' && <PlanOutputs project={project} onGo={() => navigate(`/project/${project.id}/planner`)} />}
      </div>
    </AppShell>
  );
}

function filledCount(project: Project, templateId: BuilderTemplateId): number {
  const values = project.builder.templateValues[templateId] ?? {};
  return Object.values(values).filter((v) => v && v.trim().length > 0).length;
}

function SectionCard({ title, caption, children }: { title: string; caption?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-none border border-hairline bg-white">
      <div className="border-b border-hairline px-5 py-3.5">
        <p className="text-[13.5px] font-bold text-ink-strong">{title}</p>
        {caption && <p className="mt-0.5 text-[12px] text-ink-muted">{caption}</p>}
      </div>
      {children}
    </div>
  );
}

function VersionList({ items }: { items: Array<{ id: string; label: string; savedAt: string; caption?: string }> }) {
  if (items.length === 0) {
    return <p className="px-5 py-4 text-[12.5px] text-ink-faint">아직 저장된 버전이 없습니다.</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-hairline">
      {items.map((v, idx) => (
        <li key={v.id} className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-ink-strong">{v.label}</span>
              {idx === 0 && <Badge tone="brand">최신</Badge>}
            </div>
            {v.caption && <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">{v.caption}</p>}
          </div>
          <span className="shrink-0 text-[11.5px] text-ink-faint">{formatDateTime(v.savedAt)}</span>
        </li>
      ))}
    </ul>
  );
}

function IdeaOutputs({ project, onGo }: { project: Project; onGo: () => void }) {
  const { ideas, selectedIdeaId, versions } = project.generator;

  if (ideas.length === 0) {
    return (
      <EmptyState
        title="아직 만들어진 아이디어가 없습니다"
        description="Generator에서 카드를 골라 아이디어를 생성해보세요."
        action={<Button onClick={onGo}>Generator로 이동</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="아이디어" caption={`${ideas.length}개 · Generator 산출물`}>
        <div className="flex flex-col divide-y divide-hairline">
          {ideas.map((idea) => (
            <IdeaRow key={idea.id} idea={idea} selected={idea.id === selectedIdeaId} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="버전 기록" caption="Generator에서 저장한 아이디어 버전">
        <VersionList items={versions.map((v) => ({ id: v.id, label: v.label, savedAt: v.savedAt, caption: v.snapshot.oneLiner }))} />
      </SectionCard>
    </div>
  );
}

function IdeaRow({ idea, selected }: { idea: IdeaDraft; selected: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-5 py-3.5">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-3 text-left">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13.5px] font-bold text-ink-strong">{idea.title}</span>
            {selected && <Badge tone="brand">선택됨</Badge>}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[12px] text-ink-muted">{idea.oneLiner}</p>
        </div>
        <span className="shrink-0 text-[11px] text-ink-faint">{open ? '접기' : '펼치기'}</span>
      </button>

      {open && (
        <dl className="mt-3 grid gap-2 border-t border-hairline pt-3 sm:grid-cols-2">
          {[
            ['타겟 고객', idea.customer],
            ['문제', idea.problem],
            ['해결 방안', idea.solution],
            ['가치 제안', idea.valueProp],
            ['수익 모델', idea.revenue],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11.5px] font-semibold text-ink-faint">{label}</dt>
              <dd className="mt-0.5 text-[12.5px] leading-relaxed text-ink">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function TemplateOutputs({ project, onGo }: { project: Project; onGo: () => void }) {
  const written = useMemo(
    () => BUILDER_TEMPLATES.filter((t) => filledCount(project, t.id) > 0),
    [project],
  );
  const { versions, criteria } = project.builder;

  if (written.length === 0) {
    return (
      <EmptyState
        title="작성된 구체화 템플릿이 없습니다"
        description="Builder의 ② 구체화 템플릿 탭에서 아이디어를 정리해보세요."
        action={<Button onClick={onGo}>Builder로 이동</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {written.map((template) => {
        const values = project.builder.templateValues[template.id] ?? {};
        return (
          <SectionCard
            key={template.id}
            title={`${template.icon} ${template.name}`}
            caption={`${filledCount(project, template.id)}/${template.fields.length} 항목 작성됨`}
          >
            <dl className="grid gap-3 px-5 py-4 sm:grid-cols-2">
              {template.fields
                .filter((f) => values[f.id]?.trim())
                .map((f) => (
                  <div key={f.id}>
                    <dt className="text-[11.5px] font-semibold text-ink-faint">{f.label}</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink">{values[f.id]}</dd>
                  </div>
                ))}
            </dl>
          </SectionCard>
        );
      })}

      {criteria.length > 0 && (
        <SectionCard title="점검 기준" caption={`${criteria.filter((c) => c.status === 'met').length}/${criteria.length} 충족`}>
          <ul className="flex flex-col divide-y divide-hairline">
            {criteria.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="truncate text-[13px] font-semibold text-ink-strong">{c.name}</span>
                <Badge tone={c.status === 'met' ? 'brand' : c.status === 'partial' ? 'warning' : 'outline'}>
                  {c.status === 'met' ? '충족' : c.status === 'partial' ? '부분 충족' : '미충족'}
                </Badge>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="버전 기록" caption="Builder에서 '지금 저장'을 누른 시점">
        <VersionList
          items={versions.map((v) => ({
            id: v.id,
            label: v.label,
            savedAt: v.savedAt,
            caption: v.snapshot ? `${v.savedBy} · ${v.snapshot.summary || '요약 없음'}` : v.savedBy,
          }))}
        />
      </SectionCard>
    </div>
  );
}

function PlanOutputs({ project, onGo }: { project: Project; onGo: () => void }) {
  const { bizPlanSections, pitchSlides, bizPlanGenerated, pitchDeckGenerated, lastExport, versions } = project.planner;

  if (!bizPlanGenerated && !pitchDeckGenerated) {
    return (
      <EmptyState
        title="아직 생성된 문서가 없습니다"
        description="Planner에서 사업계획서와 IR Deck 초안을 만들어보세요."
        action={<Button onClick={onGo}>Planner로 이동</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {bizPlanGenerated && (
        <SectionCard title="📄 사업계획서" caption={`${bizPlanSections.length}개 섹션`}>
          <ul className="flex flex-col divide-y divide-hairline">
            {[...bizPlanSections]
              .sort((a, b) => a.order - b.order)
              .map((s: PlanSection) => (
                <li key={s.id} className="px-5 py-3">
                  <p className="text-[13px] font-semibold text-ink-strong">{s.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-ink-muted">{s.content || '내용 없음'}</p>
                </li>
              ))}
          </ul>
        </SectionCard>
      )}

      {pitchDeckGenerated && (
        <SectionCard title="📊 IR Deck" caption={`${pitchSlides.length}장`}>
          <ul className="flex flex-col divide-y divide-hairline">
            {[...pitchSlides]
              .sort((a, b) => a.order - b.order)
              .map((s: PitchSlide, idx) => (
                <li key={s.id} className="flex items-start gap-3 px-5 py-3">
                  <span className="mt-0.5 shrink-0 text-[11px] font-bold text-ink-faint">{String(idx + 1).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink-strong">{s.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-[12px] text-ink-muted">{s.bullets.join(' · ') || '내용 없음'}</p>
                  </div>
                </li>
              ))}
          </ul>
        </SectionCard>
      )}

      {lastExport && (
        <div className="rounded-none border border-hairline bg-white px-5 py-3.5">
          <p className="text-[12.5px] text-ink-muted">
            최근 내보내기 · <span className="font-semibold text-ink-strong">{lastExport.filename}</span> (
            {lastExport.type.toUpperCase()}) · {formatDateTime(lastExport.at)}
          </p>
        </div>
      )}

      <SectionCard title="버전 기록" caption="문서를 생성할 때마다 기록됩니다">
        <VersionList
          items={versions.map((v) => ({
            id: v.id,
            label: v.label,
            savedAt: v.savedAt,
            caption: v.kind === 'bizplan' ? `${v.sections?.length ?? 0}개 섹션` : `${v.slides?.length ?? 0}장`,
          }))}
        />
      </SectionCard>
    </div>
  );
}
