import { useState, useMemo } from 'react';
import { useRepoStore } from '../hooks/useRepoStore';
import { AddRepoModal } from '../components/AddRepoModal';
import { RepoCard } from '../components/RepoCard';
import { Github } from 'lucide-react';
import { Layout } from '../components/Layout';
import { CsvControls } from '../components/CsvControls';
import { HelpDrawer } from '../components/HelpDrawer';
import { HelpButton } from '../components/HelpButton';
import { SavedRepo } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function MyRepos() {
  const { repos, addRepo, updateRepo, removeRepo, importRepos, getCategories } = useRepoStore();
  const categories = getCategories();
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'stars' | 'forks'>('date');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const sortedRepos = useMemo(() => {
    return [...repos].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'stars':
          return (b.info?.stars || 0) - (a.info?.stars || 0);
        case 'forks':
          return (b.info?.forks || 0) - (a.info?.forks || 0);
        default:
          return 0;
      }
    });
  }, [repos, sortBy]);

  const handleImport = (importedData: SavedRepo[]) => {
    importRepos(importedData);
    alert(`Import process complete. Added ${importedData.length} repositories.`);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">My Repositories</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto flex-wrap">
          <CsvControls 
            data={repos} 
            filename="my-dashboard-repos.csv" 
            onImport={handleImport} 
          />
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date Added</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="stars">Stars</SelectItem>
              <SelectItem value="forks">Forks</SelectItem>
            </SelectContent>
          </Select>
          <AddRepoModal onAdd={addRepo} existingCategories={categories} />
          <HelpButton onClick={() => setIsHelpOpen(true)} />
        </div>
      </div>

      {repos.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-white dark:bg-card p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-border inline-block max-w-md">
            <Github className="w-12 h-12 mx-auto text-gray-300 dark:text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-2">No repositories added yet</h2>
            <p className="text-gray-500 dark:text-muted-foreground mb-6">Add a GitHub repository to start exploring its documentation.</p>
            <AddRepoModal onAdd={addRepo} existingCategories={categories} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRepos.map((repo) => (
            <RepoCard 
              key={repo.id} 
              repo={repo} 
              onRemove={removeRepo} 
              onUpdate={updateRepo}
              existingCategories={categories}
            />
          ))}
        </div>
      )}

      <HelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="About My Repos"
      >
        <p className="lead">
          My Repos is your personal workspace for managing and exploring GitHub repositories.
        </p>
        
        <h3>What is this page?</h3>
        <p>
          This page displays all the repositories you have added to your collection. You can manage them, categorize them, and quickly access their details.
        </p>

        <h3>How to use</h3>
        <ul>
          <li><strong>Add Repository:</strong> Click the "Add Repository" button to add a new repo by its URL (e.g., <code>facebook/react</code>).</li>
          <li><strong>Sort:</strong> Use the dropdown menu to sort your repositories by name, date added, stars, or forks.</li>
          <li><strong>Manage:</strong> Each card allows you to update the repository's category or remove it from your dashboard.</li>
          <li><strong>Explore:</strong> Click on a repository card to view its file structure and details.</li>
        </ul>

        <h3>Data Management</h3>
        <p>
          You can export your collection of repositories to a CSV file to backup your data or share it with others. You can also import a previously exported CSV file.
        </p>
      </HelpDrawer>
    </Layout>
  );
}
