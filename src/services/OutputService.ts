import fs from 'fs';
import path from 'path';
import { ConfigManager } from '../utils/ConfigManager.js';
import { OutputResult } from '../types/index.js';

interface PostMetadata {
  totalTokens: number;
  estimatedCost: number;
  model: string;
}

export class OutputService {
  private config: ConfigManager;

  constructor(config: ConfigManager) {
    this.config = config;
  }

  async outputPost(post: string, metadata: PostMetadata): Promise<OutputResult> {
    const outputConfig = this.config.getOutputConfig();
    const results: OutputResult = {};

    // Handle different output types
    switch (outputConfig.type) {
      case 'console':
        results.console = await this.outputToConsole(post, metadata, outputConfig);
        break;
      case 'file':
        results.file = await this.outputToFile(post, metadata, outputConfig);
        break;
      case 'linkedin':
        // LinkedIn posting is handled separately in LinkedInPosterService
        break;
      case 'multiple':
        // Handle multiple outputs based on enabled flags
        if (outputConfig.console.enabled) {
          results.console = await this.outputToConsole(post, metadata, outputConfig);
        }
        if (outputConfig.file.enabled) {
          results.file = await this.outputToFile(post, metadata, outputConfig);
        }
        break;
    }

    return results;
  }

  private async outputToConsole(post: string, metadata: PostMetadata, outputConfig: any): Promise<{ success: boolean; message?: string }> {
    try {
      if (outputConfig.console.format === 'detailed') {
        console.log('\n📣 Generated LinkedIn Post:');
        console.log('='.repeat(50));
        console.log(post);
        console.log('='.repeat(50));
        console.log(`\n📊 Stats:`);
        console.log(`- Tokens used: ${metadata.totalTokens}`);
        console.log(`- Model: ${metadata.model}`);
        console.log(`- Estimated cost: ~$${metadata.estimatedCost.toFixed(4)} USD`);
      } else {
        console.log(post);
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  private async outputToFile(post: string, metadata: PostMetadata, outputConfig: any): Promise<{ success: boolean; path?: string; message?: string }> {
    try {
      const outputPath = outputConfig.file.path;
      const format = outputConfig.file.format;

      // Security: Validate and sanitize the output path
      const sanitizedPath = this.sanitizePath(outputPath);
      if (!sanitizedPath) {
        return { success: false, message: 'Invalid output path provided' };
      }

      // Ensure directory exists
      if (!fs.existsSync(sanitizedPath)) {
        fs.mkdirSync(sanitizedPath, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `post-${timestamp}.${format}`;
      const filePath = path.join(sanitizedPath, filename);

      // Security: Validate the final file path
      const finalPath = path.resolve(filePath);
      const basePath = path.resolve(sanitizedPath);
      if (!finalPath.startsWith(basePath)) {
        return { success: false, message: 'Path traversal attack detected' };
      }

      let content: string;
      if (format === 'json') {
        content = JSON.stringify({
          post,
          metadata,
          generatedAt: new Date().toISOString()
        }, null, 2);
      } else {
        content = post;
      }

      fs.writeFileSync(finalPath, content, 'utf8');
      return { success: true, path: finalPath };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  /**
   * Sanitize and validate file path to prevent path traversal attacks
   */
  private sanitizePath(filePath: string): string | null {
    try {
      // Normalize the path
      const normalizedPath = path.normalize(filePath);
      
      // Check for path traversal attempts
      if (normalizedPath.includes('..') || normalizedPath.includes('~')) {
        return null;
      }
      
      // Ensure the path is within the current working directory
      const resolvedPath = path.resolve(normalizedPath);
      const cwd = process.cwd();
      
      if (!resolvedPath.startsWith(cwd)) {
        return null;
      }
      
      return resolvedPath;
    } catch (error) {
      return null;
    }
  }
} 