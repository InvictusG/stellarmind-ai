import create from 'zustand';
import { persist } from 'zustand/middleware';
import { LLMModel } from '@/types';

export interface SessionState {
  selectedModel: LLMModel | null;
  setSelectedModel: (model: LLMModel | null) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      selectedModel: null,
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: 'stellarmind-session-storage', // name of the item in the storage (must be unique)
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
    }
  )
); 