import { Link } from 'react-router-dom';

export function Logo({ to = '/home', className = '' }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="flex flex-col leading-none">
        <span className="text-[16px] font-extrabold tracking-tight text-brand">Invention</span>
        <span className="flex items-center gap-0.5">
          {['D', 'E', 'C', 'K'].map((ch) => (
            <span
              key={ch}
              className="flex h-4 w-4 items-center justify-center rounded-[3px] border-[1.5px] border-ink-strong text-[9px] font-black leading-none text-ink-strong"
            >
              {ch}
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}
