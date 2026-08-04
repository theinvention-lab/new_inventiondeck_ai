import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import logoUrl from '../../assets/logo.webp';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

export const SIDEBAR_WIDTH_EXPANDED = 'w-64';
export const SIDEBAR_WIDTH_COLLAPSED = 'w-[88px]';

const NAV_ITEMS = [
  { to: '/home', icon: '🏠', label: '홈', match: (path: string, search: string) => path === '/' || (path === '/home' && !search.includes('mode=')) },
  { to: '/home?mode=generator', icon: '✨', label: 'Generator', match: (path: string, search: string) => path.includes('/generator') || (path === '/home' && search.includes('mode=generator')) },
  { to: '/home?mode=builder', icon: '🧩', label: 'Builder', match: (path: string, search: string) => path.includes('/builder') || (path === '/home' && search.includes('mode=builder')) },
  { to: '/home?mode=planner', icon: '📄', label: 'Planner', match: (path: string, search: string) => path.includes('/planner') || (path === '/home' && search.includes('mode=planner')) },
  { to: '/mypage', icon: '👤', label: '마이페이지', match: (path: string) => path.startsWith('/mypage') },
];

export function Sidebar() {
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.currentUser());
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={`sticky top-0 relative flex h-screen ${collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED} shrink-0 flex-col border-r border-hairline bg-white transition-[width] duration-150`}
    >
      <div className={`flex h-16 items-center border-b border-hairline ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        {collapsed ? (
          <Link to="/home" className="flex h-8 w-8 items-center justify-center">
            <img src={logoUrl} alt="InventionDeck" className="h-8 w-8 rounded-[6px]" />
          </Link>
        ) : (
          <Logo />
        )}
      </div>

      <div className="h-px bg-hairline" />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex items-center rounded-lg text-[13.5px] font-semibold transition-colors ${
              collapsed ? 'flex-col justify-center gap-1 px-0.5 py-2.5' : 'gap-2.5 px-3 py-2.5'
            } ${
              item.match(location.pathname, location.search)
                ? 'bg-brand-soft text-brand-strong'
                : 'text-ink-muted hover:bg-canvas-sunken'
            }`}
          >
            <span className="text-[16px]">{item.icon}</span>
            <span className={collapsed ? 'whitespace-nowrap text-[10.5px] font-semibold leading-none' : ''}>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-1.5 border-t border-hairline px-3 py-3">
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
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-3 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-hairline-strong bg-white text-[11px] text-ink-muted shadow-sm hover:bg-canvas-sunken"
        aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  );
}
