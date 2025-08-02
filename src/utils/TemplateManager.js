import fs from 'fs';
import path from 'path';

export class TemplateManager {
  constructor() {
    this.templatesDir = path.join(process.cwd(), 'templates');
  }

  loadTemplate(templateName) {
    // Try different file extensions
    const extensions = ['.xml', '.md'];
    let templatePath = null;
    let template = null;
    
    for (const ext of extensions) {
      templatePath = path.join(this.templatesDir, `${templateName}${ext}`);
      if (fs.existsSync(templatePath)) {
        template = fs.readFileSync(templatePath, 'utf8');
        break;
      }
    }
    
    if (!template) {
      throw new Error(`Template not found: ${templateName} (tried: ${extensions.join(', ')})`);
    }
    
    return template;
  }

  renderTemplate(templateName, variables = {}) {
    let template = this.loadTemplate(templateName);
    
    // Replace all variables in the template
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      template = template.replace(new RegExp(placeholder, 'g'), value || '');
    });
    
    return template;
  }

  // Helper method to format commits list
  formatCommitsList(commits) {
    if (!commits || commits.length === 0) {
      return 'No commits found';
    }
    
    return commits.map(commit => `- ${commit}`).join('\n');
  }

  // Helper method to format boolean instructions
  formatBooleanInstruction(enabled, instruction) {
    return enabled ? instruction : 'Disabled';
  }

  // Helper method to format hashtags
  formatHashtagsInstruction(includeHashtags, hashtags) {
    if (!includeHashtags) {
      return 'Disabled';
    }
    
    const hashtagList = hashtags.join(' ');
    return `Add these hashtags at the end: ${hashtagList}`;
  }

  // Helper method to format call to action
  formatCTAInstruction(callToAction, projectUrl) {
    if (!callToAction) {
      return 'Disabled';
    }
    
    return `End with an engaging phrase to invite people to try the tool. Add a link to the project: ${projectUrl}`;
  }

  // Helper method to format emoji instruction
  formatEmojiInstruction(includeEmojis) {
    return this.formatBooleanInstruction(
      includeEmojis, 
      'Use appropriate emojis to make the post more engaging'
    );
  }

  // Helper method to format max length instruction
  formatMaxLengthInstruction(maxLength) {
    if (!maxLength) {
      return 'No limit';
    }
    
    return `The post should not exceed ${maxLength} characters`;
  }
} 