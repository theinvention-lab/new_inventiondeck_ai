import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      const result = requestPasswordReset(email);
      setLoading(false);
      if (!result.ok) {
        setError(result.error ?? '요청에 실패했습니다.');
        return;
      }
      setSent(true);
      // Demo-only: normally this token would be emailed, never shown in UI.
      window.setTimeout(() => navigate(`/reset-password?token=${result.token}`), 1600);
    }, 350);
  };

  if (sent) {
    return (
      <AuthLayout title="이메일을 확인해주세요" subtitle="비밀번호 재설정 링크를 보냈습니다 (1시간 동안 유효)">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="text-3xl">📩</span>
          <p className="text-[13.5px] text-ink-muted">
            데모 환경에서는 실제 메일 발송 없이 잠시 후 재설정 페이지로 자동 이동합니다.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="비밀번호 찾기" subtitle="가입하신 이메일로 재설정 링크를 보내드릴게요">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label="이메일"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          required
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>
          재설정 링크 보내기
        </Button>
      </form>
      <p className="mt-6 text-center text-[13px] text-ink-muted">
        <Link to="/login" className="font-semibold text-brand">
          로그인으로 돌아가기
        </Link>
      </p>
    </AuthLayout>
  );
}
