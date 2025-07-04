const aiService = require('./services/aiService');

async function testMultiPlatformCaptions() {
  console.log('🧪 Testing Multi-Platform Caption Generation...');
  
  const testPrompt = 'Herbal skincare brand in Bangalore targeting young professionals';
  
  const platforms = ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok'];
  
  for (const platform of platforms) {
    try {
      console.log(`\n📝 Testing ${platform} caption generation...`);
      
      const caption = await aiService.generateContent('caption', testPrompt, {
        provider: 'deepseek',
        platform: platform,
        tone: platform === 'linkedin' ? 'professional' : 'friendly'
      });
      
      console.log(`✅ ${platform.toUpperCase()} Caption:`);
      console.log(caption.content);
      console.log(`\nCharacter count: ${caption.content.length}`);
      
    } catch (error) {
      console.error(`❌ Error generating ${platform} caption:`, error.message);
    }
  }
  
  console.log('\n🎉 Multi-platform caption test completed!');
}

// Run the test
testMultiPlatformCaptions().catch(console.error); 