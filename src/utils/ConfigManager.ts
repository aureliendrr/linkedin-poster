import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { 
  AppConfig, 
  GitHubConfig, 
  AIConfig, 
  LinkedInConfig, 
  ProjectConfig, 
  OutputConfig,
  EnvironmentVariables 
} from '../types/index.js';

export class ConfigManager {
  private config: AppConfig & EnvironmentVariables;

  constructor() {
    dotenv.config();
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig & EnvironmentVariables {
    // Load default config
    const defaultConfigPath = path.join(process.cwd(), 'config', 'default.json');
    let defaultConfig: Partial<AppConfig> = {};
    
    try {
      if (fs.existsSync(defaultConfigPath)) {
        defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load default config file:', (error as Error).message);
    }

    // Load custom config if it exists
    const customConfigPath = path.join(process.cwd(), 'config.json');
    let customConfig: Partial<AppConfig> = {};
    
    try {
      if (fs.existsSync(customConfigPath)) {
        customConfig = JSON.parse(fs.readFileSync(customConfigPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load custom config file:', (error as Error).message);
    }

    // Merge configs (custom overrides default)
    const mergedConfig = this.deepMerge(defaultConfig, customConfig);

    // Load sensitive environment variables
    const envConfig = this.loadEnvironmentConfig();

    return {
      ...mergedConfig,
      ...envConfig
    } as AppConfig & EnvironmentVariables;
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private loadEnvironmentConfig(): EnvironmentVariables {
    const requiredVars = [
      'GITHUB_OWNER',
      'GITHUB_REPO'
    ] as const;

    const optionalVars = [
      'LINKEDIN_PERSON_ID'
    ] as const;

    const envConfig: Partial<EnvironmentVariables> = {};

    // Load required variables
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (!value) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
      envConfig[varName] = value;
    }

    // Load optional variables
    for (const varName of optionalVars) {
      envConfig[varName] = process.env[varName] || '';
    }

    // Load other environment variables
    envConfig.GH_TOKEN = process.env.GH_TOKEN || '';
    envConfig.OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
    const linkedinToken = process.env.LINKEDIN_ACCESS_TOKEN;
    if (linkedinToken) {
      envConfig.LINKEDIN_ACCESS_TOKEN = linkedinToken;
    }

    return envConfig as EnvironmentVariables;
  }

  get(key: string): any {
    return this.config[key as keyof typeof this.config];
  }

  getAll(): AppConfig & EnvironmentVariables {
    return { ...this.config };
  }

  hasLinkedInCredentials(): boolean {
    return !!(process.env.LINKEDIN_ACCESS_TOKEN && this.config.LINKEDIN_PERSON_ID);
  }

  validateLinkedInConfig(): void {
    if (!this.hasLinkedInCredentials()) {
      throw new Error('LinkedIn credentials not configured. Please set LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_ID environment variables.');
    }
  }

  validateAllCredentials(): void {
    const requiredVars = [
      'GITHUB_OWNER',
      'GITHUB_REPO',
      'OPENAI_API_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  getGitHubConfig(): GitHubConfig {
    return {
      owner: this.config.GITHUB_OWNER,
      repo: this.config.GITHUB_REPO,
      branch: this.config.github?.branch || 'main',
      daysToFetch: this.config.github?.daysToFetch || 7,
      excludePatterns: this.config.github?.excludePatterns || ['refactor', 'chore', 'docs', 'test', 'ci', 'cd']
    };
  }

  getOpenAIConfig(): AIConfig {
    const config: AIConfig = {
      model: this.config.ai?.model || 'gpt-3.5-turbo',
      language: this.config.ai?.language || 'english',
      tone: this.config.ai?.tone || 'motivational'
    };
    
    if (this.config.ai?.maxTokens !== undefined) {
      config.maxTokens = this.config.ai.maxTokens;
    }
    if (this.config.ai?.temperature !== undefined) {
      config.temperature = this.config.ai.temperature;
    }
    
    return config;
  }

  getLinkedInConfig(): LinkedInConfig {
    return {
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
      personId: this.config.LINKEDIN_PERSON_ID || ''
    };
  }

  getProjectConfig(): ProjectConfig {
    return {
      name: this.config.project?.name || 'My Project',
      url: this.config.project?.url || 'https://github.com',
      description: this.config.project?.description || 'A software project'
    };
  }

  getOutputConfig(): OutputConfig {
    return {
      type: this.config.output?.type || 'console',
      options: this.config.output?.options || ['console', 'linkedin', 'file'],
      console: {
        enabled: this.config.output?.console?.enabled ?? true,
        format: this.config.output?.console?.format || 'detailed'
      },
      file: {
        enabled: this.config.output?.file?.enabled ?? false,
        path: this.config.output?.file?.path || './posts',
        format: this.config.output?.file?.format || 'json'
      },
      linkedin: {
        enabled: this.config.output?.linkedin?.enabled ?? false,
        visibility: this.config.output?.linkedin?.visibility || 'PUBLIC',
        autoPost: this.config.output?.linkedin?.autoPost ?? true,
        requireConfirmation: this.config.output?.linkedin?.requireConfirmation ?? false
      }
    };
  }

  getPostConfig(): any {
    return {
      language: this.config.ai?.language || 'english',
      tone: this.config.ai?.tone || 'motivational',
      maxLength: 1300
    };
  }

  getLoggingConfig(): any {
    return {
      verbose: false,
      silent: false
    };
  }

  createCustomConfig(): void {
    const defaultConfig: AppConfig = {
      project: {
        name: 'Your Project Name',
        url: 'https://your-project-url.com',
        description: 'A brief description of your project'
      },
      output: {
        type: 'multiple',
        options: ['console', 'linkedin', 'file'],
        console: {
          enabled: true,
          format: 'detailed'
        },
        file: {
          enabled: true,
          path: './output/posts',
          format: 'json'
        },
        linkedin: {
          enabled: true,
          visibility: 'PUBLIC',
          autoPost: true,
          requireConfirmation: true
        }
      },
      ai: {
        model: 'gpt-3.5-turbo',
        language: 'english',
        tone: 'motivational'
      },
      github: {
        owner: process.env.GITHUB_OWNER || 'your-username',
        repo: process.env.GITHUB_REPO || 'your-repo',
        branch: 'main',
        daysToFetch: 7,
        excludePatterns: ['refactor', 'chore', 'docs', 'test', 'ci', 'cd']
      }
    };

    const configPath = path.join(process.cwd(), 'config.json');
    
    if (fs.existsSync(configPath)) {
      console.log('⚠️  config.json already exists. Skipping creation.');
      return;
    }

    try {
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log('✅ Created config.json with default settings');
      console.log('📝 Please edit the file to customize your configuration');
    } catch (error) {
      console.error('❌ Error creating config.json:', (error as Error).message);
    }
  }
} 