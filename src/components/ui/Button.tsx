import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong active:bg-brand-strong disabled:bg-hairline disabled:text-ink-faint',
  secondary: 'bg-ink-strong text-white hover:opacity-90 disabled:bg-hairline disabled:text-ink-faint',
  outline: 'bg-white text-ink border border-hairline-strong hover:border-ink-muted disabled:opacity-50',
  ghost: 'bg-transparent text-ink hover:bg-canvas-sunken disabled:opacity-40',
  danger: 'bg-danger text-white hover:opacity-90 disabled:opacity-50',
};

const SIZE_CLASS: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1',
  md: 'h-10 px-4 text-[14px] gap-1.5',
  lg: 'h-12 px-5 text-[15px] gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  fullWidth,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-medium transition-colors duration-150 whitespace-nowrap select-none disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin-slow" aria-hidden />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
