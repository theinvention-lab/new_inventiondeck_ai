import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useToast } from '../ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import type { Project, ProjectStage } from '../../types';

export const SIDEBAR_WIDTH_EXPANDED = 'w-64';
export const SIDEBAR_WIDTH_COLLAPSED = 'w-20';

const PLANNER_STAGES: { id: ProjectStage; label: string; icon: string; iconBg: string; path: (id: string) => string }[] = [
  { id: 'generator', label: 'Generator', icon: '✨', iconBg: '#fde7ea', path: (id) => `/project/${id}/generator` },
  { id: 'builder', label: 'Builder', icon: '🧩', iconBg: '#eef2fc', path: (id) => `/project/${id}/builder` },
  { id: 'planner', label: 'Planner', icon: '📄', iconBg: '#e6f7ec', path: (id) => `/project/${id}/planner` },
  { id: 'deck', label: 'Deck', icon: '📊', iconBg: '#f3ecfd', path: (id) => `/project/${id}/deck` },
];

export function Sidebar({ project, activeStage }: { project?: Project; activeStage?: ProjectStage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const currentUser = useAuthStore((s) => s.currentUser());
  const logout = useAuthStore((s) => s.logout);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const [plannerOpen, setPlannerOpen] = useState(!!project);
  const [guideOpen, setGuideOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const activeIndex = project ? PLANNER_STAGES.findIndex((s) => s.id === activeStage) : -1;
  const onHome = location.pathname.startsWith('/home');
  const onMyPage = location.pathname.startsWith('/mypage');
  const onPlannerRoute = location.pathname.startsWith('/project/');

  const submitFeedback = () => {
    if (!feedbackText.trim()) return;
    setFeedbackOpen(false);
    setFeedbackText('');
    toast.push('피드백을 보내주셔서 감사합니다!');
  };

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

      <div className="flex flex-col gap-0.5 border-t border-hairline px-3 py-3">
        <button
          onClick={() => setGuideOpen(true)}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-muted hover:bg-canvas-sunken ${collapsed ? 'justify-center' : ''}`}
        >
          <span>📖</span>
          {!collapsed && '사용 가이드'}
        </button>
        <button
          onClick={() => setFeedbackOpen(true)}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink-muted hover:bg-canvas-sunken ${collapsed ? 'justify-center' : ''}`}
        >
          <span>💬</span>
          {!collapsed && '피드백'}
        </button>
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

        {!collapsed && (
          <div className="mt-2 flex items-center gap-2 border-t border-hairline px-1 pt-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[12px] font-bold text-ink-muted">
              {currentUser?.name?.slice(0, 1) ?? '?'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-ink-strong">{currentUser?.name ?? '게스트'}</p>
              <p className="truncate text-[11px] text-ink-faint">{currentUser?.email}</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute top-[68px] -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-hairline-strong bg-white text-[11px] text-ink-muted shadow-sm hover:bg-canvas-sunken"
        aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
      >
        {collapsed ? '›' : '‹'}
      </button>

      <Dialog open={guideOpen} onClose={() => setGuideOpen(false)} title="사용 가이드" size="md">
        <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-ink-muted">
          <p>
            <strong className="text-ink-strong">1. Generator</strong> — 비즈니스 카드를 조합해 AI가 새로운 사업 아이디어를
            제안합니다.
          </p>
          <p>
            <strong className="text-ink-strong">2. Builder</strong> — AI 채팅과 점검 기준으로 아이디어를 검증하고
            구체화합니다.
          </p>
          <p>
            <strong className="text-ink-strong">3. Planner</strong> — 검증된 내용을 바탕으로 사업계획서를 작성하고 PDF로
            내보냅니다.
          </p>
          <p>
            <strong className="text-ink-strong">4. Deck</strong> — 투자자용 IR Deck을 슬라이드로 구성하고 PPT로
            내보냅니다.
          </p>
        </div>
      </Dialog>

      <Dialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title="피드백 보내기"
        description="개선하면 좋을 점이나 불편했던 점을 알려주세요."
        footer={
          <>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
              취소
            </Button>
            <Button onClick={submitFeedback}>보내기</Button>
          </>
        }
      >
        <Textarea rows={4} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="자유롭게 남겨주세요…" />
      </Dialog>
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
