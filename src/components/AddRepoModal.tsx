import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Edit2 } from 'lucide-react';
import { fetchRepoInfo } from '../services/github';
import { SavedRepo } from '../types';
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AddRepoModalProps {
  onAdd: (repo: SavedRepo) => void;
  existingCategories: string[];
  repoToEdit?: SavedRepo;
  trigger?: React.ReactNode;
}

export function AddRepoModal({ onAdd, existingCategories, repoToEdit, trigger }: AddRepoModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [name, setName] = useState(''); // Custom name
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [recursive, setRecursive] = useState(false);
  const [error, setError] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (open && repoToEdit) {
      setUrl(repoToEdit.url);
      setName(repoToEdit.name);
      setCategory(repoToEdit.category);
      setTags(repoToEdit.tags);
      setRecursive(repoToEdit.recursive);
    } else if (open && !repoToEdit) {
      resetForm();
    }
  }, [open, repoToEdit]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Parse URL
      const cleanUrl = url.replace(/\/$/, '');
      let owner = '';
      let repoName = '';

      if (cleanUrl.includes('github.com')) {
        const parts = cleanUrl.split('github.com/')[1].split('/');
        owner = parts[0];
        repoName = parts[1];
      } else {
        const parts = cleanUrl.split('/');
        if (parts.length === 2) {
          owner = parts[0];
          repoName = parts[1];
        } else {
          throw new Error('Invalid GitHub URL format (use owner/repo)');
        }
      }

      // Fetch info to verify and get stats
      const info = await fetchRepoInfo(owner, repoName);

      const newRepo: SavedRepo = {
        id: repoToEdit ? repoToEdit.id : crypto.randomUUID(),
        url: `https://github.com/${owner}/${repoName}`,
        name: name || info.repo, // Use custom name or repo name
        owner,
        repo: repoName,
        category: category || 'Uncategorized',
        tags,
        recursive,
        info,
        createdAt: repoToEdit ? repoToEdit.createdAt : Date.now(),
      };

      onAdd(newRepo);
      setOpen(false);
      if (!repoToEdit) resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to add repository');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setName('');
    setCategory('');
    setTags([]);
    setTagInput('');
    setRecursive(false);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Repository
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{repoToEdit ? 'Edit Repository' : 'Add Repository'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="url">GitHub URL or owner/repo</Label>
            <Input 
              id="url" 
              placeholder="facebook/react" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name (Optional)</Label>
            <Input 
              id="name" 
              placeholder="React Source" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>Category</Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={categoryOpen}
                  className="justify-between font-normal"
                >
                  {category || "Select or create category..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search category..." />
                  <CommandList>
                    <CommandEmpty>
                      <button 
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm"
                        onClick={() => {
                          setCategory(category); // This logic is tricky with Command, usually we type in input
                          // Simplified: Just use a text input for category creation if complex
                        }}
                      >
                        Type to create new
                      </button>
                    </CommandEmpty>
                    <CommandGroup>
                      {existingCategories.map((cat) => (
                        <CommandItem
                          key={cat}
                          value={cat}
                          onSelect={(currentValue) => {
                            setCategory(currentValue);
                            setCategoryOpen(false);
                          }}
                        >
                          {cat}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* Fallback input for custom category if popover is too complex for this context */}
            <Input 
              placeholder="Or type new category name" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="mt-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags (Press Enter)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
                </Badge>
              ))}
            </div>
            <Input 
              placeholder="Add tag..." 
              value={tagInput} 
              onChange={(e) => setTagInput(e.target.value)} 
              onKeyDown={handleAddTag} 
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recursive"
              checked={recursive}
              onChange={(e) => setRecursive(e.target.checked)}
              className="rounded border-gray-300 text-black focus:ring-gray-500"
            />
            <Label htmlFor="recursive" className="cursor-pointer">Recursive Search (Include all subfolders)</Label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {repoToEdit ? 'Save Changes' : 'Add Repo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
