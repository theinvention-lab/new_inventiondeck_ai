import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import type { Project, ProjectStage } from '../../types';

export const SIDEBAR_WIDTH_EXPANDED = 'w-64';
export const SIDEBAR_WIDTH_COLLAPSED = 'w-20';

const PLANNER_STAGES: { id: ProjectStage; label: string; icon: string; iconBg: string; path: (id: string) => string }[] = [
  { id: 'generator', label: 'Generator', icon: '✨', iconBg: '#fde7ea', path: (id) => `/project/${id}/generator` },
  { id: 'builder', label: 'Builder', icon: '🧩', iconBg: '#eef2fc', path: (id) => `/project/${id}/builder` },
  { id: 'planner', label: 'Planner', icon: '📄', iconBg: '#e6f7ec', path: (id) => `/project/${id}/planner` },
];

export function Sidebar({ project, activeStage }: { project?: Project; activeStage?: ProjectStage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.currentUser());
  const logout = useAuthStore((s) => s.logout);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const [plannerOpen, setPlannerOpen] = useState(!!project);

  const activeIndex = project ? PLANNER_STAGES.findIndex((s) => s.id === activeStage) : -1;
  const onHome = location.pathname.startsWith('/home');
  const onMyPage = location.pathname.startsWith('/mypage');
  const onPlannerRoute = location.pathname.startsWith('/project/');

  return (
    <aside
      className={`sticky top-0 relative flex h-screen ${collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED} shrink-0 flex-col border-r border-hairline bg-white transition-[width] duration-150`}
    >
      <div className={`flex h-16 items-center border-b border-hairline ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        {collapsed ? (
          <Link to="/home" className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-[13px] font-bold text-white">
            I
          </Link>
        ) : (
          <Logo />
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        <NavItem to="/home" icon="🏠" label="홈" active={onHome} collapsed={collapsed} />

        <div>
          <button
            onClick={() => (collapsed ? navigate('/home') : setPlannerOpen((v) => !v))}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition-colors ${
              onPlannerRoute ? 'bg-brand-soft text-brand-strong' : 'text-ink-muted hover:bg-canvas-sunken'
            }`}
          >
            <span className="text-[16px]">🧭</span>
            {!collapsed && (
              <>
                <span className="flex-1 text-left">비즈니스 플래너</span>
                <span className={`text-[10px] transition-transform ${plannerOpen ? 'rotate-180' : ''}`}>▾</span>
              </>
            )}
          </button>

          {!collapsed && plannerOpen && (
            <div className="ml-2 mt-1 flex flex-col gap-0.5 border-l border-hairline pl-3">
              {PLANNER_STAGES.map((s, idx) => {
                const enabled = !!project && idx <= activeIndex + 1;
                const active = !!project && s.id === activeStage;
                const to = project ? (enabled ? s.path(project.id) : '#') : '/mypage';
                return (
                  <Link
                    key={s.id}
                    to={to}
                    aria-disabled={!!project && !enabled}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                      active
                        ? 'bg-brand-soft text-brand-strong'
                        : project && !enabled
                          ? 'pointer-events-none text-ink-faint/50'
                          : 'text-ink-muted hover:bg-canvas-sunken'
                    }`}
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded text-[11px]"
                      style={{ backgroundColor: s.iconBg }}
                    >
                      {s.icon}
                    </span>
                    {s.label}
                  </Link>
                );
              })}
              {!project && (
                <p className="px-2.5 py-1.5 text-[11px] leading-relaxed text-ink-faint">
                  프로젝트를 선택하면 단계별로 이동할 수 있어요
                </p>
              )}
            </div>
          )}
        </div>

        <NavItem to="/mypage" icon="👤" label="마이페이지" active={onMyPage} collapsed={collapsed} />
      </nav>

      <div className="flex flex-col gap-2 border-t border-hairline px-3 py-3">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[12px] font-bold text-ink-muted">
            {currentUser?.name?.slice(0, 1) ?? '?'}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-ink-strong">{currentUser?.name ?? '게스트'}</p>
              <p className="truncate text-[11px] text-ink-faint">{currentUser?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-muted hover:bg-canvas-sunken ${collapsed ? 'justify-center' : ''}`}
        >
          <span>🚪</span>
          {!collapsed && '로그아웃'}
        </button>
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute top-[68px] -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-hairline-strong bg-white text-[11px] text-ink-muted shadow-sm hover:bg-canvas-sunken"
        aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  );
}

function NavItem({
  to,
  icon,
  label,
  active,
  collapsed,
}: {
  to: string;
  icon: string;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition-colors ${
        collapsed ? 'justify-center' : ''
      } ${active ? 'bg-brand-soft text-brand-strong' : 'text-ink-muted hover:bg-canvas-sunken'}`}
    >
      <span className="text-[16px]">{icon}</span>
      {!collapsed && label}
    </Link>
  );
}
