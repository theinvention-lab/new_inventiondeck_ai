import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  BuilderState,
  CriterionEntry,
  DeckState,
  Folder,
  GeneratorState,
  PlannerState,
  Project,
} from '../types';
import { makeId } from '../lib/id';
import { defaultCriteria } from '../data/defaultCriteria';

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
    summary: '',
    targetCustomer: '',
    userProblem: '',
    solution: '',
    evidence: '',
    assumptions: '',
    currentConcerns: '',
    chatMessages: [],
    criteria: defaultCriteria(),
    autosaveStatus: 'idle',
    lastSavedAt: null,
    versions: [],
    activeTemplateId: 'lean-canvas',
    templateValues: {},
  };
}

function defaultPlanner(): PlannerState {
  return {
    bizPlanSections: [],
    designTemplateId: 'naver-mint',
    bizPlanGenerated: false,
    bizPlanProgress: 0,
    lastExport: null,
  };
}

function defaultDeck(): DeckState {
  return {
    pitchSlides: [],
    designTemplateId: 'naver-mint',
    pitchDeckGenerated: false,
    pitchDeckProgress: 0,
    lastExport: null,
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
    deck: defaultDeck(),
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
  updateDeck: (id: string, patch: Partial<DeckState>) => void;

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

      updateDeck: (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, deck: { ...p.deck, ...patch }, updatedAt: new Date().toISOString() } : p,
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
      version: 3,
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
              const planner: PlannerState = {
                bizPlanSections: (oldPlanner.bizPlanSections as PlannerState['bizPlanSections']) ?? [],
                designTemplateId: (oldPlanner.designTemplateId as PlannerState['designTemplateId']) ?? 'naver-mint',
                bizPlanGenerated: (oldPlanner.bizPlanGenerated as boolean) ?? false,
                bizPlanProgress: (oldPlanner.bizPlanProgress as number) ?? 0,
                lastExport:
                  (oldPlanner.lastExport as PlannerState['lastExport'] | undefined)?.type === 'pdf'
                    ? (oldPlanner.lastExport as PlannerState['lastExport'])
                    : null,
              };
              const deck: DeckState = (next.deck as DeckState) ?? {
                pitchSlides: (oldPlanner.pitchSlides as DeckState['pitchSlides']) ?? [],
                designTemplateId: (oldPlanner.designTemplateId as DeckState['designTemplateId']) ?? 'naver-mint',
                pitchDeckGenerated: (oldPlanner.pitchDeckGenerated as boolean) ?? false,
                pitchDeckProgress: (oldPlanner.pitchDeckProgress as number) ?? 0,
                lastExport:
                  (oldPlanner.lastExport as DeckState['lastExport'] | undefined)?.type === 'ppt'
                    ? (oldPlanner.lastExport as DeckState['lastExport'])
                    : null,
              };
              const stage = next.stage === 'developer' ? 'builder' : next.stage;
              next = { ...next, builder, planner, deck, stage };
            }

            // v2 → v3: Builder gains the 6-template worksheet, and each
            // criterion gains an attachments list.
            if (fromVersion < 3) {
              const builder = (next.builder as Record<string, unknown>) ?? defaultBuilder();
              const criteria = ((builder.criteria as CriterionEntry[]) ?? []).map((c) => ({
                ...c,
                attachments: c.attachments ?? [],
              }));
              next = {
                ...next,
                builder: {
                  ...builder,
                  criteria,
                  activeTemplateId: builder.activeTemplateId ?? 'lean-canvas',
                  templateValues: builder.templateValues ?? {},
                },
              };
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
  if (project.deck.pitchDeckGenerated) score += 1;
  return Math.round((score / total) * 100);
}
