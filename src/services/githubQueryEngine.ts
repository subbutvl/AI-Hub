import { AIRepository } from "../types/ai-index";
import { errorBus } from "./errorBus";

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const CACHE_KEY = "ai_repositories_cache";
const CACHE_LIFETIME = 24 * 60 * 60 * 1000; // 24 hours

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  owner: {
    login: string;
    type: string;
    avatar_url: string;
  };
  stargazers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
  created_at: string;
  updated_at: string;
  default_branch: string;
  license: {
    key: string;
    name: string;
  } | null;
}

interface CacheData {
  timestamp: number;
  data: AIRepository[];
}

export class GitHubQueryEngine {
  private token: string;
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private rateLimitRemaining = 30;
  private rateLimitReset = Date.now();
  private collectedRepos = new Map<number, AIRepository>();
  private onProgress?: (message: string, count: number) => void;
  private isStopped = false;

  constructor(token?: string) {
    this.token = token || GITHUB_TOKEN || "";
    if (!this.token) {
      console.warn("GitHub token not found. API requests may be limited.");
    }
  }

  public setProgressCallback(callback: (message: string, count: number) => void) {
    this.onProgress = callback;
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async checkRateLimit(headers: Headers) {
    if (this.isStopped) return;

    const remaining = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");

    if (remaining) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }

    if (reset) {
      this.rateLimitReset = parseInt(reset, 10) * 1000;
    }

    if (this.rateLimitRemaining <= 1) {
      const waitTime = this.rateLimitReset - Date.now() + 1000; // Add buffer
      if (waitTime > 0) {
        // If wait time is reasonable (e.g. < 1 minute), wait. Otherwise stop.
        if (waitTime < 60000) {
          this.onProgress?.(`Rate limit reached. Pausing for ${Math.ceil(waitTime / 1000)}s...`, this.collectedRepos.size);
          await this.delay(waitTime);
        } else {
          this.isStopped = true;
          errorBus.emit(`GitHub API rate limit reached. Resets at ${new Date(this.rateLimitReset).toLocaleTimeString()}. Querying stopped.`);
          throw new Error("Rate limit reached");
        }
      }
    }
  }

  private async fetchWithAuth(url: string): Promise<any> {
    if (this.isStopped) {
      throw new Error("Query engine is stopped.");
    }

    await this.delay(1500); // Base delay between requests

    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, { headers });
      await this.checkRateLimit(response.headers);

      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          this.isStopped = true;
          errorBus.emit("GitHub API rate limit exceeded. Querying stopped to prevent abuse.");
          throw new Error("Rate limit exceeded");
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }

  private mapToAIRepository(repo: GitHubRepo): AIRepository {
    return {
      id: repo.id,
      repo_name: repo.name,
      repo_url: repo.html_url,
      description: repo.description || "",
      owner_name: repo.owner.login,
      owner_type: repo.owner.type,
      owner_avatar: repo.owner.avatar_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language || "Unknown",
      license: repo.license?.name || "None",
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      topics: repo.topics || [],
      default_branch: repo.default_branch,
      ai_category: this.inferCategory(repo.topics, repo.description),
    };
  }

  private inferCategory(topics: string[], description: string): string {
    const text = (topics.join(" ") + " " + (description || "")).toLowerCase();
    
    if (text.includes("agent") || text.includes("autonomous")) return "AI Agents";
    if (text.includes("llm") || text.includes("gpt") || text.includes("llama")) return "LLM Framework";
    if (text.includes("vector") || text.includes("embedding")) return "Vector Databases";
    if (text.includes("vision") || text.includes("image")) return "Computer Vision";
    if (text.includes("nlp") || text.includes("text")) return "NLP";
    if (text.includes("training") || text.includes("finetuning")) return "Model Training";
    if (text.includes("deploy") || text.includes("serving")) return "AI Deployment";
    if (text.includes("eval") || text.includes("benchmark")) return "AI Evaluation";
    if (text.includes("deep learning") || text.includes("neural")) return "Deep Learning";
    
    return "Machine Learning";
  }

  private async searchWithPagination(query: string) {
    let page = 1;
    const perPage = 100;

    while (true) {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}&page=${page}`;
      
      this.onProgress?.(`Fetching page ${page} for query: ${query}...`, this.collectedRepos.size);
      
      try {
        const data = await this.fetchWithAuth(url);
        
        if (!data.items || data.items.length === 0) break;

        for (const item of data.items) {
          if (!this.collectedRepos.has(item.id)) {
            this.collectedRepos.set(item.id, this.mapToAIRepository(item));
          }
        }

        if (data.items.length < perPage || page >= 10) break; // Limit to 10 pages per query
        page++;
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        break;
      }
    }
  }

  private async searchByStarRanges(baseQuery: string) {
    // Check total count first
    const checkUrl = `https://api.github.com/search/repositories?q=${baseQuery}&per_page=1`;
    const checkData = await this.fetchWithAuth(checkUrl);
    
    if (checkData.total_count <= 1000) {
      await this.searchWithPagination(baseQuery);
      return;
    }

    // Split by star ranges if > 1000
    const ranges = [
      "stars:>10000",
      "stars:5000..10000",
      "stars:1000..5000",
      "stars:500..1000",
      "stars:100..500",
      "stars:<100"
    ];

    for (const range of ranges) {
      const query = `${baseQuery} ${range}`;
      await this.searchWithPagination(query);
    }
  }

  public async run(): Promise<AIRepository[]> {
    // Try to load from cache first
    const cached = this.loadFromCache();
    if (cached) {
      this.onProgress?.("Loaded from cache", cached.length);
      return cached;
    }

    this.collectedRepos.clear();
    
    const topics = [
      "topic:ai",
      "topic:llm",
      "topic:machine-learning",
      "topic:generative-ai",
      "topic:ai-agents",
      "topic:rag",
      "topic:vector-database",
      "topic:deep-learning"
    ];

    // Group topics to reduce queries (OR logic)
    // GitHub search query length is limited, so we group by 2-3 topics
    const groups = [];
    for (let i = 0; i < topics.length; i += 2) {
      groups.push(topics.slice(i, i + 2).join(" OR "));
    }

    for (const groupQuery of groups) {
      await this.searchByStarRanges(groupQuery);
    }

    const results = Array.from(this.collectedRepos.values());
    this.saveToCache(results);
    
    return results;
  }

  public loadFromCache(): AIRepository[] | null {
    try {
      const json = localStorage.getItem(CACHE_KEY);
      if (!json) return null;

      const cache: CacheData = JSON.parse(json);
      if (Date.now() - cache.timestamp > CACHE_LIFETIME) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return cache.data;
    } catch (e) {
      console.error("Error loading cache", e);
      return null;
    }
  }

  public saveToCache(data: AIRepository[]) {
    try {
      const cache: CacheData = {
        timestamp: Date.now(),
        data
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.error("Error saving cache", e);
    }
  }

  public clearCache() {
    localStorage.removeItem(CACHE_KEY);
  }
}

export const gitHubQueryEngine = new GitHubQueryEngine();
