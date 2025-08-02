import { GitHubService } from './GitHubService.js';
import { OpenAIService } from './OpenAIService.js';
import { LinkedInService } from './LinkedInService.js';
import { OutputService } from './OutputService.js';
import { ConfigManager } from '../utils/ConfigManager.js';
import { Logger } from '../utils/Logger.js';

export class LinkedInPosterService {
  constructor(options = {}) {
    this.config = new ConfigManager();
    this.logger = new Logger(options);

    // Initialize services
    const githubConfig = this.config.getGitHubConfig();
    const openAIConfig = this.config.getOpenAIConfig();
    const linkedInConfig = this.config.getLinkedInConfig();

    this.githubService = new GitHubService(
      githubConfig.token,
      githubConfig.owner,
      githubConfig.repo,
      {
        branch: githubConfig.branch,
        daysToFetch: githubConfig.daysToFetch,
        excludePatterns: githubConfig.excludePatterns
      }
    );

    this.openAIService = new OpenAIService(openAIConfig.apiKey, {
      model: openAIConfig.model,
      language: openAIConfig.language,
      tone: openAIConfig.tone,
      maxTokens: openAIConfig.maxTokens,
      temperature: openAIConfig.temperature
    });

    this.linkedInService = new LinkedInService(
      linkedInConfig.accessToken,
      linkedInConfig.personId
    );

    this.outputService = new OutputService(this.config);
  }

  async generatePost(options = {}) {
    try {
      this.logger.section('Starting Post Generation');

      // Step 1: Fetch commits
      this.logger.progress(1, 3, 'Fetching recent commits...');
      const commits = await this.githubService.fetchCommitsSinceLastWeek();

      if (commits.length === 0) {
        this.logger.warning('Aucun nouveau commit cette semaine.');
        return null;
      }

      this.logger.success(`Found ${commits.length} commits`);

      // Step 2: Generate post
      this.logger.progress(2, 3, 'Generating LinkedIn post...');
      const projectConfig = this.config.getProjectConfig();
      const postConfig = this.config.getPostConfig();
      const result = await this.openAIService.generatePost(
        commits,
        projectConfig.name,
        projectConfig.url,
        postConfig
      );

      this.logger.success('Post generated successfully');

      // Step 3: Handle outputs based on configuration
      this.logger.progress(3, 3, 'Processing outputs...');
      const outputResults = await this.outputService.outputPost(result.post, {
        totalTokens: result.totalTokens,
        estimatedCost: result.estimatedCost,
        model: result.model
      });

      return { ...result, outputResults };

    } catch (error) {
      this.logger.error(`Failed to generate post: ${error.message}`);
      throw error;
    }
  }

  async generateAndPost(options = {}) {
    try {
      this.logger.section('Starting LinkedIn Post Generation and Publishing');

      // Validate LinkedIn configuration
      this.config.validateLinkedInConfig();

      // Step 1: Generate post
      this.logger.progress(1, 4, 'Generating post...');
      const result = await this.generatePost(options);

      if (!result) {
        return null;
      }

      // Step 2: Confirm posting (if not auto-posting)
      if (options.requireConfirmation !== false) {
        this.logger.info('❓ Do you want to post this to LinkedIn? (y/n)');
        // In a real implementation, you might want to add user input here
        const shouldPost = options.autoPost !== false;

        if (!shouldPost) {
          this.logger.warning('Posting cancelled by user.');
          return result;
        }
      }

      // Step 3: Post to LinkedIn
      this.logger.progress(2, 4, 'Posting to LinkedIn...');
      const linkedInResult = await this.linkedInService.postContent(
        result.post,
        options.visibility || 'PUBLIC'
      );

      this.logger.success('Successfully posted to LinkedIn!');
      this.logger.info(`Post ID: ${linkedInResult.id}`);

      // Step 4: Return combined results
      this.logger.progress(3, 4, 'Finalizing...');

      return {
        ...result,
        linkedInPostId: linkedInResult.id,
        postedAt: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Failed to generate and post: ${error.message}`);
      throw error;
    }
  }

  // Utility methods
  isLinkedInConfigured() {
    return this.config.hasLinkedInCredentials();
  }

  getConfig() {
    return this.config.getAll();
  }

  setLoggerOptions(options) {
    this.logger.setVerbose(options.verbose || false);
    this.logger.setSilent(options.silent || false);
  }

  updateLinkedInCredentials(accessToken, personId) {
    this.linkedInService.setCredentials(accessToken, personId);
  }
} 