import type { ReactNode } from 'react';
import { Logo } from './Logo';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-sunken px-5 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-hairline bg-white p-7 shadow-sm animate-fade-in-up">
          <h1 className="text-[19px] font-bold text-ink-strong">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[13px] text-ink-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
