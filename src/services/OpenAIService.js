import { OpenAI } from 'openai';
import { TemplateManager } from '../utils/TemplateManager.js';

export class OpenAIService {
  constructor(options = {}) {
    // Get API key directly from environment for security
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({ apiKey });
    this.model = options.model || 'gpt-3.5-turbo';
    this.language = options.language || 'english';
    this.tone = options.tone || 'motivational';
    this.maxTokens = options.maxTokens || 1000;
    this.temperature = options.temperature || 0.7;
    this.costPer1kTokens = 0.002; // GPT-3.5-turbo cost
    this.templateManager = new TemplateManager();
  }

  async generatePost(commits, projectName, projectUrl, postConfig = {}) {
    const prompt = this.buildPrompt(commits, projectName, projectUrl, postConfig);

    const response = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
    });

    const post = response.choices[0].message.content;
    const totalTokens = response.usage.total_tokens;
    const estimatedCost = this.calculateCost(totalTokens);

    return {
      post,
      totalTokens,
      estimatedCost,
      model: this.model
    };
  }

  buildPrompt(commits, projectName, projectUrl, postConfig = {}) {
    const language = this.language === 'french' ? 'français' : 'english';
    const includeHashtags = postConfig.includeHashtags !== false;
    const hashtags = postConfig.hashtags || ['#tech', '#development'];
    const callToAction = postConfig.callToAction !== false;
    const includeEmojis = postConfig.includeEmojis !== false;

    const variables = {
      PROJECT_NAME: projectName,
      LANGUAGE: language,
      TONE: this.tone,
      COMMITS_LIST: this.templateManager.formatCommitsList(commits),
      EMOJI_INSTRUCTION: this.templateManager.formatEmojiInstruction(includeEmojis),
      CTA_INSTRUCTION: this.templateManager.formatCTAInstruction(callToAction, projectUrl),
      PROJECT_URL: projectUrl,
      HASHTAGS_INSTRUCTION: this.templateManager.formatHashtagsInstruction(includeHashtags, hashtags),
      MAX_LENGTH_INSTRUCTION: this.templateManager.formatMaxLengthInstruction(postConfig.maxLength)
    };

    return this.templateManager.renderTemplate('linkedin-post', variables);
  }

  calculateCost(totalTokens) {
    return (totalTokens / 1000) * this.costPer1kTokens;
  }

  setModel(model) {
    this.model = model;
  }

  setCostPer1kTokens(cost) {
    this.costPer1kTokens = cost;
  }
} 