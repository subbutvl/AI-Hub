import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { usePodcastStore, PodcastFeed } from '../hooks/usePodcastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet';
import {
  Headphones, Plus, Trash2, ExternalLink, Loader2, RefreshCw, Calendar
} from 'lucide-react';

interface PodcastItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
}

interface PodcastResponse {
  status: string;
  feed: {
    url: string;
    title: string;
    link: string;
    author: string;
    description: string;
    image: string;
  };
  items: PodcastItem[];
}

export default function Podcasts() {
  const { podcasts, addPodcast, deletePodcast, lastViewedMap, markAsViewed } = usePodcastStore();

  const [addOpen, setAddOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Track latest episodes for badges
  const [latestEps, setLatestEps] = useState<Record<string, { latestPubDate: string, hasNew: boolean, link: string }>>({});
  const [checking, setChecking] = useState(false);

  // Side Drawer State
  const [activePodcast, setActivePodcast] = useState<PodcastFeed | null>(null);
  const [feedData, setFeedData] = useState<PodcastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Initial Badge Check
  useEffect(() => {
    if (podcasts.length === 0) return;
    
    let isMounted = true;
    const checkFeeds = async () => {
      setChecking(true);
      try {
        const results = await Promise.allSettled(
          podcasts.map(async p => {
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(p.url)}`);
            const data = await res.json();
            if (data.status === 'ok' && data.items?.length > 0) {
               const latestPubDate = data.items[0].pubDate;
               const link = data.feed.link || p.url;
               const lastViewed = lastViewedMap[p.id];
               
               let isNew = false;
               if (!lastViewed) {
                 isNew = true;
               } else {
                 const newTime = new Date(latestPubDate).getTime();
                 const oldTime = new Date(lastViewed).getTime();
                 if (!isNaN(newTime) && !isNaN(oldTime)) {
                   isNew = newTime > oldTime;
                 }
               }
               
               return { id: p.id, latestPubDate, hasNew: isNew, link };
            }
            throw new Error('invalid feed');
          })
        );
        
        if (!isMounted) return;

        const newMap: Record<string, { latestPubDate: string, hasNew: boolean, link: string }> = {};
        results.forEach(r => {
          if (r.status === 'fulfilled') {
            newMap[r.value.id] = r.value;
          }
        });
        setLatestEps(newMap);
      } finally {
        if (isMounted) setChecking(false);
      }
    };
    checkFeeds();

    return () => { isMounted = false; };
  }, [podcasts, lastViewedMap]);

  // 2. Fetch specific podcast detail when Side Drawer opens
  useEffect(() => {
    if (activePodcast) {
      fetchPodcast(activePodcast.url);
      
      // Clear the 'new' badge immediately by marking as viewed
      const meta = latestEps[activePodcast.id];
      if (meta && meta.latestPubDate) {
        markAsViewed(activePodcast.id, meta.latestPubDate);
      }
    }
  }, [activePodcast]);

  const fetchPodcast = async (url: string) => {
    setLoading(true);
    setError('');
    setFeedData(null);
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.status === 'ok') {
        setFeedData(data);
      } else {
        setError('Failed to load this podcast. It might be invalid or unsupported.');
      }
    } catch (err) {
      setError('An error occurred while fetching the podcast feed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPodcast = () => {
    if (!newUrl.trim() || !newName.trim()) return;
    const feed: PodcastFeed = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      url: newUrl.trim(),
      description: newDesc.trim() || undefined,
      addedAt: new Date().toISOString()
    };
    addPodcast(feed);
    setAddOpen(false);
    setNewUrl('');
    setNewName('');
    setNewDesc('');
  };

  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Headphones className="w-8 h-8 text-fuchsia-500" /> Podcasts
              {checking && <span title="Checking for new episodes..."><Loader2 className="w-4 h-4 ml-2 animate-spin text-muted-foreground" /></span>}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Bookmark and track episodes for your favorite AI podcasts.
            </p>
          </div>
          <div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Add Podcast
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Podcast Feed</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>RSS Feed URL *</Label>
                    <Input 
                      placeholder="https://example.com/feed.xml" 
                      value={newUrl} 
                      onChange={e => setNewUrl(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input 
                      placeholder="e.g. Latent Space" 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Input 
                      placeholder="Brief description..." 
                      value={newDesc} 
                      onChange={e => setNewDesc(e.target.value)} 
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleAddPodcast} disabled={!newUrl.trim() || !newName.trim()}>
                      Save Podcast
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {podcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl border-dashed">
             <Headphones className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
             <p className="text-muted-foreground">No podcasts added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {podcasts.map((pod) => {
              const meta = latestEps[pod.id];
              return (
                <div
                  key={pod.id}
                  onClick={() => setActivePodcast(pod)}
                  className="group relative bg-white dark:bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Headphones className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <h3 className="font-semibold text-foreground line-clamp-1 flex items-center gap-1.5">
                          {pod.name}
                          {meta?.hasNew && (
                            <Badge className="h-5 px-1.5 text-[10px] bg-blue-500 hover:bg-blue-600 text-white rounded-md">New</Badge>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={pod.url}>
                          {pod.url}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {pod.description && (
                    <p className="text-sm text-foreground/80 line-clamp-2">{pod.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <a
                      href={meta?.link || pod.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors -ml-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      Source
                    </a>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${pod.name}"?`)) {
                          deletePodcast(pod.id);
                        }
                      }}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Podcast"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Sheet open={!!activePodcast} onOpenChange={(v) => !v && setActivePodcast(null)}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto flex flex-col p-4 sm:p-6" style={{maxWidth: "700px"}}>
          {activePodcast && (
            <>
              <SheetHeader className="mb-6 shrink-0 text-left border-b border-border pb-4">
                <SheetTitle className="text-2xl font-bold flex items-center gap-2 mt-4">
                  <Headphones className="w-6 h-6 text-primary" />
                  {feedData?.feed.title || activePodcast.name}
                </SheetTitle>
                <SheetDescription>
                  {feedData?.feed.description ? decodeHtml(feedData.feed.description) : activePodcast.description}
                </SheetDescription>
                <a href={feedData?.feed.link || activePodcast.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-4 w-fit px-3 py-1.5 bg-primary/10 rounded-md font-medium">
                  Listen on External Source <ExternalLink className="w-3 h-3" />
                </a>
              </SheetHeader>

              <div className="flex-1 space-y-6 min-h-0 relative">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p>Loading episodes...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 text-destructive space-y-4 text-center px-4">
                    <RefreshCw className="w-8 h-8 opacity-50" />
                    <p>{error}</p>
                    <Button variant="outline" onClick={() => fetchPodcast(activePodcast.url)}>Try Again</Button>
                  </div>
                ) : feedData?.items?.length ? (
                  <div className="space-y-6">
                    {feedData.items.map((item, i) => {
                      const date = new Date(item.pubDate);
                      const dateStr = !isNaN(date.getTime()) 
                        ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                        : item.pubDate;

                      return (
                        <div key={item.guid || i} className="border-b border-border pb-6 last:border-0 relative">
                          <h3 className="text-lg font-semibold leading-tight hover:text-primary transition-colors mb-2 pr-24">
                             {item.title}
                          </h3>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            {dateStr && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {dateStr}
                              </span>
                            )}
                          </div>
                          
                          <div 
                            className="text-sm text-foreground/80 line-clamp-3 prose dark:prose-invert prose-sm max-w-none mb-1"
                            dangerouslySetInnerHTML={{ __html: item.description || item.content || '' }} 
                          />
                          
                          <div className="mt-2 text-right absolute top-0 right-0">
                             {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 bg-muted/60 px-2 py-1 rounded-md">
                                  Go to Episode <ExternalLink className="w-3 h-3" />
                                </a>
                             )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">No episodes found in this feed.</p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
