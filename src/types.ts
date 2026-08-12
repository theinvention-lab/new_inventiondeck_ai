// ---------------------------------------------------------------------------
// Domain types shared across the app
// ---------------------------------------------------------------------------

export type CardCategory =
  | 'theme'
  | 'tech'
  | 'revenue'
  | 'trend'
  | 'segment'
  | 'feature';

export interface BizCard {
  id: string;
  category: CardCategory;
  title: string;
  description: string;
  example: string;
  tags: string[];
  popularity: number; // 0-100, used for sorting
}

export interface IdeaSection {
  id: string;
  title: string;
  content: string;
}

export interface IdeaDraft {
  id: string;
  title: string;
  oneLiner: string;
  customer: string;
  problem: string;
  solution: string;
  valueProp: string;
  revenue: string;
  tags: string[];
  sections: IdeaSection[];
  createdAt: string;
}

export interface IdeaVersion {
  id: string;
  label: string;
  savedAt: string;
  snapshot: IdeaDraft;
}

export interface GeneratorState {
  selectedCardIds: string[];
  interest: string;
  problemFocus: string;
  ideas: IdeaDraft[];
  selectedIdeaId: string | null;
  versions: IdeaVersion[];
  cardHistory: string[]; // ids of cards ever selected, for recommendations
  lastGeneratedAt: string | null;
}

export type ChatRole = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  kind?: 'question' | 'gap' | 'alternative' | 'suggestion' | 'normal';
}

export type CriterionStatus = 'unmet' | 'partial' | 'met';

export interface CriterionEntry {
  id: string;
  name: string;
  description: string;
  evidence: string;
  judgement: string;
  unresolved: string;
  nextAction: string;
  status: CriterionStatus;
  weight: number;
  custom?: boolean;
}

export interface BuilderVersion {
  id: string;
  label: string;
  savedAt: string;
  savedBy: string;
  /** 저장 시점의 내용. 산출물 관리 페이지에서 버전별로 되돌아볼 때 쓴다. */
  snapshot?: BuilderSnapshot;
}

export interface BuilderSnapshot {
  summary: string;
  targetCustomer: string;
  userProblem: string;
  solution: string;
  templateValues: Partial<Record<BuilderTemplateId, Record<string, string>>>;
  criteria: CriterionEntry[];
}

export type BuilderTemplateId =
  | 'idea-definition'
  | 'idea-canvas'
  | 'solution-outline'
  | 'value-prop'
  | 'bmc'
  | 'bm-narratives';

// 시작 정보를 어떻게 채웠는지.
//  - manual:    처음부터 직접 작성 (Case 2)
//  - generator: 이 프로젝트의 Generator에서 만든 아이디어를 이어받음 (Case 1)
//  - saved:     내 프로젝트에 저장해둔 다른 아이디어를 가져옴 (Case 3)
export type StartInfoSource = 'manual' | 'generator' | 'saved';

export interface BuilderState {
  startInfoSource: StartInfoSource;
  sourceIdeaId: string | null;
  /** 'saved' 모드에서 아이디어를 가져온 다른 프로젝트의 id */
  sourceProjectId: string | null;
  summary: string;
  targetCustomer: string;
  userProblem: string;
  solution: string;
  evidence: string;
  assumptions: string;
  currentConcerns: string;
  criteria: CriterionEntry[];
  criteriaSuggestedAt: string | null;
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: string | null;
  versions: BuilderVersion[];
  activeTemplateId: BuilderTemplateId;
  templateValues: Partial<Record<BuilderTemplateId, Record<string, string>>>;
}

export interface PlanSection {
  id: string;
  title: string;
  content: string;
  order: number;
  aiDraft?: string;
}

export interface PitchSlide {
  id: string;
  title: string;
  bullets: string[];
  note: string;
  order: number;
  chart?: 'bar' | 'line' | 'none';
}

export type DesignTemplateId = 'naver-mint' | 'ink-mono' | 'sunrise' | 'slate-pro';

export interface PlannerVersion {
  id: string;
  kind: 'bizplan' | 'pitchdeck';
  label: string;
  savedAt: string;
  sections?: PlanSection[];
  slides?: PitchSlide[];
}

export interface PlannerState {
  bizPlanSections: PlanSection[];
  pitchSlides: PitchSlide[];
  designTemplateId: DesignTemplateId;
  bizPlanGenerated: boolean;
  pitchDeckGenerated: boolean;
  bizPlanProgress: number;
  pitchDeckProgress: number;
  lastExport: { type: 'pdf' | 'ppt'; at: string; filename: string } | null;
  versions: PlannerVersion[];
}

export type ProjectStage = 'generator' | 'builder' | 'planner' | 'completed';

export interface Project {
  id: string;
  ownerEmail: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  stage: ProjectStage;
  folderId: string | null;
  tags: string[];
  trashedAt: string | null;
  generator: GeneratorState;
  builder: BuilderState;
  planner: PlannerState;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  ownerEmail: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  email: string;
  name: string;
  passwordHash: string;
  provider: 'email' | 'google' | 'kakao';
  createdAt: string;
  verified: boolean;
  avatarDataUrl: string | null;
  interest: string;
  marketingConsent: boolean;
}
