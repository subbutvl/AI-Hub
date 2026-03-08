import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, LayoutDashboard, Database, Globe, Zap, ArrowRight, Upload } from "lucide-react";
import { useRepoStore } from '../hooks/useRepoStore';
import { useWebHubStore } from '../hooks/useWebHubStore';
import { parseCsv } from '../utils/csvHelper';
import { SavedRepo } from '../types';
import { WebLink } from '../types/webHub';
import { useState } from 'react';

// Import raw CSV data
import reposCsvData from '../data/my-dashboard-repos.csv?raw';
import webHubCsvData from '../data/web-hub.csv?raw';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center">Welcome as AI Hub 👋</DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            Your Premium Centralized Workspace for AI Development, Curation, and Automation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground text-center px-4">
            Tired of losing track of LLM repositories, tutorials, and workflows? AI Hub bridges the gap between discovery and implementation, providing a unified interface to manage your entire AI workflow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mission Control Panel */}
            <div className="p-4 rounded-xl border border-primary/10 bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                  <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground">Mission Control</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A unified dashboard with real-time analytics, instant activity tracking, and dynamic mission statements to keep you focused.
              </p>
            </div>

            {/* Repo Hub Panel */}
            <div className="p-4 rounded-xl border border-primary/10 bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg">
                  <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-foreground">Repo Hub</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Deep GitHub integration. Explore, categorize, and tag your favorite codebases. Browse file structures instantly within the app.
              </p>
            </div>

            {/* Web Hub Panel */}
            <div className="p-4 rounded-xl border border-primary/10 bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                  <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-foreground">Web Hub</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Smart content curation. Auto-detect YouTube videos and GitHub links with an engine that fetches metadata automatically.
              </p>
            </div>

            {/* Skill Hub Panel */}
            <div className="p-4 rounded-xl border border-primary/10 bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold text-foreground">Skill Hub & Use Cases</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Turn knowledge into action. Build custom prompted skills, chain pipelines, and leverage pre-configured workflow templates.
              </p>
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-xl text-sm text-center italic text-muted-foreground">
            What's Next? We are building an AI Skill Marketplace and Team Collaboration tools. Join us on this journey!
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border mt-2">
            <Button
              className="flex-1 gap-2"
              onClick={onClose}
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 relative overflow-hidden group"
              onClick={handleLoadSampleData}
            >
              <span className="">{isLoaded ? "Data Loaded Successfully!" : "Load Sample Data"}</span>
              {/* <Upload className="w-4 h-4 group-hover:-translate-y-1 group-hover:opacity-0 transition-all absolute" />
              <Database className="w-4 h-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all absolute" /> */}

            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
