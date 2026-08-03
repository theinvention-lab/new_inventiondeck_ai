import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';
import type { Project, ProjectStage } from '../../types';

export const SIDEBAR_WIDTH = 'w-64';

const STAGES: { id: ProjectStage; label: string; path: (id: string) => string }[] = [
  { id: 'generator', label: 'Generator', path: (id) => `/project/${id}/generator` },
  { id: 'developer', label: 'Developer', path: (id) => `/project/${id}/developer` },
  { id: 'planner', label: 'Planner', path: (id) => `/project/${id}/planner` },
];

export function Sidebar({ project, activeStage }: { project?: Project; activeStage?: ProjectStage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.currentUser());
  const logout = useAuthStore((s) => s.logout);

  const activeIndex = project ? STAGES.findIndex((s) => s.id === activeStage) : -1;
  const onMyPage = location.pathname.startsWith('/mypage');

  return (
    <aside className={`sticky top-0 flex h-screen ${SIDEBAR_WIDTH} shrink-0 flex-col border-r border-hairline bg-white`}>
      <div className="flex h-16 items-center border-b border-hairline px-5">
        <Logo to="/mypage" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        <Link
          to="/mypage"
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors ${
            onMyPage ? 'bg-brand-soft text-brand-strong' : 'text-ink-muted hover:bg-canvas-sunken'
          }`}
        >
          🏠 마이페이지
        </Link>

        {project && (
          <>
            <div className="mt-5 mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
              현재 프로젝트
            </div>
            <p className="mb-2 truncate px-3 text-[13px] font-bold text-ink-strong" title={project.title}>
              {project.title}
            </p>
            <div className="flex flex-col gap-1">
              {STAGES.map((s, idx) => {
                const enabled = idx <= activeIndex + 1;
                const active = s.id === activeStage;
                return (
                  <Link
                    key={s.id}
                    to={enabled ? s.path(project.id) : '#'}
                    aria-disabled={!enabled}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors ${
                      active
                        ? 'bg-brand-soft text-brand-strong'
                        : enabled
                          ? 'text-ink-muted hover:bg-canvas-sunken'
                          : 'pointer-events-none text-ink-faint/50'
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[10.5px] font-bold">
                      {idx + 1}
                    </span>
                    {s.label}
                  </Link>
                );
              })}
            </div>
            <Badge tone="outline" className="mt-3 w-fit">
              {project.stage === 'completed' ? '완료' : '작업중'}
            </Badge>
          </>
        )}
      </nav>

      <div className="border-t border-hairline p-3">
        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[12px] font-bold text-ink-muted">
            {currentUser?.name?.slice(0, 1) ?? '?'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-ink-strong">{currentUser?.name ?? '게스트'}</p>
            <p className="truncate text-[11px] text-ink-faint">{currentUser?.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="mt-1 w-full rounded-lg px-3 py-2 text-left text-[12.5px] font-medium text-ink-muted hover:bg-canvas-sunken"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
