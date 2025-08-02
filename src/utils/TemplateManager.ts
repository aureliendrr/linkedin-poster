import fs from 'fs';
import path from 'path';
import { Commit, TemplateVariables } from '../types/index.js';

export class TemplateManager {
  private templatesDir: string;

  constructor() {
    this.templatesDir = path.join(process.cwd(), 'templates');
  }

  renderTemplate(templateName: string, variables: TemplateVariables): string {
    const templatePath = path.join(this.templatesDir, `${templateName}.xml`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace variables in template
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      template = template.replace(new RegExp(placeholder, 'g'), value);
    }

    return template;
  }

  formatCommitsList(commits: Commit[]): string {
    if (commits.length === 0) {
      return 'No commits found';
    }

    return commits
      .map((commit, index) => `${index + 1}. ${commit.message}`)
      .join('\n');
  }

  formatEmojiInstruction(includeEmojis: boolean): string {
    if (includeEmojis) {
      return 'Use relevant emojis to make the post more engaging and visually appealing.';
    }
    return 'Do not use emojis in this post.';
  }

  formatCTAInstruction(includeCTA: boolean, projectUrl: string): string {
    if (includeCTA && projectUrl) {
      return `Include a call-to-action encouraging readers to check out the project at ${projectUrl}`;
    }
    return 'Do not include a call-to-action in this post.';
  }

  formatHashtagsInstruction(includeHashtags: boolean, hashtags: string[]): string {
    if (includeHashtags && hashtags.length > 0) {
      return `Include these hashtags at the end: ${hashtags.join(', ')}`;
    }
    return 'Do not include hashtags in this post.';
  }

  formatMaxLengthInstruction(maxLength?: number): string {
    if (maxLength) {
      return `Keep the post under ${maxLength} characters.`;
    }
    return 'Keep the post concise and engaging.';
  }
} 