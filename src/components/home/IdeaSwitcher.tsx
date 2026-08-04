import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types';

const STAGE_PATH: Record<Project['stage'], string> = {
  generator: 'generator',
  builder: 'builder',
  planner: 'planner',
  completed: 'planner',
};

export function IdeaSwitcher({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-hairline-strong bg-white px-4 py-2 text-[13px] font-semibold text-ink-strong shadow-sm hover:bg-canvas-sunken"
      >
        <span>✨</span>
        아이디어를 선택해주세요
        <span className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-hairline bg-white p-2 shadow-lg">
            {projects.length === 0 ? (
              <p className="px-3 py-4 text-center text-[12.5px] text-ink-faint">아직 프로젝트가 없어요</p>
            ) : (
              <ul className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
                {projects.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate(`/project/${p.id}/${STAGE_PATH[p.stage]}`);
                      }}
                      className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-canvas-sunken"
                    >
                      <span className="truncate text-[13px] font-semibold text-ink-strong">{p.title}</span>
                      <span className="text-[11px] text-ink-faint">{p.stage === 'completed' ? '완료' : `${p.stage} 진행중`}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
