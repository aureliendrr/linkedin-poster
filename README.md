# LinkedIn Poster

Automatically generate and post LinkedIn updates based on your GitHub commits using AI.

## Features

- 🤖 AI-powered post generation using OpenAI GPT-3.5-turbo
- 📊 Fetches commits from the last N days (configurable)
- 🎯 Filters out technical commits (refactoring, bug fixes)
- 📱 Direct posting to LinkedIn via API
- 💰 Cost tracking for OpenAI usage
- 🏗️ Clean, modular architecture with separation of concerns
- 🔧 Easy to extend and customize
- 📝 Written in TypeScript with full type safety

## Installation

### As a Library

```bash
npm install linkedin-poster
```

### As a CLI Tool

```bash
npm install -g linkedin-poster
```

## Usage

### As a Library

#### Simple Usage (Recommended)

```typescript
import { generatePost, generateAndPost, isLinkedInConfigured } from 'linkedin-poster';

// Check if LinkedIn is configured
if (isLinkedInConfigured()) {
  console.log('LinkedIn is ready for posting');
}

// Generate a post from recent commits
const result = await generatePost();

// Generate and post to LinkedIn
const postedResult = await generateAndPost({
  autoPost: true,
  visibility: 'PUBLIC'
});
```

#### Advanced Usage (Full Control)

```typescript
import { LinkedInPosterService } from 'linkedin-poster';

// Create a poster instance with custom options
const poster = new LinkedInPosterService({
  verbose: true
});

// Generate a post from recent commits
const result = await poster.generatePost();

// Generate and post to LinkedIn
const postedResult = await poster.generateAndPost({
  autoPost: true,
  visibility: 'PUBLIC'
});

// Check if LinkedIn is configured
if (poster.isLinkedInConfigured()) {
  console.log('LinkedIn is ready for posting');
}
```

### Advanced Library Usage

```typescript
import { 
  LinkedInPosterService, 
  GitHubService, 
  OpenAIService,
  LinkedInService,
  ConfigManager 
} from 'linkedin-poster';

// Use individual services
const githubService = new GitHubService();
const openAIService = new OpenAIService();
const linkedInService = new LinkedInService();
const configManager = new ConfigManager();

// Fetch commits manually
const commits = await githubService.getRecentCommits(7);

// Generate post with custom options
const post = await openAIService.generatePost({
  commits,
  projectName: 'My Awesome Project',
  language: 'english',
  tone: 'professional'
});

// Post to LinkedIn
const result = await linkedInService.postToLinkedIn(post);
```

### Utility Functions

For simple use cases, you can use the utility functions:

```typescript
import { 
  generatePost,           // Generate post from commits
  generateAndPost,        // Generate and post to LinkedIn
  isLinkedInConfigured,   // Check LinkedIn configuration
  createPoster           // Create custom poster instance
} from 'linkedin-poster';

// Quick post generation
const result = await generatePost();

// Quick post and publish
const posted = await generateAndPost({ autoPost: true });

// Check configuration
if (isLinkedInConfigured()) {
  // Ready to post
}

// Create custom instance
const poster = createPoster({ verbose: true });
```

### As a CLI Tool

```bash
# Generate a post (no posting)
linkedin-poster generate

# Generate and post to LinkedIn
linkedin-poster post

# Post with private visibility
linkedin-poster post --private

# Setup LinkedIn API
linkedin-poster setup

# Create configuration file
linkedin-poster config

# Show help
linkedin-poster help
```

## API Reference

### LinkedInPosterService

The main service class that orchestrates all functionality.

#### Constructor

```typescript
new LinkedInPosterService(options?: LinkedInPosterOptions)
```

**Options:**
- `verbose?: boolean` - Enable verbose logging
- `silent?: boolean` - Disable all output

#### Methods

- `generatePost(): Promise<PostGenerationResult | null>` - Generate a post from recent commits
- `generateAndPost(options?: PostOptions): Promise<OutputResult | null>` - Generate and post to LinkedIn
- `isLinkedInConfigured(): boolean` - Check if LinkedIn credentials are configured

### Types

```typescript
interface LinkedInPosterOptions {
  verbose?: boolean;
  silent?: boolean;
}

interface PostOptions {
  autoPost?: boolean;
  requireConfirmation?: boolean;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}

interface PostGenerationResult {
  post: string;
  totalTokens: number;
  estimatedCost: number;
  model: string;
}

interface OutputResult {
  console?: { success: boolean; message?: string; };
  file?: { success: boolean; path?: string; message?: string; };
  linkedin?: { success: boolean; postId?: string; message?: string; };
}
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Environment Variables

Create a `.env` file in the root directory with sensitive information:

```env
# GitHub Configuration
GH_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# LinkedIn Configuration (for direct posting)
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
LINKEDIN_PERSON_ID=your_linkedin_person_id
```

### 4. Configuration File

Create a custom configuration file for non-sensitive settings:

```bash
npm run config
# or
node src/index.js config
```

This will create a `config.json` file that you can customize:

```json
{
  "project": {
    "name": "Your Project Name",
    "url": "https://your-project-url.com",
    "description": "A brief description of your project"
  },
  "output": {
    "type": "file",
    "options": ["console", "linkedin", "file"],
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
    "tone": "motivational"
  },
  "github": {
    "branch": "main",
    "daysToFetch": 7,
    "excludePatterns": ["refactor", "chore", "docs", "test", "ci", "cd"]
  }
}
```

### Output Types

The `output.type` configuration determines where the generated posts are sent:

- **`"console"`** - Display in terminal only (console.enabled still controls format)
- **`"file"`** - Save to files (JSON or TXT format) - ignores file.enabled
- **`"linkedin"`** - Post directly to LinkedIn - ignores linkedin.enabled
- **`"multiple"`** - Use enabled flags to determine which outputs to use

**Note:** When using specific types (`"file"`, `"linkedin"`), the `enabled` flags are ignored. Only use `enabled` flags when `type` is set to `"multiple"`.

### GitHub Configuration

The `github` section allows you to customize how commits are fetched and filtered:

- **`branch`** - Git branch to fetch commits from (default: `"main"`)
- **`daysToFetch`** - Number of days to look back for commits (default: `7`)
- **`excludePatterns`** - Array of patterns to exclude from commit messages (e.g., `["refactor", "chore", "docs"]`)

**Example:**
```json
{
  "github": {
    "branch": "develop",
    "daysToFetch": 14,
    "excludePatterns": ["refactor", "chore", "docs", "test", "ci", "cd"]
  }
}
```

### Examples

**Console only:**
```json
{
  "output": {
    "type": "console",
    "console": { "enabled": true, "format": "detailed" }
  }
}
```

**File output only:**
```json
{
  "output": {
    "type": "file",
    "file": { "enabled": false, "path": "./posts", "format": "json" }
  }
}
```

**LinkedIn posting only:**
```json
{
  "output": {
    "type": "linkedin",
    "linkedin": { "enabled": false, "visibility": "PUBLIC", "autoPost": true }
  }
}
```

**Multiple outputs:**
```json
{
  "output": {
    "type": "multiple",
    "console": { "enabled": true, "format": "detailed" },
    "file": { "enabled": true, "path": "./posts", "format": "json" },
    "linkedin": { "enabled": false, "visibility": "PUBLIC", "autoPost": true }
  }
}
```
In this last example, the post will be displayed in console and saved to file, but NOT posted to LinkedIn because `linkedin.enabled` is `false`.

### 5. LinkedIn API Setup

To post directly to LinkedIn, you need to set up LinkedIn API access:

#### Step 1: Create a LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in your app details
4. Request access to "Marketing Developer Platform"

#### Step 2: Get Your Person ID
1. Go to your LinkedIn profile
2. Right-click and "View Page Source"
3. Search for `"publicIdentifier"`
4. Note your Person ID (it's a numeric value)

#### Step 3: Generate Access Token
1. In your LinkedIn app, go to "Auth" tab
2. Add redirect URL: `http://localhost:3000/callback`
3. Use the OAuth 2.0 flow to get an access token
4. The token should have `w_member_social` scope

### 6. GitHub Token Setup
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope
3. Add it to your `.env` file

## Usage

### Single Entry Point

All functionality is now available through a single entry point:

```bash
npm run [command] [options]
# or
node dist/index.js [command] [options]
```

### Commands

#### Generate Post Only
```bash
# Using npm scripts
npm run generate

# Direct command
npm run generate
# or
node dist/index.js generate
```

#### Generate and Post to LinkedIn
```bash
# Using npm scripts
npm run post

# Direct command
npm run post
# or
node dist/index.js post
```

#### Setup LinkedIn API
```bash
# Using npm scripts
npm run setup

# Direct command
npm run setup
# or
node dist/index.js setup
```

#### Create Configuration File
```bash
# Using npm scripts
npm run config

# Direct command
npm run config
# or
node dist/index.js config
```

#### Show Help
```bash
# Using npm scripts
npm run help

# Direct command
npm run help
# or
node dist/index.js help
```

### Advanced Options

```bash
# Generate with verbose logging
npm run generate -- --verbose

# Post with private visibility
npm run post -- --private

# Post without auto-confirmation
npm run post -- --no-auto-post



# Silent mode (disable all output)
npm run generate -- --silent
```

### Available Commands

- `generate, g` - Generate a LinkedIn post from recent commits (no posting)
- `post, p` - Generate and post to LinkedIn
- `setup, s` - Interactive LinkedIn API setup
- `config, cfg` - Create a custom configuration file
- `help, h` - Show help message

## Architecture

The project follows a clean, modular architecture with clear separation of concerns:

### Core Classes

- **`LinkedInPosterService`** - Main service that orchestrates all other services
- **`GitHubService`** - Handles GitHub API interactions and commit fetching
- **`OpenAIService`** - Manages OpenAI API calls and post generation
- **`LinkedInService`** - Handles LinkedIn API posting functionality
- **`ConfigManager`** - Manages environment variables and configuration
- **`Logger`** - Handles all console output and logging
- **`TemplateManager`** - Manages template loading and variable replacement
- **`OutputService`** - Handles multiple output types (console, file, LinkedIn)

### Directory Structure

```
src/
├── index.ts                   # Single entry point for all commands
├── types/
│   └── index.ts              # TypeScript type definitions
├── services/
│   ├── LinkedInPosterService.ts # Main service that orchestrates all others
│   ├── GitHubService.ts       # GitHub API interactions
│   ├── OpenAIService.ts       # OpenAI API interactions
│   ├── LinkedInService.ts     # LinkedIn API interactions
│   └── OutputService.ts       # Multiple output handling
└── utils/
    ├── ConfigManager.ts       # Configuration management
    ├── Logger.ts              # Logging utilities
    └── TemplateManager.ts     # Template management
templates/
└── linkedin-post.xml         # LinkedIn post generation template (XML format)
dist/                         # Compiled JavaScript output
```

## How It Works

1. **Fetch Commits**: Retrieves commits from the last N days (configurable via `github.daysToFetch`) from your GitHub repository
2. **Filter Content**: Removes technical commits (refactoring, bug fixes, etc.) based on `github.excludePatterns`
3. **Generate Post**: Uses OpenAI with a template-based prompt to create an engaging LinkedIn post in English
4. **Output Processing**: Handles multiple output types based on configuration (console, file, LinkedIn)

## Templates

The project uses a template-based system for generating prompts. Templates are stored in the `templates/` directory and use placeholder variables for dynamic content.

### Template Formats

The system supports XML template format:

**XML Format** (`templates/linkedin-post.xml`) - **Recommended**
- More structured and easier for AI to parse
- Clear separation of context, instructions, constraints, and data
- Better organization with nested elements

### Template Variables

The template supports the following variables:

- `{{PROJECT_NAME}}` - Your project name
- `{{LANGUAGE}}` - Post language (English/French)
- `{{TONE}}` - Desired tone (motivational, professional, etc.)
- `{{COMMITS_LIST}}` - Formatted list of commits
- `{{EMOJI_INSTRUCTION}}` - Emoji usage instructions
- `{{CTA_INSTRUCTION}}` - Call-to-action instructions
- `{{PROJECT_URL}}` - Your project URL
- `{{HASHTAGS_INSTRUCTION}}` - Hashtag instructions
- `{{MAX_LENGTH_INSTRUCTION}}` - Character limit instructions

### XML Template Structure

The XML template (`linkedin-post.xml`) is organized into clear sections:

```xml
<Prompt>
  <Context>
    <Background>...</Background>
    <Problem>...</Problem>
  </Context>
  
  <Instructions>
    <Request>...</Request>
    <Steps>
      <Step order="1">...</Step>
      <Step order="2">...</Step>
    </Steps>
  </Instructions>
  
  <Constraints>
    <Rule>...</Rule>
  </Constraints>
  
  <Data>
    <Commits>...</Commits>
    <ProjectInfo>...</ProjectInfo>
  </Data>
  
  <Output>
    <Format>...</Format>
    <Style>...</Style>
  </Output>
</Prompt>
```

### Customizing Templates

You can modify the template file to change the prompt structure and instructions. The template system makes it easy to:
- Adjust the tone and style of generated posts
- Add new instructions or constraints
- Support multiple languages
- Create different templates for different use cases
- Use structured XML format for better AI comprehension

## Programmatic Usage

You can also use the `LinkedInPoster` class programmatically:

```typescript
import { LinkedInPosterService } from './dist/services/LinkedInPosterService.js';

const poster = new LinkedInPosterService({
  verbose: true
});

// Generate post only
const result = await poster.generatePost();

// Generate and post to LinkedIn
const postedResult = await poster.generateAndPost({
  autoPost: true,
  visibility: 'PUBLIC'
});
```

## Cost Estimation

The script tracks OpenAI usage and estimates costs:
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- Typical post generation: ~$0.01-0.05 per post

## Troubleshooting

### LinkedIn API Issues
- Ensure your access token has the correct scopes (`w_member_social`)
- Check that your Person ID is correct
- Verify your LinkedIn app has the necessary permissions

### GitHub API Issues
- Verify your GitHub token has `repo` scope
- Check that the repository name and owner are correct

### OpenAI Issues
- Ensure your OpenAI API key is valid and has credits
- Check the API key format

## Security Notes

- Never commit your `.env` file to version control
- Keep your API tokens secure
- LinkedIn access tokens expire - you may need to refresh them periodically

## Development

### Development Mode

For development, you can use the TypeScript source directly without building:

```bash
# Install development dependencies
npm install

# Run in development mode (no build required)
npm run dev:generate
npm run dev:post
npm run dev:setup
npm run dev:config
npm run dev:help

# Or use the generic dev command
npm run dev generate
npm run dev post
```

### Building for Production

```bash
# Build the project
npm run build

# Run the built version
npm start
```

### TypeScript Configuration

The project uses strict TypeScript configuration with:
- Strict type checking
- No implicit any
- Strict null checks
- Exact optional property types
- Source maps for debugging

## License

ISC
