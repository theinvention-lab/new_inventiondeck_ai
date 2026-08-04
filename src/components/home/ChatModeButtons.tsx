import type { ChatMode } from '../../ai/homeChatEngine';
import { MODE_COPY } from '../../ai/homeChatEngine';

const MODES: ChatMode[] = ['generator', 'builder', 'planner'];

export function ChatModeButtons({ active, onSelect }: { active: ChatMode; onSelect: (mode: ChatMode) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {MODES.map((mode) => {
        const copy = MODE_COPY[mode];
        const isActive = mode === active;
        return (
          <button
            key={mode}
            onClick={() => onSelect(mode)}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-[14px] font-bold transition-colors ${
              isActive ? 'border-transparent text-white' : 'border-hairline-strong bg-white text-ink-muted hover:bg-canvas-sunken'
            }`}
            style={isActive ? { backgroundColor: copy.accent } : undefined}
          >
            <span>{copy.icon}</span>
            {copy.label}
          </button>
        );
      })}
    </div>
  );
}
