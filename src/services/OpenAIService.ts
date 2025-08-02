import { OpenAI } from 'openai';
import { TemplateManager } from '../utils/TemplateManager.js';
import { Commit, PostGenerationResult, TemplateVariables } from '../types/index.js';

interface OpenAIServiceOptions {
  model?: string;
  language?: 'english' | 'french';
  tone?: string;
  maxTokens?: number;
  temperature?: number;
}

interface PostConfig {
  language?: 'english' | 'french';
  tone?: string;
  maxLength?: number;
  includeHashtags?: boolean;
  hashtags?: string[];
  callToAction?: boolean;
  includeEmojis?: boolean;
}

export class OpenAIService {
  private openai: OpenAI;
  private model: string;
  private language: 'english' | 'french';
  private tone: string;
  private maxTokens: number;
  private temperature: number;
  private costPer1kTokens: number;
  private templateManager: TemplateManager;

  constructor(options: OpenAIServiceOptions = {}) {
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

  async generatePost(commits: Commit[], projectName: string, projectUrl: string, postConfig: PostConfig = {}): Promise<PostGenerationResult> {
    const prompt = this.buildPrompt(commits, projectName, projectUrl, postConfig);

    const response = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
    });

    const post = response.choices[0]?.message?.content || '';
    const totalTokens = response.usage?.total_tokens || 0;
    const estimatedCost = this.calculateCost(totalTokens);

    return {
      post,
      totalTokens,
      estimatedCost,
      model: this.model
    };
  }

  private buildPrompt(commits: Commit[], projectName: string, projectUrl: string, postConfig: PostConfig = {}): string {
    const language = this.language === 'french' ? 'français' : 'english';
    const includeHashtags = postConfig.includeHashtags !== false;
    const hashtags = postConfig.hashtags || ['#tech', '#development'];
    const callToAction = postConfig.callToAction !== false;
    const includeEmojis = postConfig.includeEmojis !== false;

    const variables: TemplateVariables = {
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

  private calculateCost(totalTokens: number): number {
    return (totalTokens / 1000) * this.costPer1kTokens;
  }

  setModel(model: string): void {
    this.model = model;
  }

  setCostPer1kTokens(cost: number): void {
    this.costPer1kTokens = cost;
  }
} 