import type { TextareaHTMLAttributes } from 'react';
import { setFieldDragData } from '../../lib/fieldDrag';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  /**
   * 지정하면 라벨 옆에 손잡이가 붙어, 이 칸의 내용을 비즈니스 에이전트
   * 채팅창으로 끌어다 놓을 수 있다.
   */
  dragLabel?: string;
}

export function Textarea({ label, error, hint, dragLabel, className = '', id, ...rest }: TextareaProps) {
  const areaId = id ?? rest.name;
  const dragValue = typeof rest.value === 'string' ? rest.value : '';
  const canDrag = !!dragLabel && !!dragValue.trim();

  return (
    <div className="flex flex-col gap-1.5">
      {(label || canDrag) && (
        <div className="flex items-center gap-1.5">
          {label && (
            <label htmlFor={areaId} className="text-[13px] font-medium text-ink-muted">
              {label}
            </label>
          )}
          {canDrag && (
            <span
              draggable
              onDragStart={(e) => setFieldDragData(e, { label: dragLabel!, value: dragValue })}
              title="에이전트 채팅창으로 끌어다 놓기"
              aria-label={`${dragLabel} 내용을 에이전트로 끌어가기`}
              className="cursor-grab select-none text-[11px] leading-none text-ink-faint transition-colors hover:text-brand active:cursor-grabbing"
            >
              ⠿
            </span>
          )}
        </div>
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
