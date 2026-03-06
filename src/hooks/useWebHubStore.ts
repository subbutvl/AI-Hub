import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WebLink, LinkType } from '../types/webHub';

interface WebHubStore {
  links: WebLink[];
  addLink: (link: WebLink) => void;
  updateLink: (link: WebLink) => void;
  deleteLink: (id: string) => void;
  importLinks: (links: WebLink[]) => void;
  getCategories: () => string[];
  getAllTags: () => string[];
}

export const useWebHubStore = create<WebHubStore>()(
  persist(
    (set, get) => ({
      links: [
        {
          id: 'def-1',
          url: 'https://www.youtube.com/watch?v=aircAruvnKk',
          name: 'OpenAI DevDay Opening Keynote',
          type: 'youtube-video',
          category: 'AI News',
          tags: ['openai', 'keynote', 'devday'],
          addedAt: new Date().toISOString(),
        },
        {
          id: 'def-2',
          url: 'https://github.com/microsoft/vscode',
          name: 'Microsoft VS Code',
          type: 'github-repo',
          category: 'IDE',
          tags: ['editor', 'microsoft', 'typescript'],
          addedAt: new Date().toISOString(),
        },
        {
          id: 'def-3',
          url: 'https://www.anthropic.com/news/claude-3-5-sonnet',
          name: 'Claude 3.5 Sonnet Announcement',
          type: 'webpage',
          category: 'AI Models',
          tags: ['anthropic', 'claude', 'llm'],
          addedAt: new Date().toISOString(),
        }
      ],

      addLink: (link) => {
        const existing = get().links;
        if (existing.some((l) => l.url.toLowerCase() === link.url.toLowerCase())) {
          return; // Prevent duplicate URL
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
    { name: 'web-hub-store' }
  )
);
