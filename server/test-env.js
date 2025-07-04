require('dotenv').config();

console.log('=== Environment Variables Test ===');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '✅ Set (' + process.env.DEEPSEEK_API_KEY.substring(0, 10) + '...)' : '❌ Not set');
console.log('PORT:', process.env.PORT || 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');

// Check if .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  const deepseekLine = lines.find(line => line.startsWith('DEEPSEEK_API_KEY='));
  if (deepseekLine) {
    console.log('✅ DEEPSEEK_API_KEY found in .env file');
    console.log('   Key starts with:', deepseekLine.substring(17, 27) + '...');
  } else {
    console.log('❌ DEEPSEEK_API_KEY not found in .env file');
  }
} else {
  console.log('❌ .env file does not exist');
} 