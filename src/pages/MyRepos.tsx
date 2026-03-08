import { useState, useMemo } from 'react';
import { useRepoStore } from '../hooks/useRepoStore';
import { AddRepoModal } from '../components/AddRepoModal';
import { RepoCard } from '../components/RepoCard';
import { Github, Search, LayoutGrid, List, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function MyRepos() {
  const { repos, addRepo, updateRepo, removeRepo, importRepos, getCategories } = useRepoStore();
  const categories = getCategories();
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'stars' | 'forks'>('date');
  const [layout, setLayout] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const rowsPerPage = 20;

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    repos.forEach(r => {
      const rTags = Array.isArray(r.tags) ? r.tags : String(r.tags || "").split(/[,;]/).map(t => t.trim()).filter(Boolean);
      rTags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [repos]);

  const filteredAndSortedRepos = useMemo(() => {
    // Sanitize any broken tags from localStorage
    let safeRepos = repos.map(r => ({
      ...r,
      tags: Array.isArray(r.tags) ? r.tags : String(r.tags || "").split(/[,;]/).map(t => t.trim()).filter(Boolean)
    }));
    
    // Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      safeRepos = safeRepos.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.owner.toLowerCase().includes(q) ||
        (r.info?.description || '').toLowerCase().includes(q)
      );
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      safeRepos = safeRepos.filter(r => r.category === selectedCategory);
    }
    
    if (selectedTag && selectedTag !== 'all') {
      safeRepos = safeRepos.filter(r => r.tags.includes(selectedTag));
    }

    // Sort
    return safeRepos.sort((a, b) => {
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
  }, [repos, sortBy, searchQuery, selectedCategory, selectedTag]);

  // Reset pagination if filters change and we are out of bounds
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRepos.length / rowsPerPage));
  if (currentPage > totalPages) {
    setCurrentPage(1);
  }

  const paginatedRepos = useMemo(() => {
    if (layout === 'grid') return filteredAndSortedRepos;
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedRepos.slice(start, start + rowsPerPage);
  }, [filteredAndSortedRepos, layout, currentPage]);

  const handleImport = (importedData: SavedRepo[]) => {
    importRepos(importedData);
    alert(`Import process complete. Added ${importedData.length} repositories.`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag('all');
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">My Repositories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filteredAndSortedRepos.length} {filteredAndSortedRepos.length === 1 ? 'repository' : 'repositories'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <CsvControls 
            data={repos} 
            filename="my-dashboard-repos.csv" 
            onImport={handleImport} 
          />
          <AddRepoModal onAdd={addRepo} existingCategories={categories} />
          <HelpButton onClick={() => setIsHelpOpen(true)} />
        </div>
      </div>
      
      {/* Filters Bar */}
      <div className="bg-white dark:bg-card p-4 rounded-xl border border-gray-200 dark:border-border shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search repos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-50 dark:bg-muted/50"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[160px] bg-gray-50 dark:bg-muted/50">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full md:w-[160px] bg-gray-50 dark:bg-muted/50">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full md:w-[150px] bg-gray-50 dark:bg-muted/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date Added</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="stars">Stars</SelectItem>
              <SelectItem value="forks">Forks</SelectItem>
            </SelectContent>
          </Select>
          
          {(searchQuery || selectedCategory !== 'all' || selectedTag !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              Clear Filters
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-muted p-1 rounded-lg">
          <Button 
            variant={layout === 'grid' ? "outline" : "ghost"} 
            size="icon" 
            className={`h-8 w-8 ${layout === 'grid' ? 'shadow-sm' : ''}`}
            onClick={() => setLayout('grid')}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button 
            variant={layout === 'table' ? "outline" : "ghost"} 
            size="icon" 
            className={`h-8 w-8 ${layout === 'table' ? 'shadow-sm' : ''}`}
            onClick={() => setLayout('table')}
            title="Table View (Paginated)"
          >
            <List className="w-4 h-4" />
          </Button>
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
      ) : filteredAndSortedRepos.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-card border border-border rounded-2xl shadow-sm">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-medium text-foreground mb-2">No results found</h2>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
          <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
        </div>
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRepos.map((repo) => (
            <RepoCard 
              key={repo.id} 
              repo={repo} 
              onRemove={removeRepo} 
              onUpdate={updateRepo}
              existingCategories={categories}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Repository</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Category</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Tags</th>
                  <th className="px-5 py-3 font-medium text-right">Stars</th>
                  <th className="px-5 py-3 font-medium text-right hidden lg:table-cell">Forks</th>
                  <th className="px-5 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedRepos.map(repo => (
                  <tr key={repo.id} className="hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Github className="w-5 h-5 text-gray-400" />
                        <div>
                          <a href={repo.url} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                            {repo.owner} / {repo.name} <ExternalLink className="w-3 h-3 opacity-50" />
                          </a>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px] block" title={repo.info?.description}>
                            {repo.info?.description || 'No description'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {repo.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell max-w-[200px] truncate">
                      <div className="flex items-center gap-1 overflow-hidden">
                        {repo.tags && repo.tags.length > 0 ? repo.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {tag}
                          </span>
                        )) : <span className="text-xs text-muted-foreground opacity-50">-</span>}
                        {repo.tags && repo.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{repo.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {repo.info?.stars?.toLocaleString() || 0}
                    </td>
                    <td className="px-5 py-4 text-right hidden lg:table-cell">
                      {repo.info?.forks?.toLocaleString() || 0}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`#/repo/${repo.id}`}>View Details</a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-gray-50 dark:bg-muted/10">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{((currentPage - 1) * rowsPerPage) + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * rowsPerPage, filteredAndSortedRepos.length)}</span> of <span className="font-medium text-foreground">{filteredAndSortedRepos.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <div className="text-sm font-medium px-2">
                  Page {currentPage} of {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
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
          <li><strong>Search & Filter:</strong> Finding repos is easy. Use the search box or filter dropdowns by tags and categories.</li>
          <li><strong>Add Repository:</strong> Click the "Add Repository" button to add a new repo by its URL (e.g., <code>facebook/react</code>).</li>
          <li><strong>Sort:</strong> Use the dropdown menu to sort your repositories by name, date added, stars, or forks.</li>
          <li><strong>Manage:</strong> Each card allows you to update the repository's category or remove it from your dashboard.</li>
          <li><strong>Explore:</strong> Click on a repository card or table row "View" to view its file structure and details.</li>
        </ul>

        <h3>Data Management</h3>
        <p>
          You can export your collection of repositories to a CSV file to backup your data or share it with others. You can also import a previously exported CSV file.
        </p>
      </HelpDrawer>
    </Layout>
  );
}
