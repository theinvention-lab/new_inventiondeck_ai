# 인벤션덱 (InventionDeck)

AI 기반 비즈니스 아이데이션 및 사업계획서 자동 작성 솔루션.

4,000여 장의 비즈니스 카드를 조합해 아이디어를 발상하고(Generator), AI 채팅과 점검 기준으로 아이디어를 검증·고도화하며(Developer), 사업계획서(PDF)와 IR Deck(PPT)을 생성·다운로드(Planner)하는 원스톱 웹앱입니다.

## 스택

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (NAVER 디자인 참고 토큰: 브랜드 그린 `#03C75A`, 화이트 캔버스, 4/8/12/16/20 스페이싱 리듬)
- 커스텀 폰트: `ChangwonDangamRounded`
- zustand (localStorage persist) — 별도 백엔드 없이 브라우저에 저장되는 데모 데이터 계층
- jsPDF / pptxgenjs — 사업계획서 PDF, IR Deck PPT 실제 다운로드 생성

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # oxlint
```

## 주요 흐름

1. **Generator** — 카드 라이브러리 탐색 → 조건 입력 → AI 아이디어 3안 생성 → 편집/버전관리 → 채택 → Developer로 전달
2. **Developer** — 시작 정보 입력/불러오기 → AI 채팅 고도화 → 5대 점검 기준(문제 적합성/고객 정의/경쟁 환경/수익 구조/실행 가능성) 관리 → 자동/수동 저장 → Planner로 전달
3. **Planner** — 사업계획서 목차·초안 생성 → IR Deck 슬라이드 생성 → 디자인 템플릿 적용 → 미리보기 → PDF/PPT 다운로드
4. **마이페이지** — 프로젝트 목록/폴더·태그 분류(드래그앤드롭)/검색/삭제(휴지통, 7일 보관)
5. **인증** — 이메일 회원가입/로그인, 소셜 로그인(Google/Kakao) UI, 비밀번호 재설정, 로그인 시도 제한
6. **명예의 전당** — 완성한 프로젝트를 커뮤니티에 공유하고 좋아요로 반응

> 이 빌드는 백엔드 없이 브라우저 localStorage에 모든 데이터(계정, 프로젝트)를 저장하는 프런트엔드 데모입니다. AI 응답은 카드/입력 데이터를 조합하는 결정적 생성 엔진으로 시뮬레이션됩니다.
