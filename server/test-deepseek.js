// Load environment variables first
require('dotenv').config();

const aiService = require('./services/aiService');

async function testDeepSeek() {
  console.log('🧪 Testing DeepSeek API integration...');
  
  try {
    // Test basic caption generation
    console.log('📝 Testing caption generation...');
    const caption = await aiService.generateContent('caption', 'Herbal skincare brand in Bangalore', {
      provider: 'deepseek',
      platform: 'instagram',
      tone: 'friendly'
    });
    
    console.log('✅ Caption generated successfully:');
    console.log(caption.content);
    console.log('\n---\n');
    
    // Test hashtag generation
    console.log('🏷️ Testing hashtag generation...');
    const hashtags = await aiService.generateContent('hashtags', 'Herbal skincare brand in Bangalore', {
      provider: 'deepseek',
      count: 10,
      platform: 'instagram'
    });
    
    console.log('✅ Hashtags generated successfully:');
    console.log(hashtags.content);
    console.log('\n---\n');
    
    // Test ad copy generation
    console.log('📢 Testing ad copy generation...');
    const adCopy = await aiService.generateContent('adCopy', 'Herbal skincare brand targeting young professionals', {
      provider: 'deepseek',
      adType: 'social',
      platform: 'facebook'
    });
    
    console.log('✅ Ad copy generated successfully:');
    console.log(adCopy.content);
    console.log('\n---\n');
    
    console.log('🎉 All DeepSeek tests passed!');
    
  } catch (error) {
    console.error('❌ DeepSeek test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testDeepSeek(); 