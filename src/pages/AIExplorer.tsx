import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Compass, ExternalLink, Star, GitFork, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { CsvControls } from '../components/CsvControls';
import { HelpDrawer } from '../components/HelpDrawer';
import { HelpButton } from '../components/HelpButton';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  owner: {
    login: string;
    avatar_url: string;
  };
  topics: string[];
  updated_at: string;
}

interface GithubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
}

export default function AIExplorer() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const fetchAwesomeLists = async () => {
      try {
        // Search for "awesome" lists related to AI/ML
        const query = encodeURIComponent('awesome ai OR awesome machine learning OR awesome-llm in:name,description topic:awesome');
        const response = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=24`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch awesome lists');
        }

        const data: GithubSearchResponse = await response.json();
        setRepos(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAwesomeLists();
  }, []);

  const handleImport = (importedData: Repository[]) => {
    setRepos(prev => {
        const newRepos = [...prev];
        importedData.forEach(item => {
            const index = newRepos.findIndex(r => r.id === item.id);
            if (index >= 0) {
                newRepos[index] = { ...newRepos[index], ...item };
            } else {
                newRepos.push(item);
            }
        });
        return newRepos;
    });
    alert(`Imported ${importedData.length} items successfully.`);
  };

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground flex items-center gap-3">
            <Compass className="w-8 h-8" />
            AI Explorer
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover curated "Awesome" lists for Artificial Intelligence and Machine Learning.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CsvControls 
              data={repos} 
              filename="ai-explorer.csv" 
              onImport={handleImport} 
          />
          <HelpButton onClick={() => setIsHelpOpen(true)} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={repo.owner.avatar_url} 
                    alt={repo.owner.login} 
                    className="w-10 h-10 rounded-full border border-gray-100 dark:border-border"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-foreground line-clamp-1" title={repo.name}>
                      {repo.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">by {repo.owner.login}</p>
                  </div>
                </div>
                <a 
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
                {repo.description || "No description available."}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-gray-100 dark:border-border/50">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" />
                  {repo.stargazers_count.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5" />
                  {repo.forks_count.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <BookOpen className="w-3.5 h-3.5" />
                  Readme
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <HelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="About AI Explorer"
      >
        <p className="lead">
          AI Explorer helps you discover "Awesome" lists - curated collections of resources, libraries, and tools for AI and Machine Learning.
        </p>
        
        <h3>What are Awesome Lists?</h3>
        <p>
          "Awesome" lists are community-curated repositories on GitHub that gather the best resources for a specific topic. They are a great way to find high-quality tools and learning materials.
        </p>

        <h3>How to use</h3>
        <ul>
          <li><strong>Browse:</strong> Scroll through the cards to see different AI-related topics.</li>
          <li><strong>Visit:</strong> Click the external link icon to visit the repository on GitHub.</li>
          <li><strong>Stats:</strong> Each card shows the number of stars and forks, indicating popularity and community engagement.</li>
        </ul>

        <h3>Data Management</h3>
        <p>
          You can export the list of repositories to a CSV file for offline analysis.
        </p>
      </HelpDrawer>
    </Layout>
  );
}
