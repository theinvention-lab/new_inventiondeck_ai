import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Note } from '../types';
import { makeId } from '../lib/id';

interface NoteStoreState {
  notes: Note[];

  createNote: (ownerEmail: string, title: string, content: string) => Note;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'content'>>) => void;
  deleteNote: (id: string) => void;
  listForUser: (email: string) => Note[];
}

export const useNoteStore = create<NoteStoreState>()(
  persist(
    (set, get) => ({
      notes: [],

      createNote: (ownerEmail, title, content) => {
        const now = new Date().toISOString();
        const note: Note = {
          id: makeId('note'),
          ownerEmail,
          title: title.trim() || '제목 없는 메모',
          content: content.trim(),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ notes: [note, ...s.notes] }));
        return note;
      },

      updateNote: (id, patch) => {
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)),
        }));
      },

      deleteNote: (id) => {
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
      },

      listForUser: (email) => get().notes.filter((n) => n.ownerEmail === email),
    }),
    {
      name: 'inventiondeck:notes',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
