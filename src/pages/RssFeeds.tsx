import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useRssStore, RssFeed } from '../hooks/useRssStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Rss, Plus, Trash2, ExternalLink, Loader2, RefreshCw, Calendar
} from 'lucide-react';

interface RssItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
}

interface RssResponse {
  status: string;
  feed: {
    url: string;
    title: string;
    link: string;
    author: string;
    description: string;
    image: string;
  };
  items: RssItem[];
}

export default function RssFeeds() {
  const { feeds, addFeed, deleteFeed, updateFeed } = useRssStore();
  const [activeFeedId, setActiveFeedId] = useState<string | null>(feeds[0]?.id || null);
  const [feedData, setFeedData] = useState<RssResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // No active article needed, we just open link directly

  const activeFeed = feeds.find(f => f.id === activeFeedId);

  useEffect(() => {
    if (!feeds.length) {
      setFeedData(null);
      return;
    }
    if (!activeFeedId && feeds.length > 0) {
      setActiveFeedId(feeds[0].id);
    }
  }, [feeds, activeFeedId]);

  useEffect(() => {
    if (activeFeed) {
      fetchFeed(activeFeed.url);
    }
  }, [activeFeed]);

  /** Parse a raw RSS/Atom XML string into our RssResponse shape */
  const parseRssXml = (xml: string, originalUrl: string): RssResponse | null => {
    try {
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) return null;

      // Atom feed?
      const isAtom = !!doc.querySelector('feed');
      const items: RssItem[] = [];

      if (isAtom) {
        doc.querySelectorAll('entry').forEach(entry => {
          const linkEl = entry.querySelector('link[rel="alternate"]') || entry.querySelector('link');
          items.push({
            title: entry.querySelector('title')?.textContent?.trim() || '',
            pubDate: entry.querySelector('published,updated')?.textContent?.trim() || '',
            link: linkEl?.getAttribute('href') || '',
            guid: entry.querySelector('id')?.textContent?.trim() || '',
            author: entry.querySelector('author name')?.textContent?.trim() || '',
            thumbnail: '',
            description: entry.querySelector('summary,content')?.textContent?.trim() || '',
            content: entry.querySelector('content')?.textContent?.trim() || '',
          });
        });
        const feedTitle = doc.querySelector('feed > title')?.textContent?.trim() || '';
        const feedLink = doc.querySelector('feed > link[rel="alternate"]')?.getAttribute('href') || originalUrl;
        return { status: 'ok', feed: { url: originalUrl, title: feedTitle, link: feedLink, author: '', description: doc.querySelector('feed > subtitle')?.textContent?.trim() || '', image: '' }, items };
      }

      // RSS 2.0
      doc.querySelectorAll('item').forEach(item => {
        const enclosure = item.querySelector('enclosure[type^="image"]');
        const mediaThumbnail = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'thumbnail')[0];
        items.push({
          title: item.querySelector('title')?.textContent?.trim() || '',
          pubDate: item.querySelector('pubDate')?.textContent?.trim() || '',
          link: item.querySelector('link')?.textContent?.trim() || item.querySelector('link')?.nextSibling?.textContent?.trim() || '',
          guid: item.querySelector('guid')?.textContent?.trim() || '',
          author: item.querySelector('author,creator')?.textContent?.trim() || '',
          thumbnail: mediaThumbnail?.getAttribute('url') || enclosure?.getAttribute('url') || '',
          description: item.querySelector('description')?.textContent?.trim() || '',
          content: item.querySelector('encoded')?.textContent?.trim() || '',
        });
      });
      const channel = doc.querySelector('channel');
      return {
        status: 'ok',
        feed: {
          url: originalUrl,
          title: channel?.querySelector('title')?.textContent?.trim() || '',
          link: channel?.querySelector('link')?.textContent?.trim() || originalUrl,
          author: '',
          description: channel?.querySelector('description')?.textContent?.trim() || '',
          image: channel?.querySelector('image url')?.textContent?.trim() || '',
        },
        items,
      };
    } catch {
      return null;
    }
  };

  const fetchFeed = async (url: string) => {
    setLoading(true);
    setError('');
    setFeedData(null);

    // ── Stage 1: rss2json ──────────────────────────────────────────────────
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          setFeedData(data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // fall through to next proxy
    }

    // ── Stage 2: allorigins.win → native XML parse ─────────────────────────
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('allorigins fetch failed');
      const json = await res.json();
      const parsed = parseRssXml(json.contents, url);
      if (parsed) {
        setFeedData(parsed);
        setLoading(false);
        return;
      }
    } catch {
      // fall through to error
    }

    setError('Unable to load this RSS feed. The feed may be behind a paywall or require authentication. Try opening it directly in your browser.');
    setLoading(false);
  };


  const handleAddFeed = () => {
    if (!newUrl.trim() || !newName.trim()) return;
    const feed: RssFeed = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      url: newUrl.trim(),
      description: newDesc.trim() || undefined,
      addedAt: new Date().toISOString()
    };
    addFeed(feed);
    setAddOpen(false);
    setNewUrl('');
    setNewName('');
    setNewDesc('');
    if (!activeFeedId) setActiveFeedId(feed.id);
  };

  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Rss className="w-8 h-8 text-orange-500" /> RSS Feeds
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Subscribe and read your favorite AI news feeds.
            </p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Add Feed
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New RSS Feed</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Feed URL *</Label>
                  <Input 
                    placeholder="https://example.com/rss.xml" 
                    value={newUrl} 
                    onChange={e => setNewUrl(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input 
                    placeholder="e.g. OpenAI Blog" 
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
                  <Button onClick={handleAddFeed} disabled={!newUrl.trim() || !newName.trim()}>
                    Save Feed
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-full md:w-64 lg:w-72 shrink-0 flex flex-col gap-2 overflow-y-auto pr-2 border-r border-border/50">
            {feeds.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No RSS feeds added yet.
              </div>
            ) : (
              feeds.map((feed) => (
                <div
                  key={feed.id}
                  onClick={() => setActiveFeedId(feed.id)}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                    activeFeedId === feed.id
                      ? 'bg-primary/5 border-primary/20 text-foreground'
                      : 'bg-white dark:bg-card border-border hover:border-primary/30 text-muted-foreground hover:text-foreground hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 pr-12">
                      <h4 className={`font-medium text-sm truncate ${activeFeedId === feed.id ? 'text-primary' : ''}`}>
                        {feed.name}
                      </h4>
                      {feed.description && (
                         <p className="text-xs truncate opacity-70 mt-0.5">{feed.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute right-2 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={feedData?.feed.link && activeFeedId === feed.id ? feedData.feed.link : feed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors"
                      title="Open source"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${feed.name}"?`)) {
                          deleteFeed(feed.id);
                          if (activeFeedId === feed.id) setActiveFeedId(null);
                        }
                      }}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete Feed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
            {!activeFeed ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <Rss className="w-12 h-12 opacity-20" />
                <p>Select a feed from the sidebar or add a new one.</p>
              </div>
            ) : loading ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p>Loading latest articles...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-destructive space-y-4">
                <RefreshCw className="w-8 h-8 opacity-50" />
                <p>{error}</p>
                <Button variant="outline" onClick={() => fetchFeed(activeFeed.url)}>Try Again</Button>
              </div>
            ) : feedData ? (
              <div className="space-y-6 max-w-4xl mx-auto pb-8">
                <div className="mb-8 border-b border-border pb-6 flex items-start gap-4">
                  {feedData.feed.image && (
                    <img src={feedData.feed.image} alt="" className="w-16 h-16 rounded-md object-contain bg-white shrink-0" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{feedData.feed.title || activeFeed.name}</h2>
                    {feedData.feed.description && (
                      <p className="text-muted-foreground text-sm mt-1">{feedData.feed.description}</p>
                    )}
                    <a 
                      href={feedData.feed.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-2 inline-flex"
                    >
                      Visit Website <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="space-y-8">
                  {feedData.items?.length > 0 ? (
                    feedData.items.map((item, i) => {
                      const date = new Date(item.pubDate);
                      const dateStr = !isNaN(date.getTime()) 
                        ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                        : item.pubDate;

                      return (
                        <article key={item.guid || i} className="group">
                          <div className="flex flex-col gap-2">
                            <a 
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xl font-semibold leading-tight hover:text-primary transition-colors cursor-pointer inline-block"
                            >
                              {item.title}
                            </a>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-1">
                              {dateStr && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {dateStr}
                                </span>
                              )}
                              {item.author && <span>By {item.author}</span>}
                            </div>
                            
                            {/* Rendering description safely if possible, or simple text. rss2json returns raw HTML in description/content sometimes */}
                            <div 
                              className="text-sm text-foreground/80 line-clamp-3 prose dark:prose-invert prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: item.description || item.content || '' }} 
                            />
                            
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-sm font-medium mt-1 inline-flex items-center gap-1 max-w-fit hover:underline focus:outline-none"
                            >
                              Read full article
                            </a>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No articles found in this feed.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

    </Layout>
  );
}
