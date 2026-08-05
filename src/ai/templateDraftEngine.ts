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
    case 'lean-canvas':
      return {
        problem,
        solution,
        uniqueValueProp: `${summary} — 기존 대안과 달리 ${customer}의 핵심 문제를 직접 겨냥합니다.`,
        unfairAdvantage: `${evidence}에 기반한 초기 데이터와 도메인 이해`,
        customerSegments: customer,
        keyMetrics: `${customer}의 재방문율과 문제 해결 완료율`,
        channels: `${customer}이(가) 주로 머무는 채널을 통한 직접 유입`,
        costStructure: '초기 개발/운영 인건비와 채널 획득 비용',
        revenueStreams: `${solution} 이용에 대한 과금`,
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
    case 'swot':
      return {
        strengths: `${evidence}에서 확인된 내부 강점`,
        weaknesses: `${concerns}과(와) 관련해 아직 부족한 부분`,
        opportunities: `${customer} 시장의 성장 가능성`,
        threats: '유사한 문제를 다루는 기존 대안들의 빠른 추격',
      };
    case '3c':
      return {
        company: `${evidence}를 바탕으로 한 현재 역량과 자원`,
        customer: `${customer} — ${problem}`,
        competitor: '유사한 문제를 다루는 기존 대안들',
      };
    case 'stp':
      return {
        segmentation: `${customer}을(를) 중심으로 한 시장 세분화`,
        targeting: `${problem}을(를) 가장 크게 느끼는 세그먼트 우선 공략`,
        positioning: `${solution}을(를) 통해 ${customer}에게 다르게 인식되기`,
      };
    default:
      return {};
  }
}
