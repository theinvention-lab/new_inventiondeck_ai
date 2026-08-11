import type { BuilderTemplateId } from '../types';

export interface TemplateFieldDef {
  id: string;
  label: string;
  placeholder: string;
  span?: 1 | 2 | 3;
}

// A formula section renders a mad-libs style sentence: static connector text
// interleaved with small named "blank" chips. A section may optionally also
// have its own free-text field (textFieldId) for writing the assembled
// sentence out in full — omit it when the blanks alone are enough.
export type FormulaPart =
  | { type: 'text'; text: string }
  | { type: 'blank'; id: string; label: string; placeholder?: string };

export interface TemplateSectionDef {
  id: string;
  title: string;
  subtitle: string;
  formula?: FormulaPart[];
  textFieldId?: string;
  textPlaceholder?: string;
}

export interface BuilderTemplateDef {
  id: BuilderTemplateId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  fields: TemplateFieldDef[];
  sections?: TemplateSectionDef[];
}

export const BUILDER_TEMPLATES: BuilderTemplateDef[] = [
  {
    id: 'idea-definition',
    name: '아이디어 정의',
    shortName: 'Idea Definition',
    description: '아이디어의 핵심을 다양한 문장 형식으로 정의합니다.',
    icon: '💡',
    fields: [
      { id: 'ycOneLiner', label: 'YC One Liner', placeholder: '예: 우리는 펫팸족을 위한 넷플릭스입니다.' },
      { id: 'targetCustomer', label: '목표 고객', placeholder: '예: 작물재배 효율을 높이고 싶은 농장관리자' },
      { id: 'productDescription', label: '제품/서비스 설명', placeholder: '예: 작물 재배 관리 디지털 솔루션' },
      { id: 'coreValue', label: '핵심 가치', placeholder: '예: 농지를 다양한 관점에서 구분한 후 실시간 분석/모니터링' },
      { id: 'competitorProduct', label: '기존의 타사 제품', placeholder: '예: 기존의 스마트 파밍 솔루션들' },
      { id: 'keyBenefit', label: '주요 혜택', placeholder: '예: 높은 차원의 분석' },
      { id: 'analogousProduct', label: '유사한 기존 제품/서비스', placeholder: '예: 구글 어스' },
      { id: 'newContext', label: '산업/새로운 타겟 고객 등', placeholder: '예: 농장' },
    ],
    sections: [
      {
        id: 'ycOneLiner',
        title: 'YC One Liner',
        subtitle: '고객 가치를 표현하는 한문장 만들기',
        textFieldId: 'ycOneLiner',
        textPlaceholder: '예: 우리는 펫팸족을 위한 넷플릭스입니다.',
      },
      {
        id: 'zenStatement',
        title: 'Zen Statement',
        subtitle: '핵심을 표현하는 완전한 제품 소개문 만들기',
        formula: [
          { type: 'blank', id: 'targetCustomer', label: '목표 고객', placeholder: '작물재배 효율을 높이고 싶은 농장관리자' },
          { type: 'text', text: '을 위한 ' },
          { type: 'blank', id: 'productDescription', label: '제품/서비스 설명', placeholder: '작물 재배 관리 디지털 솔루션' },
          { type: 'text', text: '으로, ' },
          { type: 'blank', id: 'coreValue', label: '핵심 가치', placeholder: '농지를 다양한 관점에서 구분한 후 실시간 분석/모니터링' },
          { type: 'text', text: '하며, ' },
          { type: 'blank', id: 'competitorProduct', label: '기존의 타사 제품', placeholder: '기존의 스마트 파밍 솔루션들' },
          { type: 'text', text: '과는 다른 ' },
          { type: 'blank', id: 'keyBenefit', label: '주요 혜택', placeholder: '높은 차원의 분석' },
          { type: 'text', text: '을 제공합니다.' },
        ],
      },
      {
        id: 'weAreXForY',
        title: 'We are X for Y',
        subtitle: '기존 유명 서비스에 빗대어 만들기',
        formula: [
          { type: 'text', text: '우리는 ' },
          { type: 'blank', id: 'analogousProduct', label: '유사한 매커니즘/모델의 기존 유형 제품/서비스', placeholder: '구글 어스' },
          { type: 'text', text: '의 ' },
          { type: 'blank', id: 'newContext', label: '산업/새로운 타겟 고객 등', placeholder: '농장' },
          { type: 'text', text: ' 버전입니다.' },
        ],
      },
    ],
  },
  {
    id: 'idea-canvas',
    name: '아이디어 캔버스',
    shortName: 'Idea Canvas',
    description: '고객·문제·해결·가치·비용·수익을 한 흐름으로 정리합니다.',
    icon: '🧩',
    fields: [
      { id: 'oneLineDefinition', label: '아이디어 한 문장 정의', placeholder: '예: 바쁜 1인 가구 반려인을 위한 이웃 산책 매칭 서비스' },
      { id: 'targetCustomer', label: '타겟 고객', placeholder: '예: 주 5일 이상 야근하는 20~30대 1인 가구 반려견 양육자' },
      { id: 'problemOpportunity', label: '어떤 기회/니즈/문제를 해결하려는가?', placeholder: '예: 퇴근이 늦어 반려견 산책을 매일 챙기지 못하고, 죄책감과 함께 분리불안·건강 문제로 이어진다' },
      { id: 'solutionMechanism', label: '어떻게 해결하는가? (방식, 매커니즘 등)', placeholder: '예: 같은 동네 반려인끼리 산책 시간대를 매칭하고, 신원 인증과 상호 평가로 신뢰를 확보한다' },
      { id: 'customerValue', label: '이를 통해 고객이 얻는 가치/효율은 무엇인가?', placeholder: '예: 산책 공백일이 주 3일에서 0일로 줄고, 별도 비용 없이 이웃 관계까지 얻는다' },
      { id: 'requiredResources', label: '해당 아이디어를 구현하기 위해 어떤 비용/자원이 요구되는가?', placeholder: '예: 매칭 알고리즘 개발 인력, 신원 인증 솔루션 연동 비용, 초기 지역 커뮤니티 확보' },
      { id: 'revenueModel', label: '어떻게 수익을 창출할 것인가?', placeholder: '예: 기본 매칭은 무료, 보험 연계·프리미엄 매칭 구독으로 과금' },
    ],
    sections: [
      {
        id: 'oneLineDefinition',
        title: '아이디어 한 문장 정의',
        subtitle: '누구를 위해 무엇을 하는 아이디어인지 한 문장으로',
        textFieldId: 'oneLineDefinition',
        textPlaceholder: '예: 바쁜 1인 가구 반려인을 위한 이웃 산책 매칭 서비스',
      },
      {
        id: 'targetCustomer',
        title: '타겟 고객',
        subtitle: '이 아이디어가 가장 먼저 필요한 사람들',
        textFieldId: 'targetCustomer',
        textPlaceholder: '예: 주 5일 이상 야근하는 20~30대 1인 가구 반려견 양육자',
      },
      {
        id: 'problemOpportunity',
        title: '어떤 기회/니즈/문제를 해결하려는가?',
        subtitle: '고객이 겪는 불편, 충족되지 않은 니즈, 시장의 빈틈',
        textFieldId: 'problemOpportunity',
        textPlaceholder: '예: 퇴근이 늦어 반려견 산책을 매일 챙기지 못하고, 죄책감과 함께 분리불안·건강 문제로 이어진다',
      },
      {
        id: 'solutionMechanism',
        title: '어떻게 해결하는가? (방식, 매커니즘 등)',
        subtitle: '문제를 푸는 구체적인 방법과 작동 원리',
        textFieldId: 'solutionMechanism',
        textPlaceholder: '예: 같은 동네 반려인끼리 산책 시간대를 매칭하고, 신원 인증과 상호 평가로 신뢰를 확보한다',
      },
      {
        id: 'customerValue',
        title: '이를 통해 고객이 얻는 가치/효율은 무엇인가?',
        subtitle: '고객 입장에서 달라지는 결과 — 시간, 비용, 경험',
        textFieldId: 'customerValue',
        textPlaceholder: '예: 산책 공백일이 주 3일에서 0일로 줄고, 별도 비용 없이 이웃 관계까지 얻는다',
      },
      {
        id: 'requiredResources',
        title: '해당 아이디어를 구현하기 위해 어떤 비용/자원이 요구되는가?',
        subtitle: '필요한 인력, 기술, 데이터, 초기 투자 등',
        textFieldId: 'requiredResources',
        textPlaceholder: '예: 매칭 알고리즘 개발 인력, 신원 인증 솔루션 연동 비용, 초기 지역 커뮤니티 확보',
      },
      {
        id: 'revenueModel',
        title: '어떻게 수익을 창출할 것인가?',
        subtitle: '누구에게, 무엇으로, 어떤 방식으로 과금할지',
        textFieldId: 'revenueModel',
        textPlaceholder: '예: 기본 매칭은 무료, 보험 연계·프리미엄 매칭 구독으로 과금',
      },
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
