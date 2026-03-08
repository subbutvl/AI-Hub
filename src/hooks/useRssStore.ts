import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RssFeed {
  id: string;
  name: string;
  url: string;
  description?: string;
  addedAt: string;
}

interface RssStore {
  feeds: RssFeed[];
  addFeed: (feed: RssFeed) => void;
  deleteFeed: (id: string) => void;
  updateFeed: (feed: RssFeed) => void;
}

export const useRssStore = create<RssStore>()(
  persist(
    (set, get) => ({
      feeds: [
        {
          id: 'rss-1',
          name: 'OpenAI Blog',
          url: 'https://openai.com/blog/rss.xml',
          description: 'Latest research and updates from OpenAI',
          addedAt: new Date().toISOString()
        },
        {
          id: 'rss-2',
          name: 'Google AI Blog',
          url: 'https://blog.google/technology/ai/rss',
          description: 'News and updates from Google AI',
          addedAt: new Date().toISOString()
        }
      ],
      addFeed: (feed) => {
        const existing = get().feeds;
        if (existing.some((f) => f.url.toLowerCase() === feed.url.toLowerCase())) {
          return;
        }
        set((state) => ({ feeds: [feed, ...state.feeds] }));
      },
      deleteFeed: (id) => set((state) => ({ feeds: state.feeds.filter(f => f.id !== id) })),
      updateFeed: (feed) => set((state) => ({ feeds: state.feeds.map(f => f.id === feed.id ? feed : f) }))
    }),
    { name: 'rss-feeds-store' }
  )
);
