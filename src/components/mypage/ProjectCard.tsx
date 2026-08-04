import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { relativeTime } from '../../lib/format';
import { projectProgress } from '../../store/projectStore';

const STAGE_LABEL: Record<Project['stage'], string> = {
  generator: 'Generator 진행중',
  builder: 'Builder 진행중',
  planner: 'Planner 진행중',
  deck: 'Deck 진행중',
  completed: '완료',
};

const STAGE_PATH: Record<Project['stage'], string> = {
  generator: 'generator',
  builder: 'builder',
  planner: 'planner',
  deck: 'deck',
  completed: 'deck',
};

export function ProjectCard({
  project,
  draggable,
  onDragStart,
  onDelete,
}: {
  project: Project;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const progress = projectProgress(project);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className="flex flex-col gap-3 rounded-xl border border-hairline bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => navigate(`/project/${project.id}/${STAGE_PATH[project.stage]}`)} className="text-left">
          <h3 className="text-[14.5px] font-bold text-ink-strong line-clamp-1">{project.title}</h3>
        </button>
        <Badge tone={project.stage === 'completed' ? 'brand' : 'neutral'} className="shrink-0">
          {STAGE_LABEL[project.stage]}
        </Badge>
      </div>

      <ProgressBar value={progress} showLabel />

      <div className="flex flex-wrap gap-1">
        {project.tags.map((t) => (
          <span key={t} className="rounded-full bg-canvas-sunken px-2 py-0.5 text-[11px] text-ink-faint">
            #{t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11.5px] text-ink-faint">
        <span>수정 {relativeTime(project.updatedAt)}</span>
        <div className="flex items-center gap-1">
          <span title="Generator">{project.generator.ideas.length > 0 ? '✅' : '▫️'}</span>
          <span title="Builder">{project.builder.criteria.some((c) => c.status !== 'unmet') ? '✅' : '▫️'}</span>
          <span title="사업계획서">{project.planner.bizPlanGenerated ? '✅' : '▫️'}</span>
          <span title="IR Deck">{project.deck.pitchDeckGenerated ? '✅' : '▫️'}</span>
        </div>
      </div>

      <div className="mt-1 flex items-center gap-2 border-t border-hairline pt-3">
        <button
          onClick={() => navigate(`/project/${project.id}/${STAGE_PATH[project.stage]}`)}
          className="flex-1 rounded-full bg-canvas-sunken py-1.5 text-[12.5px] font-semibold text-ink-muted hover:bg-hairline"
        >
          이어서 작업
        </button>
        <button onClick={onDelete} className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-danger hover:bg-danger-soft">
          삭제
        </button>
      </div>
    </div>
  );
}
