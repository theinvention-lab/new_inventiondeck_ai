import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas-sunken px-6 text-center">
      <span className="text-[13px] font-bold text-brand">404</span>
      <h1 className="text-[22px] font-bold text-ink-strong">페이지를 찾을 수 없어요</h1>
      <p className="text-[14px] text-ink-muted">주소가 바뀌었거나 존재하지 않는 페이지입니다.</p>
      <Link to="/">
        <Button>홈으로 돌아가기</Button>
      </Link>
    </div>
  );
}
