import { useState, useEffect } from 'react';
import { dbManager } from '../db';
import { settings as settingsSchema } from '../db/schema';

export interface AppSettings {
  enableRepoHub: boolean;
  enableSkillHub: boolean;
  enableWebHub: boolean;
  enableStackBuilder: boolean;
  enableRssFeeds?: boolean;
  enablePodcasts?: boolean;
  enableBackgroundQuerying: boolean;
  webHubLayout: 'grid' | 'table';
  hasSeenWelcome: boolean;
}

const defaultSettings: AppSettings = {
  enableRepoHub: true,
  enableSkillHub: true,
  enableWebHub: true,
  enableStackBuilder: true,
  enableRssFeeds: true,
  enablePodcasts: true,
  enableBackgroundQuerying: false,
  webHubLayout: 'grid',
  hasSeenWelcome: false,
};

// We use a fixed ID for the singleton settings row
const SETTINGS_ID = 'app_settings_global';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    if (!dbManager.isInitialized) return;

    try {
      const existing = dbManager.db.select().from(settingsSchema).all();
      
      if (existing.length > 0) {
        // Hydrate from DB, merging over defaults
        setSettings({ ...defaultSettings, ...existing[0] } as AppSettings);
      } else {
        // Initialize default settings row if it doesn't exist
        dbManager.db.insert(settingsSchema).values({
          id: SETTINGS_ID,
          ...defaultSettings
        }).run();
        dbManager.save();
      }
    } catch (e) {
      console.error("Failed to query settings", e);
    }
  }, [dbManager.isInitialized]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };

      try {
        dbManager.db.update(settingsSchema)
          .set(updates)
          .run(); // Updates all rows (our singleton)
        dbManager.save();
      } catch (e) {
        console.error("Failed to persist settings update", e);
      }

      return newSettings;
    });
  };

  return { settings, updateSettings };
}
