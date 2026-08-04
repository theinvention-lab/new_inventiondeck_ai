import { useState } from 'react';
import type { PitchSlide } from '../../types';
import type { DesignTemplate } from '../../data/designTemplates';
import { Button } from '../ui/Button';

export function PitchDeckPreview({ slides, template }: { slides: PitchSlide[]; template: DesignTemplate }) {
  const [idx, setIdx] = useState(0);
  if (slides.length === 0) return null;
  const slide = slides[Math.min(idx, slides.length - 1)];

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex aspect-video w-full max-w-2xl flex-col justify-center overflow-hidden rounded-xl border border-hairline p-10 shadow-sm"
        style={{ backgroundColor: template.bg }}
      >
        {idx === 0 ? (
          <div className="rounded-lg p-8" style={{ backgroundColor: template.primary }}>
            <h1 className="text-[26px] font-bold text-white">{slide.title}</h1>
            <p className="mt-3 text-[13px] text-white/80">{slide.bullets.join('  ·  ')}</p>
          </div>
        ) : (
          <>
            <h2 className="text-[19px] font-bold" style={{ color: template.primary }}>
              {slide.title}
            </h2>
            <div className="mt-1.5 h-0.5 w-16 rounded-full" style={{ backgroundColor: template.primary }} />
            <ul className="mt-4 flex flex-col gap-2">
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px] leading-relaxed" style={{ color: template.ink }}>
                  <span style={{ color: template.accent }}>●</span> {b}
                </li>
              ))}
            </ul>
            {slide.chart && slide.chart !== 'none' && (
              <div className="mt-4 flex h-16 items-end gap-1.5">
                {[40, 65, 50, 90, 70].map((h, i) => (
                  <div key={i} className="w-6 rounded-t" style={{ height: `${h}%`, backgroundColor: template.accent }} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" disabled={idx === 0} onClick={() => setIdx((v) => v - 1)}>
          ← 이전
        </Button>
        <span className="text-[12.5px] text-ink-muted">
          {idx + 1} / {slides.length}
        </span>
        <Button size="sm" variant="outline" disabled={idx === slides.length - 1} onClick={() => setIdx((v) => v + 1)}>
          다음 →
        </Button>
      </div>
    </div>
  );
}
