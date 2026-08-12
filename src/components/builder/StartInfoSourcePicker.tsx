import type { IdeaDraft, StartInfoSource } from '../../types';

const OPTIONS: Array<{ id: StartInfoSource; icon: string; title: string; description: string }> = [
  {
    id: 'manual',
    icon: '✍️',
    title: '직접 작성하기',
    description: '아이디어를 처음부터 직접 정리합니다.',
  },
  {
    id: 'generator',
    icon: '🎴',
    title: 'Generator에서 가져오기',
    description: 'Generator에서 만든 아이디어를 그대로 이어서 씁니다.',
  },
];

export function StartInfoSourcePicker({
  source,
  ideas,
  sourceIdeaId,
  onSelectSource,
  onSelectIdea,
}: {
  source: StartInfoSource;
  ideas: IdeaDraft[];
  sourceIdeaId: string | null;
  onSelectSource: (source: StartInfoSource) => void;
  onSelectIdea: (ideaId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((opt) => {
          const disabled = opt.id === 'generator' && ideas.length === 0;
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
                <span className="text-[13.5px] font-bold text-ink-strong">{opt.title}</span>
                {active && <span className="text-[12px] text-brand">✓</span>}
              </div>
              <p className="text-[12px] text-ink-muted">
                {disabled ? 'Generator에서 만든 아이디어가 아직 없습니다.' : opt.description}
              </p>
            </button>
          );
        })}
      </div>

      {source === 'generator' && ideas.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[12.5px] font-bold text-ink-muted">이어서 쓸 아이디어를 선택하세요</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ideas.map((idea) => {
              const active = sourceIdeaId === idea.id;
              return (
                <button
                  key={idea.id}
                  onClick={() => onSelectIdea(idea.id)}
                  className={`flex flex-col gap-1 rounded-none border p-3 text-left transition-colors ${
                    active ? 'border-brand bg-brand-soft/40' : 'border-hairline bg-white hover:border-brand'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13px] font-bold text-ink-strong">{idea.title}</p>
                    {active && <span className="shrink-0 text-[11px] font-bold text-brand">선택됨</span>}
                  </div>
                  <p className="line-clamp-2 text-[12px] text-ink-muted">{idea.oneLiner}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
