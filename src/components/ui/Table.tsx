import type { HTMLAttributes } from 'react';

export function Table({ className = '', children, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-none border border-hairline">
      <table className={`w-full border-collapse text-left text-[13px] ${className}`} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-canvas-sunken text-ink-muted">{children}</thead>;
}

export function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2.5 text-[12px] font-semibold ${className}`}>{children}</th>;
}

export function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`border-t border-hairline px-4 py-2.5 text-ink ${className}`}>{children}</td>;
}
