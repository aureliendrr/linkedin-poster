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

// Default export for convenience
import { LinkedInPosterService } from './services/LinkedInPosterService.js';
export default LinkedInPosterService; 