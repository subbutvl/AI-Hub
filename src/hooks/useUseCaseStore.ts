import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UseCase } from '../types/useCase';

const DEFAULT_USE_CASES: UseCase[] = [
  {
    id: 'mock-1',
    title: "Automated Code Review",
    description: "Chain a stylistic linters skill with a deep-logic analysis skill to provide comprehensive feedback on pending Pull Requests instantly.",
    pipelineId: "",
    icon: "Code2",
    color: "bg-blue-500/10",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'mock-2',
    title: "Customer Support Triage",
    description: "Intelligently route incoming support tickets by combining sentiment analysis skills with technical categorization.",
    pipelineId: "",
    icon: "MessageSquare",
    color: "bg-green-500/10",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'mock-3',
    title: "Document Summarization",
    description: "Extract key entities from long-form PDFs and generate executive summaries formatted specifically for stakeholder emails.",
    pipelineId: "",
    icon: "FileText",
    color: "bg-amber-500/10",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'mock-4',
    title: "Complex Data Extraction",
    description: "Pull unstructured data from websites, clean the output via a pipeline, and structure it into strict JSON payloads for your database.",
    pipelineId: "",
    icon: "Database",
    color: "bg-purple-500/10",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'mock-5',
    title: "Technical Research Assistant",
    description: "Feed a topic to the pipeline to automatically search APIs, summarize papers, and generate a literature review.",
    pipelineId: "",
    icon: "Search",
    color: "bg-rose-500/10",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

interface UseCaseStore {
  useCases: UseCase[];
  addUseCase: (useCase: Omit<UseCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUseCase: (id: string, updates: Partial<UseCase>) => void;
  deleteUseCase: (id: string) => void;
  importUseCases: (useCases: UseCase[]) => void;
}

export const useUseCaseStore = create<UseCaseStore>()(
  persist(
    (set) => ({
      useCases: DEFAULT_USE_CASES,
      addUseCase: (useCaseData) => set((state) => {
        const newUseCase: UseCase = {
          ...useCaseData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return { useCases: [...state.useCases, newUseCase] };
      }),
      updateUseCase: (id, updates) => set((state) => ({
        useCases: state.useCases.map((uc) =>
          uc.id === id ? { ...uc, ...updates, updatedAt: Date.now() } : uc
        ),
      })),
      deleteUseCase: (id) => set((state) => ({
        useCases: state.useCases.filter((uc) => uc.id !== id),
      })),
      importUseCases: (newUseCases) => set((state) => {
        // Merge without duplicating existing IDs if possible, or just append
        const deduplicated = [...state.useCases];
        newUseCases.forEach(nuc => {
          if (!deduplicated.find(e => e.id === nuc.id)) {
            deduplicated.push(nuc);
          }
        });
        return { useCases: deduplicated };
      })
    }),
    {
      name: 'use-case-storage',
    }
  )
);
