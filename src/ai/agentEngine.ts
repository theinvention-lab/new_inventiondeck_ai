import type { ChatMessage } from '../types';
import { makeId } from '../lib/id';

/** 채팅창에 드래그앤드롭으로 붙인 입력 칸의 내용 */
export interface AgentAttachment {
  id: string;
  label: string;
  value: string;
}

// 질문의 주제를 키워드로 판별해 답변 틀을 고른다. 실제 모델 호출은 없고,
// ideaEngine/chatEngine과 같은 결정적(deterministic) 시뮬레이션 방식이다.
const TOPICS: Array<{
  id: string;
  keywords: string[];
  answer: (q: string) => string[];
}> = [
  {
    id: 'customer',
    keywords: ['고객', '타겟', '유저', '사용자', '세그먼트', 'persona', '페르소나'],
    answer: () => [
      '고객을 좁힐 때는 "누가 이 문제로 가장 많이 손해를 보고 있는가"부터 봅니다.',
      '① 문제를 가장 자주 겪는 사람 ② 그 문제로 실제 비용(돈·시간)을 치르는 사람 ③ 지금 당장 대안을 찾아 헤매는 사람 — 이 세 조건을 모두 만족하는 집단이 첫 고객입니다.',
      '지금 정의하신 고객군을 "직업 + 상황 + 빈도" 형태로 다시 써보시면 훨씬 뾰족해집니다. 예: "주 4회 이상 야근하는 1인 가구 반려견 양육자".',
    ],
  },
  {
    id: 'problem',
    keywords: ['문제', '니즈', '불편', '페인', 'pain', '고통'],
    answer: () => [
      '문제가 진짜인지 확인하는 가장 빠른 방법은 "지금 그 사람이 이 문제를 어떻게 때우고 있는지"를 묻는 것입니다.',
      '이미 돈을 쓰거나, 엑셀·카톡 같은 수작업으로 버티고 있다면 검증된 문제입니다. 반대로 아무것도 안 하고 있다면 불편하긴 해도 지갑을 열 만큼은 아닐 가능성이 큽니다.',
      '인터뷰할 때는 "이런 서비스 있으면 쓰시겠어요?"가 아니라 "최근에 그 상황이 언제였고, 그때 어떻게 하셨나요?"로 물어보세요.',
    ],
  },
  {
    id: 'revenue',
    keywords: ['수익', '과금', '가격', '요금', '매출', 'bm', '비즈니스 모델', '결제', '단가'],
    answer: () => [
      '가격은 원가가 아니라 "고객이 이 문제로 이미 치르고 있는 비용"에서 역산하는 게 안전합니다.',
      '초기에는 무료 확산보다 소수에게 유료로 파는 쪽이 검증 속도가 빠릅니다. 돈을 내는 순간에만 진짜 수요가 드러나기 때문입니다.',
      '점검할 숫자는 세 가지입니다 — 고객 1명 데려오는 비용(CAC), 고객이 남기는 총이익(LTV), 그리고 회수 기간. LTV가 CAC의 3배 이상이면 일단 건강한 구조로 봅니다.',
    ],
  },
  {
    id: 'competition',
    keywords: ['경쟁', '차별', '대안', '경쟁사', '유사', '해자', '진입장벽'],
    answer: () => [
      '경쟁 분석에서 흔한 실수는 같은 업종 회사만 보는 것입니다. 실제 경쟁자는 "고객이 지금 그 문제를 해결하는 방식" 전부입니다 — 엑셀, 지인 부탁, 그냥 참기까지 포함해서요.',
      '차별점은 기능 목록이 아니라 "우리만 할 수 있고 남이 따라 하기 어려운 이유"여야 합니다. 데이터 축적, 공급자 네트워크, 전환 비용 같은 것들이죠.',
      '지금 차별점이 기능 하나로만 설명된다면, 경쟁사가 그 기능을 붙이는 순간 사라집니다. 구조적인 이유를 하나 더 찾아보세요.',
    ],
  },
  {
    id: 'validation',
    keywords: ['검증', 'mvp', '실험', '테스트', '가설', '파일럿', '프로토'],
    answer: () => [
      '검증은 "만들어서 확인"이 아니라 "가장 위험한 가정 하나를 가장 싸게 확인"하는 순서로 갑니다.',
      '지금 세운 가정 중에서 "이게 틀리면 사업 전체가 무너진다" 싶은 것 하나를 고르고, 그것만 확인할 수 있는 최소한의 실험을 설계하세요.',
      '랜딩페이지 + 사전신청, 수작업으로 10명만 직접 서비스해보기(컨시어지 MVP)가 가장 빠른 두 가지 방법입니다. 코드 없이 2주 안에 답이 나옵니다.',
    ],
  },
  {
    id: 'growth',
    keywords: ['성장', '마케팅', '확보', '유입', '채널', '홍보', '확산', '초기 고객'],
    answer: () => [
      '초기 고객 확보는 확장 가능한 채널이 아니라 "지금 당장 손이 닿는 곳"부터 시작하는 게 맞습니다.',
      '첫 100명은 광고가 아니라 직접 찾아가서 데려오는 게 정석입니다. 그 과정에서 얻는 대화가 제품보다 더 큰 자산이 됩니다.',
      '채널을 고를 때는 "우리 고객이 이 문제로 고민할 때 어디를 검색하고, 어디에 모여 있는가"를 먼저 답해보세요. 그 답이 곧 첫 채널입니다.',
    ],
  },
  {
    id: 'team',
    keywords: ['팀', '창업자', '공동창업', '채용', '인력', '조직'],
    answer: () => [
      '초기 팀에서 중요한 건 스펙보다 "이 문제를 왜 우리가 풀어야 하는지"에 대한 공통된 답입니다.',
      '지금 단계에서 꼭 필요한 역량은 보통 두 가지입니다 — 만들 수 있는 사람, 그리고 고객을 직접 만나 팔 수 있는 사람.',
      '외주나 채용을 고민 중이시라면, 검증 전 단계에서는 고정비를 늘리지 않는 쪽을 권합니다.',
    ],
  },
  {
    id: 'funding',
    keywords: ['투자', '펀딩', 'ir', '벤처', '지원사업', '데모데이', '밸류'],
    answer: () => [
      '초기 투자는 숫자보다 "왜 지금, 왜 이 팀인가"에 대한 설득이 핵심입니다.',
      '자료에는 세 가지가 반드시 들어가야 합니다 — 문제가 실재한다는 증거, 우리 해결책이 작동한다는 초기 신호, 그리고 이 시장이 커지고 있다는 근거.',
      'Planner 단계에서 사업계획서와 IR Deck을 만들 수 있으니, 지금은 Builder에서 점검 기준의 근거부터 채워두시면 그대로 이어집니다.',
    ],
  },
];

const FALLBACK = [
  '질문 주신 내용을 사업 관점에서 정리하면 이렇게 접근해볼 수 있습니다.',
  '먼저 "이 결정이 틀렸을 때 무엇을 잃는가"를 기준으로 우선순위를 정하고, 되돌리기 쉬운 결정은 빠르게, 되돌리기 어려운 결정은 근거를 모은 뒤에 내리는 것이 좋습니다.',
  '조금 더 구체적으로 답을 드리려면 어떤 상황인지 알려주시거나, 작성 중인 칸을 이 채팅창으로 끌어다 놓아주세요. 그 내용을 기준으로 봐드릴게요.',
];

export function agentGreeting(): ChatMessage {
  return {
    id: makeId('msg'),
    role: 'ai',
    content:
      '안녕하세요, 비즈니스 에이전트입니다. 고객 정의, 문제 검증, 수익 구조, 경쟁 환경, 초기 고객 확보 등 사업에 대해 궁금한 점을 물어봐주세요. 작성 중인 입력 칸을 이 채팅창으로 끌어다 놓으면 그 내용을 함께 보고 답변드립니다.',
    createdAt: new Date().toISOString(),
    kind: 'normal',
  };
}

function pickTopic(question: string) {
  const q = question.toLowerCase();
  return TOPICS.find((t) => t.keywords.some((k) => q.includes(k)));
}

export function generateAgentReply(question: string, attachments: AgentAttachment[]): ChatMessage {
  const topic = pickTopic(question);
  const body = topic ? topic.answer(question) : FALLBACK;
  const parts: string[] = [];

  if (attachments.length > 0) {
    const names = attachments.map((a) => `"${a.label}"`).join(', ');
    parts.push(`${names} 내용을 함께 보고 답변드립니다.`);
  }
  parts.push(...body);

  if (attachments.length > 0) {
    const first = attachments[0];
    const excerpt = first.value.trim().slice(0, 60);
    if (excerpt) {
      parts.push(`특히 ${first.label}에 적으신 "${excerpt}${first.value.trim().length > 60 ? '…' : ''}" 부분은 위 기준으로 한 번 더 다듬어볼 여지가 있습니다.`);
    }
  }

  return {
    id: makeId('msg'),
    role: 'ai',
    content: parts.join(' '),
    createdAt: new Date().toISOString(),
    kind: topic ? 'suggestion' : 'normal',
  };
}
