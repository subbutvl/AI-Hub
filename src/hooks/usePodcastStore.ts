import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PodcastFeed {
  id: string;
  name: string;
  url: string;
  description?: string;
  addedAt: string;
}

interface PodcastStore {
  podcasts: PodcastFeed[];
  /** Maps podcast ID to the ISO string of the latest episode pubDate that the user has "seen" */
  lastViewedMap: Record<string, string>;
  addPodcast: (feed: PodcastFeed) => void;
  deletePodcast: (id: string) => void;
  updatePodcast: (feed: PodcastFeed) => void;
  markAsViewed: (id: string, latestPubDateIso: string) => void;
}

export const usePodcastStore = create<PodcastStore>()(
  persist(
    (set, get) => ({
      podcasts: [
        {
          id: 'pod-1',
          name: 'Lex Fridman Podcast',
          url: 'https://lexfridman.com/feed/podcast/',
          description: 'Conversations about science, technology, history, philosophy and the nature of intelligence.',
          addedAt: new Date().toISOString()
        },
        {
          id: 'pod-2',
          name: 'Latent Space',
          url: 'https://api.substack.com/feed/podcast/1084089.rss',
          description: 'The AI Engineer podcast.',
          addedAt: new Date().toISOString()
        }
      ],
      lastViewedMap: {},
      addPodcast: (feed) => {
        const existing = get().podcasts;
        if (existing.some((f) => f.url.toLowerCase() === feed.url.toLowerCase())) {
          return;
        }
        set((state) => ({ podcasts: [feed, ...state.podcasts] }));
      },
      deletePodcast: (id) => set((state) => {
        const newMap = { ...state.lastViewedMap };
        delete newMap[id];
        return { 
          podcasts: state.podcasts.filter(f => f.id !== id),
          lastViewedMap: newMap
        };
      }),
      updatePodcast: (feed) => set((state) => ({ podcasts: state.podcasts.map(f => f.id === feed.id ? feed : f) })),
      markAsViewed: (id, latestPubDateIso) => set((state) => ({
        lastViewedMap: {
          ...state.lastViewedMap,
          [id]: latestPubDateIso
        }
      }))
    }),
    { name: 'podcast-store' }
  )
);
