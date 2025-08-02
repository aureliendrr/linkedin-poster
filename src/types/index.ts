// Configuration types
export interface ProjectConfig {
  name: string;
  url: string;
  description: string;
}

export interface OutputConfig {
  type: 'console' | 'file' | 'linkedin' | 'multiple';
  options: string[];
  console: {
    enabled: boolean;
    format: 'simple' | 'detailed';
  };
  file: {
    enabled: boolean;
    path: string;
    format: 'json' | 'txt';
  };
  linkedin: {
    enabled: boolean;
    visibility: 'PUBLIC' | 'CONNECTIONS';
    autoPost: boolean;
    requireConfirmation: boolean;
  };
}

export interface AIConfig {
  model: string;
  language: 'english' | 'french';
  tone: 'motivational' | 'professional' | 'casual';
  maxTokens?: number;
  temperature?: number;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  daysToFetch: number;
  excludePatterns: string[];
}

export interface LinkedInConfig {
  accessToken: string;
  personId: string;
}

export interface AppConfig {
  project: ProjectConfig;
  output: OutputConfig;
  ai: AIConfig;
  github: GitHubConfig;
}

// Service types
export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface PostGenerationResult {
  post: string;
  totalTokens: number;
  estimatedCost: number;
  model: string;
}

export interface OutputResult {
  console?: {
    success: boolean;
    message?: string;
  };
  file?: {
    success: boolean;
    path?: string;
    message?: string;
  };
  linkedin?: {
    success: boolean;
    postId?: string;
    message?: string;
  };
}

export interface LinkedInPosterOptions {
  verbose?: boolean;
  silent?: boolean;
}

export interface PostOptions {
  autoPost?: boolean;
  requireConfirmation?: boolean;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}

// Logger types
export interface LoggerOptions {
  verbose?: boolean;
  silent?: boolean;
}

// Template types
export interface TemplateVariables {
  PROJECT_NAME: string;
  LANGUAGE: string;
  TONE: string;
  COMMITS_LIST: string;
  EMOJI_INSTRUCTION: string;
  CTA_INSTRUCTION: string;
  PROJECT_URL: string;
  HASHTAGS_INSTRUCTION: string;
  MAX_LENGTH_INSTRUCTION: string;
}

// GitHub API types
export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

// OpenAI API types
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    total_tokens: number;
  };
}

// LinkedIn API types
export interface LinkedInPostRequest {
  author: string;
  lifecycleState: string;
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string;
      };
      shareMediaCategory: string;
    };
  };
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': string;
  };
}

export interface LinkedInPostResponse {
  id: string;
  message?: string;
}

// Environment variables
export interface EnvironmentVariables {
  GH_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  OPENAI_API_KEY: string;
  LINKEDIN_ACCESS_TOKEN?: string;
  LINKEDIN_PERSON_ID?: string;
} 