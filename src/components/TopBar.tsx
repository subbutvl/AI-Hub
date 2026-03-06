import { useState } from 'react';
import { Search, Github, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopBarProps {
  onLoadRepo: (url: string, recursive: boolean) => void;
  loading: boolean;
  repoInfo: { owner: string; repo: string } | null;
}

export function TopBar({ onLoadRepo, loading, repoInfo }: TopBarProps) {
  const [url, setUrl] = useState('');
  const [recursive, setRecursive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onLoadRepo(url, recursive);
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <Github className="w-6 h-6" />
          <span className="hidden sm:inline">AI Repo Hub</span>
          <span className="sm:hidden">AI Repo Hub</span>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm transition-colors"
              placeholder="Paste GitHub repository URL (e.g. facebook/react)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none hover:text-black transition-colors">
              <input
                type="checkbox"
                checked={recursive}
                onChange={(e) => setRecursive(e.target.checked)}
                className="rounded border-gray-300 text-black focus:ring-gray-500"
              />
              <span className="hidden sm:inline">Recursive</span>
            </label>
            
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className={cn(
                "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                loading && "cursor-wait"
              )}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Load <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
