import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../ui/Toast';

export function SocialButtons() {
  const socialLogin = useAuthStore((s) => s.socialLogin);
  const navigate = useNavigate();
  const toast = useToast();

  const handle = (provider: 'google' | 'kakao') => {
    const result = socialLogin(provider);
    if (result.ok) {
      toast.push(`${provider === 'google' ? 'Google' : 'Kakao'} 계정으로 로그인했습니다.`);
      navigate('/mypage');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => handle('google')}
        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-hairline-strong bg-white text-[14px] font-medium text-ink transition-colors hover:bg-canvas-sunken"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[conic-gradient(from_90deg,#4285F4_0deg,#34A853_120deg,#FBBC05_240deg,#EA4335_360deg)] text-[10px] font-bold text-white">
          G
        </span>
        Google로 계속하기
      </button>
      <button
        onClick={() => handle('kakao')}
        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FEE500] text-[14px] font-medium text-[#191600] transition-opacity hover:opacity-90"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#191600] text-[10px] font-bold text-[#FEE500]">
          K
        </span>
        Kakao로 계속하기
      </button>
    </div>
  );
}
