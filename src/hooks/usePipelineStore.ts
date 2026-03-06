import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Pipeline } from '../types/pipeline';

interface PipelineStore {
  pipelines: Pipeline[];
  addPipeline: (pipeline: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePipeline: (id: string, updates: Partial<Pipeline>) => void;
  deletePipeline: (id: string) => void;
}

export const usePipelineStore = create<PipelineStore>()(
  persist(
    (set) => ({
      pipelines: [],
      addPipeline: (pipelineData) => set((state) => {
        const newPipeline: Pipeline = {
          ...pipelineData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return { pipelines: [...state.pipelines, newPipeline] };
      }),
      updatePipeline: (id, updates) => set((state) => ({
        pipelines: state.pipelines.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        ),
      })),
      deletePipeline: (id) => set((state) => ({
        pipelines: state.pipelines.filter((p) => p.id !== id),
      })),
    }),
    {
      name: 'pipeline-storage',
    }
  )
);
