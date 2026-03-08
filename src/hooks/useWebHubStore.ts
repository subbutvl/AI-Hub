import { create } from 'zustand';
import { WebLink, LinkType } from '../types/webHub';
import { dbManager } from '../db';
import { webHubItems as webHubSchema } from '../db/schema';
import { eq } from 'drizzle-orm';

interface WebHubStore {
  links: WebLink[];
  init: () => void;
  addLink: (link: WebLink) => void;
  updateLink: (link: WebLink) => void;
  deleteLink: (id: string) => void;
  importLinks: (links: WebLink[]) => void;
  getCategories: () => string[];
  getAllTags: () => string[];
}

const DEFAULT_LINKS: WebLink[] = [
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
];

export const useWebHubStore = create<WebHubStore>((set, get) => ({
  links: [],

  init: () => {
    if (!dbManager.isInitialized) return;
    
    try {
       // Convert raw DB format back to internal format (mostly matches natively)
       let existing = dbManager.db.select().from(webHubSchema).all() as unknown as WebLink[];
       
       if (existing.length === 0) {
         // Seed defaults
         for (const link of DEFAULT_LINKS) {
            dbManager.db.insert(webHubSchema).values({
               id: link.id,
               title: link.name,
               url: link.url,
               description: link.description,
               thumbnailUrl: link.favicon, // Mapped loosely
               category: link.category,
               type: link.type,
               tags: link.tags,
               addedAt: link.addedAt
            }).run();
         }
         dbManager.save();
         
         // Remap for state
         existing = [...DEFAULT_LINKS];
       } else {
         // Remap raw DB to state (DB has title, state has name)
         existing = existing.map((r: any) => ({
             ...r,
             name: r.title,
             favicon: r.thumbnailUrl
         }));
       }
       
       set({ links: existing });
    } catch(e) {
       console.error("Failed to init WebHubStore from DB", e);
    }
  },

  addLink: (link) => {
    const existing = get().links;
    if (existing.some((l) => l.url.toLowerCase() === link.url.toLowerCase())) {
      return; 
    }
    
    try {
      dbManager.db.insert(webHubSchema).values({
         id: link.id,
         title: link.name,
         url: link.url,
         description: link.description,
         thumbnailUrl: link.favicon,
         category: link.category,
         type: link.type,
         tags: link.tags,
         addedAt: link.addedAt
      }).run();
      dbManager.save();
      
      set((state) => ({ links: [link, ...state.links] }));
    } catch(e) {
      console.error("Failed to insert web link", e);
    }
  },

  updateLink: (link) => {
    try {
      dbManager.db.update(webHubSchema)
        .set({
           title: link.name,
           url: link.url,
           description: link.description,
           thumbnailUrl: link.favicon,
           category: link.category,
           type: link.type,
           tags: link.tags,
           addedAt: link.addedAt
        })
        .where(eq(webHubSchema.id, link.id))
        .run();
      dbManager.save();

      set((state) => ({
        links: state.links.map((l) => (l.id === link.id ? link : l)),
      }));
    } catch(e) {
      console.error("Failed to update web link", e);
    }
  },

  deleteLink: (id) => {
    try {
       dbManager.db.delete(webHubSchema).where(eq(webHubSchema.id, id)).run();
       dbManager.save();
       set((state) => ({ links: state.links.filter((l) => l.id !== id) }));
    } catch(e) {
       console.error("Failed to delete web link", e);
    }
  },

  importLinks: (incoming) => {
    const existing = get().links;
    const existingUrls = new Set(existing.map((l) => l.url.toLowerCase()));
    const existingIds = new Set(existing.map((l) => l.id));
    
    const newLinks = incoming.filter((l) => 
      !existingIds.has(l.id) && !existingUrls.has(l.url.toLowerCase())
    );
    
    if (newLinks.length > 0) {
      try {
         for (const link of newLinks) {
            dbManager.db.insert(webHubSchema).values({
               id: link.id,
               title: link.name,
               url: link.url,
               description: link.description,
               thumbnailUrl: link.favicon,
               category: link.category,
               type: link.type,
               tags: link.tags,
               addedAt: link.addedAt
            }).run();
         }
         dbManager.save();
         set({ links: [...newLinks, ...existing] });
      } catch(e) {
         console.error("Failed to import links", e);
      }
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
}));
