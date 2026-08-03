import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Badge } from '../ui/Badge';
import type { Project, ProjectStage } from '../../types';

const STAGES: { id: ProjectStage; label: string; path: (id: string) => string }[] = [
  { id: 'generator', label: '1. Generator', path: (id) => `/project/${id}/generator` },
  { id: 'developer', label: '2. Developer', path: (id) => `/project/${id}/developer` },
  { id: 'planner', label: '3. Planner', path: (id) => `/project/${id}/planner` },
];

export function AppHeader({ project, activeStage }: { project: Project; activeStage: ProjectStage }) {
  const navigate = useNavigate();
  const activeIndex = STAGES.findIndex((s) => s.id === activeStage);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="hidden h-5 w-px bg-hairline-strong sm:block" />
          <button
            onClick={() => navigate('/mypage')}
            className="hidden max-w-[220px] truncate text-[14px] font-semibold text-ink-strong hover:text-brand sm:block"
            title={project.title}
          >
            {project.title}
          </button>
        </div>

        <nav className="flex items-center gap-1">
          {STAGES.map((s, idx) => {
            const enabled = idx <= activeIndex + 1;
            const active = s.id === activeStage;
            return (
              <Link
                key={s.id}
                to={enabled ? s.path(project.id) : '#'}
                aria-disabled={!enabled}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  active
                    ? 'bg-brand-soft text-brand-strong'
                    : enabled
                      ? 'text-ink-muted hover:bg-canvas-sunken'
                      : 'pointer-events-none text-ink-faint/60'
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Badge tone="outline" className="hidden sm:inline-flex">
            {project.stage === 'completed' ? '완료' : '작업중'}
          </Badge>
          <button
            onClick={() => navigate('/mypage')}
            className="rounded-full px-3 py-1.5 text-[13px] font-medium text-ink-muted hover:bg-canvas-sunken"
          >
            마이페이지로
          </button>
        </div>
      </div>
    </header>
  );
}
