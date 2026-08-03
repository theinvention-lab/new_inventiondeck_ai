import type { HTMLAttributes } from 'react';

type Tone = 'brand' | 'neutral' | 'info' | 'warning' | 'danger' | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const TONE_CLASS: Record<Tone, string> = {
  brand: 'bg-brand-soft text-brand-strong',
  neutral: 'bg-canvas-sunken text-ink-muted',
  info: 'bg-info-soft text-info',
  warning: 'bg-warning-soft text-[#8a5a05]',
  danger: 'bg-danger-soft text-danger',
  outline: 'bg-white text-ink-muted border border-hairline-strong',
};

export function Badge({ tone = 'neutral', className = '', children, ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium leading-none ${TONE_CLASS[tone]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
