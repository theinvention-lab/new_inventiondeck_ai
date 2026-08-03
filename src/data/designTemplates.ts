import type { DesignTemplateId } from '../types';

export interface DesignTemplate {
  id: DesignTemplateId;
  name: string;
  description: string;
  primary: string;
  accent: string;
  bg: string;
  ink: string;
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'naver-mint',
    name: '네이버 그린',
    description: '화이트 캔버스와 브랜드 그린을 포인트로 쓰는 정보 밀도 높은 스타일',
    primary: '#03c75a',
    accent: '#0c43b7',
    bg: '#ffffff',
    ink: '#1c1c1c',
  },
  {
    id: 'ink-mono',
    name: '잉크 모노톤',
    description: '무채색 위주의 절제된 톤으로 신뢰감을 주는 스타일',
    primary: '#1a1d24',
    accent: '#717680',
    bg: '#ffffff',
    ink: '#1a1d24',
  },
  {
    id: 'sunrise',
    name: '선라이즈',
    description: '따뜻한 오렌지 포인트로 스타트업의 에너지를 강조하는 스타일',
    primary: '#f5a524',
    accent: '#e0343f',
    bg: '#fffaf0',
    ink: '#2b1a05',
  },
  {
    id: 'slate-pro',
    name: '슬레이트 프로',
    description: '차분한 블루 계열로 투자자 미팅에 적합한 스타일',
    primary: '#0c43b7',
    accent: '#03c75a',
    bg: '#f7f9fc',
    ink: '#111827',
  },
];

export function getTemplate(id: DesignTemplateId): DesignTemplate {
  return DESIGN_TEMPLATES.find((t) => t.id === id) ?? DESIGN_TEMPLATES[0];
}
