// 작성 중인 입력 칸을 비즈니스 에이전트 채팅창으로 끌어다 놓을 때 쓰는
// 데이터 포맷. 브라우저 기본 텍스트 드래그(선택한 글자를 끌기)도 함께
// 지원하도록 text/plain을 같이 실어 보낸다.

export const FIELD_DRAG_MIME = 'application/x-inventiondeck-field';

export interface FieldDragPayload {
  label: string;
  value: string;
}

export function setFieldDragData(e: React.DragEvent, payload: FieldDragPayload) {
  e.dataTransfer.setData(FIELD_DRAG_MIME, JSON.stringify(payload));
  e.dataTransfer.setData('text/plain', payload.value);
  e.dataTransfer.effectAllowed = 'copy';
}

export function readFieldDragData(e: React.DragEvent): FieldDragPayload | null {
  const raw = e.dataTransfer.getData(FIELD_DRAG_MIME);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as FieldDragPayload;
      if (typeof parsed?.label === 'string' && typeof parsed?.value === 'string') return parsed;
    } catch {
      // 형식이 깨졌으면 아래 text/plain 처리로 넘어간다
    }
  }
  const text = e.dataTransfer.getData('text/plain');
  return text.trim() ? { label: '선택한 텍스트', value: text } : null;
}
