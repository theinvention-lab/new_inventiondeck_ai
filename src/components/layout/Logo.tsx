import { Link } from 'react-router-dom';

export function Logo({ to = '/', className = '' }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-[14px] font-bold text-white">
        I
      </span>
      <span className="text-[17px] font-bold tracking-tight text-ink-strong">인벤션덱</span>
    </Link>
  );
}
