import type { ChatMessage, BuilderState } from '../types';
import { makeId } from '../lib/id';

const QUESTION_BANK = [
  (s: BuilderState) => `"${short(s.targetCustomer)}" 고객군 중에서도 가장 먼저 돈을 낼 사람은 누구인가요? 세그먼트를 더 좁혀볼 수 있을까요?`,
  (s: BuilderState) => `"${short(s.userProblem)}" 문제를 실제로 겪는 사람을 몇 명이나 인터뷰해 보셨나요? 근거 자료가 있다면 함께 정리해보죠.`,
  (s: BuilderState) => `"${short(s.solution)}" 방식 외에 사용자가 지금 쓰고 있는 대안(경쟁 서비스, 수작업 등)은 무엇인가요?`,
  () => `이 아이디어가 실패한다면 가장 가능성 높은 이유는 무엇일까요? 핵심 가정 중 가장 불확실한 것을 짚어볼까요?`,
  (s: BuilderState) => `"${short(s.evidence) || '보유 근거'}"를 조금 더 구체적인 수치로 표현할 수 있을까요? (예: 설문 응답 수, 사전 신청자 수)`,
];

const GAP_BANK = [
  () => `현재 입력에는 '경쟁 환경'에 대한 근거가 비어 있습니다. 유사 서비스와의 차별점을 한두 문장으로 채워보면 좋겠습니다.`,
  () => `'수익 구조'에 대한 구체적인 단가나 전환율 가정이 아직 없습니다. 대략적인 숫자라도 적어두면 다음 단계(Planner)에서 훨씬 수월합니다.`,
  (s: BuilderState) => `'${short(s.currentConcerns) || '현재 고민'}' 항목이 비어 있어요. 지금 가장 걸리는 부분을 적어주시면 그 지점부터 함께 점검하겠습니다.`,
  () => `실행 계획 쪽 정보가 아직 부족합니다. 첫 3개월 안에 무엇을 검증할지 간단히 적어볼까요?`,
];

const ALT_BANK = [
  (s: BuilderState) => `대안으로, "${short(s.solution)}"을(를) 더 작은 범위(MVP)로 축소해 먼저 검증하는 방법도 있습니다. 어떻게 생각하시나요?`,
  () => `가격을 낮춘 무료 체험판으로 먼저 반응을 보는 방법과, 처음부터 유료로 소수에게 판매해보는 방법 중 어느 쪽이 지금 상황에 맞을까요?`,
  (s: BuilderState) => `"${short(s.targetCustomer)}" 대신 조금 더 좁은 초기 고객군으로 시작하면 검증 속도를 높일 수 있습니다. 후보를 함께 좁혀볼까요?`,
];

const SUGGESTION_BANK = [
  (s: BuilderState) => `문장을 조금 더 명확하게 다듬어보면: "${short(s.userProblem)} 때문에 시간을 낭비하는 사람들에게, ${short(s.solution)}로 대안을 제공합니다." 이런 식으로 정리할 수 있어요.`,
  () => `점검 기준 탭에서 '문제 적합성'과 '고객 정의' 항목을 먼저 채워보시는 것을 추천합니다. 근거가 쌓일수록 다음 단계 문서 품질이 좋아집니다.`,
  (s: BuilderState) => `"${short(s.evidence)}"를 뒷받침할 추가 자료(설문, 사전 신청, 인터뷰 메모)가 있다면 첨부해두면 Planner 단계에서 설득력이 높아집니다.`,
];

function short(text: string, max = 40): string {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function pickBank(bank: Array<(s: BuilderState) => string>, state: BuilderState, seed: number): string {
  const idx = Math.floor(pseudoRandom(seed) * bank.length);
  return bank[idx](state);
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function openingMessage(state: BuilderState): ChatMessage {
  const parts: string[] = [];
  parts.push(`입력해주신 내용을 확인했습니다. "${short(state.summary) || '아이디어 요약'}"을(를) 함께 점검해볼게요.`);
  if (!state.evidence) {
    parts.push('아직 보유 근거가 비어 있네요. 먼저 어떤 확신으로 이 아이디어를 시작하셨는지 들어보고 싶습니다.');
  } else {
    parts.push(`"${short(state.evidence)}"를 근거로 시작하셨군요. 이 부분을 조금 더 검증해보겠습니다.`);
  }
  parts.push('고객 정의, 문제 적합성, 경쟁 환경, 수익 구조, 실행 가능성 순서로 함께 점검하겠습니다. 먼저 고객부터 볼까요?');

  return {
    id: makeId('msg'),
    role: 'ai',
    content: parts.join(' '),
    createdAt: new Date().toISOString(),
    kind: 'question',
  };
}

let turnCounter = 0;

export function generateAiReply(state: BuilderState, _userMessage: string): ChatMessage {
  turnCounter += 1;
  const seed = turnCounter * 71 + state.chatMessages.length * 17;
  const roll = pseudoRandom(seed);

  let kind: ChatMessage['kind'];
  let content: string;

  if (roll < 0.35) {
    kind = 'question';
    content = pickBank(QUESTION_BANK, state, seed + 1);
  } else if (roll < 0.6) {
    kind = 'gap';
    content = pickBank(GAP_BANK, state, seed + 2);
  } else if (roll < 0.8) {
    kind = 'alternative';
    content = pickBank(ALT_BANK, state, seed + 3);
  } else {
    kind = 'suggestion';
    content = pickBank(SUGGESTION_BANK, state, seed + 4);
  }

  return {
    id: makeId('msg'),
    role: 'ai',
    content,
    createdAt: new Date().toISOString(),
    kind,
  };
}

export function regenerateSectionDraft(sectionLabel: string, direction: string, current: string): string {
  const trimmedDirection = direction.trim();
  const base = current || `${sectionLabel}에 대한 초안입니다.`;
  if (!trimmedDirection) {
    return `${base} (재생성됨: 조금 더 구체적인 수치와 근거를 덧붙였습니다.)`;
  }
  return `${base} — "${trimmedDirection}" 방향을 반영해 다시 작성했습니다: 핵심 메시지를 해당 방향에 맞춰 재구성하고, 근거 문장을 추가했습니다.`;
}
