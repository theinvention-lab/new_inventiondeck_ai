import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import type { Project, ProjectStage } from '../../types';

export function AppShell({
  project,
  activeStage,
  children,
}: {
  project?: Project;
  activeStage?: ProjectStage;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas-sunken">
      <Sidebar project={project} activeStage={activeStage} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
