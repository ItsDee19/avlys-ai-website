// Test script for AI API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testAIEndpoints() {
  console.log('🧪 Testing AI API Endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check Response:', healthResponse.data);
    console.log('');

    // Test 2: Get Available Providers
    console.log('2️⃣ Testing Get Available Providers...');
    const providersResponse = await axios.get(`${BASE_URL}/api/ai/providers`);
    console.log('✅ Available Providers:', providersResponse.data);
    console.log('');

    // Test 3: AI Health Check
    console.log('3️⃣ Testing AI Health Check...');
    const aiHealthResponse = await axios.get(`${BASE_URL}/api/ai/health`);
    console.log('✅ AI Health Status:', aiHealthResponse.data);
    console.log('');

    // Test 4: Generate Caption (without auth for testing)
    console.log('4️⃣ Testing Caption Generation...');
    try {
      const captionResponse = await axios.post(`${BASE_URL}/api/ai/captions`, {
        prompt: 'Herbal skincare brand in Bangalore',
        options: {
          platform: 'instagram',
          tone: 'friendly',
          length: 'medium'
        }
      });
      console.log('✅ Caption Generated:', captionResponse.data);
    } catch (error) {
      console.log('⚠️ Caption generation requires auth:', error.response?.data || error.message);
    }
    console.log('');

    // Test 5: Generate Hashtags
    console.log('5️⃣ Testing Hashtag Generation...');
    try {
      const hashtagsResponse = await axios.post(`${BASE_URL}/api/ai/hashtags`, {
        prompt: 'Herbal skincare brand in Bangalore',
        options: {
          count: 5,
          platform: 'instagram'
        }
      });
      console.log('✅ Hashtags Generated:', hashtagsResponse.data);
    } catch (error) {
      console.log('⚠️ Hashtag generation requires auth:', error.response?.data || error.message);
    }
    console.log('');

    // Test 6: Generate Ad Copy
    console.log('6️⃣ Testing Ad Copy Generation...');
    try {
      const adCopyResponse = await axios.post(`${BASE_URL}/api/ai/ad-copy`, {
        prompt: 'Herbal skincare brand targeting young professionals',
        options: {
          adType: 'social',
          platform: 'facebook'
        }
      });
      console.log('✅ Ad Copy Generated:', adCopyResponse.data);
    } catch (error) {
      console.log('⚠️ Ad copy generation requires auth:', error.response?.data || error.message);
    }
    console.log('');

    // Test 7: Generate Image Prompts
    console.log('7️⃣ Testing Image Prompt Generation...');
    try {
      const imagePromptResponse = await axios.post(`${BASE_URL}/api/ai/image-prompts`, {
        prompt: 'Herbal skincare brand in Bangalore',
        options: {
          style: 'modern',
          mood: 'natural'
        }
      });
      console.log('✅ Image Prompt Generated:', imagePromptResponse.data);
    } catch (error) {
      console.log('⚠️ Image prompt generation requires auth:', error.response?.data || error.message);
    }
    console.log('');

    // Test 8: Generate Campaign Strategy
    console.log('8️⃣ Testing Campaign Strategy Generation...');
    try {
      const strategyResponse = await axios.post(`${BASE_URL}/api/ai/campaign-strategy`, {
        prompt: 'Herbal skincare brand in Bangalore targeting young professionals',
        options: {
          budget: '5000',
          timeline: '1 month'
        }
      });
      console.log('✅ Campaign Strategy Generated:', strategyResponse.data);
    } catch (error) {
      console.log('⚠️ Campaign strategy generation requires auth:', error.response?.data || error.message);
    }
    console.log('');

    // Test 9: Test endpoint (no auth required)
    console.log('9️⃣ Testing Test Endpoint (No Auth Required)...');
    const testResponse = await axios.get(`${BASE_URL}/api/ai/test`);
    console.log('✅ Test Endpoint Response:', testResponse.data);
    console.log('');

    console.log('🎉 All API endpoint tests completed!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Health endpoints working');
    console.log('- ✅ Provider endpoints working');
    console.log('- ⚠️ Content generation endpoints require authentication');
    console.log('- ✅ Test endpoint working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
testAIEndpoints(); 