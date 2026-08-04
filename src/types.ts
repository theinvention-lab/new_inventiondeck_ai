// ---------------------------------------------------------------------------
// Domain types shared across the app
// ---------------------------------------------------------------------------

export type CardCategory =
  | 'industry'
  | 'customer'
  | 'problem'
  | 'businessModel'
  | 'revenue'
  | 'technology';

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

export interface CriterionAttachment {
  id: string;
  name: string;
  dataUrl: string;
  isImage: boolean;
}

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
  attachments: CriterionAttachment[];
}

export interface BuilderVersion {
  id: string;
  label: string;
  savedAt: string;
  savedBy: string;
}

export type BuilderTemplateId = 'lean-canvas' | 'bmc' | 'value-prop' | 'swot' | '3c' | 'stp';

export interface BuilderState {
  summary: string;
  targetCustomer: string;
  userProblem: string;
  solution: string;
  evidence: string;
  assumptions: string;
  currentConcerns: string;
  chatMessages: ChatMessage[];
  criteria: CriterionEntry[];
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

export interface PlannerState {
  bizPlanSections: PlanSection[];
  designTemplateId: DesignTemplateId;
  bizPlanGenerated: boolean;
  bizPlanProgress: number;
  lastExport: { type: 'pdf'; at: string; filename: string } | null;
}

export interface DeckState {
  pitchSlides: PitchSlide[];
  designTemplateId: DesignTemplateId;
  pitchDeckGenerated: boolean;
  pitchDeckProgress: number;
  lastExport: { type: 'ppt'; at: string; filename: string } | null;
}

export type ProjectStage = 'generator' | 'builder' | 'planner' | 'deck' | 'completed';

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
  deck: DeckState;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface User {
  email: string;
  name: string;
  passwordHash: string;
  provider: 'email' | 'google' | 'kakao';
  createdAt: string;
  verified: boolean;
}
