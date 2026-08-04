import type { Project } from '../../types';

export function MyProjectsPanel({
  projects,
  onOpen,
  onCreate,
  onViewAll,
}: {
  projects: Project[];
  onOpen: (project: Project) => void;
  onCreate: () => void;
  onViewAll: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-ink-strong">내 프로젝트</h2>
        {projects.length > 0 && (
          <button onClick={onViewAll} className="text-[12.5px] font-semibold text-brand">
            전체보기 →
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <button
          onClick={onCreate}
          className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong bg-white px-6 py-10 text-center transition-colors hover:border-brand"
        >
          <span className="text-2xl">➕</span>
          <span className="text-[13.5px] font-bold text-ink-strong">새로운 프로젝트를 생성하기</span>
          <span className="text-[12px] text-ink-muted">아직 만든 프로젝트가 없어요</span>
        </button>
      ) : (
        <div className="flex flex-col gap-2.5">
          {projects.slice(0, 4).map((p) => {
            const idea = p.generator.ideas.find((i) => i.id === p.generator.selectedIdeaId) ?? p.generator.ideas[0];
            return (
              <button
                key={p.id}
                onClick={() => onOpen(p)}
                className="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-[13.5px] font-bold text-ink-strong">{p.title}</h3>
                  <span className="shrink-0 rounded-full bg-canvas-sunken px-2 py-0.5 text-[10.5px] font-semibold text-ink-faint">
                    {p.stage === 'completed' ? '완료' : p.stage}
                  </span>
                </div>
                <p className="truncate text-[12px] text-ink-muted">{idea?.oneLiner ?? p.description ?? '아직 요약이 없습니다.'}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
