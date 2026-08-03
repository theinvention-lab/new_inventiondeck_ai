import { Link, useNavigate } from 'react-router-dom';
import { SiteHeader } from '../components/layout/SiteHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';

const FLOW_STEPS = [
  {
    step: '01',
    name: 'Generator',
    title: 'AI 기반 아이디어 생성',
    desc: '4,000여 장의 비즈니스 카드를 조합하고 관심 분야를 입력하면, AI가 서로 다른 사업 아이디어 초안을 3개 이상 제안합니다.',
  },
  {
    step: '02',
    name: 'Developer',
    title: '아이디어 검증 및 고도화',
    desc: 'AI 채팅과 5가지 점검 기준(문제 적합성·고객 정의·경쟁 환경·수익 구조·실행 가능성)으로 아이디어의 빈틈을 함께 메웁니다.',
  },
  {
    step: '03',
    name: 'Planner',
    title: '사업계획서 · IR Deck 구조화',
    desc: '검증된 내용을 바탕으로 문서형 사업계획서와 PPT형 IR Deck 초안을 생성하고, 디자인 템플릿을 적용해 바로 다운로드합니다.',
  },
];

const FEATURES = [
  { title: '4,000여 장의 아이데이션 카드', desc: '산업·고객·문제·비즈니스모델·수익모델·기술 6개 카테고리 카드를 조합해 새로운 아이디어의 재료를 찾습니다.' },
  { title: 'AI 채팅 기반 고도화', desc: 'AI가 답을 대신 확정하지 않고, 확인 질문·누락 정보·대안을 제시해 사용자가 직접 판단하도록 돕습니다.' },
  { title: '원스톱 문서 자동 생성', desc: '아이디어부터 사업계획서(PDF)·IR Deck(PPT)까지 한 흐름에서 완성합니다.' },
  { title: '프로젝트 관리 마이페이지', desc: '진행 중인 모든 프로젝트를 폴더·태그로 정리하고 진행률을 한눈에 확인합니다.' },
  { title: '명예의 전당', desc: '완성한 아이디어를 커뮤니티에 공유하고 다른 사용자와 영감을 주고받습니다.' },
  { title: '안전한 데이터 보호', desc: '모든 작업물은 기본 비공개이며, 본인 계정에서만 열람할 수 있습니다.' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const currentEmail = useAuthStore((s) => s.currentEmail);

  const startCta = () => navigate(currentEmail ? '/mypage' : '/signup');

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-hairline bg-gradient-to-b from-brand-soft/60 to-white px-5 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="brand" className="mb-5">
            AI 비즈니스 아이데이션 &amp; 사업계획서
          </Badge>
          <h1 className="text-[36px] font-bold leading-[1.25] tracking-tight text-ink-strong sm:text-[48px]">
            아이디어가 없어도,
            <br />
            사업계획서까지 <span className="text-brand">AI와 함께</span> 완성하세요
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-ink-muted">
            4,000여 장의 비즈니스 카드로 아이디어를 발상하고, AI 검증을 거쳐 투자용 IR Deck까지 —
            예비 창업가와 신사업 담당자를 위한 원스톱 기획 솔루션입니다.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" onClick={startCta}>
              무료로 아이디어 시작하기
            </Button>
            <Link to="/hall">
              <Button size="lg" variant="outline">
                명예의 전당 둘러보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section id="flow" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-[26px] font-bold text-ink-strong">3단계면 사업계획서 초안이 완성됩니다</h2>
          <p className="mt-2 text-[14px] text-ink-muted">Generator → Developer → Planner, 하나의 흐름으로 이어집니다.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {FLOW_STEPS.map((s) => (
            <Card key={s.step} hoverable className="flex flex-col gap-3">
              <span className="text-[13px] font-bold text-brand">{s.step}</span>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">{s.name}</p>
                <h3 className="mt-0.5 text-[17px] font-bold text-ink-strong">{s.title}</h3>
              </div>
              <p className="text-[13.5px] leading-relaxed text-ink-muted">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-hairline bg-canvas-sunken px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-[26px] font-bold text-ink-strong">핵심 기능</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="bg-white">
                <h3 className="text-[15px] font-bold text-ink-strong">{f.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-3xl bg-ink-strong px-8 py-14 text-center">
          <h2 className="text-[24px] font-bold text-white">지금 바로 첫 아이디어를 만들어보세요</h2>
          <p className="text-[14px] text-white/70">가입 없이도 카드 라이브러리를 둘러볼 수 있습니다.</p>
          <Button size="lg" onClick={startCta}>
            무료로 시작하기
          </Button>
        </div>
      </section>

      <footer className="border-t border-hairline px-5 py-8 text-center text-[12px] text-ink-faint">
        © {new Date().getFullYear()} 인벤션덱. All rights reserved.
      </footer>
    </div>
  );
}
