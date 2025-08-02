// Example: Advanced usage of linkedin-poster library
import { 
  LinkedInPosterService, 
  GitHubService, 
  OpenAIService,
  LinkedInService,
  ConfigManager,
  Logger 
} from 'linkedin-poster';

async function advancedExample() {
  try {
    console.log('🚀 LinkedIn Poster Advanced Library Example\n');

    // Initialize individual services
    const configManager = new ConfigManager();
    const logger = new Logger({ verbose: true });
    const githubService = new GitHubService();
    const openAIService = new OpenAIService();
    const linkedInService = new LinkedInService();

    // Get configuration
    const config = configManager.getConfig();
    console.log('📋 Configuration loaded:', {
      project: config.project.name,
      language: config.ai.language,
      tone: config.ai.tone,
      daysToFetch: config.github.daysToFetch
    });

    // Fetch commits manually with custom parameters
    console.log('\n📥 Fetching recent commits...');
    const commits = await githubService.getRecentCommits(config.github.daysToFetch);
    
    if (commits.length === 0) {
      console.log('⚠️  No commits found in the specified time period');
      return;
    }

    console.log(`✅ Found ${commits.length} commits`);
    commits.slice(0, 3).forEach((commit, index) => {
      console.log(`  ${index + 1}. ${commit.commit.message.substring(0, 60)}...`);
    });

    // Filter commits manually (optional)
    const filteredCommits = commits.filter(commit => {
      const message = commit.commit.message.toLowerCase();
      const excludePatterns = config.github.excludePatterns;
      return !excludePatterns.some(pattern => message.includes(pattern));
    });

    console.log(`\n🎯 After filtering: ${filteredCommits.length} commits`);

    // Generate post with custom options
    console.log('\n🤖 Generating post with custom parameters...');
    const postResult = await openAIService.generatePost({
      commits: filteredCommits,
      projectName: config.project.name,
      projectUrl: config.project.url,
      projectDescription: config.project.description,
      language: config.ai.language,
      tone: config.ai.tone,
      model: config.ai.model,
      maxTokens: config.ai.maxTokens,
      temperature: config.ai.temperature
    });

    if (!postResult) {
      console.log('❌ Failed to generate post');
      return;
    }

    console.log('\n✅ Post generated successfully!');
    console.log(`📊 Tokens used: ${postResult.totalTokens}`);
    console.log(`💰 Estimated cost: $${postResult.estimatedCost.toFixed(4)}`);
    console.log(`🤖 Model: ${postResult.model}`);

    // Display the generated post
    console.log('\n📄 Generated post:');
    console.log('─'.repeat(60));
    console.log(postResult.post);
    console.log('─'.repeat(60));

    // Check LinkedIn configuration
    if (linkedInService.isConfigured()) {
      console.log('\n🔗 LinkedIn is configured');
      
      // Post to LinkedIn with custom visibility
      const visibility = 'PUBLIC'; // or 'CONNECTIONS'
      console.log(`\n📤 Posting to LinkedIn with ${visibility} visibility...`);
      
      const linkedInResult = await linkedInService.postToLinkedIn(
        postResult.post, 
        visibility
      );

      if (linkedInResult.success) {
        console.log('✅ Post published successfully!');
        console.log(`🆔 Post ID: ${linkedInResult.postId}`);
        console.log(`🔗 View post: https://www.linkedin.com/feed/update/${linkedInResult.postId}/`);
      } else {
        console.log('❌ Failed to post to LinkedIn');
        console.log(`Error: ${linkedInResult.message}`);
      }
    } else {
      console.log('\n⚠️  LinkedIn is not configured. Skipping posting.');
      console.log('💡 Run "linkedin-poster setup" to configure LinkedIn API access.');
    }

    // Save to file (optional)
    if (config.output.file.enabled) {
      console.log('\n💾 Saving post to file...');
      const fs = await import('fs');
      const path = await import('path');
      
      const outputDir = config.output.file.path;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `post-${timestamp}.${config.output.file.format}`;
      const filepath = path.join(outputDir, filename);

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      let content;
      if (config.output.file.format === 'json') {
        content = JSON.stringify({
          post: postResult.post,
          metadata: {
            tokens: postResult.totalTokens,
            cost: postResult.estimatedCost,
            model: postResult.model,
            generatedAt: new Date().toISOString(),
            commits: filteredCommits.length
          }
        }, null, 2);
      } else {
        content = postResult.post;
      }

      fs.writeFileSync(filepath, content);
      console.log(`✅ Post saved to: ${filepath}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the advanced example
advancedExample().catch(console.error); 