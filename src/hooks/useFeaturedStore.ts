import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WebLink } from '../types/webHub';

interface FeaturedStore {
  links: WebLink[];
  addLink: (link: WebLink) => void;
  updateLink: (link: WebLink) => void;
  deleteLink: (id: string) => void;
  importLinks: (links: WebLink[]) => void;
  getCategories: () => string[];
  getAllTags: () => string[];
}

export const useFeaturedStore = create<FeaturedStore>()(
  persist(
    (set, get) => ({
      links: [
        {
          id: 'feat-1',
          url: 'https://v0.dev',
          name: 'v0 by Vercel',
          type: 'tool',
          category: 'UI Generation',
          tags: ['react', 'tailwind', 'ai', 'vercel'],
          addedAt: new Date().toISOString(),
          description: 'AI-powered generative UI system built on top of React and Tailwind CSS.'
        },
        {
          id: 'feat-2',
          url: 'https://cursor.sh',
          name: 'Cursor Editor',
          type: 'tool',
          category: 'IDE',
          tags: ['ai-editor', 'copilot', 'development'],
          addedAt: new Date().toISOString(),
          description: 'The AI-first Code Editor.'
        }
      ],

      addLink: (link) => {
        const existing = get().links;
        if (existing.some((l) => l.url.toLowerCase() === link.url.toLowerCase())) {
          return;
        }
        set((state) => ({ links: [link, ...state.links] }));
      },

      updateLink: (link) =>
        set((state) => ({
          links: state.links.map((l) => (l.id === link.id ? link : l)),
        })),

      deleteLink: (id) =>
        set((state) => ({ links: state.links.filter((l) => l.id !== id) })),

      importLinks: (incoming) => {
        const existing = get().links;
        const existingUrls = new Set(existing.map((l) => l.url.toLowerCase()));
        const existingIds = new Set(existing.map((l) => l.id));
        
        const newLinks = incoming.filter((l) => 
          !existingIds.has(l.id) && !existingUrls.has(l.url.toLowerCase())
        );
        
        if (newLinks.length > 0) {
          set({ links: [...newLinks, ...existing] });
        }
      },

      getCategories: () => {
        const cats = new Set(get().links.map((l) => l.category).filter(Boolean));
        return Array.from(cats).sort();
      },

      getAllTags: () => {
        const tags = new Set(get().links.flatMap((l) => l.tags));
        return Array.from(tags).sort();
      },
    }),
    { name: 'featured-store' }
  )
);
