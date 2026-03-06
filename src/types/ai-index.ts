export interface AIRepository {
  id: number;
  repo_name: string;
  repo_url: string;
  description: string;
  owner_name: string;
  owner_type: string;
  owner_avatar: string;
  stars: number;
  forks: number;
  language: string;
  license: string;
  created_at: string;
  updated_at: string;
  topics: string[];
  default_branch: string;
  ai_category: string;
  developer_name?: string;
  developer_blog?: string;
  developer_twitter?: string;
  country?: string;
  city?: string;
}

export interface AIIndexFilter {
  search: string;
  category: string;
  language: string;
  minStars: number;
  country: string;
}

export const AI_CATEGORIES = [
  "LLM Framework",
  "AI Agents",
  "Machine Learning",
  "Deep Learning",
  "Vector Databases",
  "Prompt Engineering",
  "AI Tools",
  "AI Infrastructure",
  "Model Training",
  "AI Evaluation",
  "AI Deployment",
  "Computer Vision",
  "NLP",
  "Other",
] as const;

export type AICategory = typeof AI_CATEGORIES[number];
