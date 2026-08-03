import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

export function SiteHeader() {
  const navigate = useNavigate();
  const currentEmail = useAuthStore((s) => s.currentEmail);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-[14px] font-medium text-ink-muted md:flex">
            <Link to="/#flow" className="hover:text-ink-strong">
              이용 흐름
            </Link>
            <Link to="/#features" className="hover:text-ink-strong">
              핵심 기능
            </Link>
            <Link to="/hall" className="hover:text-ink-strong">
              명예의 전당
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {currentEmail ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/mypage')}>
                마이페이지
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                로그인
              </Button>
              <Button size="sm" onClick={() => navigate('/signup')}>
                무료로 시작하기
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
