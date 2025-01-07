import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resume } from '@/types/resume';

interface AppState {
  selectedResume: Resume | null;
  resumes: Resume[];
  filters: {
    status: string[];
    state: string[];
    dateRange: [Date | null, Date | null];
  };
  setSelectedResume: (resume: Resume | null) => void;
  setResumes: (resumes: Resume[]) => void;
  addResume: (resume: Resume) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  deleteResume: (id: string) => void;
  setFilters: (filters: AppState['filters']) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedResume: null,
      resumes: [],
      filters: {
        status: [],
        state: [],
        dateRange: [null, null],
      },
      setSelectedResume: (resume) => set({ selectedResume: resume }),
      setResumes: (resumes) => set({ resumes }),
      addResume: (resume) => set((state) => ({ 
        resumes: [...state.resumes, resume] 
      })),
      updateResume: (id, updates) => set((state) => ({
        resumes: state.resumes.map((resume) =>
          resume.id === id ? { ...resume, ...updates } : resume
        ),
      })),
      deleteResume: (id) => set((state) => ({
        resumes: state.resumes.filter((resume) => resume.id !== id),
      })),
      setFilters: (filters) => set({ filters }),
    }),
    {
      name: 'app-storage',
      skipHydration: true,
    }
  )
); 