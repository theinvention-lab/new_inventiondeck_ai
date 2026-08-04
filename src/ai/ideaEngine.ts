import type { BizCard, CardCategory, IdeaDraft, IdeaSection } from '../types';
import { makeId } from '../lib/id';

function pick<T>(arr: T[], seed: number): T | undefined {
  if (arr.length === 0) return undefined;
  const idx = Math.floor(seededRandom(seed) * arr.length);
  return arr[idx];
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function byCategory(cards: BizCard[], category: CardCategory): BizCard[] {
  return cards.filter((c) => c.category === category);
}

const GENERIC_CUSTOMER = ['바쁜 현대인', '소규모 조직 운영자', '변화에 민감한 얼리어답터'];
const GENERIC_PROBLEM = ['선택에 드는 시간과 비용', '신뢰할 수 있는 정보 부족', '반복되는 수작업 부담'];
const GENERIC_MODEL = ['구독형 서비스', '중개 플랫폼', '온디맨드 서비스'];

const OPENERS = ['한 줄로 말하면,', '핵심은 이렇습니다.', '이 조합의 승부처는,', '가장 먼저 검증할 지점은,'];
const VALUE_PHRASES = [
  '의사결정에 걸리는 시간을 절반으로 줄여줍니다',
  '전문가 없이도 같은 품질의 결과를 얻게 해줍니다',
  '흩어진 정보를 한 곳에서 비교·실행하게 해줍니다',
  '반복 작업을 자동화해 본업에 집중하게 해줍니다',
  '처음 접하는 사람도 3분 안에 시작하게 해줍니다',
];

function titleCase(a?: string, b?: string): string {
  const parts = [a, b].filter(Boolean);
  if (parts.length === 0) return '새로운 비즈니스 아이디어';
  return parts.join(' × ');
}

export interface IdeaGenerationInput {
  selectedCards: BizCard[];
  interest: string;
  problemFocus: string;
  count?: number;
  seedOffset?: number;
}

export function generateIdeas(input: IdeaGenerationInput): IdeaDraft[] {
  const { selectedCards, interest, problemFocus } = input;
  const count = input.count ?? 3;
  const seedOffset = input.seedOffset ?? 0;

  const industries = byCategory(selectedCards, 'industry');
  const customers = byCategory(selectedCards, 'customer');
  const problems = byCategory(selectedCards, 'problem');
  const models = byCategory(selectedCards, 'businessModel');
  const revenues = byCategory(selectedCards, 'revenue');
  const techs = byCategory(selectedCards, 'technology');

  const ideas: IdeaDraft[] = [];

  for (let i = 0; i < count; i += 1) {
    const seed = (i + 1) * 53 + seedOffset * 191 + selectedCards.length * 11;

    const industryCard = pick(industries, seed + 1);
    const customerCard = pick(customers, seed + 2);
    const problemCard = pick(problems, seed + 3);
    const modelCard = pick(models, seed + 4);
    const revenueCard = pick(revenues, seed + 5);
    const techCard = pick(techs, seed + 6);

    const customerLabel = customerCard?.title ?? (interest ? `${interest}에 관심 있는 사용자` : pick(GENERIC_CUSTOMER, seed + 7)!);
    const problemLabel = problemCard?.title ?? (problemFocus || pick(GENERIC_PROBLEM, seed + 8)!);
    const modelLabel = modelCard?.title ?? pick(GENERIC_MODEL, seed + 9)!;
    const industryLabel = industryCard?.title ?? (interest || '신규 영역');
    const revenueLabel = revenueCard?.title ?? '월 구독료';
    const techLabel = techCard?.title;

    const opener = pick(OPENERS, seed + 10)!;
    const valuePhrase = pick(VALUE_PHRASES, seed + 11)!;

    const title = titleCase(industryCard?.title.split(' ').slice(-1)[0] ?? industryLabel, customerCard?.title.split(' ').slice(-1)[0]);

    const oneLiner = `${customerLabel}을(를) 위한 ${modelLabel} — ${problemLabel} 문제를 해결합니다.`;

    const solutionText = techLabel
      ? `${techLabel} 기술을 결합한 ${modelLabel} 구조로 ${problemLabel}을(를) 완화합니다. ${opener} ${valuePhrase}.`
      : `${modelLabel} 구조로 ${problemLabel}을(를) 완화합니다. ${opener} ${valuePhrase}.`;

    const sections: IdeaSection[] = [
      { id: makeId('sec'), title: '타겟 고객', content: `${customerLabel}. ${interest ? `특히 '${interest}' 영역에서 반복적으로 이 문제를 겪는 사람들을 우선 타겟으로 합니다.` : '초기에는 좁고 뾰족한 세그먼트부터 검증하는 것을 권장합니다.'}` },
      { id: makeId('sec'), title: '사용자 문제', content: `${problemLabel}. ${problemFocus ? `사용자가 직접 언급한 문제: "${problemFocus}"` : '문제의 발생 빈도와 지불 의사를 다음 단계(Builder)에서 검증해야 합니다.'}` },
      { id: makeId('sec'), title: '해결 방안', content: solutionText },
      { id: makeId('sec'), title: '핵심 가치', content: `${valuePhrase}. 경쟁 대비 좁은 영역에 집중해 초기 신뢰를 확보하는 전략을 제안합니다.` },
      { id: makeId('sec'), title: '수익 방식', content: `${revenueLabel} 기반. 초기에는 소규모 유료 베타로 지불 의사를 확인한 뒤 가격을 조정하는 것을 권장합니다.` },
    ];

    ideas.push({
      id: makeId('idea'),
      title,
      oneLiner,
      customer: customerLabel,
      problem: problemLabel,
      solution: solutionText,
      valueProp: valuePhrase,
      revenue: revenueLabel,
      tags: [industryLabel, modelLabel].filter(Boolean),
      sections,
      createdAt: new Date().toISOString(),
    });
  }

  return ideas;
}
