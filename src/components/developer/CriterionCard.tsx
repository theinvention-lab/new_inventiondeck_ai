import { useState } from 'react';
import type { CriterionEntry, CriterionStatus } from '../../types';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { regenerateSectionDraft } from '../../ai/chatEngine';

const STATUS_META: Record<CriterionStatus, { label: string; tone: 'brand' | 'warning' | 'danger' }> = {
  met: { label: '충족', tone: 'brand' },
  partial: { label: '부분 충족', tone: 'warning' },
  unmet: { label: '미충족', tone: 'danger' },
};

export function CriterionCard({
  criterion,
  onChange,
  onRemove,
}: {
  criterion: CriterionEntry;
  onChange: (patch: Partial<CriterionEntry>) => void;
  onRemove?: () => void;
}) {
  const [direction, setDirection] = useState('');
  const [showRegenerate, setShowRegenerate] = useState(false);

  return (
    <div className="rounded-xl border border-hairline bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[14.5px] font-bold text-ink-strong">{criterion.name}</h3>
            {criterion.custom && <Badge tone="outline">사용자 정의</Badge>}
          </div>
          <p className="mt-0.5 text-[12px] text-ink-muted">{criterion.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {(['unmet', 'partial', 'met'] as CriterionStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => onChange({ status: s })}
              className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                criterion.status === s
                  ? STATUS_META[s].tone === 'brand'
                    ? 'bg-brand text-white'
                    : STATUS_META[s].tone === 'warning'
                      ? 'bg-warning text-white'
                      : 'bg-danger text-white'
                  : 'bg-canvas-sunken text-ink-faint hover:bg-hairline'
              }`}
            >
              {STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Textarea
          label="보유 근거"
          rows={2}
          placeholder="설문, 인터뷰, 사전 신청 등 구체적 근거"
          value={criterion.evidence}
          onChange={(e) => onChange({ evidence: e.target.value })}
        />
        <Textarea
          label="판단"
          rows={2}
          placeholder="현재까지의 판단을 정리해주세요"
          value={criterion.judgement}
          onChange={(e) => onChange({ judgement: e.target.value })}
        />
        <Textarea
          label="미해결 과제"
          rows={2}
          placeholder="아직 확인되지 않은 점"
          value={criterion.unresolved}
          onChange={(e) => onChange({ unresolved: e.target.value })}
        />
        <Textarea
          label="다음 행동"
          rows={2}
          placeholder="다음에 무엇을 검증할지"
          value={criterion.nextAction}
          onChange={(e) => onChange({ nextAction: e.target.value })}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => setShowRegenerate((v) => !v)}
          className="text-[12px] font-semibold text-brand hover:underline"
        >
          ✨ AI로 판단 초안 재생성
        </button>
        {onRemove && (
          <button onClick={onRemove} className="ml-auto text-[12px] font-medium text-danger hover:underline">
            기준 삭제
          </button>
        )}
      </div>

      {showRegenerate && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-canvas-sunken p-2.5">
          <input
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            placeholder="원하는 방향을 입력 (선택) — 예: 더 보수적으로"
            className="h-8 flex-1 rounded-md border border-hairline-strong bg-white px-2.5 text-[12.5px] outline-none focus:border-brand"
          />
          <Button
            size="sm"
            onClick={() => {
              onChange({ judgement: regenerateSectionDraft(criterion.name, direction, criterion.judgement) });
              setShowRegenerate(false);
              setDirection('');
            }}
          >
            재생성
          </Button>
        </div>
      )}
    </div>
  );
}
