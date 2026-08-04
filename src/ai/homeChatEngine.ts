import type { ChatMessage } from '../types';
import { makeId } from '../lib/id';

export type ChatMode = 'generator' | 'builder' | 'planner';

interface ModeCopy {
  label: string;
  icon: string;
  accent: string;
  subtitle: string;
  placeholder: string;
  ctaLabel: string;
}

export const MODE_COPY: Record<ChatMode, ModeCopy> = {
  generator: {
    label: 'Generator',
    icon: 'fi-rr-apps',
    accent: '#e4002b',
    subtitle: '카드를 조합해서 AI가 비즈니스 아이디어를 만들어드려요',
    placeholder: '관심 있는 분야나 풀고 싶은 문제를 자유롭게 적어보세요…',
    ctaLabel: '카드 라이브러리로 계속하기',
  },
  builder: {
    label: 'Builder',
    icon: 'fi-rr-edit',
    accent: '#0c43b7',
    subtitle: '템플릿을 기반으로 아이디어를 구체화해요',
    placeholder: '구체화하고 싶은 아이디어를 한 문장으로 요약해보세요…',
    ctaLabel: '템플릿으로 계속하기',
  },
  planner: {
    label: 'Planner',
    icon: 'fi-rr-document',
    accent: '#16a34a',
    subtitle: '사업계획서와 IR Deck을 작성해요',
    placeholder: '사업계획서에 담고 싶은 핵심 내용을 적어보세요…',
    ctaLabel: '사업계획서 작성 계속하기',
  },
};

const OPENING: Record<ChatMode, string> = {
  generator:
    '안녕하세요! 어떤 분야에 관심이 있으신가요? 키워드나 풀고 싶은 문제를 말씀해주시면, 어울리는 카드를 조합해 아이디어를 함께 만들어볼게요.',
  builder:
    '이미 떠올린 아이디어가 있다면 한 문장으로 소개해주세요. 목표 고객, 문제, 해결 방식을 하나씩 짚어가며 구체화를 도와드릴게요.',
  planner:
    '사업계획서와 IR Deck을 준비 중이시군요. 어떤 아이디어를 문서로 정리하고 싶으신지 말씀해주세요.',
};

const FOLLOWUPS: Record<ChatMode, string[]> = {
  generator: [
    '좋아요, 그 분야에서 특히 어떤 고객층을 떠올리고 계신가요?',
    '흥미로운 방향이네요. 관련된 키워드를 카드 라이브러리에서 함께 찾아볼까요?',
    '충분히 감을 잡았어요. 아래 버튼으로 카드 라이브러리에서 아이디어를 직접 조합해보세요.',
  ],
  builder: [
    '그 아이디어의 핵심 문제는 무엇인가요? 누가 가장 크게 겪고 있나요?',
    '좋습니다. 이제 템플릿에서 고객, 문제, 해결책을 구조적으로 정리해볼까요?',
    '준비된 것 같아요. 아래 버튼으로 템플릿 작업을 이어가보세요.',
  ],
  planner: [
    '핵심 내용 감사해요. 사업계획서에 강조하고 싶은 숫자나 근거가 있을까요?',
    '좋아요, 그 부분은 사업계획서 초안에 잘 반영될 수 있어요.',
    '이제 사업계획서와 IR Deck 초안을 만들어볼 준비가 된 것 같아요. 아래 버튼을 눌러 이어가보세요.',
  ],
};

export function openingMessage(mode: ChatMode): ChatMessage {
  return {
    id: makeId('hmsg'),
    role: 'ai',
    content: OPENING[mode],
    createdAt: new Date().toISOString(),
    kind: 'normal',
  };
}

export function replyFor(mode: ChatMode, turnIndex: number): ChatMessage {
  const bank = FOLLOWUPS[mode];
  const content = bank[Math.min(turnIndex, bank.length - 1)];
  return {
    id: makeId('hmsg'),
    role: 'ai',
    content,
    createdAt: new Date().toISOString(),
    kind: 'normal',
  };
}
