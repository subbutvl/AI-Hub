import { useState, useEffect } from 'react';

export interface AppSettings {
  enableRepoHub: boolean;
  enableSkillHub: boolean;
  enableWebHub: boolean;
  enableBackgroundQuerying: boolean;
  webHubLayout: 'grid' | 'table';
}

const defaultSettings: AppSettings = {
  enableRepoHub: true,
  enableSkillHub: true,
  enableWebHub: true,
  enableBackgroundQuerying: false,
  webHubLayout: 'grid',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem('ai_hub_settings');
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return defaultSettings;
  });

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem('ai_hub_settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  return { settings, updateSettings };
}
