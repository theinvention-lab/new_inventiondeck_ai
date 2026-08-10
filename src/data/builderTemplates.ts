import type { BuilderTemplateId } from '../types';

export interface TemplateFieldDef {
  id: string;
  label: string;
  placeholder: string;
  span?: 1 | 2 | 3;
}

export interface BuilderTemplateDef {
  id: BuilderTemplateId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  fields: TemplateFieldDef[];
}

export const BUILDER_TEMPLATES: BuilderTemplateDef[] = [
  {
    id: 'idea-definition',
    name: '아이디어 정의',
    shortName: 'Idea Definition',
    description: '아이디어를 처음 구체화할 때, 핵심을 짧고 명확한 문장으로 정리합니다.',
    icon: '💡',
    fields: [
      { id: 'ideaName', label: '아이디어 이름', placeholder: '이 아이디어를 부르는 짧은 이름이나 문구', span: 1 },
      { id: 'oneLiner', label: '한 줄 정의', placeholder: '누구를 위해, 무엇을, 어떻게 해결하는지 한 문장으로', span: 1 },
      { id: 'targetCustomer', label: '타겟 고객', placeholder: '가장 먼저 이 아이디어가 필요한 사람들', span: 1 },
      { id: 'problem', label: '해결하려는 문제', placeholder: '고객이 겪는 핵심 문제', span: 1 },
      { id: 'solution', label: '제안하는 해결책', placeholder: '문제를 해결하는 핵심 방식', span: 1 },
      { id: 'whyNow', label: '왜 지금인가', placeholder: '지금 이 아이디어가 가능해진 변화나 계기', span: 1 },
    ],
  },
  {
    id: 'idea-canvas',
    name: '아이디어 캔버스',
    shortName: 'Idea Canvas',
    description: '아이디어의 배경이 되는 통찰과 기존 대안 대비 차별점을 함께 정리합니다.',
    icon: '🧩',
    fields: [
      { id: 'insight', label: '핵심 통찰', placeholder: '이 아이디어를 떠올리게 된 관찰이나 인사이트', span: 1 },
      { id: 'targetCustomer', label: '타겟 고객', placeholder: '문제를 겪는 구체적인 고객군', span: 1 },
      { id: 'problem', label: '문제', placeholder: '고객이 반복적으로 겪는 어려움', span: 1 },
      { id: 'existingAlternatives', label: '기존 대안', placeholder: '지금 고객이 대신 사용하는 방법들', span: 1 },
      { id: 'solutionSketch', label: '해결 아이디어', placeholder: '문제를 해결하는 방식의 초안', span: 1 },
      { id: 'differentiation', label: '차별점', placeholder: '기존 대안과 다른 점', span: 1 },
    ],
  },
  {
    id: 'solution-outline',
    name: '솔루션 개요 캔버스',
    shortName: 'Solution Outline Canvas',
    description: '해결책의 구성과 작동 방식, 실현 가능성을 구체적으로 설계합니다.',
    icon: '🛠️',
    fields: [
      { id: 'problemRecap', label: '문제 요약', placeholder: '해결하려는 문제를 다시 한 번 정리', span: 1 },
      { id: 'solutionOverview', label: '솔루션 개요', placeholder: '해결책의 전체 그림', span: 1 },
      { id: 'keyFeatures', label: '핵심 기능', placeholder: '솔루션을 구성하는 핵심 기능/구성 요소', span: 1 },
      { id: 'howItWorks', label: '작동 방식', placeholder: '고객이 실제로 어떻게 사용하는지', span: 1 },
      { id: 'feasibility', label: '구현 가능성', placeholder: '기술적·운영적으로 고려해야 할 제약', span: 1 },
      { id: 'differentiation', label: '경쟁 우위', placeholder: '경쟁 대비 이 솔루션만의 강점', span: 1 },
    ],
  },
  {
    id: 'value-prop',
    name: '가치 제안 캔버스',
    shortName: 'Value Proposition Canvas',
    description: '고객이 실제로 원하는 가치와 제품이 맞아떨어지는지 검증할 때 적합합니다.',
    icon: '💎',
    fields: [
      { id: 'customerJobs', label: '고객이 해결하려는 일', placeholder: '고객이 완수하려는 기능적/감정적 과업', span: 1 },
      { id: 'customerPains', label: '고객의 불편', placeholder: '과업 수행 중 겪는 어려움과 리스크', span: 1 },
      { id: 'customerGains', label: '고객이 원하는 효과', placeholder: '고객이 얻고 싶어하는 이점', span: 1 },
      { id: 'products', label: '제품/서비스', placeholder: '제공하는 제품과 서비스 목록', span: 1 },
      { id: 'painRelievers', label: '불편 해소 방안', placeholder: '제품이 고객의 불편을 어떻게 줄이는지', span: 1 },
      { id: 'gainCreators', label: '효과 창출 방안', placeholder: '제품이 고객에게 어떤 이점을 만들어내는지', span: 1 },
    ],
  },
  {
    id: 'bmc',
    name: '비즈니스 모델 캔버스',
    shortName: 'Business Model Canvas',
    description: '사업 전체 구조를 9개 블록으로 균형 있게 설계할 때 적합합니다.',
    icon: '🧱',
    fields: [
      { id: 'keyPartners', label: '핵심 파트너', placeholder: '협력이 필요한 외부 주체', span: 1 },
      { id: 'keyActivities', label: '핵심 활동', placeholder: '가치를 만들기 위해 반드시 해야 하는 활동', span: 1 },
      { id: 'keyResources', label: '핵심 자원', placeholder: '사업에 필요한 인적/물적/지적 자원', span: 1 },
      { id: 'valuePropositions', label: '가치 제안', placeholder: '고객에게 제공하는 핵심 가치', span: 1 },
      { id: 'customerRelationships', label: '고객 관계', placeholder: '고객과 어떤 관계를 유지할지', span: 1 },
      { id: 'channels', label: '채널', placeholder: '가치를 전달하는 경로', span: 1 },
      { id: 'customerSegments', label: '고객 세그먼트', placeholder: '누구를 위한 사업인지', span: 1 },
      { id: 'costStructure', label: '비용 구조', placeholder: '사업 운영에 드는 주요 비용', span: 1 },
      { id: 'revenueStreams', label: '수익원', placeholder: '고객이 무엇에 비용을 지불하는지', span: 1 },
    ],
  },
  {
    id: 'bm-narratives',
    name: '비즈니스 모델 내러티브',
    shortName: 'Business Model Narratives',
    description: '비즈니스 모델을 숫자·블록이 아닌 이야기 흐름으로 풀어 설득력을 점검합니다.',
    icon: '📖',
    fields: [
      { id: 'customerNarrative', label: '고객 스토리', placeholder: '고객은 누구이며 어떤 변화를 원하는가', span: 1 },
      { id: 'problemNarrative', label: '문제 스토리', placeholder: '고객이 이 문제를 어떻게 경험하는가', span: 1 },
      { id: 'solutionNarrative', label: '해결 스토리', placeholder: '우리 솔루션이 고객의 삶을 어떻게 바꾸는가', span: 1 },
      { id: 'revenueNarrative', label: '수익 스토리', placeholder: '누가, 왜, 얼마를 지불하는가', span: 1 },
      { id: 'growthNarrative', label: '성장 스토리', placeholder: '초기 고객에서 어떻게 확장되는가', span: 1 },
      { id: 'whyUsNarrative', label: '우리여야 하는 이유', placeholder: '왜 지금, 왜 우리 팀이어야 하는가', span: 1 },
    ],
  },
];

export function getBuilderTemplate(id: BuilderTemplateId): BuilderTemplateDef {
  return BUILDER_TEMPLATES.find((t) => t.id === id) ?? BUILDER_TEMPLATES[0];
}
