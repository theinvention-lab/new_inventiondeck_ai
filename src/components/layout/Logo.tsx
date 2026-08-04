import { Link } from 'react-router-dom';
import logoUrl from '../../assets/logo.webp';

export function Logo({ to = '/home', className = '' }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2 ${className}`}>
      <img src={logoUrl} alt="InventionDeck" className="h-7 w-7 shrink-0 rounded-[6px]" />
      <span className="text-[15px] font-extrabold tracking-tight text-ink-strong">
        Invention<span className="text-brand">Deck</span>
      </span>
    </Link>
  );
}
