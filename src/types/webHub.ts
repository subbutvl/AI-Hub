export type LinkType =
  | 'youtube-video'
  | 'youtube-short'
  | 'youtube-channel'
  | 'youtube-playlist'
  | 'github-repo'
  | 'webpage'
  | 'article'
  | 'tool';

export interface WebLink {
  id: string;
  url: string;
  name: string;
  type: LinkType;
  category: string;
  tags: string[];
  description?: string;
  favicon?: string;
  addedAt: string;
}

// ── Type helpers ──────────────────────────────────────────────────────────────

export function detectLinkType(url: string): LinkType {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtube.com' || host === 'youtu.be') {
      if (u.pathname.startsWith('/shorts/')) return 'youtube-short';
      if (
        u.pathname.startsWith('/channel/') ||
        u.pathname.startsWith('/@') ||
        u.pathname.startsWith('/user/')
      ) return 'youtube-channel';
      if (u.searchParams.has('list') && !u.searchParams.has('v')) return 'youtube-playlist';
      if (u.searchParams.has('v') || host === 'youtu.be') return 'youtube-video';
      return 'youtube-channel';
    }

    if (host === 'github.com') return 'github-repo';

    return 'webpage';
  } catch {
    return 'webpage';
  }
}

export function getLinkTypeLabel(type: LinkType): string {
  const labels: Record<LinkType, string> = {
    'youtube-video': 'YouTube Video',
    'youtube-short': 'YouTube Short',
    'youtube-channel': 'YouTube Channel',
    'youtube-playlist': 'YouTube Playlist',
    'github-repo': 'GitHub Repo',
    'webpage': 'Web Page',
    'article': 'Article',
    'tool': 'Tool',
  };
  return labels[type];
}

export interface TypeMeta {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const TYPE_META: Record<LinkType, TypeMeta> = {
  'youtube-video':    { label: 'Video',    bgColor: 'bg-red-100 dark:bg-red-900/30',       textColor: 'text-red-600 dark:text-red-400',       borderColor: 'border-red-200 dark:border-red-800' },
  'youtube-short':   { label: 'Short',    bgColor: 'bg-pink-100 dark:bg-pink-900/30',      textColor: 'text-pink-600 dark:text-pink-400',     borderColor: 'border-pink-200 dark:border-pink-800' },
  'youtube-channel': { label: 'Channel',  bgColor: 'bg-rose-100 dark:bg-rose-900/30',      textColor: 'text-rose-700 dark:text-rose-400',     borderColor: 'border-rose-200 dark:border-rose-800' },
  'youtube-playlist':{ label: 'Playlist', bgColor: 'bg-orange-100 dark:bg-orange-900/30',  textColor: 'text-orange-600 dark:text-orange-400', borderColor: 'border-orange-200 dark:border-orange-800' },
  'github-repo':     { label: 'GitHub',   bgColor: 'bg-gray-100 dark:bg-gray-800',         textColor: 'text-gray-700 dark:text-gray-300',     borderColor: 'border-gray-200 dark:border-gray-700' },
  'webpage':         { label: 'Web Page', bgColor: 'bg-blue-100 dark:bg-blue-900/30',      textColor: 'text-blue-600 dark:text-blue-400',     borderColor: 'border-blue-200 dark:border-blue-800' },
  'article':         { label: 'Article',  bgColor: 'bg-teal-100 dark:bg-teal-900/30',      textColor: 'text-teal-600 dark:text-teal-400',     borderColor: 'border-teal-200 dark:border-teal-800' },
  'tool':            { label: 'Tool',     bgColor: 'bg-violet-100 dark:bg-violet-900/30',  textColor: 'text-violet-600 dark:text-violet-400', borderColor: 'border-violet-200 dark:border-violet-800' },
};

// ── Auto-fetch helpers ────────────────────────────────────────────────────────

export async function fetchLinkMeta(
  url: string,
  type: LinkType
): Promise<{ name: string; description?: string }> {
  // YouTube oEmbed — no CORS issues
  if (type === 'youtube-video' || type === 'youtube-short' || type === 'youtube-playlist') {
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        return { name: data.title, description: `by ${data.author_name}` };
      }
    } catch {}
  }

  if (type === 'youtube-channel') {
    try {
      // oEmbed works for channels too via a dummy video URL redirect, best effort
      const channelName = new URL(url).pathname.replace(/^\/@?/, '').split('/')[0];
      if (channelName) return { name: channelName };
    } catch {}
  }

  // GitHub API — public repos, no key needed
  if (type === 'github-repo') {
    try {
      const parts = new URL(url).pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        const res = await fetch(`https://api.github.com/repos/${parts[0]}/${parts[1]}`);
        if (res.ok) {
          const data = await res.json();
          return { name: data.full_name, description: data.description ?? undefined };
        }
      }
    } catch {}
  }

  // Fallback: derive name from URL
  try {
    const u = new URL(url);
    const pathParts = u.pathname.split('/').filter(Boolean);
    const name = pathParts.length > 0
      ? pathParts[pathParts.length - 1].replace(/[-_]/g, ' ')
      : u.hostname.replace(/^www\./, '');
    return { name: name || url };
  } catch {
    return { name: url };
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// ── CSV helpers ───────────────────────────────────────────────────────────────

export function linksToCSV(links: WebLink[]): string {
  const header = 'id,url,name,type,category,tags,description,addedAt';
  const rows = links.map(l =>
    [
      l.id,
      `"${l.url.replace(/"/g, '""')}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      l.type,
      `"${l.category.replace(/"/g, '""')}"`,
      `"${l.tags.join(';').replace(/"/g, '""')}"`,
      `"${(l.description ?? '').replace(/"/g, '""')}"`,
      l.addedAt,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

export function csvToLinks(csv: string): WebLink[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const results: WebLink[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].match(/("(?:[^"]|"")*"|[^,]*),?/g);
    if (!cols || cols.length < 8) continue;
    const clean = (s: string) => s.replace(/^"|"$/g, '').replace(/""/g, '"').replace(/,$/, '').trim();
    results.push({
      id: clean(cols[0]) || crypto.randomUUID(),
      url: clean(cols[1]),
      name: clean(cols[2]),
      type: (clean(cols[3]) as LinkType) ?? 'webpage',
      category: clean(cols[4]),
      tags: clean(cols[5]).split(';').filter(Boolean),
      description: clean(cols[6]) || undefined,
      addedAt: clean(cols[7]) || new Date().toISOString(),
    });
  }
  return results;
}
