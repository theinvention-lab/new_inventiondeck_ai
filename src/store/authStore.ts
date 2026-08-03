import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';
import { mockHash } from '../lib/hash';
import { makeId } from '../lib/id';

interface ResetToken {
  token: string;
  email: string;
  expiresAt: string;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthStoreState {
  users: User[];
  resetTokens: ResetToken[];
  currentEmail: string | null;
  loginAttempts: Record<string, { count: number; lockedUntil: string | null }>;

  signup: (input: { email: string; password: string; name: string }) => AuthResult;
  login: (input: { email: string; password: string }) => AuthResult;
  socialLogin: (provider: 'google' | 'kakao') => AuthResult;
  logout: () => void;
  requestPasswordReset: (email: string) => { ok: boolean; token?: string; error?: string };
  resetPassword: (token: string, newPassword: string) => AuthResult;
  isEmailTaken: (email: string) => boolean;
  currentUser: () => User | null;
}

const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 60_000;

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      users: [],
      resetTokens: [],
      currentEmail: null,
      loginAttempts: {},

      isEmailTaken: (email) => get().users.some((u) => u.email.toLowerCase() === email.toLowerCase()),

      signup: ({ email, password, name }) => {
        const normalized = email.trim().toLowerCase();
        if (!normalized || !password || !name.trim()) {
          return { ok: false, error: '모든 필드를 입력해주세요.' };
        }
        if (get().isEmailTaken(normalized)) {
          return { ok: false, error: '이미 가입된 이메일입니다.' };
        }
        const user: User = {
          email: normalized,
          name: name.trim(),
          passwordHash: mockHash(password),
          provider: 'email',
          createdAt: new Date().toISOString(),
          verified: true,
        };
        set((s) => ({ users: [...s.users, user], currentEmail: normalized }));
        return { ok: true };
      },

      login: ({ email, password }) => {
        const normalized = email.trim().toLowerCase();
        const attempts = get().loginAttempts[normalized];
        if (attempts?.lockedUntil && new Date(attempts.lockedUntil).getTime() > Date.now()) {
          const secs = Math.ceil((new Date(attempts.lockedUntil).getTime() - Date.now()) / 1000);
          return { ok: false, error: `로그인 시도가 많아 잠시 잠겼습니다. ${secs}초 후 다시 시도해주세요.` };
        }

        const user = get().users.find((u) => u.email === normalized);
        const valid = !!user && user.passwordHash === mockHash(password);

        if (!valid) {
          set((s) => {
            const prev = s.loginAttempts[normalized] ?? { count: 0, lockedUntil: null };
            const count = prev.count + 1;
            const lockedUntil = count >= LOCK_THRESHOLD ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null;
            return { loginAttempts: { ...s.loginAttempts, [normalized]: { count, lockedUntil } } };
          });
          if (!user) return { ok: false, error: '등록되지 않은 이메일입니다.' };
          return { ok: false, error: '비밀번호가 일치하지 않습니다.' };
        }

        set((s) => ({
          currentEmail: normalized,
          loginAttempts: { ...s.loginAttempts, [normalized]: { count: 0, lockedUntil: null } },
        }));
        return { ok: true };
      },

      socialLogin: (provider) => {
        const email = `${provider}-user@inventiondeck.demo`;
        let user = get().users.find((u) => u.email === email);
        if (!user) {
          user = {
            email,
            name: provider === 'google' ? 'Google 사용자' : 'Kakao 사용자',
            passwordHash: '',
            provider,
            createdAt: new Date().toISOString(),
            verified: true,
          };
          set((s) => ({ users: [...s.users, user!] }));
        }
        set({ currentEmail: email });
        return { ok: true };
      },

      logout: () => set({ currentEmail: null }),

      requestPasswordReset: (email) => {
        const normalized = email.trim().toLowerCase();
        const user = get().users.find((u) => u.email === normalized);
        if (!user) return { ok: false, error: '등록되지 않은 이메일입니다.' };
        const token = makeId('reset');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        set((s) => ({ resetTokens: [...s.resetTokens.filter((t) => t.email !== normalized), { token, email: normalized, expiresAt }] }));
        return { ok: true, token };
      },

      resetPassword: (token, newPassword) => {
        const entry = get().resetTokens.find((t) => t.token === token);
        if (!entry) return { ok: false, error: '유효하지 않은 링크입니다.' };
        if (new Date(entry.expiresAt).getTime() < Date.now()) {
          return { ok: false, error: '링크가 만료되었습니다. 다시 요청해주세요.' };
        }
        set((s) => ({
          users: s.users.map((u) => (u.email === entry.email ? { ...u, passwordHash: mockHash(newPassword) } : u)),
          resetTokens: s.resetTokens.filter((t) => t.token !== token),
        }));
        return { ok: true };
      },

      currentUser: () => {
        const email = get().currentEmail;
        if (!email) return null;
        return get().users.find((u) => u.email === email) ?? null;
      },
    }),
    {
      name: 'inventiondeck:auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ users: s.users, resetTokens: s.resetTokens, currentEmail: s.currentEmail, loginAttempts: s.loginAttempts }),
    },
  ),
);
