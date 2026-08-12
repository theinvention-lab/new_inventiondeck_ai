// 점검 기준 모듈 라이브러리.
//
// Builder의 점검 기준 탭은 이 모듈들 중에서 아이디어에 실제로 필요한 것만
// 골라 담는 방식으로 동작한다. 선별 로직은 ai/criteriaEngine.ts 참고.

export type CriterionModuleGroup = '기본' | '시장' | '수익' | '실행' | '리스크';

export interface CriterionModule {
  id: string;
  name: string;
  description: string;
  group: CriterionModuleGroup;
  /** 이 모듈을 불러올지 판단할 때 아이디어 내용에서 찾는 키워드 */
  keywords: string[];
  /** 아이디어 유형과 무관하게 항상 필요한 기본 모듈인지 */
  core?: boolean;
}

export const CRITERIA_LIBRARY: CriterionModule[] = [
  {
    id: 'problem-fit',
    name: '문제 적합성',
    description: '사용자가 실제로 겪는 문제인지, 얼마나 자주·심각하게 겪는지에 대한 근거',
    group: '기본',
    keywords: [],
    core: true,
  },
  {
    id: 'customer-definition',
    name: '고객 정의',
    description: '초기 타겟 고객이 구체적으로 누구인지, 왜 그들부터 시작해야 하는지',
    group: '기본',
    keywords: [],
    core: true,
  },
  {
    id: 'competition',
    name: '경쟁 환경',
    description: '유사 서비스·대안 대비 차별점과 대체 불가능한 이유',
    group: '시장',
    keywords: ['경쟁', '대안', '기존', '차별', '유사'],
    core: true,
  },
  {
    id: 'market-size',
    name: '시장 규모',
    description: '초기 진입 시장의 크기와, 확장 가능한 인접 시장의 범위',
    group: '시장',
    keywords: ['시장', '규모', '확장', '성장', '점유'],
  },
  {
    id: 'revenue-model',
    name: '수익 구조',
    description: '단가, 전환율, 원가 구조에 대한 가정과 근거',
    group: '수익',
    keywords: ['수익', '과금', '가격', '매출', '결제', '요금', '단가'],
  },
  {
    id: 'unit-economics',
    name: '단위 경제성',
    description: '고객 1명을 데려오는 비용(CAC)과 그 고객이 남기는 이익(LTV)의 균형',
    group: '수익',
    keywords: ['구독', '반복', 'cac', 'ltv', '광고', '마케팅비', '획득'],
  },
  {
    id: 'retention',
    name: '지속 사용·리텐션',
    description: '첫 사용 이후에도 고객이 계속 돌아올 이유와 이탈 방지 장치',
    group: '수익',
    keywords: ['구독', '멤버십', '반복', '재방문', '리텐션', '락인', '커뮤니티'],
  },
  {
    id: 'marketplace-liquidity',
    name: '양면 시장 유동성',
    description: '공급자와 수요자를 동시에 확보하는 순서와, 초기 밀도를 만드는 방법',
    group: '시장',
    keywords: ['매칭', '플랫폼', '중개', '연결', '양면', '공급자', '수요자', '마켓'],
  },
  {
    id: 'channel-strategy',
    name: '초기 고객 확보 채널',
    description: '첫 100명의 고객을 어디서, 어떤 방법으로 데려올지에 대한 구체적 계획',
    group: '실행',
    keywords: ['채널', '유입', '홍보', '마케팅', '확보', '모집'],
    core: true,
  },
  {
    id: 'feasibility',
    name: '실행 가능성',
    description: '초기 팀 역량, 필요 자원, 기술적 제약에 대한 점검',
    group: '실행',
    keywords: ['개발', '기술', '인력', '자원', '비용', '구현'],
    core: true,
  },
  {
    id: 'data-strategy',
    name: '데이터 확보 전략',
    description: '모델·추천의 품질을 좌우하는 데이터를 어떻게 확보하고 축적할지',
    group: '실행',
    keywords: ['ai', '인공지능', '데이터', '알고리즘', '추천', '학습', '분석', '모델'],
  },
  {
    id: 'supply-chain',
    name: '공급망·운영',
    description: '제조·재고·배송 등 물리적 운영 부담과 그 비용 구조',
    group: '실행',
    keywords: ['제조', '하드웨어', '배송', '재고', '물류', '생산', '기기'],
  },
  {
    id: 'sales-cycle',
    name: '영업 사이클',
    description: '기업 고객의 의사결정 구조와 계약까지 걸리는 시간·비용',
    group: '실행',
    keywords: ['b2b', '기업', '법인', '사업자', '도입', '계약', '조직'],
  },
  {
    id: 'regulation',
    name: '규제·법적 리스크',
    description: '인허가, 개인정보, 업권 규제 등 사업을 막을 수 있는 제도적 제약',
    group: '리스크',
    keywords: ['의료', '금융', '보험', '결제', '개인정보', '규제', '인증', '면허', '법', '아동', '식품'],
  },
  {
    id: 'trust-safety',
    name: '신뢰·안전 장치',
    description: '낯선 사용자 간 거래에서 발생할 수 있는 사고와 그 책임 소재',
    group: '리스크',
    keywords: ['매칭', '중개', '방문', '대면', '돌봄', '펫', '아이', '숙박', '동행', '신원'],
  },
  {
    id: 'key-assumption',
    name: '핵심 가정 검증',
    description: '틀리면 사업 자체가 흔들리는 가장 불확실한 가정과 그 검증 방법',
    group: '리스크',
    keywords: ['가정', '가설', '검증', '불확실'],
    core: true,
  },
];

export function getCriterionModule(id: string): CriterionModule | undefined {
  return CRITERIA_LIBRARY.find((m) => m.id === id);
}
