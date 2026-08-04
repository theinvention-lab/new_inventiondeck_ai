import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SocialButtons } from '../../components/auth/SocialButtons';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = (location.state as { from?: string } | null)?.from ?? '/home';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      const result = login({ email, password });
      setLoading(false);
      if (!result.ok) {
        setError(result.error ?? '로그인에 실패했습니다.');
        return;
      }
      toast.push('로그인되었습니다.');
      navigate(from, { replace: true });
    }, 350);
  };

  return (
    <AuthLayout title="로그인" subtitle="아이디어 작업을 이어서 진행하세요">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label="이메일"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="비밀번호"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-[13px] text-danger">{error}</p>}
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-[12.5px] font-medium text-ink-muted hover:text-brand">
            비밀번호를 잊으셨나요?
          </Link>
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          로그인
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="text-[12px] text-ink-faint">또는</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <SocialButtons />

      <p className="mt-6 text-center text-[13px] text-ink-muted">
        아직 계정이 없나요?{' '}
        <Link to="/signup" className="font-semibold text-brand">
          회원가입
        </Link>
      </p>
    </AuthLayout>
  );
}
