// Example: Simple usage of linkedin-poster library
import { generatePost, generateAndPost, isLinkedInConfigured } from 'linkedin-poster';

async function main() {
  try {
    console.log('🚀 LinkedIn Poster - Simple Usage Example\n');

    // Check if LinkedIn is configured
    if (isLinkedInConfigured()) {
      console.log('✅ LinkedIn is configured and ready for posting');
    } else {
      console.log('⚠️  LinkedIn is not configured. Only generating posts.');
    }

    // Simple post generation
    console.log('\n📝 Generating post from recent commits...');
    const result = await generatePost();

    if (result) {
      console.log('\n✅ Post generated successfully!');
      console.log(`📊 Tokens used: ${result.totalTokens}`);
      console.log(`💰 Estimated cost: $${result.estimatedCost.toFixed(4)}`);
      console.log(`🤖 Model: ${result.model}`);
      console.log('\n📄 Generated post:');
      console.log('─'.repeat(50));
      console.log(result.post);
      console.log('─'.repeat(50));

      // If LinkedIn is configured, post automatically
      if (isLinkedInConfigured()) {
        console.log('\n📤 Posting to LinkedIn...');
        const postResult = await generateAndPost({
          autoPost: true,
          visibility: 'PUBLIC'
        });

        if (postResult?.linkedInPostId) {
          console.log('✅ Post published successfully!');
          console.log(`🆔 Post ID: ${postResult.linkedInPostId}`);
          console.log(`📅 Posted at: ${postResult.postedAt}`);
        } else {
          console.log('❌ Failed to post to LinkedIn');
        }
      }
    } else {
      console.log('❌ No commits found or failed to generate post');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
main().catch(console.error); 