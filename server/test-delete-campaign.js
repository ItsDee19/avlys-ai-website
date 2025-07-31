// Test script for campaign deletion functionality
require('dotenv').config();

const firestoreService = require('./services/firestoreService');

async function testCampaignDeletion() {
  console.log('🧪 Testing Campaign Deletion Functionality...\n');

  try {
    // Test 1: Check if we can get campaigns
    console.log('1️⃣ Testing campaign retrieval...');
    const campaigns = await firestoreService.getCampaignsByUser('test-user-id');
    console.log(`✅ Found ${campaigns.length} campaigns for test user`);
    
    if (campaigns.length > 0) {
      const testCampaign = campaigns[0];
      console.log(`📋 Test campaign: ${testCampaign.id} - ${testCampaign.name}`);
      
      // Test 2: Test deletion from main collection
      console.log('\n2️⃣ Testing deletion from main collection...');
      try {
        await firestoreService.deleteCampaign(testCampaign.id);
        console.log('✅ Successfully deleted from main collection');
      } catch (error) {
        console.log('⚠️ Error deleting from main collection:', error.message);
      }
      
      // Test 3: Test deletion from user subcollection
      console.log('\n3️⃣ Testing deletion from user subcollection...');
      try {
        await firestoreService.deleteUserCampaign(testCampaign.userId, testCampaign.id);
        console.log('✅ Successfully deleted from user subcollection');
      } catch (error) {
        console.log('⚠️ Error deleting from user subcollection:', error.message);
      }
    } else {
      console.log('⚠️ No campaigns found for testing');
    }
    
    console.log('\n🎉 Campaign deletion tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCampaignDeletion(); 