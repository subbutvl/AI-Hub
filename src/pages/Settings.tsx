import { Layout } from "../components/Layout";
import { useSettings } from "../hooks/useSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, LayoutGrid, List, Database, Upload, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRepoStore } from '../hooks/useRepoStore';
import { useWebHubStore } from '../hooks/useWebHubStore';
import { parseCsv } from '../utils/csvHelper';
import { SavedRepo } from '../types';
import { WebLink } from '../types/webHub';
import { useState } from 'react';

// Import raw CSV data
import reposCsvData from '../data/my-dashboard-repos.csv?raw';
import webHubCsvData from '../data/web-hub.csv?raw';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { importRepos } = useRepoStore();
  const { importLinks } = useWebHubStore();
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoadSampleData = () => {
    try {
      // Parse and load Repositories
      const parsedRepos = parseCsv<SavedRepo>(reposCsvData);
      if (parsedRepos && parsedRepos.length > 0) {
        importRepos(parsedRepos);
      }

      // Parse and load Web Links
      const parsedLinks = parseCsv<WebLink>(webHubCsvData);
      if (parsedLinks && parsedLinks.length > 0) {
        importLinks(parsedLinks);
      }

      setIsLoaded(true);
      setTimeout(() => setIsLoaded(false), 3000);
    } catch (error) {
      console.error("Failed to load sample data:", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-gray-900 dark:text-foreground">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your application preferences, menus, and API behaviors.
          </p>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm p-6 space-y-8 mt-6">
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b border-border pb-2">User Interface Features</h2>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-repo-hub" className="text-base font-medium">Enable Repo Hub</Label>
                <p className="text-sm text-muted-foreground">
                  Displays the centralized repository menus like AI Index and Awesome AI.
                </p>
              </div>
              <Switch 
                id="enable-repo-hub" 
                checked={settings.enableRepoHub}
                onCheckedChange={(checked) => updateSettings({ enableRepoHub: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-skill-hub" className="text-base font-medium">Enable Skill Hub</Label>
                <p className="text-sm text-muted-foreground">
                  Displays the Skill Hub tools and pipelines in the navigation menu.
                </p>
              </div>
              <Switch 
                id="enable-skill-hub" 
                checked={settings.enableSkillHub}
                onCheckedChange={(checked) => updateSettings({ enableSkillHub: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-web-hub" className="text-base font-medium">Enable Web Hub</Label>
                <p className="text-sm text-muted-foreground">
                  Displays the Web Hub bookmark manager in the navigation menu.
                </p>
              </div>
              <Switch 
                id="enable-web-hub" 
                checked={settings.enableWebHub}
                onCheckedChange={(checked) => updateSettings({ enableWebHub: checked })}
              />
            </div>
          </div>

          {/* Web Hub Features */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b border-border pb-2">Web Hub Features</h2>
            <p className="text-sm text-muted-foreground">
              Web Hub is your personal bookmark manager for the AI ecosystem, stored locally in your browser.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside border-l-2 border-primary/20 pl-4">
              <li><b>Auto-Fetch:</b> Metadata (name, type) fetched via YouTube oEmbed & GitHub API.</li>
              <li><b>Categorization:</b> Create custom categories and multi-tag links for easy filtering.</li>
              <li><b>Visuals:</b> Type-specific color-coded icons (Red for Video, Pink for Shorts, etc.).</li>
              <li><b>Portability:</b> Export your library to CSV or import links from other sources.</li>
            </ul>
            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Default Layout</Label>
                  <p className="text-xs text-muted-foreground">
                    Choose how your links are displayed by default.
                  </p>
                </div>
                <Select 
                  value={settings.webHubLayout} 
                  onValueChange={(v) => updateSettings({ webHubLayout: v as 'grid' | 'table' })}
                >
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Grid View</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="table">
                      <div className="flex items-center gap-2">
                        <List className="w-3.5 h-3.5" />
                        <span>Table View</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b border-border pb-2">API & Network Limits</h2>
            
            <div className="flex items-start justify-between">
              <div className="space-y-0.5 max-w-lg">
                <Label htmlFor="enable-background-querying" className="text-base font-medium">Allow Background Querying</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, secondary data processes like user location fetching in the AI Index will be allowed to execute silently in the background. 
                  <br/><br/>
                  <b>Note:</b> Checking this box might consume your GitHub API limits much faster and delay results.
                </p>
              </div>
              <Switch 
                id="enable-background-querying" 
                checked={settings.enableBackgroundQuerying}
                onCheckedChange={(checked) => updateSettings({ enableBackgroundQuerying: checked })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b border-border pb-2">Data Management</h2>
            
            <div className="flex items-start justify-between">
              <div className="space-y-0.5 max-w-lg">
                <Label className="text-base font-medium">Load Sample Data</Label>
                <p className="text-sm text-muted-foreground">
                  Populate your Repo Hub and Web Hub with pre-configured sample data (CSV format) to explore AI Hub's features quickly.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="gap-2 relative overflow-hidden group shrink-0" 
                onClick={handleLoadSampleData}
              >
                <Upload className="w-4 h-4 group-hover:-translate-y-1 group-hover:opacity-0 transition-all absolute" />
                <Database className="w-4 h-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all absolute" />
                <span className="ml-6">{isLoaded ? "Data Loaded successfully!" : "Load Sample Data"}</span>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
