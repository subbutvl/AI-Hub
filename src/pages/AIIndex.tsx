import { useState, useEffect, useMemo } from "react";
import { fetchLocationsForRepos } from "../services/githubService";
import { gitHubQueryEngine } from "../services/githubQueryEngine";
import { AIRepository, AIIndexFilter } from "../types/ai-index";
import { FilterPanel } from "../components/ai-index/FilterPanel";
import { RepoTable } from "../components/ai-index/RepoTable";
import { Layout } from "../components/Layout";
import { CsvControls } from "../components/CsvControls";
import { HelpDrawer } from "../components/HelpDrawer";
import { HelpButton } from "../components/HelpButton";

export default function AIIndex() {
  const [repos, setRepos] = useState<AIRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [filter, setFilter] = useState<AIIndexFilter>({
    search: "",
    category: "",
    language: "",
    minStars: 0,
    country: "",
  });

  const loadData = async (forceRefresh = false) => {
    setRefreshing(true);
    if (forceRefresh) {
      setLoading(true);
      gitHubQueryEngine.clearCache();
    }

    setProgressMessage("Initializing GitHub engine...");
    
    gitHubQueryEngine.setProgressCallback((msg, count) => {
      setProgressMessage(`${msg} (${count} repos)`);
    });

    try {
      const data = await gitHubQueryEngine.run();
      setRepos(data);
      setLoading(false);

      // Fetch locations in background
      fetchLocationsForRepos(data, (repoId, location) => {
        setRepos(prev => prev.map(r => 
          r.id === repoId ? { ...r, ...location } : r
        ));
      });
      
    } catch (error) {
      console.error("Failed to load AI repos", error);
      setLoading(false);
    } finally {
      setRefreshing(false);
      setProgressMessage("");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleImport = (importedData: AIRepository[]) => {
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

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      const matchesSearch = 
        repo.repo_name.toLowerCase().includes(filter.search.toLowerCase()) ||
        repo.description.toLowerCase().includes(filter.search.toLowerCase()) ||
        repo.owner_name.toLowerCase().includes(filter.search.toLowerCase());
      
      const matchesCategory = filter.category ? repo.ai_category === filter.category : true;
      const matchesLanguage = filter.language ? repo.language === filter.language : true;
      const matchesStars = repo.stars >= filter.minStars;
      const matchesCountry = filter.country ? repo.country === filter.country : true;

      return matchesSearch && matchesCategory && matchesLanguage && matchesStars && matchesCountry;
    });
  }, [repos, filter]);

  const uniqueLanguages = useMemo(() => 
    Array.from(new Set(repos.map(r => r.language).filter(Boolean))).sort(),
    [repos]
  );

  const uniqueCountries = useMemo(() => 
    Array.from(new Set(repos.map(r => r.country).filter(Boolean) as string[])).sort(),
    [repos]
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">AI Index</h1>
            <p className="text-muted-foreground mt-2">
              Explore the open source AI ecosystem. Automatically indexed from GitHub.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CsvControls 
              data={filteredRepos} 
              filename="ai-index.csv" 
              onImport={handleImport} 
            />
            <HelpButton onClick={() => setIsHelpOpen(true)} />
          </div>
        </div>

        <FilterPanel
          filter={filter}
          setFilter={setFilter}
          onRefresh={() => loadData(true)}
          isRefreshing={refreshing}
          progressMessage={progressMessage}
          uniqueLanguages={uniqueLanguages}
          uniqueCountries={uniqueCountries}
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <RepoTable data={filteredRepos} />
        )}
      </div>

      <HelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="About AI Index"
      >
        <p className="lead">
          The AI Index is a comprehensive directory of open-source AI repositories on GitHub, automatically indexed and categorized.
        </p>
        
        <h3>What is this page?</h3>
        <p>
          This page lists popular AI repositories, showing their stars, language, and country of origin (inferred from the owner's profile).
        </p>

        <h3>How to use</h3>
        <ul>
          <li><strong>Search:</strong> Use the search bar to find repositories by name, description, or owner.</li>
          <li><strong>Filter:</strong> Use the dropdowns to filter by programming language or country.</li>
          <li><strong>Sort:</strong> Click on column headers to sort the table.</li>
          <li><strong>Refresh:</strong> Click the refresh icon in the filter panel to fetch the latest data from GitHub.</li>
        </ul>

        <h3>Data Management</h3>
        <p>
          You can export the current view to a CSV file or import a previously exported CSV to view offline data.
        </p>
      </HelpDrawer>
    </Layout>
  );
}
