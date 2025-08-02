#!/usr/bin/env node

import { LinkedInPosterService } from './services/LinkedInPosterService.js';
import { ConfigManager } from './utils/ConfigManager.js';
import { LinkedInPosterOptions } from './types/index.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function isValidToken(token: string): boolean {
  // Basic validation: LinkedIn tokens are typically base64-like strings
  // They should contain only alphanumeric characters, hyphens, and underscores
  const tokenRegex = /^[A-Za-z0-9\-_]+$/;
  return tokenRegex.test(token);
}

async function executeCommand(commandFn: (options: LinkedInPosterOptions) => Promise<void>, options: LinkedInPosterOptions = {}): Promise<void> {
  try {
    await commandFn(options);
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
    process.exit(1);
  } finally {
    if (rl) {
      rl.close();
    }
  }
}

function showHelp(): void {
  console.log(`
🚀 LinkedIn Poster - AI-powered LinkedIn post generator

Usage: linkedin-poster [command] [options]

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
  linkedin-poster generate
  linkedin-poster post --private
  linkedin-poster setup
  linkedin-poster config

Environment Variables:
  Make sure you have a .env file with the required configuration.
  Run 'linkedin-poster setup' to configure LinkedIn API access.
`);
}

async function handleGenerateCommand(options: LinkedInPosterOptions): Promise<void> {
  const poster = new LinkedInPosterService(options);
  const result = await poster.generatePost();
  if (!result) {
    process.exit(0);
  }
}

async function handlePostCommand(options: LinkedInPosterOptions): Promise<void> {
  const poster = new LinkedInPosterService(options);
  
  // Check if LinkedIn is configured
  if (!poster.isLinkedInConfigured()) {
    console.error('❌ LinkedIn credentials not configured. Please run: linkedin-poster setup');
    process.exit(1);
  }

  const postOptions = {
    autoPost: !process.argv.includes('--no-auto-post'),
    requireConfirmation: process.argv.includes('--no-auto-post'),
    visibility: process.argv.includes('--private') ? 'CONNECTIONS' as const : 'PUBLIC' as const
  };

  const result = await poster.generateAndPost(postOptions);
  
  if (!result) {
    process.exit(0);
  }
}

async function handleSetupCommand(): Promise<void> {
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
  if (!personId || isNaN(Number(personId)) || Number(personId) <= 0) {
    console.log('❌ Invalid Person ID. Please enter a valid positive numeric value.');
    rl.close();
    return;
  }

  console.log('\n🔑 Step 3: Generate Access Token');
  console.log('1. In your LinkedIn app, go to "Auth" tab');
  console.log('2. Add redirect URL: http://localhost:3000/callback');
  console.log('3. Use the OAuth 2.0 flow to get an access token');
  console.log('4. The token should have "w_member_social" scope\n');

  const accessToken = await question('Enter your LinkedIn Access Token: ');
  if (!accessToken || accessToken.length < 50 || !isValidToken(accessToken)) {
    console.log('❌ Invalid access token. Please check your token format.');
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

    // Security: Validate that we're not overwriting critical system variables
    const criticalVars = ['PATH', 'HOME', 'USER', 'SHELL', 'PWD'];
    const hasCriticalVars = criticalVars.some(varName => 
      envContent.includes(`${varName}=`)
    );
    
    if (hasCriticalVars) {
      console.log('⚠️  Warning: .env file contains critical system variables. Please review manually.');
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

    // Security: Set restrictive permissions on .env file
    fs.writeFileSync(envPath, envContent);
    
    // Set file permissions to owner read/write only (600)
    try {
      const { chmod } = await import('fs/promises');
      await chmod(envPath, 0o600);
    } catch (chmodError) {
      console.log('⚠️  Could not set restrictive permissions on .env file');
    }

    console.log('\n✅ LinkedIn setup completed!');
    console.log('Your credentials have been added to your .env file.');
    console.log('\n🚀 You can now use:');
    console.log('linkedin-poster post');
    
  } catch (error) {
    console.error('❌ Error updating .env file:', (error as Error).message);
  }

  rl.close();
}

async function handleConfigCommand(): Promise<void> {
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

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('help') || args.includes('h')) {
    showHelp();
    if (rl) {
      rl.close();
    }
    return;
  }

  const command = args[0];
  const options: LinkedInPosterOptions = {
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
    console.error('❌ Unexpected error:', (error as Error).message);
    process.exit(1);
  } finally {
    if (rl) {
      rl.close();
    }
  }
}

// Run the application
main().catch(console.error); 