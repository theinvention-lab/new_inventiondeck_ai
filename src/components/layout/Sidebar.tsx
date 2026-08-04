import { Link, useLocation } from 'react-router-dom';
import logoUrl from '../../assets/logo.webp';
import { useAuthStore } from '../../store/authStore';

export const SIDEBAR_WIDTH_COLLAPSED = 'w-[88px]';

const NAV_ITEMS = [
  { to: '/home', icon: 'fi-rr-home', label: '홈', match: (path: string, search: string) => path === '/' || (path === '/home' && !search.includes('mode=')) },
  { to: '/home?mode=generator', icon: 'fi-rr-apps', label: 'Generator', match: (path: string, search: string) => path.includes('/generator') || (path === '/home' && search.includes('mode=generator')) },
  { to: '/home?mode=builder', icon: 'fi-rr-edit', label: 'Builder', match: (path: string, search: string) => path.includes('/builder') || (path === '/home' && search.includes('mode=builder')) },
  { to: '/home?mode=planner', icon: 'fi-rr-document', label: 'Planner', match: (path: string, search: string) => path.includes('/planner') || (path === '/home' && search.includes('mode=planner')) },
  { to: '/mypage', icon: 'fi-rr-user', label: '마이페이지', match: (path: string) => path.startsWith('/mypage') },
];

export function Sidebar() {
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.currentUser());

  return (
    <aside className={`sticky top-0 flex h-screen ${SIDEBAR_WIDTH_COLLAPSED} shrink-0 flex-col items-center border-r border-hairline bg-white`}>
      <div className="flex h-16 items-center justify-center border-b border-hairline">
        <Link to="/home" className="flex h-8 w-8 items-center justify-center">
          <img src={logoUrl} alt="InventionDeck" className="h-8 w-8 rounded-[6px]" />
        </Link>
      </div>

      <div className="h-px w-full bg-hairline" />

      <nav className="flex w-full flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex flex-col items-center justify-center gap-1 rounded-lg px-0.5 py-2.5 text-[13.5px] font-semibold transition-colors ${
              item.match(location.pathname, location.search)
                ? 'bg-brand-soft text-brand-strong'
                : 'text-ink-muted hover:bg-canvas-sunken'
            }`}
          >
            <i className={`fi ${item.icon} text-[16px]`} />
            <span className="whitespace-nowrap text-[10.5px] font-semibold leading-none">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="flex w-full flex-col gap-1.5 border-t border-hairline px-3 py-3">
        <div className="flex items-center justify-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[12px] font-bold text-ink-muted">
            {currentUser?.name?.slice(0, 1) ?? '?'}
          </span>
        </div>
      </div>
    </aside>
  );
}
