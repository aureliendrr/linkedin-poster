# LinkedIn Poster API Documentation

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [LinkedInPosterService](#linkedinposterservice)
  - [GitHubService](#githubservice)
  - [OpenAIService](#openaiservice)
  - [LinkedInService](#linkedinservice)
  - [ConfigManager](#configmanager)
  - [Logger](#logger)
  - [TemplateManager](#templatemanager)
  - [OutputService](#outputservice)
- [Types](#types)
- [Configuration](#configuration)
- [Examples](#examples)

## Installation

```bash
npm install linkedin-poster
```

## Quick Start

```typescript
import { LinkedInPosterService } from 'linkedin-poster';

const poster = new LinkedInPosterService();
const result = await poster.generatePost();
```

## API Reference

### LinkedInPosterService

The main service class that orchestrates all functionality.

#### Constructor

```typescript
new LinkedInPosterService(options?: LinkedInPosterOptions)
```

**Parameters:**
- `options` (optional): Configuration options
  - `verbose?: boolean` - Enable verbose logging
  - `silent?: boolean` - Disable all output

#### Methods

##### `generatePost()`

Generates a LinkedIn post from recent commits without posting.

```typescript
generatePost(): Promise<PostGenerationResult | null>
```

**Returns:** Promise that resolves to the generated post result or null if failed.

##### `generateAndPost(options?)`

Generates a post and optionally posts it to LinkedIn.

```typescript
generateAndPost(options?: PostOptions): Promise<OutputResult | null>
```

**Parameters:**
- `options` (optional): Posting options
  - `autoPost?: boolean` - Automatically post without confirmation
  - `requireConfirmation?: boolean` - Ask for confirmation before posting
  - `visibility?: 'PUBLIC' | 'CONNECTIONS'` - Post visibility

**Returns:** Promise that resolves to the output result or null if failed.

##### `isLinkedInConfigured()`

Checks if LinkedIn credentials are properly configured.

```typescript
isLinkedInConfigured(): boolean
```

**Returns:** true if LinkedIn is configured, false otherwise.

### GitHubService

Handles GitHub API interactions and commit fetching.

#### Constructor

```typescript
new GitHubService()
```

#### Methods

##### `getRecentCommits(days)`

Fetches recent commits from the configured repository.

```typescript
getRecentCommits(days: number): Promise<GitHubCommit[]>
```

**Parameters:**
- `days: number` - Number of days to look back

**Returns:** Promise that resolves to an array of GitHub commits.

##### `filterCommits(commits, patterns)`

Filters commits based on exclude patterns.

```typescript
filterCommits(commits: GitHubCommit[], patterns: string[]): GitHubCommit[]
```

**Parameters:**
- `commits: GitHubCommit[]` - Array of commits to filter
- `patterns: string[]` - Patterns to exclude

**Returns:** Filtered array of commits.

### OpenAIService

Manages OpenAI API calls and post generation.

#### Constructor

```typescript
new OpenAIService()
```

#### Methods

##### `generatePost(options)`

Generates a LinkedIn post using OpenAI.

```typescript
generatePost(options: {
  commits: GitHubCommit[];
  projectName: string;
  projectUrl?: string;
  projectDescription?: string;
  language?: 'english' | 'french';
  tone?: 'motivational' | 'professional' | 'casual';
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<PostGenerationResult | null>
```

**Parameters:**
- `options` - Generation options
  - `commits: GitHubCommit[]` - Array of commits to include
  - `projectName: string` - Name of the project
  - `projectUrl?: string` - Project URL (optional)
  - `projectDescription?: string` - Project description (optional)
  - `language?: 'english' | 'french'` - Post language
  - `tone?: 'motivational' | 'professional' | 'casual'` - Post tone
  - `model?: string` - OpenAI model to use
  - `maxTokens?: number` - Maximum tokens for generation
  - `temperature?: number` - Generation temperature

**Returns:** Promise that resolves to the generation result or null if failed.

### LinkedInService

Handles LinkedIn API posting functionality.

#### Constructor

```typescript
new LinkedInService()
```

#### Methods

##### `postToLinkedIn(content, visibility)`

Posts content to LinkedIn.

```typescript
postToLinkedIn(content: string, visibility?: 'PUBLIC' | 'CONNECTIONS'): Promise<LinkedInPostResponse>
```

**Parameters:**
- `content: string` - Post content
- `visibility?: 'PUBLIC' | 'CONNECTIONS'` - Post visibility

**Returns:** Promise that resolves to the LinkedIn API response.

##### `isConfigured()`

Checks if LinkedIn service is properly configured.

```typescript
isConfigured(): boolean
```

**Returns:** true if configured, false otherwise.

### ConfigManager

Manages environment variables and configuration.

#### Constructor

```typescript
new ConfigManager()
```

#### Methods

##### `getConfig()`

Gets the current configuration.

```typescript
getConfig(): AppConfig
```

**Returns:** The application configuration.

##### `createCustomConfig()`

Creates a custom configuration file.

```typescript
createCustomConfig(): void
```

##### `loadEnvironmentVariables()`

Loads environment variables from .env file.

```typescript
loadEnvironmentVariables(): EnvironmentVariables
```

**Returns:** Environment variables object.

### Logger

Handles all console output and logging.

#### Constructor

```typescript
new Logger(options?: LoggerOptions)
```

**Parameters:**
- `options` (optional): Logger options
  - `verbose?: boolean` - Enable verbose logging
  - `silent?: boolean` - Disable all output

#### Methods

##### `info(message)`

Logs an info message.

```typescript
info(message: string): void
```

##### `success(message)`

Logs a success message.

```typescript
success(message: string): void
```

##### `warning(message)`

Logs a warning message.

```typescript
warning(message: string): void
```

##### `error(message)`

Logs an error message.

```typescript
error(message: string): void
```

### TemplateManager

Manages template loading and variable replacement.

#### Constructor

```typescript
new TemplateManager()
```

#### Methods

##### `loadTemplate(name)`

Loads a template by name.

```typescript
loadTemplate(name: string): string
```

**Parameters:**
- `name: string` - Template name

**Returns:** Template content as string.

##### `replaceVariables(template, variables)`

Replaces variables in a template.

```typescript
replaceVariables(template: string, variables: TemplateVariables): string
```

**Parameters:**
- `template: string` - Template content
- `variables: TemplateVariables` - Variables to replace

**Returns:** Template with replaced variables.

### OutputService

Handles multiple output types (console, file, LinkedIn).

#### Constructor

```typescript
new OutputService(config: OutputConfig)
```

**Parameters:**
- `config: OutputConfig` - Output configuration

#### Methods

##### `processOutput(result, post)`

Processes output based on configuration.

```typescript
processOutput(result: PostGenerationResult, post: string): Promise<OutputResult>
```

**Parameters:**
- `result: PostGenerationResult` - Generation result
- `post: string` - Generated post content

**Returns:** Promise that resolves to output result.

## Types

### LinkedInPosterOptions

```typescript
interface LinkedInPosterOptions {
  verbose?: boolean;
  silent?: boolean;
}
```

### PostOptions

```typescript
interface PostOptions {
  autoPost?: boolean;
  requireConfirmation?: boolean;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}
```

### PostGenerationResult

```typescript
interface PostGenerationResult {
  post: string;
  totalTokens: number;
  estimatedCost: number;
  model: string;
}
```

### OutputResult

```typescript
interface OutputResult {
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
```

### GitHubCommit

```typescript
interface GitHubCommit {
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
```

### AppConfig

```typescript
interface AppConfig {
  project: ProjectConfig;
  output: OutputConfig;
  ai: AIConfig;
  github: GitHubConfig;
}
```

### ProjectConfig

```typescript
interface ProjectConfig {
  name: string;
  url: string;
  description: string;
}
```

### OutputConfig

```typescript
interface OutputConfig {
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
```

### AIConfig

```typescript
interface AIConfig {
  model: string;
  language: 'english' | 'french';
  tone: 'motivational' | 'professional' | 'casual';
  maxTokens?: number;
  temperature?: number;
}
```

### GitHubConfig

```typescript
interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  daysToFetch: number;
  excludePatterns: string[];
}
```

### EnvironmentVariables

```typescript
interface EnvironmentVariables {
  GH_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  OPENAI_API_KEY: string;
  LINKEDIN_ACCESS_TOKEN?: string;
  LINKEDIN_PERSON_ID?: string;
}
```

## Configuration

The library uses a configuration system with environment variables and optional config files.

### Environment Variables

Required environment variables:

```env
GH_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
OPENAI_API_KEY=your_openai_api_key
```

Optional environment variables:

```env
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
LINKEDIN_PERSON_ID=your_linkedin_person_id
```

### Configuration File

You can create a `config.json` file for non-sensitive settings:

```json
{
  "project": {
    "name": "Your Project Name",
    "url": "https://your-project-url.com",
    "description": "A brief description of your project"
  },
  "output": {
    "type": "multiple",
    "console": {
      "enabled": true,
      "format": "detailed"
    },
    "file": {
      "enabled": true,
      "path": "./output/posts",
      "format": "json"
    },
    "linkedin": {
      "enabled": true,
      "visibility": "PUBLIC",
      "autoPost": true,
      "requireConfirmation": true
    }
  },
  "ai": {
    "model": "gpt-3.5-turbo",
    "language": "english",
    "tone": "motivational",
    "maxTokens": 1000,
    "temperature": 0.7
  },
  "github": {
    "branch": "main",
    "daysToFetch": 7,
    "excludePatterns": ["refactor", "chore", "docs", "test", "ci", "cd"]
  }
}
```

## Examples

### Basic Usage

```typescript
import { LinkedInPosterService } from 'linkedin-poster';

const poster = new LinkedInPosterService({ verbose: true });
const result = await poster.generatePost();

if (result) {
  console.log('Generated post:', result.post);
  console.log('Cost:', result.estimatedCost);
}
```

### Advanced Usage

```typescript
import { 
  GitHubService, 
  OpenAIService, 
  LinkedInService,
  ConfigManager 
} from 'linkedin-poster';

const configManager = new ConfigManager();
const config = configManager.getConfig();

const githubService = new GitHubService();
const openAIService = new OpenAIService();
const linkedInService = new LinkedInService();

// Fetch commits
const commits = await githubService.getRecentCommits(7);

// Generate post
const postResult = await openAIService.generatePost({
  commits,
  projectName: config.project.name,
  language: config.ai.language,
  tone: config.ai.tone
});

// Post to LinkedIn
if (linkedInService.isConfigured() && postResult) {
  const result = await linkedInService.postToLinkedIn(
    postResult.post, 
    'PUBLIC'
  );
  
  if (result.success) {
    console.log('Posted successfully:', result.postId);
  }
}
```

### Custom Configuration

```typescript
import { ConfigManager } from 'linkedin-poster';

const configManager = new ConfigManager();

// Create custom config
configManager.createCustomConfig();

// Load and modify config
const config = configManager.getConfig();
config.ai.tone = 'professional';
config.github.daysToFetch = 14;

// Save modified config
// (You would need to implement save functionality)
```

### Error Handling

```typescript
import { LinkedInPosterService } from 'linkedin-poster';

try {
  const poster = new LinkedInPosterService();
  const result = await poster.generatePost();
  
  if (!result) {
    console.error('Failed to generate post');
    return;
  }
  
  console.log('Success:', result.post);
} catch (error) {
  console.error('Error:', error.message);
  
  if (error.code === 'ENOTFOUND') {
    console.error('Network error - check your internet connection');
  } else if (error.status === 401) {
    console.error('Authentication error - check your API keys');
  }
}
``` 