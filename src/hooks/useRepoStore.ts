import { useState, useEffect } from 'react';
import { SavedRepo } from '../types';

const STORAGE_KEY = 'gme_saved_repos';

export function useRepoStore() {
  const [repos, setRepos] = useState<SavedRepo[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRepos(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored repos', e);
      }
    }
  }, []);

  const addRepo = (repo: SavedRepo) => {
    const updated = [repo, ...repos];
    setRepos(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateRepo = (updatedRepo: SavedRepo) => {
    const updated = repos.map(r => r.id === updatedRepo.id ? updatedRepo : r);
    setRepos(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeRepo = (id: string) => {
    const updated = repos.filter(r => r.id !== id);
    setRepos(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getCategories = () => {
    const categories = new Set(repos.map(r => r.category).filter(Boolean));
    return Array.from(categories);
  };

  return { repos, addRepo, updateRepo, removeRepo, getCategories };
}
