import type { BuilderTemplateId } from '../types';

export interface BuilderStartInfo {
  summary: string;
  targetCustomer: string;
  userProblem: string;
  solution: string;
  evidence: string;
  assumptions: string;
  currentConcerns: string;
}

const FALLBACK = {
  summary: '아직 구체화되지 않은 아이디어',
  targetCustomer: '핵심 타겟 고객',
  userProblem: '고객이 반복적으로 겪는 문제',
  solution: '문제를 해결하는 핵심 방식',
  evidence: '초기 인터뷰/조사에서 확인한 근거',
  assumptions: '검증이 필요한 핵심 가정',
  currentConcerns: '아직 답을 찾지 못한 질문',
};

function v(value: string, fallback: string): string {
  return value.trim() ? value.trim() : fallback;
}

// Simulates an AI draft of the active 구체화 템플릿 by composing the 시작
// 정보 fields into template-appropriate sentences. No real model call — this
// mirrors the deterministic template-composition style used by ideaEngine.ts
// and chatEngine.ts elsewhere in this app.
export function generateTemplateDraft(templateId: BuilderTemplateId, start: BuilderStartInfo): Record<string, string> {
  const summary = v(start.summary, FALLBACK.summary);
  const customer = v(start.targetCustomer, FALLBACK.targetCustomer);
  const problem = v(start.userProblem, FALLBACK.userProblem);
  const solution = v(start.solution, FALLBACK.solution);
  const evidence = v(start.evidence, FALLBACK.evidence);
  const concerns = v(start.currentConcerns, FALLBACK.currentConcerns);

  switch (templateId) {
    case 'idea-definition': {
      const productDescription = solution;
      const coreValue = `${problem}을(를) 해결`;
      const competitorProduct = '기존의 대안들';
      const keyBenefit = `${evidence}에 기반한 더 나은 결과`;
      const analogousProduct = '익숙한 서비스';
      return {
        ycOneLiner: `우리는 ${customer}을(를) 위한 ${summary}입니다.`,
        targetCustomer: customer,
        productDescription,
        coreValue,
        competitorProduct,
        keyBenefit,
        analogousProduct,
        newContext: customer,
      };
    }
    case 'idea-canvas':
      return {
        oneLineDefinition: summary,
        targetCustomer: customer,
        problemOpportunity: problem,
        solutionMechanism: solution,
        customerValue: `${problem}이(가) 줄어들어 ${customer}이(가) 본래 하려던 일에 집중할 수 있습니다.`,
        requiredResources: '초기 개발/운영 인력과 채널 확보 비용',
        revenueModel: `${solution} 이용에 대한 과금`,
      };
    case 'solution-outline':
      return {
        solutionTagline: summary,
        keyFeatures: `${solution}을(를) 구성하는 핵심 기능`,
        customerValues: `${problem}이(가) 줄어들어 ${customer}이(가) 얻는 결과`,
        keyRequirements: `${solution} 실행에 필요한 기술·자원과 초기 사용자 확보`,
        hurdles: concerns,
      };
    case 'bm-narratives':
      return {
        customerNarrative: `${customer} — ${problem}`,
        problemNarrative: problem,
        solutionNarrative: solution,
        revenueNarrative: `${solution} 이용에 대한 과금`,
        growthNarrative: `${customer}에서 시작해 인접 세그먼트로 확장`,
        whyUsNarrative: `${evidence}에 기반한 초기 데이터와 도메인 이해`,
      };
    case 'bmc':
      return {
        keyPartners: `${solution} 실행에 필요한 외부 협력사`,
        keyActivities: `${problem} 해결을 위한 핵심 운영 활동`,
        keyResources: `${evidence}와 핵심 인력/기술 자산`,
        valuePropositions: summary,
        customerRelationships: `${customer}과(와)의 신뢰 기반 관계 구축`,
        channels: `${customer}에게 도달하는 온/오프라인 채널`,
        customerSegments: customer,
        costStructure: '초기 개발/운영 인건비와 채널 획득 비용',
        revenueStreams: `${solution} 이용에 대한 과금`,
      };
    case 'value-prop':
      return {
        customerJobs: `${customer}이(가) 완수하려는 일: ${problem}`,
        customerPains: `${problem} 과정에서 겪는 불편`,
        customerGains: `${solution}을(를) 통해 얻고 싶어하는 결과`,
        products: solution,
        painRelievers: `${solution}이(가) ${problem}을(를) 줄이는 방식`,
        gainCreators: `${solution}이(가) ${customer}에게 만들어내는 이점`,
      };
    default:
      return {};
  }
}
