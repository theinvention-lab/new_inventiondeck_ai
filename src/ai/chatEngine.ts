// 점검 기준 카드의 "AI로 판단 초안 재생성"에서 쓰는 문장 재작성 시뮬레이션.
// 실제 모델 호출은 없고, ideaEngine.ts와 같은 결정적 방식이다.
export function regenerateSectionDraft(sectionLabel: string, direction: string, current: string): string {
  const trimmedDirection = direction.trim();
  const base = current || `${sectionLabel}에 대한 초안입니다.`;
  if (!trimmedDirection) {
    return `${base} (재생성됨: 조금 더 구체적인 수치와 근거를 덧붙였습니다.)`;
  }
  return `${base} — "${trimmedDirection}" 방향을 반영해 다시 작성했습니다: 핵심 메시지를 해당 방향에 맞춰 재구성하고, 근거 문장을 추가했습니다.`;
}
