import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export class ConfigManager {
  constructor() {
    dotenv.config();
    this.config = this.loadConfig();
  }

  loadConfig() {
    // Load default config
    const defaultConfigPath = path.join(process.cwd(), 'config', 'default.json');
    let defaultConfig = {};
    
    try {
      if (fs.existsSync(defaultConfigPath)) {
        defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load default config file:', error.message);
    }

    // Load custom config if it exists
    const customConfigPath = path.join(process.cwd(), 'config.json');
    let customConfig = {};
    
    try {
      if (fs.existsSync(customConfigPath)) {
        customConfig = JSON.parse(fs.readFileSync(customConfigPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load custom config file:', error.message);
    }

    // Merge configs (custom overrides default)
    const mergedConfig = this.deepMerge(defaultConfig, customConfig);

    // Load sensitive environment variables
    const envConfig = this.loadEnvironmentConfig();

    return {
      ...mergedConfig,
      ...envConfig
    };
  }

  deepMerge(target, source) {
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

  loadEnvironmentConfig() {
    const requiredVars = [
      'GH_TOKEN',
      'OPENAI_API_KEY',
      'GITHUB_OWNER',
      'GITHUB_REPO'
    ];

    const optionalVars = [
      'LINKEDIN_ACCESS_TOKEN',
      'LINKEDIN_PERSON_ID'
    ];

    const envConfig = {};

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
      envConfig[varName] = process.env[varName] || null;
    }

    return envConfig;
  }

  get(key) {
    return this.config[key];
  }

  getAll() {
    return { ...this.config };
  }

  hasLinkedInCredentials() {
    return !!(this.config.LINKEDIN_ACCESS_TOKEN && this.config.LINKEDIN_PERSON_ID);
  }

  validateLinkedInConfig() {
    if (!this.hasLinkedInCredentials()) {
      throw new Error('LinkedIn credentials not configured. Please set LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_ID in your .env file.');
    }
  }

  getGitHubConfig() {
    return {
      token: this.config.GH_TOKEN,
      owner: this.config.GITHUB_OWNER,
      repo: this.config.GITHUB_REPO,
      branch: this.config.github?.branch || 'main',
      daysToFetch: this.config.github?.daysToFetch || 7,
      excludePatterns: this.config.github?.excludePatterns || []
    };
  }

  getOpenAIConfig() {
    return {
      apiKey: this.config.OPENAI_API_KEY,
      model: this.config.ai?.model || 'gpt-3.5-turbo',
      language: this.config.ai?.language || 'french',
      tone: this.config.ai?.tone || 'motivational',
      maxTokens: this.config.ai?.maxTokens || 1000,
      temperature: this.config.ai?.temperature || 0.7
    };
  }

  getLinkedInConfig() {
    return {
      accessToken: this.config.LINKEDIN_ACCESS_TOKEN,
      personId: this.config.LINKEDIN_PERSON_ID,
      visibility: this.config.output?.linkedin?.visibility || 'PUBLIC',
      autoPost: this.config.output?.linkedin?.autoPost !== false,
      requireConfirmation: this.config.output?.linkedin?.requireConfirmation || false
    };
  }

  getProjectConfig() {
    return {
      name: this.config.project?.name || 'Your Project',
      url: this.config.project?.url || 'https://your-project-url.com',
      description: this.config.project?.description || ''
    };
  }

  getOutputConfig() {
    return {
      type: this.config.output?.type || 'linkedin',
      console: this.config.output?.console || { enabled: true, format: 'detailed' },
      file: this.config.output?.file || { enabled: false, path: './output/posts', format: 'json' },
      linkedin: this.config.output?.linkedin || { enabled: true, visibility: 'PUBLIC', autoPost: true }
    };
  }

  getPostConfig() {
    return {
      maxLength: this.config.post?.maxLength || 3000,
      includeHashtags: this.config.post?.includeHashtags !== false,
      hashtags: this.config.post?.hashtags || ['#tech', '#development'],
      callToAction: this.config.post?.callToAction !== false,
      includeEmojis: this.config.post?.includeEmojis !== false
    };
  }

  getLoggingConfig() {
    return {
      level: this.config.logging?.level || 'info',
      format: this.config.logging?.format || 'colored',
      showProgress: this.config.logging?.showProgress !== false,
      showStats: this.config.logging?.showStats !== false
    };
  }

  // Method to create a custom config file
  createCustomConfig() {
    const customConfigPath = path.join(process.cwd(), 'config.json');
    const defaultConfigPath = path.join(process.cwd(), 'config', 'default.json');
    
    if (fs.existsSync(customConfigPath)) {
      console.log('⚠️  Custom config file already exists');
      return;
    }

    try {
      const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
      fs.writeFileSync(customConfigPath, JSON.stringify(defaultConfig, null, 2));
      console.log('✅ Custom config file created: config.json');
      console.log('📝 Edit this file to customize your settings');
    } catch (error) {
      console.error('❌ Error creating custom config:', error.message);
    }
  }
} 