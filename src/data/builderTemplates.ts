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
    id: 'lean-canvas',
    name: '린 캔버스',
    shortName: 'Lean Canvas',
    description: '초기 스타트업이 핵심 가설을 한 장으로 빠르게 정리할 때 적합합니다.',
    icon: '🎯',
    fields: [
      { id: 'problem', label: '문제', placeholder: '고객이 겪는 상위 1~3개 문제', span: 1 },
      { id: 'solution', label: '솔루션', placeholder: '각 문제에 대한 핵심 해결 방안', span: 1 },
      { id: 'uniqueValueProp', label: '고유 가치 제안', placeholder: '왜 우리 제품이 달라야 하는지 한 문장으로', span: 1 },
      { id: 'unfairAdvantage', label: '경쟁 우위', placeholder: '쉽게 복제될 수 없는 우리만의 강점', span: 1 },
      { id: 'customerSegments', label: '고객군', placeholder: '타겟 고객과 얼리어답터', span: 1 },
      { id: 'keyMetrics', label: '핵심 지표', placeholder: '추적해야 할 핵심 행동/수치', span: 1 },
      { id: 'channels', label: '채널', placeholder: '고객에게 도달하는 경로', span: 1 },
      { id: 'costStructure', label: '비용 구조', placeholder: '주요 고정비/변동비 항목', span: 1 },
      { id: 'revenueStreams', label: '수익원', placeholder: '매출이 발생하는 방식과 가격', span: 1 },
    ],
  },
  {
    id: 'bmc',
    name: '비즈니스 모델 캔버스',
    shortName: 'BMC',
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
    id: 'value-prop',
    name: '가치 제안 캔버스',
    shortName: 'Value Proposition',
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
    id: 'swot',
    name: 'SWOT 분석',
    shortName: 'SWOT',
    description: '내부 역량과 외부 환경을 함께 짚어 전략 방향을 잡을 때 적합합니다.',
    icon: '⚖️',
    fields: [
      { id: 'strengths', label: '강점 (Strengths)', placeholder: '내부적으로 우리가 잘하는 것', span: 1 },
      { id: 'weaknesses', label: '약점 (Weaknesses)', placeholder: '내부적으로 부족한 부분', span: 1 },
      { id: 'opportunities', label: '기회 (Opportunities)', placeholder: '활용할 수 있는 외부 환경 변화', span: 1 },
      { id: 'threats', label: '위협 (Threats)', placeholder: '경계해야 할 외부 리스크', span: 1 },
    ],
  },
  {
    id: '3c',
    name: '3C 분석',
    shortName: '3C',
    description: '자사·고객·경쟁사 관점에서 시장 포지션을 점검할 때 적합합니다.',
    icon: '🔺',
    fields: [
      { id: 'company', label: '자사 (Company)', placeholder: '우리의 역량, 자원, 현재 위치', span: 1 },
      { id: 'customer', label: '고객 (Customer)', placeholder: '고객의 니즈와 행동 변화', span: 1 },
      { id: 'competitor', label: '경쟁사 (Competitor)', placeholder: '주요 경쟁자와 그들의 전략', span: 1 },
    ],
  },
  {
    id: 'stp',
    name: 'STP 전략',
    shortName: 'STP',
    description: '시장을 세분화하고 목표 고객과 포지셔닝을 정할 때 적합합니다.',
    icon: '🧭',
    fields: [
      { id: 'segmentation', label: '시장 세분화 (Segmentation)', placeholder: '시장을 나누는 기준과 세그먼트', span: 1 },
      { id: 'targeting', label: '목표 시장 선정 (Targeting)', placeholder: '어떤 세그먼트를 우선 공략할지', span: 1 },
      { id: 'positioning', label: '포지셔닝 (Positioning)', placeholder: '선택한 시장에서 어떻게 인식되고 싶은지', span: 1 },
    ],
  },
];

export function getBuilderTemplate(id: BuilderTemplateId): BuilderTemplateDef {
  return BUILDER_TEMPLATES.find((t) => t.id === id) ?? BUILDER_TEMPLATES[0];
}
