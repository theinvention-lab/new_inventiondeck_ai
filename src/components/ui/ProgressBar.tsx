interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  tone?: 'brand' | 'info';
  showLabel?: boolean;
}

export function ProgressBar({ value, className = '', tone = 'brand', showLabel = false }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hairline">
        <div
          className={`h-full rounded-full transition-all duration-500 ${tone === 'brand' ? 'bg-brand' : 'bg-info'}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="text-[12px] font-semibold text-ink-muted tabular-nums">{clamped}%</span>}
    </div>
  );
}
