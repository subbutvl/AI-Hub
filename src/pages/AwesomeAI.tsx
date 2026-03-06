import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { searchRepos, RepoSearchResult } from '../services/github';
import { Search, Star, GitFork, ExternalLink, BookOpen, Code, Terminal } from 'lucide-react';
import { CsvControls } from '../components/CsvControls';
import { HelpDrawer } from '../components/HelpDrawer';
import { HelpButton } from '../components/HelpButton';

export default function AwesomeAI() {
  const [repos, setRepos] = useState<RepoSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('awesome ai OR awesome-machine-learning OR awesome-llm');
  const [error, setError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const fetchRepos = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      // Search for repositories with "awesome" in the name or topic, related to AI
      const results = await searchRepos(query, 'stars', 'desc', 100);
      setRepos(results);
    } catch (err) {
      setError('Failed to fetch awesome lists. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos(searchQuery);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRepos(searchQuery);
  };

  const handleImport = (importedData: RepoSearchResult[]) => {
    setRepos(importedData);
    alert(`Imported ${importedData.length} items.`);
  };

  const chips = [
    { label: 'All Awesome AI', query: 'awesome ai OR awesome-machine-learning OR awesome-llm' },
    { label: 'Generative AI', query: 'awesome generative-ai' },
    { label: 'LLMs', query: 'awesome llm OR awesome-large-language-models' },
    { label: 'Machine Learning', query: 'awesome machine-learning' },
    { label: 'Deep Learning', query: 'awesome deep-learning' },
    { label: 'Computer Vision', query: 'awesome computer-vision' },
    { label: 'NLP', query: 'awesome nlp' },
    { label: 'Agents', query: 'awesome ai-agents' },
    { label: 'Prompts', query: 'awesome prompts OR awesome-chatgpt-prompts' },
    { label: 'Vibe Coding', query: 'vibe coding OR cursor ai OR awesome-cursor' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              Awesome AI Lists
            </h1>
            <p className="text-muted-foreground mt-2">
              Curated list of "Awesome" AI repositories, resources, skills, and tools. Top 100 sorted by stars.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CsvControls 
              data={repos} 
              filename="awesome-ai-lists.csv" 
              onImport={handleImport} 
            />
            <HelpButton onClick={() => setIsHelpOpen(true)} />
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search awesome lists..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => {
                  setSearchQuery(chip.query);
                  fetchRepos(chip.query);
                }}
                className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border border-transparent hover:border-border"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <div
                key={repo.id}
                className="group relative flex flex-col p-6 bg-card rounded-xl border border-border hover:shadow-md transition-all hover:border-primary/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={repo.owner.avatar_url}
                      alt={repo.owner.login}
                      className="w-10 h-10 rounded-full border border-border"
                    />
                    <div className="overflow-hidden">
                      <h3 className="font-semibold text-lg leading-none truncate group-hover:text-primary transition-colors">
                        {repo.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        by {repo.owner.login}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                  {repo.description || 'No description available.'}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium text-foreground">
                        {(repo.stargazers_count / 1000).toFixed(1)}k
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5" />
                      <span>{repo.forks_count}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <Code className="w-3 h-3" />
                        {repo.language}
                      </span>
                    )}
                  </div>
                </div>

                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span className="sr-only">View {repo.name} on GitHub</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <HelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="About Awesome AI"
      >
        <p className="lead">
          Awesome AI is a curated collection of top-rated AI repositories, resources, and tools from GitHub.
        </p>
        
        <h3>What is this page?</h3>
        <p>
          This page allows you to search and explore high-quality AI projects. It defaults to showing the most popular "awesome" lists but can be used to find any AI-related repository.
        </p>

        <h3>How to use</h3>
        <ul>
          <li><strong>Search:</strong> Enter keywords in the search bar to find specific repositories.</li>
          <li><strong>Quick Filters:</strong> Click on the chips (e.g., "Generative AI", "LLMs") to quickly search for popular topics.</li>
          <li><strong>Explore:</strong> Click on any card to visit the repository on GitHub.</li>
        </ul>

        <h3>Data Management</h3>
        <p>
          You can export the current search results to a CSV file for further analysis or sharing.
        </p>
      </HelpDrawer>
    </Layout>
  );
}
