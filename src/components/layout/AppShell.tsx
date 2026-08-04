import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas-sunken">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
