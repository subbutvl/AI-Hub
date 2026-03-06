import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Pipeline } from '../types/pipeline';

const DEFAULT_PIPELINES: Pipeline[] = [
  {
    id: 'default-pipeline-pr-review',
    name: "PR Code Review Pipeline",
    description: "Runs Security Analysis, Code Review, Performance Optimization and Documentation generation on every PR.",
    skillIds: [
      'default-skill-security-analysis',
      'default-skill-code-review',
      'default-skill-performance-optimization',
      'default-skill-documentation-generation',
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-pipeline-full-audit',
    name: "Full Audit Pipeline",
    description: "A comprehensive quality pass covering accessibility, refactoring, and documentation.",
    skillIds: [
      'default-skill-accessibility-review',
      'default-skill-refactoring',
      'default-skill-documentation-generation',
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

interface PipelineStore {
  pipelines: Pipeline[];
  addPipeline: (pipeline: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePipeline: (id: string, updates: Partial<Pipeline>) => void;
  deletePipeline: (id: string) => void;
}

export const usePipelineStore = create<PipelineStore>()(
  persist(
    (set, get) => ({
      pipelines: DEFAULT_PIPELINES,
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
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const existingIds = new Set(state.pipelines.map(p => p.id));
        const missing = DEFAULT_PIPELINES.filter(p => !existingIds.has(p.id));
        if (missing.length > 0) {
          state.pipelines = [...missing, ...state.pipelines];
        }
      }
    }
  )
);
