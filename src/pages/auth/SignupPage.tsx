import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SocialButtons } from '../../components/auth/SocialButtons';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import { evaluatePasswordStrength, STRENGTH_COLOR, STRENGTH_LABEL } from '../../lib/passwordStrength';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const signup = useAuthStore((s) => s.signup);
  const isEmailTaken = useAuthStore((s) => s.isEmailTaken);
  const navigate = useNavigate();
  const toast = useToast();

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const emailTaken = email.length > 3 && isEmailTaken(email);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = '이름을 입력해주세요.';
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = '올바른 이메일 형식이 아닙니다.';
    else if (isEmailTaken(email)) next.email = '이미 가입된 이메일입니다.';
    if (password.length < 8) next.password = '비밀번호는 8자 이상이어야 합니다.';
    if (confirm !== password) next.confirm = '비밀번호가 일치하지 않습니다.';
    if (!agreeTerms || !agreePrivacy) next.terms = '필수 약관에 모두 동의해주세요.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    window.setTimeout(() => {
      const result = signup({ email, password, name });
      setLoading(false);
      if (!result.ok) {
        setErrors({ email: result.error ?? '가입에 실패했습니다.' });
        return;
      }
      toast.push('회원가입이 완료되었습니다. 확인 메일을 보냈어요 (데모 환경).');
      navigate('/mypage', { replace: true });
    }, 400);
  };

  return (
    <AuthLayout title="회원가입" subtitle="30초면 첫 아이디어를 시작할 수 있어요">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
        <Input
          label="이름"
          name="name"
          placeholder="홍길동"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="이메일"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          hint={!errors.email && emailTaken ? '이미 사용 중인 이메일입니다.' : undefined}
        />
        <div>
          <Input
            label="비밀번호"
            type="password"
            name="password"
            placeholder="8자 이상, 대소문자·숫자·특수문자 권장"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {password && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex h-1 flex-1 gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-full flex-1 rounded-full transition-colors"
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
          label="비밀번호 확인"
          type="password"
          name="confirm"
          placeholder="비밀번호를 다시 입력하세요"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />

        <div className="mt-1 flex flex-col gap-2 rounded-lg bg-canvas-sunken p-3">
          <label className="flex items-center gap-2 text-[13px] text-ink">
            <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="h-4 w-4 accent-[#e4002b]" />
            (필수) 서비스 이용약관에 동의합니다
          </label>
          <label className="flex items-center gap-2 text-[13px] text-ink">
            <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} className="h-4 w-4 accent-[#e4002b]" />
            (필수) 개인정보처리방침에 동의합니다
          </label>
          {errors.terms && <p className="text-[12px] text-danger">{errors.terms}</p>}
        </div>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          회원가입
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="text-[12px] text-ink-faint">또는</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <SocialButtons />

      <p className="mt-6 text-center text-[13px] text-ink-muted">
        이미 계정이 있나요?{' '}
        <Link to="/login" className="font-semibold text-brand">
          로그인
        </Link>
      </p>
    </AuthLayout>
  );
}
