import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = '', id, ...rest }: TextareaProps) {
  const areaId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={areaId} className="text-[13px] font-medium text-ink-muted">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[14px] leading-relaxed text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/15 ${
          error ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-hairline-strong'
        } ${className}`}
        {...rest}
      />
      {error ? (
        <p className="text-[12px] text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}
