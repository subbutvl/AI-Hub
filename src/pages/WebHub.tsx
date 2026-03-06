import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useWebHubStore } from '../hooks/useWebHubStore';
import {
  WebLink, LinkType, TYPE_META, detectLinkType, fetchLinkMeta,
  getDomain, linksToCSV, csvToLinks, getLinkTypeLabel,
} from '../types/webHub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Search, SortAsc, Filter, Download, Upload, Trash2,
  ExternalLink, Globe, Github, Play, Zap, Tv, ListVideo,
  FileText, Wrench, Loader2, X, RefreshCw, Link2,
  LayoutGrid, List, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

// ── Type icon mapping ─────────────────────────────────────────────────────────

function TypeIcon({ type, size = 'md' }: { type: LinkType; size?: 'sm' | 'md' }): React.ReactElement {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const icons: Record<LinkType, React.ReactElement> = {
    'youtube-video':    <Play className={sz} />,
    'youtube-short':    <Zap className={sz} />,
    'youtube-channel':  <Tv className={sz} />,
    'youtube-playlist': <ListVideo className={sz} />,
    'github-repo':      <Github className={sz} />,
    'webpage':          <Globe className={sz} />,
    'article':          <FileText className={sz} />,
    'tool':             <Wrench className={sz} />,
  };
  const meta = TYPE_META[type];
  return (
    <span className={`inline-flex items-center justify-center ${size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'} rounded-lg ${meta.bgColor} ${meta.textColor} flex-shrink-0`}>
      {icons[type]}
    </span>
  );
}

// ── Add / Edit Dialog ─────────────────────────────────────────────────────────

const ALL_TYPES: LinkType[] = [
  'youtube-video', 'youtube-short', 'youtube-channel', 'youtube-playlist',
  'github-repo', 'webpage', 'article', 'tool',
];

interface AddLinkDialogProps {
  existingCategories: string[];
  onSave: (link: WebLink) => void;
  linkToEdit?: WebLink;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function AddLinkDialog({ existingCategories, onSave, linkToEdit, trigger, open: controlledOpen, onOpenChange }: AddLinkDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const [url, setUrl] = useState(linkToEdit?.url ?? '');
  const [name, setName] = useState(linkToEdit?.name ?? '');
  const [type, setType] = useState<LinkType>(linkToEdit?.type ?? 'webpage');
  const [category, setCategory] = useState(linkToEdit?.category ?? '');
  const [newCategory, setNewCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(linkToEdit?.tags ?? []);
  const [description, setDescription] = useState(linkToEdit?.description ?? '');
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const handleOpen = (v: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(v);
    onOpenChange?.(v);
    if (!v) {
      setUrl(linkToEdit?.url ?? '');
      setName(linkToEdit?.name ?? '');
      setType(linkToEdit?.type ?? 'webpage');
      setCategory(linkToEdit?.category ?? '');
      setTags(linkToEdit?.tags ?? []);
      setDescription(linkToEdit?.description ?? '');
      setFetchError('');
    }
  };

  const handleURLChange = async (val: string) => {
    setUrl(val);
    if (!val.trim()) return;
    try {
      const detectedType = detectLinkType(val);
      setType(detectedType);
    } catch {}
  };

  const handleAutoFetch = async () => {
    if (!url.trim()) return;
    setFetching(true);
    setFetchError('');
    try {
      const detectedType = detectLinkType(url);
      setType(detectedType);
      const meta = await fetchLinkMeta(url, detectedType);
      setName(meta.name);
      if (meta.description) setDescription(meta.description);
    } catch (e) {
      setFetchError('Could not auto-fetch. Please fill in the name manually.');
    } finally {
      setFetching(false);
    }
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSave = () => {
    const finalCategory = category === '__new__' ? newCategory.trim() : category;
    if (!url.trim() || !name.trim()) return;
    const link: WebLink = {
      id: linkToEdit?.id ?? crypto.randomUUID(),
      url: url.trim(),
      name: name.trim(),
      type,
      category: finalCategory || 'General',
      tags,
      description: description.trim() || undefined,
      addedAt: linkToEdit?.addedAt ?? new Date().toISOString(),
    };
    onSave(link);
    handleOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      {trigger !== undefined ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : controlledOpen === undefined ? (
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Add Link
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{linkToEdit ? 'Edit Link' : 'Add New Link'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>URL <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://..."
                value={url}
                onChange={(e) => handleURLChange(e.target.value)}
                className="flex-1"
                onBlur={handleAutoFetch}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAutoFetch}
                disabled={fetching || !url.trim()}
                title="Auto-fetch name & type"
              >
                {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
            {fetchError && <p className="text-xs text-amber-600 dark:text-amber-400">{fetchError}</p>}
          </div>

          <div className="space-y-2">
            <Label>Name <span className="text-red-500">*</span></Label>
            <Input placeholder="Link title" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as LinkType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${TYPE_META[t].bgColor}`} />
                      {getLinkTypeLabel(t)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select or create category" />
              </SelectTrigger>
              <SelectContent>
                {existingCategories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
                <SelectItem value="__new__">+ Create new category</SelectItem>
              </SelectContent>
            </Select>
            {category === '__new__' && (
              <Input
                placeholder="New category name..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                autoFocus
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Tags (press Enter to add)</Label>
            <Input
              placeholder="e.g. ai, tutorial, tools..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                  >
                    {tag} &times;
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Input placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!url.trim() || !name.trim()}>
              {linkToEdit ? 'Save Changes' : 'Add Link'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Link Card ─────────────────────────────────────────────────────────────────

function LinkCard({ link, onDelete, onEdit }: { link: WebLink; onDelete: () => void; onEdit: () => void }) {
  const meta = TYPE_META[link.type];
  const domain = getDomain(link.url);

  return (
    <div className="group relative bg-white dark:bg-card border border-border rounded-xl p-3 flex flex-col gap-2 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-1">
        <TypeIcon type={link.type} />
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Edit"
          >
            <Link2 className="w-3 h-3" />
          </button>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Open link"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold text-foreground leading-tight line-clamp-2 hover:text-primary transition-colors"
        title={link.name}
      >
        {link.name}
      </a>

      <p className="text-[10px] text-muted-foreground truncate">{domain}</p>

      <Badge
        variant="outline"
        className={`text-[10px] px-1.5 py-0 h-4 w-fit font-normal ${meta.textColor} ${meta.borderColor}`}
      >
        {meta.label}
      </Badge>

      {link.category && (
        <p className="text-[10px] text-muted-foreground truncate">📁 {link.category}</p>
      )}

      {link.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {link.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {link.tags.length > 3 && (
            <span className="text-[9px] text-muted-foreground">+{link.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Link Table ────────────────────────────────────────────────────────────────

function LinkTable({ 
  links, 
  onDelete, 
  onEdit 
}: { 
  links: WebLink[]; 
  onDelete: (id: string, name: string) => void; 
  onEdit: (link: WebLink) => void 
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white dark:bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold text-muted-foreground w-12 text-center">Type</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Name</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Category</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Tags</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {links.map((link) => {
              const meta = TYPE_META[link.type];
              return (
                <tr key={link.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3 text-center">
                    <TypeIcon type={link.type} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col max-w-md">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary transition-colors line-clamp-1"
                      >
                        {link.name}
                      </a>
                      <span className="text-[10px] text-muted-foreground truncate">{getDomain(link.url)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {link.category && (
                      <Badge variant="outline" className={`font-normal text-[10px] py-0 h-5 border-border`}>
                        {link.category}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {link.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-border/50">
                          {t}
                        </span>
                      ))}
                      {link.tags.length > 2 && <span className="text-[9px] text-muted-foreground">+{link.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(link)}>
                        <Link2 className="w-3.5 h-3.5" />
                      </Button>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(link.id, link.name)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc',  label: 'Oldest First' },
  { value: 'name-asc',  label: 'Name A→Z' },
  { value: 'name-desc', label: 'Name Z→A' },
];

export default function WebHub() {
  const { links, addLink, updateLink, deleteLink, importLinks, getCategories } = useWebHubStore();
  const { settings, updateSettings } = useSettings();
  const categories = getCategories();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sort, setSort] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [editLink, setEditLink] = useState<WebLink | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, filterCategory, sort]);

  const filtered = useMemo(() => {
    // Sanitize any broken tags from localStorage
    const safeLinks = links.map(l => ({
      ...l,
      tags: Array.isArray(l.tags) ? l.tags : String(l.tags || "").split(/[,;]/).map(t => t.trim()).filter(Boolean)
    }));
    let result = [...safeLinks];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)) ||
          l.category.toLowerCase().includes(q)
      );
    }

    if (filterType !== 'all') result = result.filter((l) => l.type === filterType);
    if (filterCategory !== 'all') result = result.filter((l) => l.category === filterCategory);

    result.sort((a, b) => {
      if (sort === 'date-desc') return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      if (sort === 'date-asc')  return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      if (sort === 'name-asc')  return a.name.localeCompare(b.name);
      if (sort === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

    return result;
  }, [links, search, filterType, filterCategory, sort]);

  // Pagination logic
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedLinks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleExport = () => {
    const csv = linksToCSV(links);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `web-hub-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = csvToLinks(text);
      if (parsed.length === 0) { alert('No valid links found in CSV.'); return; }
      importLinks(parsed);
      alert(`Imported ${parsed.length} link(s).`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    links.forEach((l) => { counts[l.type] = (counts[l.type] ?? 0) + 1; });
    return counts;
  }, [links]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Web Hub</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Save and organise websites, YouTube videos, GitHub repos and more.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={importRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImport}
            />
            <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1.5" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={links.length === 0}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            <AddLinkDialog
              existingCategories={categories}
              onSave={(link) => addLink(link)}
            />
          </div>
        </div>

        {links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                filterType === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30'
              }`}
            >
              All ({links.length})
            </button>
            {Object.entries(typeCounts).map(([t, count]) => {
              const meta = TYPE_META[t as LinkType];
              return (
                <button
                  key={t}
                  onClick={() => setFilterType(t === filterType ? 'all' : t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                    filterType === t
                      ? `${meta.bgColor} ${meta.textColor} ${meta.borderColor}`
                      : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30'
                  }`}
                >
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, URL, tag, category..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/50 border border-border rounded-lg p-1">
              <button
                onClick={() => updateSettings({ webHubLayout: 'grid' })}
                className={`p-1.5 rounded-md transition-all ${settings.webHubLayout === 'grid' ? 'bg-white dark:bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateSettings({ webHubLayout: 'table' })}
                className={`p-1.5 rounded-md transition-all ${settings.webHubLayout === 'table' ? 'bg-white dark:bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-44">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40">
                <SortAsc className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count & Pagination Info */}
        <div className="flex items-center justify-between">
          {links.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Showing {Math.min(totalItems, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(totalItems, currentPage * ITEMS_PER_PAGE)} of {totalItems} record{totalItems !== 1 ? 's' : ''}
              {(search || filterType !== 'all' || filterCategory !== 'all') && (
                <button
                  className="ml-2 underline hover:text-foreground"
                  onClick={() => { setSearch(''); setFilterType('all'); setFilterCategory('all'); }}
                >
                  Clear filters
                </button>
              )}
            </p>
          )}
          
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-2">Page {currentPage} of {totalPages}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Data Display */}
        {totalItems > 0 ? (
          settings.webHubLayout === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {paginatedLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onDelete={() => { if (window.confirm(`Delete "${link.name}"?`)) deleteLink(link.id); }}
                  onEdit={() => { setEditLink(link); setEditOpen(true); }}
                />
              ))}
            </div>
          ) : (
            <LinkTable 
              links={paginatedLinks}
              onEdit={(link) => { setEditLink(link); setEditOpen(true); }}
              onDelete={(id, name) => { if (window.confirm(`Delete "${name}"?`)) deleteLink(id); }}
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-muted-foreground opacity-40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {links.length === 0 ? 'No links saved yet' : 'No links match your filters'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs">
              {links.length === 0
                ? 'Click "Add Link" to save your first web link, YouTube video, or GitHub repo.'
                : 'Try adjusting your search or filters.'}
            </p>
            {links.length === 0 && (
              <AddLinkDialog existingCategories={categories} onSave={(link) => addLink(link)} />
            )}
          </div>
        )}

        {/* Bottom Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-border mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                    currentPage === page 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {editLink && (
          <AddLinkDialog
            key={editLink.id}
            existingCategories={categories}
            onSave={(link) => { updateLink(link); setEditLink(undefined); setEditOpen(false); }}
            linkToEdit={editLink}
            open={editOpen}
            onOpenChange={(v) => { if (!v) { setEditLink(undefined); setEditOpen(false); } }}
          />
        )}
      </div>
    </Layout>
  );
}
