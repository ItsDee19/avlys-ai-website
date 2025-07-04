// Load environment variables first
require('dotenv').config();

console.log('=== AI Service Debug ===');
console.log('DEEPSEEK_API_KEY before AI service:', process.env.DEEPSEEK_API_KEY ? 'Set' : 'Not set');

// Import AI service
const aiService = require('./services/aiService');

console.log('Available providers:', aiService.getAvailableProviders());
console.log('Providers object:', Object.keys(aiService.providers));

// Test DeepSeek specifically
if (aiService.providers.deepseek) {
  console.log('✅ DeepSeek provider is available');
  console.log('DeepSeek config:', {
    hasApiKey: !!aiService.providers.deepseek.apiKey,
    baseURL: aiService.providers.deepseek.baseURL
  });
} else {
  console.log('❌ DeepSeek provider is not available');
} 