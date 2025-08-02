#!/usr/bin/env node

import { LinkedInPosterService } from './services/LinkedInPosterService.js';
import { ConfigManager } from './utils/ConfigManager.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function executeCommand(commandFn, options = {}) {
  try {
    await commandFn(options);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (rl && !rl.closed) {
      rl.close();
    }
  }
}

function showHelp() {
  console.log(`
🚀 LinkedIn Poster - AI-powered LinkedIn post generator

Usage: node src/index.js [command] [options]

Commands:
  generate, g     Generate a LinkedIn post from recent commits (no posting)
  post, p         Generate and post to LinkedIn
  setup, s        Interactive LinkedIn API setup
  config, cfg     Create a custom configuration file
  help, h         Show this help message

Options:
  --verbose       Enable verbose logging
  --silent        Disable all output
  --private       Post with private visibility (connections only)
  --no-auto-post  Don't auto-post (ask for confirmation)


Examples:
  node src/index.js generate
  node src/index.js post --private
  node src/index.js setup
  node src/index.js config

Environment Variables:
  Make sure you have a .env file with the required configuration.
  Run 'node src/index.js setup' to configure LinkedIn API access.
`);
}

async function handleGenerateCommand(options) {
  const poster = new LinkedInPosterService(options);
  const result = await poster.generatePost();
  if (!result) {
    process.exit(0);
  }
}

async function handlePostCommand(options) {
  const poster = new LinkedInPosterService(options);
  
  // Check if LinkedIn is configured
  if (!poster.isLinkedInConfigured()) {
    console.error('❌ LinkedIn credentials not configured. Please run: node src/index.js setup');
    process.exit(1);
  }

  const postOptions = {
    autoPost: !process.argv.includes('--no-auto-post'),
    requireConfirmation: process.argv.includes('--no-auto-post'),
    visibility: process.argv.includes('--private') ? 'CONNECTIONS' : 'PUBLIC'
  };

  const result = await poster.generateAndPost(postOptions);
  
  if (!result) {
    process.exit(0);
  }
}

async function handleSetupCommand() {
  console.log('🔗 LinkedIn API Setup Guide\n');
  console.log('This will help you set up LinkedIn API access for direct posting.\n');

  console.log('📋 Prerequisites:');
  console.log('1. A LinkedIn account');
  console.log('2. Access to LinkedIn Developers portal\n');

  const continueSetup = await question('Ready to continue? (y/n): ');
  if (continueSetup.toLowerCase() !== 'y') {
    console.log('Setup cancelled.');
    rl.close();
    return;
  }

  console.log('\n📝 Step 1: Create a LinkedIn App');
  console.log('1. Go to https://www.linkedin.com/developers/');
  console.log('2. Click "Create App"');
  console.log('3. Fill in your app details');
  console.log('4. Request access to "Marketing Developer Platform"\n');

  const appCreated = await question('Have you created your LinkedIn app? (y/n): ');
  if (appCreated.toLowerCase() !== 'y') {
    console.log('Please create your LinkedIn app first, then run this setup again.');
    rl.close();
    return;
  }

  console.log('\n🆔 Step 2: Get Your Person ID');
  console.log('1. Go to your LinkedIn profile');
  console.log('2. Right-click and "View Page Source"');
  console.log('3. Search for "publicIdentifier"');
  console.log('4. Note your Person ID (it\'s a numeric value)\n');

  const personId = await question('Enter your LinkedIn Person ID: ');
  if (!personId || isNaN(personId)) {
    console.log('❌ Invalid Person ID. Please enter a numeric value.');
    rl.close();
    return;
  }

  console.log('\n🔑 Step 3: Generate Access Token');
  console.log('1. In your LinkedIn app, go to "Auth" tab');
  console.log('2. Add redirect URL: http://localhost:3000/callback');
  console.log('3. Use the OAuth 2.0 flow to get an access token');
  console.log('4. The token should have "w_member_social" scope\n');

  const accessToken = await question('Enter your LinkedIn Access Token: ');
  if (!accessToken || accessToken.length < 50) {
    console.log('❌ Invalid access token. Please check your token.');
    rl.close();
    return;
  }

  // Update .env file
  const config = new ConfigManager();
  const envPath = '.env';
  
  try {
    const fs = await import('fs');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Add LinkedIn credentials to .env
    const linkedinVars = `\n# LinkedIn Configuration
LINKEDIN_ACCESS_TOKEN=${accessToken}
LINKEDIN_PERSON_ID=${personId}`;

    if (envContent.includes('LINKEDIN_ACCESS_TOKEN')) {
      // Update existing values
      envContent = envContent.replace(/LINKEDIN_ACCESS_TOKEN=.*/g, `LINKEDIN_ACCESS_TOKEN=${accessToken}`);
      envContent = envContent.replace(/LINKEDIN_PERSON_ID=.*/g, `LINKEDIN_PERSON_ID=${personId}`);
    } else {
      // Add new values
      envContent += linkedinVars;
    }

    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ LinkedIn setup completed!');
    console.log('Your credentials have been added to your .env file.');
    console.log('\n🚀 You can now use:');
    console.log('node src/index.js post');
    
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
  }

  rl.close();
}

async function handleConfigCommand() {
  console.log('⚙️  Configuration Setup\n');
  
  const config = new ConfigManager();
  config.createCustomConfig();
  
  console.log('\n📋 Next steps:');
  console.log('1. Edit the config.json file to customize your settings');
  console.log('2. Update your project information (name, URL, description)');
  console.log('3. Configure output options (console, file, LinkedIn)');
  console.log('4. Adjust AI settings (model, language, tone)');
  console.log('5. Customize GitHub settings (branch, exclude patterns)');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('help') || args.includes('h')) {
    showHelp();
    if (rl && !rl.closed) {
      rl.close();
    }
    return;
  }

  const command = args[0];
  const options = {
    verbose: args.includes('--verbose'),
    silent: args.includes('--silent')
  };

  try {
    switch (command) {
      case 'generate':
      case 'g':
        await executeCommand(handleGenerateCommand, options);
        break;
        
      case 'post':
      case 'p':
        await executeCommand(handlePostCommand, options);
        break;
        
      case 'setup':
      case 's':
        await handleSetupCommand();
        break;
        
      case 'config':
      case 'cfg':
        await executeCommand(handleConfigCommand);
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  } finally {
    if (rl && !rl.closed) {
      rl.close();
    }
  }
}

// Run the application
main().catch(console.error); 