import { SavedRepo } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, Eye, Github, Trash2, Edit2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { AddRepoModal } from './AddRepoModal';

interface RepoCardProps {
  repo: SavedRepo;
  onRemove: (id: string) => void;
  onUpdate: (repo: SavedRepo) => void;
  existingCategories: string[];
}

export function RepoCard({ repo, onRemove, onUpdate, existingCategories }: RepoCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/repo/${repo.owner}/${repo.repo}?recursive=${repo.recursive}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group relative flex flex-col h-full dark:bg-card dark:border-border" onClick={handleCardClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
              {repo.name}
              {repo.name !== repo.repo && <span className="text-xs text-muted-foreground font-normal">({repo.owner}/{repo.repo})</span>}
            </CardTitle>
            <CardDescription className="line-clamp-2 min-h-[2.5em] text-muted-foreground">
              {repo.info?.description || 'No description available'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="dark:border-border dark:text-foreground">{repo.category}</Badge>
          {repo.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs dark:bg-secondary dark:text-secondary-foreground">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t border-border bg-gray-50/50 dark:bg-muted/30 flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {repo.info?.stars?.toLocaleString()}</span>
          <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {repo.info?.forks?.toLocaleString()}</span>
          {repo.info?.watchers !== undefined && (
             <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {repo.info?.watchers?.toLocaleString()}</span>
          )}
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <a 
            href={repo.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-200 dark:hover:bg-muted rounded-full transition-colors text-foreground"
            title="View on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          
          <AddRepoModal 
            onAdd={onUpdate} 
            existingCategories={existingCategories} 
            repoToEdit={repo}
            trigger={
              <button 
                className="p-2 hover:bg-gray-200 dark:hover:bg-muted rounded-full transition-colors text-foreground"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            }
          />

          <button 
            onClick={() => onRemove(repo.id)}
            className="p-2 hover:bg-red-100 text-muted-foreground hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-full transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
