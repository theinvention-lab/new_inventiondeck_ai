import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = '', id, children, ...rest }: SelectProps) {
  const selectId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-[13px] font-medium text-ink-muted">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`h-10 rounded-lg border border-hairline-strong bg-white px-3 text-[14px] text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/15 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}
