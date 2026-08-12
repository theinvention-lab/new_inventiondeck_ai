import type { BuilderState, CriterionEntry } from '../types';
import { CRITERIA_LIBRARY, type CriterionModule } from '../data/criteriaLibrary';
import { makeId } from '../lib/id';

export interface CriterionSuggestion {
  module: CriterionModule;
  /** 왜 이 기준이 필요한지 — 사용자가 담을지 판단할 근거 */
  reason: string;
}

// 시작 정보와 구체화 템플릿에 적은 내용을 하나의 텍스트로 합친다. 선별은
// 이 텍스트에 대한 키워드 매칭으로 이뤄진다 — 실제 모델 호출은 없고,
// ideaEngine/chatEngine과 같은 결정적(deterministic) 시뮬레이션 방식이다.
function collectContext(builder: BuilderState): string {
  const templateText = Object.values(builder.templateValues)
    .flatMap((values) => Object.values(values ?? {}))
    .join(' ');
  return [
    builder.summary,
    builder.targetCustomer,
    builder.userProblem,
    builder.solution,
    builder.evidence,
    builder.assumptions,
    builder.currentConcerns,
    templateText,
  ]
    .join(' ')
    .toLowerCase();
}

function matchedKeywords(module: CriterionModule, context: string): string[] {
  return module.keywords.filter((k) => context.includes(k.toLowerCase()));
}

function buildReason(module: CriterionModule, hits: string[], builder: BuilderState): string {
  if (hits.length > 0) {
    return `작성하신 내용에서 "${hits.slice(0, 2).join('", "')}" 관련 언급이 있어 함께 점검이 필요합니다.`;
  }
  if (module.id === 'key-assumption' && builder.assumptions.trim()) {
    return '핵심 가정에 적어주신 내용이 아직 검증되지 않아 우선 확인이 필요합니다.';
  }
  if (module.id === 'problem-fit' && !builder.evidence.trim()) {
    return '보유 근거가 비어 있어, 문제가 실재하는지부터 확인하는 것이 좋겠습니다.';
  }
  return '아이디어 형태와 무관하게 반드시 짚고 넘어가야 하는 기본 항목입니다.';
}

/**
 * 아이디어 내용을 바탕으로 담을 만한 점검 기준을 골라준다.
 * 이미 담겨 있는 기준(existingNames)은 후보에서 제외한다.
 */
export function suggestCriteria(builder: BuilderState): CriterionSuggestion[] {
  const context = collectContext(builder);
  const taken = new Set(builder.criteria.map((c) => c.name));

  const scored = CRITERIA_LIBRARY.filter((m) => !taken.has(m.name)).map((module) => {
    const hits = matchedKeywords(module, context);
    // 기본 모듈은 키워드가 없어도 담고, 나머지는 언급이 있을 때만 담는다.
    const score = (module.core ? 10 : 0) + hits.length * 3;
    return { module, hits, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ module, hits }) => ({ module, reason: buildReason(module, hits, builder) }));
}

export function criterionFromModule(module: CriterionModule): CriterionEntry {
  return {
    id: makeId('crit'),
    name: module.name,
    description: module.description,
    evidence: '',
    judgement: '',
    unresolved: '',
    nextAction: '',
    status: 'unmet',
    weight: 1,
    attachments: [],
  };
}
