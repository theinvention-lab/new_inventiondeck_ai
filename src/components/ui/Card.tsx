import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  hoverable?: boolean;
}

export function Card({ padded = true, hoverable = false, className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-none border border-hairline bg-white ${padded ? 'p-5' : ''} ${
        hoverable ? 'transition-shadow hover:shadow-md' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
