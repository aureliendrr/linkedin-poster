// Main library exports
export { LinkedInPosterService } from './services/LinkedInPosterService.js';
export { GitHubService } from './services/GitHubService.js';
export { LinkedInService } from './services/LinkedInService.js';
export { OpenAIService } from './services/OpenAIService.js';
export { OutputService } from './services/OutputService.js';

// Utility exports
export { ConfigManager } from './utils/ConfigManager.js';
export { Logger } from './utils/Logger.js';
export { TemplateManager } from './utils/TemplateManager.js';

// Type exports
export type {
  LinkedInPosterOptions,
  PostOptions,
  GitHubCommit,
  LinkedInPostRequest,
  LinkedInPostResponse,
  AppConfig,
  ProjectConfig,
  OutputConfig,
  AIConfig,
  GitHubConfig,
  LinkedInConfig,
  Commit,
  PostGenerationResult,
  OutputResult,
  LoggerOptions,
  TemplateVariables,
  OpenAIMessage,
  OpenAIResponse,
  EnvironmentVariables
} from './types/index.js';

// Simple utility functions for easier usage
import { LinkedInPosterService } from './services/LinkedInPosterService.js';
import type { PostOptions, PostGenerationResult, OutputResult, LinkedInPosterOptions } from './types/index.js';

// Create a singleton instance for simple usage (always silent for API)
let defaultPoster: LinkedInPosterService | null = null;

function getDefaultPoster(): LinkedInPosterService {
  if (!defaultPoster) {
    // API usage is always silent by default
    defaultPoster = new LinkedInPosterService({ silent: true });
  }
  return defaultPoster;
}

/**
 * Generate a LinkedIn post from recent GitHub commits
 * @param options - Post generation options
 * @returns Generated post result or null if no commits found
 */
export async function generatePost(options?: PostOptions): Promise<(PostGenerationResult & { outputResults: OutputResult }) | null> {
  const poster = getDefaultPoster();
  return poster.generatePost(options);
}

/**
 * Generate and post to LinkedIn
 * @param options - Post options including autoPost and visibility
 * @returns Post result with LinkedIn post ID if successful
 */
export async function generateAndPost(options?: PostOptions): Promise<(PostGenerationResult & { 
  outputResults: OutputResult;
  linkedInPostId?: string;
  postedAt?: string;
}) | null> {
  const poster = getDefaultPoster();
  return poster.generateAndPost(options);
}

/**
 * Check if LinkedIn is configured
 * @returns true if LinkedIn credentials are set
 */
export function isLinkedInConfigured(): boolean {
  const poster = getDefaultPoster();
  return poster.isLinkedInConfigured();
}

/**
 * Create a new poster instance with custom options (for advanced usage)
 * @param options - LinkedInPosterService options
 * @returns New LinkedInPosterService instance
 */
export function createPoster(options?: LinkedInPosterOptions): LinkedInPosterService {
  return new LinkedInPosterService(options);
}

// Default export for convenience
export default LinkedInPosterService; 