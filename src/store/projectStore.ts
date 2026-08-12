import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  BuilderState,
  CriterionEntry,
  Folder,
  GeneratorState,
  PlannerState,
  Project,
} from '../types';
import { makeId } from '../lib/id';

export const TRASH_RETENTION_DAYS = 7;

function defaultGenerator(): GeneratorState {
  return {
    selectedCardIds: [],
    interest: '',
    problemFocus: '',
    ideas: [],
    selectedIdeaId: null,
    versions: [],
    cardHistory: [],
    lastGeneratedAt: null,
  };
}

function defaultBuilder(): BuilderState {
  return {
    startInfoSource: 'manual',
    sourceIdeaId: null,
    sourceProjectId: null,
    summary: '',
    targetCustomer: '',
    userProblem: '',
    solution: '',
    evidence: '',
    assumptions: '',
    currentConcerns: '',
    // 점검 기준은 처음부터 채워두지 않는다 — ①/② 탭에 쓴 내용을 바탕으로
    // AI가 기준 모듈에서 필요한 것만 골라 담는 흐름이다.
    criteria: [],
    criteriaSuggestedAt: null,
    autosaveStatus: 'idle',
    lastSavedAt: null,
    versions: [],
    activeTemplateId: 'idea-definition',
    templateValues: {},
  };
}

function defaultPlanner(): PlannerState {
  return {
    bizPlanSections: [],
    pitchSlides: [],
    designTemplateId: 'naver-mint',
    bizPlanGenerated: false,
    pitchDeckGenerated: false,
    bizPlanProgress: 0,
    pitchDeckProgress: 0,
    lastExport: null,
    versions: [],
  };
}

export function createEmptyProject(ownerEmail: string, title: string): Project {
  const now = new Date().toISOString();
  return {
    id: makeId('proj'),
    ownerEmail,
    title: title || '이름 없는 프로젝트',
    description: '',
    createdAt: now,
    updatedAt: now,
    stage: 'generator',
    folderId: null,
    tags: [],
    trashedAt: null,
    generator: defaultGenerator(),
    builder: defaultBuilder(),
    planner: defaultPlanner(),
  };
}

interface ProjectStoreState {
  projects: Project[];
  folders: Folder[];

  createProject: (ownerEmail: string, title?: string) => Project;
  getProject: (id: string) => Project | undefined;
  updateProject: (id: string, patch: Partial<Project>) => void;
  updateGenerator: (id: string, patch: Partial<GeneratorState>) => void;
  updateBuilder: (id: string, patch: Partial<BuilderState>) => void;
  updatePlanner: (id: string, patch: Partial<PlannerState>) => void;

  softDeleteProject: (id: string) => void;
  restoreProject: (id: string) => void;
  permanentlyDeleteProject: (id: string) => void;
  purgeExpiredTrash: () => void;

  listActiveForUser: (email: string) => Project[];
  listTrashForUser: (email: string) => Project[];

  createFolder: (name: string, color: string) => Folder;
  deleteFolder: (id: string) => void;
  assignFolder: (projectId: string, folderId: string | null) => void;

  addTag: (projectId: string, tag: string) => void;
  removeTag: (projectId: string, tag: string) => void;
}

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set, get) => ({
      projects: [],
      folders: [],

      createProject: (ownerEmail, title = '') => {
        const project = createEmptyProject(ownerEmail, title);
        set((s) => ({ projects: [project, ...s.projects] }));
        return project;
      },

      getProject: (id) => get().projects.find((p) => p.id === id),

      updateProject: (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)),
        }));
      },

      updateGenerator: (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, generator: { ...p.generator, ...patch }, updatedAt: new Date().toISOString() } : p,
          ),
        }));
      },

      updateBuilder: (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, builder: { ...p.builder, ...patch }, updatedAt: new Date().toISOString() } : p,
          ),
        }));
      },

      updatePlanner: (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, planner: { ...p.planner, ...patch }, updatedAt: new Date().toISOString() } : p,
          ),
        }));
      },

      softDeleteProject: (id) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, trashedAt: new Date().toISOString() } : p)),
        }));
      },

      restoreProject: (id) => {
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, trashedAt: null } : p)) }));
      },

      permanentlyDeleteProject: (id) => {
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
      },

      purgeExpiredTrash: () => {
        const cutoff = Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
        set((s) => ({
          projects: s.projects.filter((p) => !(p.trashedAt && new Date(p.trashedAt).getTime() < cutoff)),
        }));
      },

      listActiveForUser: (email) => get().projects.filter((p) => p.ownerEmail === email && !p.trashedAt),
      listTrashForUser: (email) => get().projects.filter((p) => p.ownerEmail === email && p.trashedAt),

      createFolder: (name, color) => {
        const folder: Folder = { id: makeId('folder'), name, color, createdAt: new Date().toISOString() };
        set((s) => ({ folders: [...s.folders, folder] }));
        return folder;
      },

      deleteFolder: (id) => {
        set((s) => ({
          folders: s.folders.filter((f) => f.id !== id),
          projects: s.projects.map((p) => (p.folderId === id ? { ...p, folderId: null } : p)),
        }));
      },

      assignFolder: (projectId, folderId) => {
        set((s) => ({ projects: s.projects.map((p) => (p.id === projectId ? { ...p, folderId } : p)) }));
      },

      addTag: (projectId, tag) => {
        const t = tag.trim();
        if (!t) return;
        set((s) => ({
          projects: s.projects.map((p) => (p.id === projectId && !p.tags.includes(t) ? { ...p, tags: [...p.tags, t] } : p)),
        }));
      },

      removeTag: (projectId, tag) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === projectId ? { ...p, tags: p.tags.filter((t) => t !== tag) } : p)),
        }));
      },
    }),
    {
      name: 'inventiondeck:projects',
      storage: createJSONStorage(() => localStorage),
      version: 6,
      migrate: (persisted, fromVersion) => {
        const state = persisted as { projects?: Array<Record<string, unknown>> } | undefined;
        if (state?.projects) {
          state.projects = state.projects.map((p) => {
            let next = p;

            // v1 → v2: split single Developer stage into Builder, and single
            // Planner (biz plan + pitch deck) into separate Planner/Deck stages.
            if (fromVersion < 2) {
              const oldPlanner = (next.planner as Record<string, unknown>) ?? {};
              const builder = next.builder ?? next.developer ?? defaultBuilder();
              const planner = {
                bizPlanSections: (oldPlanner.bizPlanSections as PlannerState['bizPlanSections']) ?? [],
                designTemplateId: (oldPlanner.designTemplateId as PlannerState['designTemplateId']) ?? 'naver-mint',
                bizPlanGenerated: (oldPlanner.bizPlanGenerated as boolean) ?? false,
                bizPlanProgress: (oldPlanner.bizPlanProgress as number) ?? 0,
                lastExport:
                  (oldPlanner.lastExport as PlannerState['lastExport'] | undefined)?.type === 'pdf'
                    ? (oldPlanner.lastExport as PlannerState['lastExport'])
                    : null,
              };
              const deck = (next.deck as Record<string, unknown>) ?? {
                pitchSlides: (oldPlanner.pitchSlides as PlannerState['pitchSlides']) ?? [],
                designTemplateId: (oldPlanner.designTemplateId as PlannerState['designTemplateId']) ?? 'naver-mint',
                pitchDeckGenerated: (oldPlanner.pitchDeckGenerated as boolean) ?? false,
                pitchDeckProgress: (oldPlanner.pitchDeckProgress as number) ?? 0,
                lastExport:
                  (oldPlanner.lastExport as PlannerState['lastExport'] | undefined)?.type === 'ppt'
                    ? (oldPlanner.lastExport as PlannerState['lastExport'])
                    : null,
              };
              const stage = next.stage === 'developer' ? 'builder' : next.stage;
              next = { ...next, builder, planner, deck, stage };
            }

            // v2 → v3: Builder gains the 6-template worksheet.
            if (fromVersion < 3) {
              const builder = (next.builder as Record<string, unknown>) ?? defaultBuilder();
              next = {
                ...next,
                builder: {
                  ...builder,
                  activeTemplateId: builder.activeTemplateId ?? 'idea-definition',
                  templateValues: builder.templateValues ?? {},
                },
              };
            }

            // v3 → v4: merge the standalone Deck stage back into Planner —
            // one Planner stage now produces both the business plan
            // document and the pitch deck.
            if (fromVersion < 4) {
              const oldPlanner = (next.planner as Record<string, unknown>) ?? {};
              const oldDeck = (next.deck as Record<string, unknown>) ?? {};
              const planner: PlannerState = {
                bizPlanSections: (oldPlanner.bizPlanSections as PlannerState['bizPlanSections']) ?? [],
                pitchSlides: (oldDeck.pitchSlides as PlannerState['pitchSlides']) ?? [],
                designTemplateId:
                  (oldPlanner.designTemplateId as PlannerState['designTemplateId']) ??
                  (oldDeck.designTemplateId as PlannerState['designTemplateId']) ??
                  'naver-mint',
                bizPlanGenerated: (oldPlanner.bizPlanGenerated as boolean) ?? false,
                pitchDeckGenerated: (oldDeck.pitchDeckGenerated as boolean) ?? false,
                bizPlanProgress: (oldPlanner.bizPlanProgress as number) ?? 0,
                pitchDeckProgress: (oldDeck.pitchDeckProgress as number) ?? 0,
                lastExport:
                  (oldPlanner.lastExport as PlannerState['lastExport']) ??
                  (oldDeck.lastExport as PlannerState['lastExport']) ??
                  null,
                versions: [],
              };
              const stage = next.stage === 'deck' ? 'planner' : next.stage;
              const rest = { ...next };
              delete rest.deck;
              next = { ...rest, planner, stage };
            }

            // v4 → v5: Builder 시작 정보가 직접 작성인지 Generator에서
            // 가져온 것인지 구분하고, 점검 기준은 AI 추천으로 담는 방식이
            // 되면서 추천 시각을 기록한다. 이미 쓰던 기준 목록은 그대로 둔다.
            if (fromVersion < 5) {
              const builder = (next.builder as Record<string, unknown>) ?? defaultBuilder();
              next = {
                ...next,
                builder: {
                  ...builder,
                  startInfoSource: builder.startInfoSource ?? 'manual',
                  sourceIdeaId: builder.sourceIdeaId ?? null,
                  sourceProjectId: builder.sourceProjectId ?? null,
                  criteriaSuggestedAt:
                    builder.criteriaSuggestedAt ??
                    (((builder.criteria as CriterionEntry[]) ?? []).length > 0 ? new Date().toISOString() : null),
                },
              };
            }

            // v5 → v6: Planner 산출물도 버전 기록을 남긴다.
            if (fromVersion < 6) {
              const planner = (next.planner as Record<string, unknown>) ?? {};
              next = { ...next, planner: { ...planner, versions: planner.versions ?? [] } };
            }

            return next;
          });
        }
        return state as never;
      },
    },
  ),
);

export function projectProgress(project: Project): number {
  let score = 0;
  const total = 4;
  if (project.generator.ideas.length > 0) score += 1;
  if (project.builder.criteria.some((c) => c.status !== 'unmet')) score += 1;
  if (project.planner.bizPlanGenerated) score += 1;
  if (project.planner.pitchDeckGenerated) score += 1;
  return Math.round((score / total) * 100);
}
