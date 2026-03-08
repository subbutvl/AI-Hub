import { useState, useEffect } from 'react';
import { SavedRepo } from '../types';
import { dbManager } from '../db';
import { repos as reposSchema } from '../db/schema';
import { eq } from 'drizzle-orm';

export function useRepoStore() {
  const [repos, setRepos] = useState<SavedRepo[]>([]);

  useEffect(() => {
    if (!dbManager.isInitialized) return;

    try {
      const existing = dbManager.db.select().from(reposSchema).all() as unknown as SavedRepo[];
      // Ordering by recency implicitly handled by JS unshift in old code, we'll keep the UI state order
      setRepos(existing.reverse()); 
    } catch (e) {
      console.error('Failed to query repos', e);
    }
  }, [dbManager.isInitialized]);

  const addRepo = (repo: SavedRepo) => {
    try {
      dbManager.db.insert(reposSchema).values(repo).run();
      dbManager.save();
      setRepos([repo, ...repos]);
    } catch(e) {
      console.error("Failed to add repo", e);
    }
  };

  const updateRepo = (updatedRepo: SavedRepo) => {
    try {
      dbManager.db.update(reposSchema)
        .set(updatedRepo)
        .where(eq(reposSchema.id, updatedRepo.id))
        .run();
      dbManager.save();
      
      const updated = repos.map(r => r.id === updatedRepo.id ? updatedRepo : r);
      setRepos(updated);
    } catch(e) {
      console.error("Failed to update repo", e);
    }
  };

  const removeRepo = (id: string) => {
    try {
      dbManager.db.delete(reposSchema)
        .where(eq(reposSchema.id, id))
        .run();
      dbManager.save();

      const updated = repos.filter(r => r.id !== id);
      setRepos(updated);
    } catch(e) {
      console.error("Failed to remove repo", e);
    }
  };

  const importRepos = (reposToImport: SavedRepo[]) => {
    setRepos(prevRepos => {
      const newRepos = [...prevRepos];
      
      reposToImport.forEach(repo => {
        if (!repo.id || !repo.owner || !repo.name) return;
        
        const existingIndex = newRepos.findIndex(r => r.id === repo.id);
        if (existingIndex >= 0) {
           // Update DB
           dbManager.db.update(reposSchema).set(repo).where(eq(reposSchema.id, repo.id)).run();
           newRepos[existingIndex] = repo;
        } else {
           // Insert DB
           dbManager.db.insert(reposSchema).values(repo).run();
           newRepos.unshift(repo);
        }
      });
      
      dbManager.save();
      return newRepos;
    });
  };

  const getCategories = () => {
    const categories = new Set(repos.map(r => r.category).filter(Boolean));
    return Array.from(categories);
  };

  return { repos, addRepo, updateRepo, removeRepo, importRepos, getCategories };
}
