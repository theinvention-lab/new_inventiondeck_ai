import type { ChatMode } from '../../ai/homeChatEngine';
import { MODE_COPY } from '../../ai/homeChatEngine';

const MODES: ChatMode[] = ['generator', 'builder', 'planner'];

export function ChatModeButtons({ active, onSelect }: { active: ChatMode; onSelect: (mode: ChatMode) => void }) {
  const activeIndex = MODES.indexOf(active);
  const activeCopy = MODE_COPY[active];

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="relative flex rounded-lg bg-canvas-sunken p-1">
        <div
          className="absolute top-1 bottom-1 left-1 rounded-md shadow-sm transition-transform duration-300 ease-out"
          style={{
            width: `calc((100% - 8px) / ${MODES.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
            backgroundColor: activeCopy.accent,
          }}
        />
        {MODES.map((mode) => {
          const copy = MODE_COPY[mode];
          const isActive = mode === active;
          return (
            <button
              key={mode}
              onClick={() => onSelect(mode)}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-[12.5px] font-bold transition-colors duration-300 ${
                isActive ? 'text-white' : 'text-ink-muted hover:text-ink-strong'
              }`}
            >
              <span>{copy.icon}</span>
              {copy.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
