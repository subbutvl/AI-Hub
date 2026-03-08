import { create } from 'zustand';
import { WebLink } from '../types/webHub';
import { dbManager } from '../db';
import { featuredItems as featuredSchema } from '../db/schema';
import { eq } from 'drizzle-orm';

interface FeaturedStore {
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
];

export const useFeaturedStore = create<FeaturedStore>((set, get) => ({
  links: [],

  init: () => {
    if (!dbManager.isInitialized) return;
    
    try {
       // Convert raw DB format back to internal format (mostly matches natively)
       let existing = dbManager.db.select().from(featuredSchema).all() as unknown as WebLink[];
       
       if (existing.length === 0) {
         // Seed defaults
         for (const link of DEFAULT_LINKS) {
            dbManager.db.insert(featuredSchema).values({
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
       console.error("Failed to init FeaturedStore from DB", e);
    }
  },

  addLink: (link) => {
    const existing = get().links;
    if (existing.some((l) => l.url.toLowerCase() === link.url.toLowerCase())) {
      return;
    }
    
    try {
      dbManager.db.insert(featuredSchema).values({
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
      console.error("Failed to insert featured link", e);
    }
  },

  updateLink: (link) => {
    try {
      dbManager.db.update(featuredSchema)
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
        .where(eq(featuredSchema.id, link.id))
        .run();
      dbManager.save();

      set((state) => ({
        links: state.links.map((l) => (l.id === link.id ? link : l)),
      }));
    } catch(e) {
      console.error("Failed to update featured link", e);
    }
  },

  deleteLink: (id) => {
    try {
       dbManager.db.delete(featuredSchema).where(eq(featuredSchema.id, id)).run();
       dbManager.save();
       set((state) => ({ links: state.links.filter((l) => l.id !== id) }));
    } catch(e) {
       console.error("Failed to delete featured link", e);
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
            dbManager.db.insert(featuredSchema).values({
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
