import fs from 'fs';
import path from 'path';

export class OutputService {
  constructor(config) {
    this.config = config;
    this.outputConfig = config.getOutputConfig();
  }

  async outputPost(post, metadata = {}) {
    const outputType = this.outputConfig.type;
    const results = {};

    // Always output to console if enabled
    if (this.outputConfig.console.enabled) {
      results.console = this.outputToConsole(post, metadata);
    }

    // Output based on type
    switch (outputType) {
      case 'console':
        // Only console (already handled above)
        break;
        
      case 'file':
        results.file = await this.outputToFile(post, metadata);
        break;
        
      case 'linkedin':
        results.linkedIn = await this.outputToLinkedIn(post, metadata);
        break;
        
      case 'multiple':
        // Use enabled flags for 'multiple' mode
        if (this.outputConfig.file.enabled) {
          results.file = await this.outputToFile(post, metadata);
        }
        if (this.outputConfig.linkedin.enabled) {
          results.linkedIn = await this.outputToLinkedIn(post, metadata);
        }
        break;
        
      default:
        console.warn(`⚠️  Unknown output type: ${outputType}`);
    }

    return results;
  }

  outputToConsole(post, metadata = {}) {
    const format = this.outputConfig.console.format;
    
    if (format === 'detailed') {
      console.log('\n📝 Generated LinkedIn Post:');
      console.log('=' .repeat(50));
      console.log(post);
      console.log('=' .repeat(50));
      
      if (metadata.totalTokens) {
        console.log(`\n📊 Stats:`);
        console.log(`- Tokens used: ${metadata.totalTokens}`);
        console.log(`- Estimated cost: $${metadata.estimatedCost?.toFixed(4) || 'N/A'}`);
        console.log(`- Model: ${metadata.model || 'N/A'}`);
      }
    } else {
      console.log(post);
    }

    return { success: true, format };
  }

  async outputToFile(post, metadata = {}) {
    const fileConfig = this.outputConfig.file;
    const outputPath = path.resolve(fileConfig.path);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `post-${timestamp}.${fileConfig.format}`;
    const filepath = path.join(outputPath, filename);

    let content;
    if (fileConfig.format === 'json') {
      content = JSON.stringify({
        post,
        metadata,
        generatedAt: new Date().toISOString(),
      }, null, 2);
    } else if (fileConfig.format === 'txt') {
      content = `Generated LinkedIn Post\n${'='.repeat(30)}\n\n${post}\n\nGenerated at: ${new Date().toISOString()}`;
    } else {
      content = post;
    }

    try {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`✅ Post saved to: ${filepath}`);
      return { success: true, filepath, format: fileConfig.format };
    } catch (error) {
      console.error(`❌ Error saving to file: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async outputToLinkedIn(post, metadata = {}) {
    const linkedInConfig = this.outputConfig.linkedin;
    
    // Check if LinkedIn is configured
    if (!this.config.hasLinkedInCredentials()) {
      console.error('❌ LinkedIn credentials not configured. Skipping LinkedIn output.');
      return { success: false, error: 'LinkedIn not configured' };
    }

    // If autoPost is disabled, just return success without posting
    if (!linkedInConfig.autoPost) {
      console.log('ℹ️  LinkedIn autoPost is disabled. Post not published.');
      return { success: true, posted: false, reason: 'autoPost disabled' };
    }

    // If confirmation is required, ask user
    if (linkedInConfig.requireConfirmation) {
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      return new Promise((resolve) => {
        rl.question('\n🤔 Do you want to post this to LinkedIn? (y/N): ', async (answer) => {
          rl.close();
          
          if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            const result = await this.actuallyPostToLinkedIn(post, linkedInConfig);
            resolve(result);
          } else {
            console.log('❌ Post cancelled by user.');
            resolve({ success: true, posted: false, reason: 'user cancelled' });
          }
        });
      });
    }

    // Post directly if no confirmation required
    return await this.actuallyPostToLinkedIn(post, linkedInConfig);
  }

  async actuallyPostToLinkedIn(post, linkedInConfig) {
    try {
      // Import LinkedInService dynamically to avoid circular dependencies
      const { LinkedInService } = await import('./LinkedInService.js');
      
      const linkedInService = new LinkedInService(
        this.config.config.LINKEDIN_PERSON_ID
      );

      const result = await linkedInService.postToLinkedIn(post, {
        visibility: linkedInConfig.visibility
      });

      if (result.success) {
        console.log('✅ Post published to LinkedIn successfully!');
        return { success: true, posted: true, postId: result.postId };
      } else {
        console.error('❌ Failed to post to LinkedIn:', result.error);
        return { success: false, posted: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Error posting to LinkedIn:', error.message);
      return { success: false, posted: false, error: error.message };
    }
  }
} 