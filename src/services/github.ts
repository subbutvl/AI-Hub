import { FileNode, RepoInfo } from '../types';
import { errorBus } from './errorBus';

const GITHUB_API_BASE = 'https://api.github.com';

let isStopped = false;

export class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function checkRateLimit(response: Response) {
  if (response.status === 403 || response.status === 429) {
    isStopped = true;
    errorBus.emit('GitHub API rate limit exceeded. Querying stopped to prevent abuse.');
  }
}

function checkStopped() {
  if (isStopped) {
    throw new Error('GitHub API query stopped due to rate limits.');
  }
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  score: number;
}

export interface UserProfile extends GitHubUser {
  name: string;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface RepoSearchResult {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  topics: string[];
  updated_at: string;
}

export async function searchRepos(query: string, sort: string = 'stars', order: string = 'desc', perPage: number = 30): Promise<RepoSearchResult[]> {
  checkStopped();
  const response = await fetch(`${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}&per_page=${perPage}`);
  checkRateLimit(response);
  if (!response.ok) {
    throw new GitHubError('Failed to search repositories', response.status);
  }
  const data = await response.json();
  return data.items;
}

export async function searchUsers(query: string, perPage: number = 30): Promise<GitHubUser[]> {
  checkStopped();
  const response = await fetch(`${GITHUB_API_BASE}/search/users?q=${encodeURIComponent(query)}&per_page=${perPage}`);
  checkRateLimit(response);
  if (!response.ok) {
    throw new GitHubError('Failed to search users', response.status);
  }
  const data = await response.json();
  return data.items;
}

export async function getUserProfile(username: string): Promise<UserProfile> {
  checkStopped();
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}`);
  checkRateLimit(response);
  if (!response.ok) {
    throw new GitHubError('Failed to fetch user profile', response.status);
  }
  return await response.json();
}

export async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  checkStopped();
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);
  checkRateLimit(response);
  
  if (!response.ok) {
    throw new GitHubError(
      response.status === 404 ? 'Repository not found' : 'Failed to fetch repository info',
      response.status
    );
  }

  const data = await response.json();
  return {
    owner: data.owner.login,
    repo: data.name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    default_branch: data.default_branch,
  };
}

export async function fetchRepoTree(owner: string, repo: string, recursive: boolean = false, branch: string = 'HEAD'): Promise<FileNode[]> {
  checkStopped();
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=${recursive ? 1 : 0}`;
  const response = await fetch(url);
  checkRateLimit(response);

  if (!response.ok) {
    throw new GitHubError(
      response.status === 404 ? 'Repository tree not found' : 'Failed to fetch repository tree',
      response.status
    );
  }

  const data = await response.json();
  
  // Filter for .md, .txt, .mdx files
  // Also include folders (type === 'tree') if we are building a tree structure locally, 
  // but the API returns a flat list if recursive=1.
  
  const validExtensions = ['.md', '.txt', '.mdx'];
  
  const files = data.tree.filter((node: any) => {
    if (node.type === 'blob') {
      return validExtensions.some(ext => node.path.toLowerCase().endsWith(ext));
    }
    return true; // Keep folders for structure building
  });

  return files.map((node: any) => ({
    ...node,
    name: node.path.split('/').pop()
  }));
}

export async function fetchFileContent(owner: string, repo: string, path: string, branch: string = 'HEAD'): Promise<string> {
  checkStopped();
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  const response = await fetch(url);
  // raw.githubusercontent.com might not return standard API rate limit headers or 403 in the same way, 
  // but usually it's less strict. However, if we get 429, we should stop.
  if (response.status === 429) {
      isStopped = true;
      errorBus.emit('GitHub Raw Content rate limit exceeded.');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch file content');
  }

  return await response.text();
}

export function buildFileTree(flatNodes: FileNode[]): FileNode[] {
  const root: FileNode[] = [];
  const map: { [key: string]: FileNode } = {};

  // First pass: create all nodes and map them
  flatNodes.forEach(node => {
    map[node.path] = { ...node, children: [] };
  });

  // Second pass: connect children to parents
  flatNodes.forEach(node => {
    const parts = node.path.split('/');
    const currentNode = map[node.path];
    
    if (parts.length === 1) {
      root.push(currentNode);
    } else {
      const parentPath = parts.slice(0, -1).join('/');
      // If parent exists in our filtered list, add to it
      // If parent was filtered out (e.g. it didn't contain any valid files?), 
      // we might need to handle orphans. 
      // However, for this simple explorer, we usually want to see the folders.
      // But we filtered the raw list. 
      // If a folder contains only non-md files, it might be in the list as a tree, 
      // but if we filtered blobs only, we might miss the folder structure if we aren't careful.
      
      // Let's assume we kept 'tree' types in the fetchRepoTree filter.
      
      if (map[parentPath]) {
        map[parentPath].children?.push(currentNode);
      } else {
        // If parent is missing (maybe it was filtered out or didn't exist in the flat list for some reason),
        // treat as root or create implicit parent?
        // For simplicity, push to root if parent missing, or maybe we should reconstruct the tree properly.
        // Let's try to reconstruct implicit parents if needed, but the recursive API usually gives us everything.
        
        // Actually, if we filtered out a folder because it had no MD files? 
        // Wait, we kept (node.type === 'tree') in fetchRepoTree. 
        // So we should have the folders.
        root.push(currentNode); 
      }
    }
  });

  // Sort: Folders first, then files. Alphabetical.
  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'tree' ? -1 : 1;
    });
    nodes.forEach(node => {
      if (node.children) sortNodes(node.children);
    });
  };

  // Filter out empty folders (folders with no children that are also not blobs)
  // This is recursive pruning.
  const pruneEmptyFolders = (nodes: FileNode[]): FileNode[] => {
    return nodes.filter(node => {
      if (node.type === 'blob') return true;
      if (node.children) {
        node.children = pruneEmptyFolders(node.children);
        return node.children.length > 0;
      }
      return false;
    });
  };

  const prunedRoot = pruneEmptyFolders(root);
  sortNodes(prunedRoot);
  return prunedRoot;
}
