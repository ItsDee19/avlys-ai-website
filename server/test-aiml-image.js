require('dotenv').config();
const aiService = require('./services/aiService');

async function testAIMLImageGeneration() {
  try {
    console.log('Testing AI ML Image Generation...');
    
    // Check if AI ML provider is available
    if (!process.env.AI_ML_API_KEY) {
      console.log('❌ AI ML provider not available. Please set AI_ML_API_KEY environment variable.');
      return;
    }
    
    console.log('✅ AI ML API Key found');
    
    // Test image generation with AI ML
    const testPrompt = 'A beautiful sunset over mountains, digital art style';
    
    console.log('\n🖼️  Generating image with AI ML...');
    console.log('Prompt:', testPrompt);
    
    const result = await aiService.generateImage(testPrompt, {
      provider: 'aiml',
      size: '1024x1024',
      count: 1
    });
    
    console.log('\n✅ AI ML Image Generation Results:');
    if (Array.isArray(result)) {
      result.forEach((image, index) => {
        console.log(`\nImage ${index + 1}:`);
        console.log(`  URL: ${image.url}`);
        console.log(`  Provider: ${image.provider}`);
        console.log(`  Model: ${image.model}`);
      });
    } else {
      console.log(`\nSingle Image:`);
      console.log(`  URL: ${result.url}`);
      console.log(`  Provider: ${result.provider}`);
      console.log(`  Model: ${result.model}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing AI ML image generation:', error.message);
    if (error.response) {
      console.error('API Error Details:', error.response.data);
    }
  }
}

// Run the test
testAIMLImageGeneration(); 