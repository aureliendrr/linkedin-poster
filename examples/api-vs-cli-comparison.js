// Example: API vs CLI behavior comparison
import { generatePost, createPoster } from 'linkedin-poster';

async function demonstrateAPIvsCLI() {
  console.log('🚀 LinkedIn Poster - API vs CLI Behavior\n');

  // ===== API USAGE (Library) =====
  console.log('📚 API Usage (Library):');
  console.log('─'.repeat(50));
  
  console.log('1️⃣ Simple API call (no logs):');
  const result = await generatePost();
  
  if (result) {
    console.log('✅ Result received silently');
    console.log(`📊 Tokens: ${result.totalTokens}`);
    console.log(`💰 Cost: $${result.estimatedCost.toFixed(4)}`);
    console.log(`📄 Post: ${result.post.substring(0, 100)}...`);
  }

  console.log('\n2️⃣ Custom instance with logging:');
  const verbosePoster = createPoster({ verbose: true });
  const verboseResult = await verbosePoster.generatePost();
  
  if (verboseResult) {
    console.log('✅ Verbose result received');
  }

  // ===== CLI USAGE =====
  console.log('\n\n💻 CLI Usage:');
  console.log('─'.repeat(50));
  console.log('To see verbose output, run these commands:');
  console.log('');
  console.log('  # Verbose by default (shows progress, stats, etc.)');
  console.log('  linkedin-poster generate');
  console.log('');
  console.log('  # Silent mode');
  console.log('  linkedin-poster generate --silent');
  console.log('');
  console.log('  # Post to LinkedIn with verbose output');
  console.log('  linkedin-poster post');
  console.log('');
  console.log('  # Post silently');
  console.log('  linkedin-poster post --silent');
  
  console.log('\n\n🎯 Key Differences:');
  console.log('• API: Silent by default, you control all output');
  console.log('• CLI: Verbose by default, shows progress and details');
  console.log('• API: Perfect for integration into applications');
  console.log('• CLI: Perfect for interactive use and debugging');
}

// Run the demonstration
demonstrateAPIvsCLI().catch(console.error); 