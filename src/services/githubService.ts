import { AIRepository } from "../types/ai-index";
import { deduplicateRepositories, normalizeRepository } from "../utils/dataProcessor";
import { errorBus } from "./errorBus";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

let isStopped = false;

const getHeaders = () => {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }
  return headers;
};

const TOPIC_GROUPS = [
  ['machine-learning', 'deep-learning', 'artificial-intelligence'],
  ['generative-ai', 'llm', 'gpt', 'transformers'],
  ['computer-vision', 'nlp', 'huggingface'],
  ['openai', 'anthropic', 'gemini', 'mistral'],
  ['langchain', 'llama', 'stable-diffusion', 'agents']
];

// Cache for user location to avoid repeated API calls
const userLocationCache: Record<string, { country?: string; city?: string }> = {};

// Helper to delay requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchAIRepositories(): Promise<AIRepository[]> {
  if (isStopped) return [];

  let allRepos: any[] = [];

  for (const group of TOPIC_GROUPS) {
    if (isStopped) break;
    try {
      // Construct query: topic:a OR topic:b ...
      const query = group.map(t => `topic:${t}`).join(' OR ');
      const url = `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`;
      
      const response = await fetch(url);
      
      if (response.status === 403 || response.status === 429) {
        console.warn('GitHub API rate limit exceeded for search.');
        isStopped = true;
        errorBus.emit('GitHub API rate limit exceeded. Querying stopped.');
        break; 
      }
      
      if (!response.ok) {
        console.warn(`Failed to fetch group: ${group.join(', ')}`, response.status);
        continue;
      }
      
      const data = await response.json();
      
      if (data.items) {
        allRepos.push(...data.items);
      }
      
      // Delay to be gentle
      await delay(800); 
    } catch (error) {
      console.error(`Error fetching group ${group}:`, error);
    }
  }

  // Deduplicate and normalize
  const uniqueRepos = deduplicateRepositories(allRepos);
  const processedRepos = uniqueRepos
    .map(normalizeRepository)
    .sort((a, b) => b.stars - a.stars);

  return processedRepos;
}

export async function fetchUserLocation(username: string): Promise<{ country?: string; city?: string }> {
  if (isStopped) return {};
  if (userLocationCache[username]) {
    return userLocationCache[username];
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
      headers: getHeaders(),
    });

    if (response.status === 403 || response.status === 429) {
        isStopped = true;
        errorBus.emit('GitHub API rate limit exceeded. Querying stopped.');
        return {};
    }

    if (!response.ok) return {};
    
    const data = await response.json();
    const location = data.location; // e.g. "San Francisco, CA"
    
    if (!location) return {};

    // Simple heuristic to split city/country
    // Real implementation would use a geocoding service
    const parts = location.split(',').map((s: string) => s.trim());
    let city = parts[0];
    let country = parts.length > 1 ? parts[parts.length - 1] : undefined;
    
    if (parts.length === 1) {
        // If only one part, assume it's country if it's a known country, otherwise city
        // For now, we'll just treat single words as "Country" if they look like one, or leave as city
        // A simple heuristic: if it's a single word, put it in country to be safe for filtering
        country = parts[0];
        city = undefined;
    }

    const result = { city, country };
    userLocationCache[username] = result;
    return result;
  } catch (error) {
    return {};
  }
}

export async function fetchLocationsForRepos(
  repos: AIRepository[], 
  onUpdate: (repoId: number, location: { country?: string; city?: string }) => void
) {
  const uniqueOwners = Array.from(new Set(repos.map(r => r.owner_name)));
  
  // Process in chunks to avoid rate limits
  const CHUNK_SIZE = 3;
  
  for (let i = 0; i < uniqueOwners.length; i += CHUNK_SIZE) {
    if (isStopped) break;

    const chunk = uniqueOwners.slice(i, i + CHUNK_SIZE);
    
    await Promise.all(chunk.map(async (owner) => {
      if (isStopped) return;
      const location = await fetchUserLocation(owner);
      if (location.country || location.city) {
        // Update all repos by this owner
        repos.filter(r => r.owner_name === owner).forEach(r => {
          onUpdate(r.id, location);
        });
      }
    }));

    // Delay between chunks
    await delay(1000);
  }
}
