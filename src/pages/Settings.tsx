import { Layout } from "../components/Layout";
import { useSettings } from "../hooks/useSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const { settings, updateSettings } = useSettings();

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

        </div>
      </div>
    </Layout>
  );
}
