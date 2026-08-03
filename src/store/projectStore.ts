import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  DeveloperState,
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

function defaultDeveloper(): DeveloperState {
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
    developer: defaultDeveloper(),
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
  updateDeveloper: (id: string, patch: Partial<DeveloperState>) => void;
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

      updateDeveloper: (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, developer: { ...p.developer, ...patch }, updatedAt: new Date().toISOString() } : p,
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
    },
  ),
);

export function projectProgress(project: Project): number {
  let score = 0;
  const total = 4;
  if (project.generator.ideas.length > 0) score += 1;
  if (project.developer.criteria.some((c) => c.status !== 'unmet')) score += 1;
  if (project.planner.bizPlanGenerated) score += 1;
  if (project.planner.pitchDeckGenerated) score += 1;
  return Math.round((score / total) * 100);
}
