import { AIRepository } from "../types/ai-index";

/**
 * Deduplicates an array of repositories based on their unique ID.
 * @param repos Array of raw repository objects from GitHub API
 * @returns Deduplicated array of repositories
 */
export function deduplicateRepositories(repos: any[]): any[] {
  const seenIds = new Set<number>();
  const uniqueRepos: any[] = [];
  
  for (const repo of repos) {
    if (!seenIds.has(repo.id)) {
      seenIds.add(repo.id);
      uniqueRepos.push(repo);
    }
  }
  
  return uniqueRepos;
}

/**
 * Normalizes a raw GitHub repository object into our unified AIRepository schema.
 * @param repo Raw repository object from GitHub API
 * @returns Normalized AIRepository object
 */
export function normalizeRepository(repo: any): AIRepository {
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
    ai_category: classifyRepo(repo),
  };
}

/**
 * Classifies a repository into an AI category based on its topics and description.
 * @param repo Raw repository object
 * @returns AI Category string
 */
export function classifyRepo(repo: any): string {
  const topics = (repo.topics || []).join(" ").toLowerCase();
  const description = (repo.description || "").toLowerCase();
  const text = `${topics} ${description}`;

  if (text.includes("agent") || text.includes("autonomous")) return "AI Agents";
  if (text.includes("llm") || text.includes("gpt") || text.includes("transformer") || text.includes("llama")) return "LLM Framework";
  if (text.includes("vector") || text.includes("embedding") || text.includes("pinecone") || text.includes("weaviate")) return "Vector Databases";
  if (text.includes("rag") || text.includes("retrieval")) return "AI Infrastructure";
  if (text.includes("vision") || text.includes("image") || text.includes("diffusion")) return "Computer Vision";
  if (text.includes("nlp") || text.includes("text")) return "NLP";
  if (text.includes("train") || text.includes("finetune") || text.includes("lora")) return "Model Training";
  if (text.includes("eval") || text.includes("benchmark")) return "AI Evaluation";
  if (text.includes("deploy") || text.includes("serving") || text.includes("inference")) return "AI Deployment";
  if (text.includes("prompt")) return "Prompt Engineering";
  if (text.includes("deep learning") || text.includes("neural")) return "Deep Learning";
  if (text.includes("machine learning") || text.includes("ml")) return "Machine Learning";
  
  return "AI Tools";
}
