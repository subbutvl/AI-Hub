export interface FileNode {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
  name: string;
  children?: FileNode[];
}

export interface RepoInfo {
  owner: string;
  repo: string;
  description?: string;
  stars?: number;
  forks?: number;
  watchers?: number;
  default_branch?: string;
}

export interface FileCache {
  [path: string]: string;
}

export interface SavedRepo {
  id: string;
  url: string;
  name: string;
  owner: string;
  repo: string;
  category: string;
  tags: string[];
  recursive: boolean;
  info?: RepoInfo;
  createdAt: number;
}

export interface DeveloperInfo {
  login: string;
  name?: string;
  avatar_url: string;
  location?: string;
  company?: string;
  blog?: string;
  twitter_username?: string;
}

export interface AIRepo {
  id: number;
  name: string;
  full_name: string;
  owner: DeveloperInfo;
  html_url: string;
  description: string;
  stargazers_count: number;
  language: string;
  topics: string[];
  updated_at: string;
  ai_category?: string; // Inferred or assigned
}
