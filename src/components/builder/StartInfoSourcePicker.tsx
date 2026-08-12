import type { IdeaDraft, Project, StartInfoSource } from '../../types';

/** 가져오기 후보 — 아이디어를 가진 내 프로젝트들 */
export interface ProjectIdeaOption {
  project: Project;
  idea: IdeaDraft;
  /** 지금 열려 있는 프로젝트의 아이디어인지 */
  isCurrent: boolean;
}

export function StartInfoSourcePicker({
  source,
  options,
  sourceIdeaId,
  onSelectSource,
  onSelectIdea,
}: {
  source: StartInfoSource;
  options: ProjectIdeaOption[];
  sourceIdeaId: string | null;
  onSelectSource: (source: StartInfoSource) => void;
  onSelectIdea: (projectId: string, ideaId: string) => void;
}) {
  const hasOptions = options.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <SourceOption
          icon="✍️"
          title="직접 작성하기"
          description="생각하고 있던 아이디어를 처음부터 직접 정리합니다."
          active={source === 'manual'}
          onClick={() => onSelectSource('manual')}
        />
        <SourceOption
          icon="📁"
          title="프로젝트에서 가져오기"
          description="만들어둔 프로젝트의 아이디어를 그대로 이어서 씁니다."
          disabledHint="아이디어가 있는 프로젝트가 아직 없습니다."
          disabled={!hasOptions}
          active={source === 'project'}
          onClick={() => onSelectSource('project')}
        />
      </div>

      {source === 'project' && hasOptions && (
        <div className="flex flex-col gap-2">
          <p className="text-[12.5px] font-bold text-ink-muted">이어서 쓸 아이디어를 선택하세요</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map(({ project, idea, isCurrent }) => (
              <button
                key={`${project.id}:${idea.id}`}
                onClick={() => onSelectIdea(project.id, idea.id)}
                className={`flex flex-col gap-1 rounded-none border p-3 text-left transition-colors ${
                  sourceIdeaId === idea.id ? 'border-brand bg-brand-soft/40' : 'border-hairline bg-white hover:border-brand'
                }`}
              >
                <p className="truncate text-[11px] font-semibold text-ink-faint">
                  {project.title}
                  {isCurrent && ' · 현재 프로젝트'}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-bold text-ink-strong">{idea.title}</p>
                  {sourceIdeaId === idea.id && <span className="shrink-0 text-[11px] font-bold text-brand">선택됨</span>}
                </div>
                <p className="line-clamp-2 text-[12px] text-ink-muted">{idea.oneLiner}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceOption({
  icon,
  title,
  description,
  disabledHint,
  disabled,
  active,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  disabledHint?: string;
  disabled?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col gap-1 rounded-none border p-4 text-left transition-colors ${
        active ? 'border-brand bg-brand-soft/40' : 'border-hairline bg-white hover:border-brand'
      } ${disabled ? 'cursor-not-allowed opacity-50 hover:border-hairline' : ''}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-[16px]">{icon}</span>
        <span className="text-[13.5px] font-bold text-ink-strong">{title}</span>
        {active && <span className="text-[12px] text-brand">✓</span>}
      </div>
      <p className="text-[12px] leading-relaxed text-ink-muted">{disabled ? disabledHint : description}</p>
    </button>
  );
}
