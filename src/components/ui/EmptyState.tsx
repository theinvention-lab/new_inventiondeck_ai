import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong bg-white px-6 py-14 text-center ${className}`}>
      {icon && <div className="mb-1 text-3xl">{icon}</div>}
      <p className="text-[15px] font-semibold text-ink-strong">{title}</p>
      {description && <p className="max-w-sm text-[13px] leading-relaxed text-ink-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
