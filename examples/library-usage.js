// Example: Using linkedin-poster as a library
import { LinkedInPosterService } from 'linkedin-poster';

async function main() {
  try {
    // Create a poster instance with verbose logging
    const poster = new LinkedInPosterService({
      verbose: true
    });

    console.log('🚀 LinkedIn Poster Library Example\n');

    // Check if LinkedIn is configured
    if (poster.isLinkedInConfigured()) {
      console.log('✅ LinkedIn is configured and ready for posting');
    } else {
      console.log('⚠️  LinkedIn is not configured. Only generating posts.');
    }

    // Generate a post from recent commits
    console.log('\n📝 Generating post from recent commits...');
    const result = await poster.generatePost();

    if (result) {
      console.log('\n✅ Post generated successfully!');
      console.log(`📊 Tokens used: ${result.totalTokens}`);
      console.log(`💰 Estimated cost: $${result.estimatedCost.toFixed(4)}`);
      console.log(`🤖 Model: ${result.model}`);
      console.log('\n📄 Generated post:');
      console.log('─'.repeat(50));
      console.log(result.post);
      console.log('─'.repeat(50));

      // If LinkedIn is configured, ask if user wants to post
      if (poster.isLinkedInConfigured()) {
        const readline = await import('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const question = (prompt) => new Promise((resolve) => {
          rl.question(prompt, resolve);
        });

        const shouldPost = await question('\n🤔 Do you want to post this to LinkedIn? (y/n): ');
        rl.close();

        if (shouldPost.toLowerCase() === 'y') {
          console.log('\n📤 Posting to LinkedIn...');
          const postResult = await poster.generateAndPost({
            autoPost: true,
            visibility: 'PUBLIC'
          });

          if (postResult?.linkedin?.success) {
            console.log('✅ Post published successfully!');
            console.log(`🆔 Post ID: ${postResult.linkedin.postId}`);
          } else {
            console.log('❌ Failed to post to LinkedIn');
            console.log(`Error: ${postResult?.linkedin?.message}`);
          }
        } else {
          console.log('👋 Post not published. Goodbye!');
        }
      }
    } else {
      console.log('❌ Failed to generate post');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
main().catch(console.error); 