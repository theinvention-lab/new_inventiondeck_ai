import { useRef, useState } from 'react';
import type { User } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../ui/Toast';

const MAX_AVATAR_BYTES = 400_000;

export function ProfileSection({ user }: { user: User }) {
  const toast = useToast();
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);
  const setMarketingConsent = useAuthStore((s) => s.setMarketingConsent);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState('');
  const [name, setName] = useState(user.name);
  const [interest, setInterest] = useState(user.interest ?? '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleAvatarChange = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setAvatarError('');
    if (!file.type.startsWith('image/')) {
      setAvatarError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('이미지 용량은 400KB 이하만 가능합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatarDataUrl: reader.result as string });
      toast.push('프로필 이미지를 변경했어요.');
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const saveProfile = () => {
    updateProfile({ name: name.trim() || user.name, interest: interest.trim() });
    toast.push('프로필을 저장했어요.');
  };

  const submitPasswordChange = () => {
    setPasswordError('');
    if (!currentPassword || !newPassword) {
      setPasswordError('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    const result = changePassword(currentPassword, newPassword);
    if (!result.ok) {
      setPasswordError(result.error ?? '비밀번호 변경에 실패했습니다.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.push('비밀번호를 변경했어요.');
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-none border border-hairline bg-white p-6">
        <h2 className="mb-4 text-[16px] font-bold text-ink-strong">프로필 수정</h2>

        <div className="mb-5 flex items-center gap-4">
          {user.avatarDataUrl ? (
            <img src={user.avatarDataUrl} alt="프로필 이미지" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-canvas-sunken text-[22px] font-bold text-ink-muted">
              {user.name.slice(0, 1)}
            </span>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAvatarChange(e.target.files)}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              이미지 변경
            </Button>
            {avatarError && <p className="mt-1.5 text-[12px] text-danger">{avatarError}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Input label="닉네임" value={name} onChange={(e) => setName(e.target.value)} placeholder="닉네임을 입력하세요" />
          <Input label="이메일" value={user.email} disabled className="opacity-60" />
          <Textarea
            label="관심사"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="예: 헬스케어, 구독 서비스, AI 에이전트…"
            rows={2}
          />
          <Button className="self-start" onClick={saveProfile}>
            프로필 저장
          </Button>
        </div>

        <div className="mt-6 border-t border-hairline pt-5">
          <h3 className="mb-3 text-[13.5px] font-bold text-ink-strong">비밀번호 변경</h3>
          <div className="flex flex-col gap-3">
            <Input
              type="password"
              label="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input type="password" label="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input
              type="password"
              label="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={passwordError}
            />
            <Button className="self-start" variant="outline" onClick={submitPasswordChange}>
              비밀번호 변경
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-none border border-hairline bg-white p-6">
        <h2 className="mb-1 text-[16px] font-bold text-ink-strong">마케팅 정보 수신 동의</h2>
        <p className="mb-4 text-[12.5px] text-ink-muted">신규 기능, 이벤트, 프로모션 소식을 이메일로 받아보세요.</p>
        <label className="flex items-center gap-2.5 text-[13.5px] text-ink">
          <input
            type="checkbox"
            checked={user.marketingConsent}
            onChange={(e) => {
              setMarketingConsent(e.target.checked);
              toast.push(e.target.checked ? '마케팅 정보 수신에 동의했어요.' : '마케팅 정보 수신을 거부했어요.');
            }}
            className="h-4 w-4 accent-[#e4002b]"
          />
          마케팅 정보 수신에 동의합니다 (선택)
        </label>
      </div>
    </div>
  );
}
