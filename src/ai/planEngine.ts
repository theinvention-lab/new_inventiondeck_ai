import type { BuilderState, GeneratorState, PitchSlide, PlanSection } from '../types';
import { makeId } from '../lib/id';

export interface PlanContext {
  generator: GeneratorState;
  builder: BuilderState;
  title: string;
}

function selectedIdeaSummary(ctx: PlanContext) {
  const idea = ctx.generator.ideas.find((i) => i.id === ctx.generator.selectedIdeaId) ?? ctx.generator.ideas[0];
  return idea;
}

function fallback(value: string, alt: string): string {
  return value && value.trim().length > 0 ? value : alt;
}

export function buildDefaultBizPlanSections(ctx: PlanContext): PlanSection[] {
  const idea = selectedIdeaSummary(ctx);
  const d = ctx.builder;

  const customer = fallback(d.targetCustomer, idea?.customer ?? '핵심 타겟 고객');
  const problem = fallback(d.userProblem, idea?.problem ?? '고객이 겪는 핵심 문제');
  const solution = fallback(d.solution, idea?.solution ?? '제공하는 해결 방안');
  const evidence = fallback(d.evidence, '아직 정리되지 않았습니다. Builder 단계에서 근거를 보강해주세요.');

  const metCriteria = d.criteria.filter((c) => c.status === 'met').map((c) => c.name);
  const unresolvedCriteria = d.criteria.filter((c) => c.status !== 'met').map((c) => c.name);

  const templates: Array<Omit<PlanSection, 'id' | 'order'>> = [
    {
      title: '경영진 요약 (Executive Summary)',
      content: `${ctx.title}는 ${customer}을(를) 대상으로 ${problem} 문제를 해결하는 사업입니다. 핵심 해결 방안은 "${solution}"이며, 초기 검증 단계에서 ${metCriteria.length > 0 ? `${metCriteria.join(', ')} 기준을 충족했습니다.` : '핵심 가정에 대한 검증이 진행 중입니다.'}`,
    },
    {
      title: '문제와 해결 방안',
      content: `[문제] ${problem}\n[근거] ${evidence}\n[해결 방안] ${solution}`,
    },
    {
      title: '고객 및 시장 분석',
      content: `초기 타겟 고객: ${customer}. 이 세그먼트는 문제를 반복적으로 경험하며, 지불 의사를 확인할 수 있는 그룹부터 우선 공략합니다. 시장 규모와 성장성에 대한 구체적 수치는 추가 리서치가 필요합니다.`,
    },
    {
      title: '비즈니스 모델 및 수익 구조',
      content: `${idea?.revenue ?? '수익 모델'}을 기반으로 하며, 초기에는 소규모 유료 베타로 지불 의사를 검증합니다. 단가와 전환율 가정은 Builder 단계의 '수익 구조' 점검 기준을 참고했습니다.`,
    },
    {
      title: '실행 계획 및 로드맵',
      content: `1단계: 핵심 가설 검증 (${unresolvedCriteria.length > 0 ? unresolvedCriteria.join(', ') + ' 중심' : '남은 검증 없음'})\n2단계: MVP 출시 및 초기 고객 확보\n3단계: 지표 기반 반복 개선 및 확장`,
    },
    {
      title: '팀 소개',
      content: `창업/기획팀 구성과 각자의 역할, 이 사업을 실행할 수 있는 근거(경험, 네트워크, 전문성)를 정리해주세요.`,
    },
    {
      title: '재무 계획',
      content: `초기 투자 필요 금액, 손익분기 시점, 12개월 매출 목표에 대한 추정치를 작성해주세요. 수익 구조 섹션의 가정과 일관되게 유지합니다.`,
    },
    {
      title: '리스크 및 대응 전략',
      content: `핵심 리스크: ${unresolvedCriteria.length > 0 ? unresolvedCriteria.join(', ') : '현재 식별된 미해결 리스크 없음'}. 각 리스크에 대한 대응 방안을 Builder 점검 기준의 '다음 행동' 항목을 참고해 구체화하세요.`,
    },
  ];

  return templates.map((t, idx) => ({
    id: makeId('plansec'),
    order: idx,
    aiDraft: t.content,
    ...t,
  }));
}

export function buildDefaultPitchSlides(ctx: PlanContext): PitchSlide[] {
  const idea = selectedIdeaSummary(ctx);
  const d = ctx.builder;
  const customer = fallback(d.targetCustomer, idea?.customer ?? '핵심 타겟 고객');
  const problem = fallback(d.userProblem, idea?.problem ?? '고객이 겪는 핵심 문제');
  const solution = fallback(d.solution, idea?.solution ?? '제공하는 해결 방안');

  const templates: Array<Omit<PitchSlide, 'id' | 'order'>> = [
    { title: ctx.title || '표지', bullets: [customer, '투자 유치용 IR Deck'], note: '팀명, 발표자, 날짜를 함께 표기하세요.', chart: 'none' },
    { title: '문제', bullets: [problem, fallback(d.evidence, '근거 자료를 보강해주세요')], note: '숫자로 문제의 크기를 보여주면 설득력이 높아집니다.', chart: 'none' },
    { title: '솔루션', bullets: [solution, idea?.valueProp ?? '핵심 가치 제안'], note: '데모 스크린샷이나 사용 흐름을 추가하세요.', chart: 'none' },
    { title: '시장 기회', bullets: ['TAM / SAM / SOM 추정치', '시장 성장률 및 트렌드'], note: '리서치 출처를 명시하세요.', chart: 'bar' },
    { title: '비즈니스 모델', bullets: [idea?.revenue ?? '수익 모델', '단가 및 전환율 가정'], note: '', chart: 'none' },
    { title: '경쟁 우위', bullets: ['핵심 차별점', '대체 불가능한 이유'], note: 'Builder 단계의 경쟁 환경 근거를 활용하세요.', chart: 'none' },
    { title: '실행 로드맵', bullets: ['0-3개월: MVP 검증', '3-6개월: 초기 고객 확보', '6-12개월: 확장'], note: '', chart: 'line' },
    { title: '팀', bullets: ['창업팀 구성', '핵심 역량'], note: '', chart: 'none' },
    { title: '재무 하이라이트', bullets: ['12개월 매출 목표', '손익분기 시점'], note: '', chart: 'bar' },
    { title: 'Ask (투자 요청)', bullets: ['필요 투자 금액', '자금 사용 계획'], note: '명확한 숫자와 사용처를 제시하세요.', chart: 'none' },
  ];

  return templates.map((t, idx) => ({ id: makeId('slide'), order: idx, ...t }));
}
