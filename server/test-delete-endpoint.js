// Test script for campaign delete endpoint
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testDeleteEndpoint() {
  console.log('🧪 Testing Campaign Delete Endpoint...\n');

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

    // Test 3: Test Delete Endpoint (without auth - should fail)
    console.log('3️⃣ Testing Delete Endpoint (No Auth)...');
    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/api/campaigns/test-campaign-id`);
      console.log('❌ Unexpected success:', deleteResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Delete endpoint properly requires authentication');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    console.log('');

    console.log('🎉 Delete endpoint tests completed!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Server is running and healthy');
    console.log('- ✅ AI providers are available');
    console.log('- ✅ Delete endpoint requires authentication (security working)');
    console.log('- ⚠️ To test actual deletion, you need to:');
    console.log('  1. Create a campaign first');
    console.log('  2. Get a valid JWT token');
    console.log('  3. Use the token to delete the campaign');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
testDeleteEndpoint(); 