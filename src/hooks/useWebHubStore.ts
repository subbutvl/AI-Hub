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
      links: [],

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
