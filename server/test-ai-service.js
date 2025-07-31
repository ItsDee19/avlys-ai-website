// Load environment variables first
require('dotenv').config();

const aiService = require('./services/aiService');

async function testAIService() {
  console.log('🧪 Testing AI Service...');
  
  // Check environment variables
  console.log('\n📋 Environment Variables Check:');
  console.log('MISTRAL_API_KEY:', process.env.MISTRAL_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '✅ Set' : '❌ Not set');
  
  // AI service is already initialized
  
  console.log('\n🔧 Available Providers:');
  const providers = aiService.getAvailableProviders();
  console.log(providers);
  
  // Test health check
  console.log('\n🏥 Health Check:');
  try {
    const health = await aiService.healthCheck();
    console.log('Health Status:', health);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
  
  // Test content generation if Mistral is available
  if (process.env.MISTRAL_API_KEY) {
    console.log('\n📝 Testing Content Generation with Mistral:');
    
    try {
      // Test caption generation
      console.log('Testing caption generation...');
      const caption = await aiService.generateContent('caption', 'Herbal skincare brand in Bangalore', {
        provider: 'mistral',
        platform: 'instagram',
        tone: 'friendly'
      });
      
      console.log('✅ Caption generated successfully:');
      console.log('Content:', caption.content);
      console.log('Provider:', caption.provider);
      console.log('Model:', caption.model);
      
      // Test hashtag generation
      console.log('\nTesting hashtag generation...');
      const hashtags = await aiService.generateContent('hashtags', 'Herbal skincare brand in Bangalore', {
        provider: 'mistral',
        count: 5,
        platform: 'instagram'
      });
      
      console.log('✅ Hashtags generated successfully:');
      console.log('Content:', hashtags.content);
      
      // Test ad copy generation
      console.log('\nTesting ad copy generation...');
      const adCopy = await aiService.generateContent('adCopy', 'Herbal skincare brand targeting young professionals', {
        provider: 'mistral',
        adType: 'social',
        platform: 'facebook'
      });
      
      console.log('✅ Ad copy generated successfully:');
      console.log('Content:', adCopy.content);
      
      console.log('\n🎉 All AI service tests passed!');
      
    } catch (error) {
      console.error('❌ AI service test failed:', error.message);
      console.error('Error details:', error);
    }
  } else {
    console.log('\n⚠️ Skipping content generation tests - MISTRAL_API_KEY not set');
  }
}

// Run the test
testAIService().catch(console.error); 