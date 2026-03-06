import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useRepoStore } from '../hooks/useRepoStore';
import { useWebHubStore } from '../hooks/useWebHubStore';
import { useSkillStore } from '../hooks/useSkillStore';
import { useUseCaseStore } from '../hooks/useUseCaseStore';
import { useSettings } from '../hooks/useSettings';
import { WelcomeModal } from '../components/WelcomeModal';
import { 
  Github, Globe, Cpu, Lightbulb, 
  ChevronRight, ExternalLink, Clock, 
  Star, GitFork, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TYPE_META, getDomain } from '../types/webHub';

function StatCard({ title, value, icon: Icon, color, to }: { title: string, value: number, icon: any, color: string, to: string }) {
  return (
    <Link to={to} className="group bg-white dark:bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </Link>
  );
}

function SectionHeader({ title, to, label = "View All" }: { title: string, to: string, label?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <Link to={to} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
        {label} <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

const SUMMARIES = [
  "AI Hub is your ultimate repository and web resource manager, designed to keep your development workflow organized and efficient.",
  "Discover, save, and categorize the best AI tools and repositories with AI Hub's intuitive management features.",
  "Streamline your AI research by centralizing GitHub repos and web links in one unified, searchable dashboard.",
  "AI Hub empowers you to build personal skill libraries and automated pipelines for complex AI-driven tasks.",
  "Manage your technical knowledge base with ease using AI Hub's deep integration with GitHub and custom web resource tracking.",
  "From repository exploration to web link curation, AI Hub is the mission control for your artificial intelligence projects.",
  "Boost your productivity by organizing AI-related content, YouTube tutorials, and developmental tools in a single, sleek interface.",
  "AI Hub bridges the gap between discovery and implementation, helping you track the latest in AI models and development trends.",
  "Leverage AI Hub to curate a personalized collection of high-impact repositories and web resources for your next big project.",
  "Experience a smarter way to manage technical debt and resource clutter with AI Hub's specialized indexing and categorization tools."
];

export default function Dashboard() {
  const { repos } = useRepoStore();
  const { links } = useWebHubStore();
  const { skills } = useSkillStore();
  const { useCases } = useUseCaseStore();
  const { settings, updateSettings } = useSettings();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!settings.hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, [settings.hasSeenWelcome]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    updateSettings({ hasSeenWelcome: true });
  };

  const randomSummary = useMemo(() => SUMMARIES[Math.floor(Math.random() * SUMMARIES.length)], []);

  const recentRepos = useMemo(() => [...repos].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 6), [repos]);
  const recentLinks = useMemo(() => [...links].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, 6), [links]);

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground mt-1">Here is what is happening across your AI Hub today.</p>
          </div>
          
          <div className="max-w-md bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                &quot;{randomSummary}&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Repositories" value={repos.length} icon={Github} color="bg-blue-500" to="/my-repos" />
          <StatCard title="Web Links" value={links.length} icon={Globe} color="bg-emerald-500" to="/web-hub" />
          <StatCard title="AI Skills" value={skills.length} icon={Cpu} color="bg-purple-500" to="/skills/library" />
          <StatCard title="Use Cases" value={useCases.length} icon={Lightbulb} color="bg-amber-500" to="/skills/use-cases" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Repositories */}
          <div className="lg:col-span-2 space-y-4">
            <SectionHeader title="Recent Repositories" to="/my-repos" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentRepos.length > 0 ? (
                recentRepos.map(repo => (
                  <Link 
                    key={repo.id} 
                    to={`/repo/${repo.owner}/${repo.name}`}
                    className="flex flex-col p-4 bg-white dark:bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-sm truncate max-w-[150px]">{repo.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] py-0 h-4">{repo.category || 'General'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-8">
                      {repo.info?.description || 'No description available.'}
                    </p>
                    <div className="flex items-center gap-4 mt-auto text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {repo.info?.stars || 0}</span>
                      <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {repo.info?.forks || 0}</span>
                      <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" /> {new Date(repo.createdAt || 0).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl bg-muted/20 text-center">
                  <p className="text-sm text-muted-foreground mb-4">You haven't added any repositories yet.</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/my-repos"><Plus className="w-4 h-4 mr-2" /> Add Repo</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Web Hub Highlights */}
          <div className="space-y-4">
            <SectionHeader title="Web Hub Highlights" to="/web-hub" />
            <div className="space-y-3">
              {recentLinks.length > 0 ? (
                recentLinks.map(link => {
                  const meta = TYPE_META[link.type];
                  return (
                    <a 
                      key={link.id} 
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white dark:bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className={`p-2 rounded-lg ${meta.bgColor} ${meta.textColor}`}>
                        {meta.label === 'Video' ? <Clock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate group-hover:text-primary transition-colors">{link.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{getDomain(link.url)}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl bg-muted/20 text-center">
                  <p className="text-sm text-muted-foreground mb-4">No links saved.</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/web-hub">Visit Web Hub</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="space-y-4">
          <SectionHeader title="Recommended Use Cases" to="/skills/use-cases" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {useCases.slice(0, 3).map(uc => (
              <Link 
                key={uc.id} 
                to={`/skills/use-cases`}
                className="p-5 bg-white dark:bg-card border border-border rounded-2xl hover:border-primary/50 transition-all flex flex-col gap-3 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${uc.color || 'bg-blue-500/10'} border border-primary/5`}>
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{uc.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{uc.description}</p>
                </div>
                <div className="pt-2 flex items-center gap-2 mt-auto">
                   <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal">Workflow Enabled</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />
    </Layout>
  );
}
