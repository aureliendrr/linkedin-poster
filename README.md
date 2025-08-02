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

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

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

### 3. Configuration File

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

### 3. LinkedIn API Setup

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

### 4. GitHub Token Setup
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope
3. Add it to your `.env` file

## Usage

### Single Entry Point

All functionality is now available through a single entry point:

```bash
node src/index.js [command] [options]
```

### Commands

#### Generate Post Only
```bash
# Using npm scripts
npm run generate

# Direct command
node src/index.js generate
# or
node src/index.js g
```

#### Generate and Post to LinkedIn
```bash
# Using npm scripts
npm run post

# Direct command
node src/index.js post
# or
node src/index.js p
```

#### Setup LinkedIn API
```bash
# Using npm scripts
npm run setup

# Direct command
node src/index.js setup
# or
node src/index.js s
```

#### Create Configuration File
```bash
# Using npm scripts
npm run config

# Direct command
node src/index.js config
# or
node src/index.js cfg
```

#### Show Help
```bash
# Using npm scripts
npm run help

# Direct command
node src/index.js help
# or
node src/index.js h
```

### Advanced Options

```bash
# Generate with verbose logging
node src/index.js generate --verbose

# Post with private visibility
node src/index.js post --private

# Post without auto-confirmation
node src/index.js post --no-auto-post



# Silent mode (disable all output)
node src/index.js generate --silent
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
├── index.js                   # Single entry point for all commands
├── services/
│   ├── LinkedInPosterService.js # Main service that orchestrates all others
│   ├── GitHubService.js       # GitHub API interactions
│   ├── OpenAIService.js       # OpenAI API interactions
│   └── LinkedInService.js     # LinkedIn API interactions
└── utils/
    ├── ConfigManager.js       # Configuration management
    ├── Logger.js              # Logging utilities
    └── TemplateManager.js     # Template management
services/
├── LinkedInPosterService.js # Main service that orchestrates all others
├── GitHubService.js       # GitHub API interactions
├── OpenAIService.js       # OpenAI API interactions
├── LinkedInService.js     # LinkedIn API interactions
└── OutputService.js       # Multiple output handling
templates/
└── linkedin-post.xml         # LinkedIn post generation template (XML format)
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

```javascript
import { LinkedInPosterService } from './src/services/LinkedInPosterService.js';

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

See `examples/usage.js` for more detailed examples.

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

## License

ISC
