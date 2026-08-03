import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import { evaluatePasswordStrength, STRENGTH_COLOR, STRENGTH_LABEL } from '../../lib/passwordStrength';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const navigate = useNavigate();
  const toast = useToast();
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      const result = resetPassword(token, password);
      setLoading(false);
      if (!result.ok) {
        setError(result.error ?? '재설정에 실패했습니다.');
        return;
      }
      toast.push('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
      navigate('/login', { replace: true });
    }, 350);
  };

  if (!token) {
    return (
      <AuthLayout title="유효하지 않은 링크" subtitle="비밀번호 재설정 링크가 올바르지 않습니다">
        <Button fullWidth onClick={() => navigate('/forgot-password')}>
          다시 요청하기
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="새 비밀번호 설정" subtitle="새로운 비밀번호를 입력해주세요">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div>
          <Input
            label="새 비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8자 이상"
          />
          {password && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex h-1 flex-1 gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-full flex-1 rounded-full"
                    style={{
                      backgroundColor:
                        (strength === 'weak' && i === 0) ||
                        (strength === 'medium' && i <= 1) ||
                        (strength === 'strong' && i <= 2)
                          ? STRENGTH_COLOR[strength]
                          : '#e5e5e5',
                    }}
                  />
                ))}
              </div>
              <span className="text-[11.5px] font-medium text-ink-faint">{STRENGTH_LABEL[strength]}</span>
            </div>
          )}
        </div>
        <Input
          label="새 비밀번호 확인"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="다시 입력하세요"
        />
        {error && <p className="text-[13px] text-danger">{error}</p>}
        <Button type="submit" size="lg" fullWidth loading={loading}>
          비밀번호 변경
        </Button>
      </form>
    </AuthLayout>
  );
}
