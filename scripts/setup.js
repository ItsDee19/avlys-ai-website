#!/usr/bin/env node

/**
 * Avyls AI Website Setup Script
 * Helps users configure the project properly
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Avyls AI Website Setup');
console.log('========================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envExamplePath)) {
  console.error('❌ env.example file not found. Please ensure it exists in the project root.');
  process.exit(1);
}

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Do you want to overwrite it? (y/N)');
  rl.question('', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      runSetup();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  runSetup();
}

function runSetup() {
  console.log('\n📝 Setting up environment configuration...\n');
  
  // Read the example file
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  
  // Create .env file
  fs.writeFileSync(envPath, envExample);
  
  console.log('✅ Created .env file from env.example');
  console.log('\n📋 Next Steps:');
  console.log('1. Edit the .env file and add your API keys');
  console.log('2. Install dependencies: npm install');
  console.log('3. Start the development server: npm run dev');
  console.log('4. Start the backend server: cd server && npm start');
  console.log('5. Start the scraper service: cd scraper && python start.py');
  
  console.log('\n🔑 Required API Keys:');
  console.log('- Firebase Project ID and credentials');
  console.log('- At least one AI service API key (OpenAI, Anthropic, etc.)');
  console.log('- JWT secrets for authentication');
  
  console.log('\n📚 Documentation:');
  console.log('- Check README.md for detailed setup instructions');
  console.log('- Review AI_SETUP.md for AI service configuration');
  console.log('- Review AUTHENTICATION_TROUBLESHOOTING.md for auth issues');
  
  console.log('\n🎉 Setup complete! Happy coding!');
  
  rl.close();
} 