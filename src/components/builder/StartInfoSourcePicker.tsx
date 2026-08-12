import type { IdeaDraft, Project, StartInfoSource } from '../../types';

const OPTIONS: Array<{ id: StartInfoSource; icon: string; title: string; description: string; emptyHint: string }> = [
  {
    id: 'manual',
    icon: '✍️',
    title: '직접 작성하기',
    description: '생각하고 있던 아이디어를 처음부터 직접 정리합니다.',
    emptyHint: '',
  },
  {
    id: 'generator',
    icon: '🎴',
    title: '이 프로젝트의 Generator에서',
    description: '방금 Generator에서 만든 아이디어를 그대로 이어서 씁니다.',
    emptyHint: '이 프로젝트의 Generator에서 만든 아이디어가 아직 없습니다.',
  },
  {
    id: 'saved',
    icon: '📁',
    title: '내 프로젝트에서 가져오기',
    description: '예전에 만들어 저장해둔 아이디어를 불러옵니다.',
    emptyHint: '다른 프로젝트에 저장된 아이디어가 없습니다.',
  },
];

/** 'saved' 모드에서 고를 수 있는 후보 — 다른 프로젝트에 저장된 아이디어들 */
export interface SavedIdeaOption {
  project: Project;
  idea: IdeaDraft;
}

export function StartInfoSourcePicker({
  source,
  ideas,
  savedOptions,
  sourceIdeaId,
  onSelectSource,
  onSelectIdea,
  onSelectSavedIdea,
}: {
  source: StartInfoSource;
  ideas: IdeaDraft[];
  savedOptions: SavedIdeaOption[];
  sourceIdeaId: string | null;
  onSelectSource: (source: StartInfoSource) => void;
  onSelectIdea: (ideaId: string) => void;
  onSelectSavedIdea: (projectId: string, ideaId: string) => void;
}) {
  const availability: Record<StartInfoSource, boolean> = {
    manual: true,
    generator: ideas.length > 0,
    saved: savedOptions.length > 0,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const disabled = !availability[opt.id];
          const active = source === opt.id;
          return (
            <button
              key={opt.id}
              disabled={disabled}
              onClick={() => onSelectSource(opt.id)}
              className={`flex flex-col gap-1 rounded-none border p-4 text-left transition-colors ${
                active ? 'border-brand bg-brand-soft/40' : 'border-hairline bg-white hover:border-brand'
              } ${disabled ? 'cursor-not-allowed opacity-50 hover:border-hairline' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[16px]">{opt.icon}</span>
                <span className="text-[13px] font-bold text-ink-strong">{opt.title}</span>
                {active && <span className="text-[12px] text-brand">✓</span>}
              </div>
              <p className="text-[12px] leading-relaxed text-ink-muted">{disabled ? opt.emptyHint : opt.description}</p>
            </button>
          );
        })}
      </div>

      {source === 'generator' && ideas.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[12.5px] font-bold text-ink-muted">이어서 쓸 아이디어를 선택하세요</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ideas.map((idea) => (
              <IdeaOption
                key={idea.id}
                title={idea.title}
                oneLiner={idea.oneLiner}
                active={sourceIdeaId === idea.id}
                onClick={() => onSelectIdea(idea.id)}
              />
            ))}
          </div>
        </div>
      )}

      {source === 'saved' && savedOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[12.5px] font-bold text-ink-muted">저장해둔 아이디어를 선택하세요</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {savedOptions.map(({ project, idea }) => (
              <IdeaOption
                key={`${project.id}:${idea.id}`}
                title={idea.title}
                oneLiner={idea.oneLiner}
                caption={project.title}
                active={sourceIdeaId === idea.id}
                onClick={() => onSelectSavedIdea(project.id, idea.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IdeaOption({
  title,
  oneLiner,
  caption,
  active,
  onClick,
}: {
  title: string;
  oneLiner: string;
  caption?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-1 rounded-none border p-3 text-left transition-colors ${
        active ? 'border-brand bg-brand-soft/40' : 'border-hairline bg-white hover:border-brand'
      }`}
    >
      {caption && <p className="truncate text-[11px] font-semibold text-ink-faint">{caption}</p>}
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-bold text-ink-strong">{title}</p>
        {active && <span className="shrink-0 text-[11px] font-bold text-brand">선택됨</span>}
      </div>
      <p className="line-clamp-2 text-[12px] text-ink-muted">{oneLiner}</p>
    </button>
  );
}
