import type { CriterionEntry, CriterionStatus } from '../../types';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';

const STATUS_META: Record<CriterionStatus, { label: string; tone: 'brand' | 'warning' | 'danger' }> = {
  met: { label: '충족', tone: 'brand' },
  partial: { label: '부분 충족', tone: 'warning' },
  unmet: { label: '미충족', tone: 'danger' },
};

const WEIGHT_LABEL: Record<number, string> = { 1: '낮음', 2: '보통', 3: '높음' };

export function CriterionCard({
  criterion,
  onChange,
  onRemove,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dragging,
}: {
  criterion: CriterionEntry;
  onChange: (patch: Partial<CriterionEntry>) => void;
  onRemove?: () => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
  dragging?: boolean;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.();
      }}
      onDragEnd={onDragEnd}
      className={`rounded-none border bg-white p-4 transition-opacity ${dragging ? 'opacity-40' : 'opacity-100'} border-hairline`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {draggable && (
            <span
              className="mt-0.5 cursor-grab select-none text-[14px] text-ink-faint active:cursor-grabbing"
              title="드래그해서 순서 변경"
            >
              ⠿
            </span>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[14.5px] font-bold text-ink-strong">{criterion.name}</h3>
              {criterion.custom && <Badge tone="outline">사용자 정의</Badge>}
            </div>
            <p className="mt-0.5 text-[12px] text-ink-muted">{criterion.description}</p>
          </div>
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

      <div className="mb-3 flex items-center gap-2">
        <span className="text-[12px] font-semibold text-ink-muted">중요도</span>
        <div className="flex gap-1">
          {[1, 2, 3].map((w) => (
            <button
              key={w}
              onClick={() => onChange({ weight: w })}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                criterion.weight === w ? 'bg-ink-strong text-white' : 'bg-canvas-sunken text-ink-faint hover:bg-hairline'
              }`}
            >
              {WEIGHT_LABEL[w]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Textarea
          label="보유 근거"
          dragLabel={`${criterion.name} · 보유 근거`}
          rows={2}
          placeholder="설문, 인터뷰, 사전 신청 등 구체적 근거"
          value={criterion.evidence}
          onChange={(e) => onChange({ evidence: e.target.value })}
        />
        <Textarea
          label="판단"
          dragLabel={`${criterion.name} · 판단`}
          rows={2}
          placeholder="현재까지의 판단을 정리해주세요"
          value={criterion.judgement}
          onChange={(e) => onChange({ judgement: e.target.value })}
        />
        <Textarea
          label="미해결 과제"
          dragLabel={`${criterion.name} · 미해결 과제`}
          rows={2}
          placeholder="아직 확인되지 않은 점"
          value={criterion.unresolved}
          onChange={(e) => onChange({ unresolved: e.target.value })}
        />
        <Textarea
          label="다음 행동"
          dragLabel={`${criterion.name} · 다음 행동`}
          rows={2}
          placeholder="다음에 무엇을 검증할지"
          value={criterion.nextAction}
          onChange={(e) => onChange({ nextAction: e.target.value })}
        />
      </div>

      {onRemove && (
        <div className="mt-3 flex">
          <button onClick={onRemove} className="ml-auto text-[12px] font-medium text-danger hover:underline">
            기준 삭제
          </button>
        </div>
      )}
    </div>
  );
}
