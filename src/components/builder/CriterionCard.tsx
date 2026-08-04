import { useRef, useState } from 'react';
import type { CriterionAttachment, CriterionEntry, CriterionStatus } from '../../types';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { regenerateSectionDraft } from '../../ai/chatEngine';
import { makeId } from '../../lib/id';

const STATUS_META: Record<CriterionStatus, { label: string; tone: 'brand' | 'warning' | 'danger' }> = {
  met: { label: '충족', tone: 'brand' },
  partial: { label: '부분 충족', tone: 'warning' },
  unmet: { label: '미충족', tone: 'danger' },
};

const WEIGHT_LABEL: Record<number, string> = { 1: '낮음', 2: '보통', 3: '높음' };
const MAX_ATTACHMENT_BYTES = 400_000;

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
  const [direction, setDirection] = useState('');
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [attachError, setAttachError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAttachError('');
    Array.from(files).forEach((file) => {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setAttachError(`${file.name}은(는) 400KB를 초과해 첨부할 수 없습니다.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const attachment: CriterionAttachment = {
          id: makeId('att'),
          name: file.name,
          dataUrl: reader.result as string,
          isImage: file.type.startsWith('image/'),
        };
        onChange({ attachments: [...criterion.attachments, attachment] });
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    onChange({ attachments: criterion.attachments.filter((a) => a.id !== id) });
  };

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
      className={`rounded-xl border bg-white p-4 transition-opacity ${dragging ? 'opacity-40' : 'opacity-100'} border-hairline`}
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

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-ink-muted">첨부파일</span>
          <button onClick={() => fileInputRef.current?.click()} className="text-[12px] font-semibold text-brand hover:underline">
            + 파일 첨부
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
        {attachError && <p className="mb-1.5 text-[11px] text-danger">{attachError}</p>}
        {criterion.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {criterion.attachments.map((a) => (
              <div key={a.id} className="flex items-center gap-1.5 rounded-lg border border-hairline bg-canvas-sunken px-2 py-1.5">
                {a.isImage ? (
                  <img src={a.dataUrl} alt={a.name} className="h-6 w-6 rounded object-cover" />
                ) : (
                  <span className="text-[13px]">📎</span>
                )}
                <span className="max-w-[120px] truncate text-[11.5px] text-ink-muted">{a.name}</span>
                <button onClick={() => removeAttachment(a.id)} className="text-[11px] text-danger" aria-label={`${a.name} 삭제`}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
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
