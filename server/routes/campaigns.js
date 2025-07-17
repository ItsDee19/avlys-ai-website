const express = require('express');
const router = express.Router();
const firestoreService = require('../services/firestoreService');
const aiService = require('../services/aiService');
const { authenticateUser } = require('../middleware/auth');
const campaignController = require('../controllers/campaignController');
const { validate, campaignValidationRules } = require('../middleware/validator');

// Test endpoint (no auth required)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Campaigns API is working!',
    timestamp: new Date().toISOString()
  });
});

// Generate AI response during wizard
router.post('/ai/generate-response', async (req, res) => {
  try {
    // Always use Mistral for AI content generation
    const { step, data } = req.body;
    let responseType = 'caption';
    let prompt = '';
    switch (step) {
      case 0:
        responseType = 'caption';
        prompt = `Business: ${data.businessIntro}, Location: ${data.location}`;
        break;
      case 1:
        responseType = 'caption';
        prompt = `Goal: ${data.campaignGoal}, Vibe: ${data.brandVibe}`;
        break;
      case 2:
        responseType = 'caption';
        prompt = `Budget: ${data.budget}`;
        break;
      case 3:
        responseType = 'caption';
        prompt = `Target: ${data.targetCustomer}, Languages: ${data.preferredLanguages?.join(', ')}`;
        break;
      case 4:
        responseType = 'caption';
        prompt = `Superpowers: ${data.superpowers?.join(', ')}, Ad Type: ${data.adType}`;
        break;
      default:
        responseType = 'caption';
        prompt = 'General campaign info';
    }
    const aiResponse = await aiService.generateContent(responseType, prompt, { provider: 'mistral', tone: 'friendly', platform: 'instagram' });
    res.json({ message: aiResponse.content });
  } catch (aiError) {
    console.error('AI generation error:', aiError);
    // Fallback response
    res.json({ message: "Great progress! Let's continue building your campaign." });
  }
});

// Generate complete campaign strategy with AI content
router.post('/generate', authenticateUser, campaignController.createCampaign);

// Process payment and deploy campaign
router.post('/:id/deploy', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentToken } = req.body;
    
    const campaign = await firestoreService.getCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Process payment (placeholder - implement actual payment service)
    const payment = { success: true, id: 'payment_id' }; // Replace with actual payment service
    
    if (payment.success) {
      // Deploy to platforms (placeholder - implement actual platform service)
      const deploymentResults = { success: true }; // Replace with actual platform service
      
      await firestoreService.updateCampaign(id, {
        status: 'active',
        deploymentResults,
        paymentId: payment.id
      });
      
      res.json({ success: true, deploymentResults });
    } else {
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Real-time analytics
router.get('/:id/analytics', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    // Placeholder - implement actual analytics service
    const analytics = { views: 0, clicks: 0, conversions: 0 }; // Replace with actual analytics service
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Optimize budget allocation
router.post('/:id/optimize', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await firestoreService.getCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Placeholder - implement actual optimization service
    const optimizedAllocation = { facebook: 50, google: 30, instagram: 20 }; // Replace with actual optimization service
    
    await firestoreService.updateCampaign(id, {
      'strategy.budgetAllocation': optimizedAllocation
    });
    
    res.json({ optimizedAllocation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all campaigns for the logged-in user
router.get('/', authenticateUser, campaignController.getUserCampaigns);

// Get campaigns by user ID (for dashboard)
router.get('/user/:userId', authenticateUser, campaignController.getUserCampaigns);

// Get campaign statistics
router.get('/stats/overview', authenticateUser, async (req, res) => {
  try {
    const stats = await firestoreService.getCampaignStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    if (error.message.includes('Firestore is not available')) {
      res.status(503).json({ 
        error: 'Database service unavailable', 
        message: 'Please check Firebase configuration' 
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch campaign statistics' });
    }
  }
});

// Get a single campaign by ID
router.get('/:id', authenticateUser, campaignController.getCampaign);

// Update a campaign
router.put('/:id', authenticateUser, campaignValidationRules(), validate, campaignController.updateCampaign);

// Delete a campaign
router.delete('/:id', authenticateUser, campaignController.deleteCampaign);

// Regenerate AI content for existing campaign
router.post('/:id/regenerate-content', authenticateUser, async (req, res) => {
  try {
    const campaign = await firestoreService.getCampaignById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Check if user owns this campaign
    if (campaign.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log('Regenerating AI content for campaign:', campaign.id);
    
    // Generate new AI content using the same logic as campaign creation
    let aiContent = {};
    try {
      console.log('Generating new AI content...');
      // Always use Mistral for all content types
      const contentPromises = [
        aiService.generateContent('caption', `Business: ${campaign.businessIntro}, Goal: ${campaign.campaignGoal}, Vibe: ${campaign.brandVibe}`, { provider: 'mistral', platform: 'instagram', tone: campaign.brandVibe === 'friendly-relatable' ? 'friendly' : 'professional' }),
        aiService.generateContent('caption', `Business: ${campaign.businessIntro}, Goal: ${campaign.campaignGoal}`, { provider: 'mistral', platform: 'facebook', tone: 'engaging' }),
        aiService.generateContent('caption', `Business: ${campaign.businessIntro}, Goal: ${campaign.campaignGoal}`, { provider: 'mistral', platform: 'twitter', tone: 'trendy' }),
        aiService.generateContent('caption', `Business: ${campaign.businessIntro}, Goal: ${campaign.campaignGoal}`, { provider: 'mistral', platform: 'linkedin', tone: 'professional' }),
        aiService.generateContent('caption', `Business: ${campaign.businessIntro}, Goal: ${campaign.campaignGoal}`, { provider: 'mistral', platform: 'youtube', tone: 'engaging' }),
        aiService.generateContent('caption', `Business: ${campaign.businessIntro}, Goal: ${campaign.campaignGoal}`, { provider: 'mistral', platform: 'tiktok', tone: 'trendy' }),
        aiService.generateContent('adCopy', `Business: ${campaign.businessIntro}, Target: ${campaign.targetCustomer}, Budget: ${campaign.budget}`, { provider: 'mistral', adType: campaign.adType || 'social', platform: 'facebook' }),
        aiService.generateContent('hashtags', `${campaign.businessIntro} - ${campaign.campaignGoal} - Location: ${campaign.location}`, { provider: 'mistral', count: 20, platform: 'instagram' }),
        aiService.generateContent('imagePrompt', `${campaign.businessIntro} - ${campaign.brandVibe} style - ${campaign.adType}`, { provider: 'mistral', style: 'modern', platform: 'instagram' })
      ];
      const aiResults = await Promise.allSettled(contentPromises);
      aiContent = {
        captions: {
          instagram: aiResults[0].status === 'fulfilled' ? aiResults[0].value.content : null,
          facebook: aiResults[1].status === 'fulfilled' ? aiResults[1].value.content : null,
          twitter: aiResults[2].status === 'fulfilled' ? aiResults[2].value.content : null,
          linkedin: aiResults[3].status === 'fulfilled' ? aiResults[3].value.content : null,
          youtube: aiResults[4].status === 'fulfilled' ? aiResults[4].value.content : null,
          tiktok: aiResults[5].status === 'fulfilled' ? aiResults[5].value.content : null
        },
        adCopy: aiResults[6].status === 'fulfilled' ? aiResults[6].value.content : null,
        hashtags: aiResults[7].status === 'fulfilled' ? aiResults[7].value.content : null,
        imagePrompts: aiResults[8].status === 'fulfilled' ? aiResults[8].value.content : null
      };

      // Generate AI images if image prompts are available
      if (aiContent.imagePrompts) {
        try {
          console.log('Generating new AI images...');
          const imagePromises = [
            aiService.generateImage(aiContent.imagePrompts, {
              size: '1024x1024',
              quality: 'standard',
              style: 'vivid'
            }),
            aiService.generateImage(aiContent.imagePrompts, {
              size: '1200x630',
              quality: 'standard',
              style: 'vivid'
            })
          ];
          
          const imageResults = await Promise.allSettled(imagePromises);
          
          aiContent.images = {
            instagram: imageResults[0].status === 'fulfilled' ? imageResults[0].value : null,
            facebook: imageResults[1].status === 'fulfilled' ? imageResults[1].value : null
          };
        } catch (imageError) {
          console.error('Error generating AI images:', imageError);
          console.error('Image error details:', {
            message: imageError.message,
            response: imageError.response?.data,
            status: imageError.response?.status
          });
          aiContent.images = { instagram: null, facebook: null };
        }
      } else {
        aiContent.images = { instagram: null, facebook: null };
      }
      
      console.log('New AI content generated successfully');
      
    } catch (err) {
      console.error('Failed to generate new AI content:', err);
      aiContent = {};
    }
    
    // Update campaign with new AI content
    const updatedCampaign = await firestoreService.updateCampaign(req.params.id, {
      aiContent: aiContent,
      generatedAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json({ 
      campaign: updatedCampaign,
      aiContent: aiContent,
      message: 'AI content regenerated successfully!'
    });
    
  } catch (error) {
    console.error('Error regenerating AI content:', error);
    if (error.message.includes('Firestore is not available')) {
      res.status(503).json({ 
        error: 'Database service unavailable', 
        message: 'Please check Firebase configuration' 
      });
    } else {
      res.status(500).json({ error: 'Failed to regenerate AI content' });
    }
  }
});

// Generate video for a specific campaign
router.post('/:id/generate-video', authenticateUser, async (req, res) => {
  try {
    console.log('Video generation request:', {
      campaignId: req.params.id,
      userId: req.user.id,
      userEmail: req.user.email,
      authType: req.user.authType
    });
    
    const campaign = await firestoreService.getCampaignById(req.params.id);
    
    console.log('Campaign lookup result:', {
      found: !!campaign,
      campaignId: campaign?.id,
      campaignUserId: campaign?.userId,
      campaignTitle: campaign?.title
    });
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Check if user owns this campaign
    if (campaign.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log('Generating video for campaign:', campaign.id);
    
    // Create video prompt from campaign details
    let videoPrompt = `Create an engaging marketing video for ${campaign.businessIntro || campaign.title}. `;
    if (campaign.campaignGoal) {
      videoPrompt += `The goal is to ${campaign.campaignGoal}. `;
    }
    if (campaign.brandVibe) {
      videoPrompt += `Use a ${campaign.brandVibe} style and tone. `;
    }
    if (campaign.targetCustomer) {
      videoPrompt += `Target audience: ${campaign.targetCustomer}. `;
    }
    if (campaign.location) {
      videoPrompt += `Location: ${campaign.location}. `;
    }
    videoPrompt += `Make it visually appealing and engaging for social media platforms.`;

    // Generate video using AI service
    let videoResult = null;
    try {
      console.log('Generating video with prompt:', videoPrompt);
      videoResult = await aiService.generateVideo(videoPrompt, {
        duration: 5,
        image_url: campaign.generatedImages?.[0]?.url || null // Use first generated image if available
      });
      console.log('Video generated successfully:', videoResult);
    } catch (videoError) {
      console.error('Error generating video:', videoError);
      return res.status(500).json({ 
        error: 'Failed to generate video',
        details: videoError.message 
      });
    }

    // Update campaign with video data
    const updatedCampaign = await firestoreService.updateCampaign(req.params.id, {
      generatedVideo: videoResult,
      updatedAt: new Date()
    });
    
    res.json({ 
      message: 'Video generated successfully',
      video: videoResult,
      campaign: updatedCampaign
    });
  } catch (error) {
    console.error('Error generating video for campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update AI content for a campaign (caption or image)
router.patch('/:id/ai-content', authenticateUser, async (req, res) => {
  try {
    const { type, platform, content, image } = req.body;
    const campaignId = req.params.id;
    const campaign = await firestoreService.getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    if (campaign.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    let aiContent = campaign.aiContent || {};
    if (type === 'caption' && platform && content) {
      aiContent.captions = aiContent.captions || {};
      aiContent.captions[platform] = content;
    }
    if (type === 'image' && platform && image) {
      aiContent.images = aiContent.images || {};
      aiContent.images[platform] = image;
    }
    const updatedCampaign = await firestoreService.updateCampaign(campaignId, {
      aiContent,
      updatedAt: new Date()
    });
    res.json({ campaign: updatedCampaign, aiContent });
  } catch (error) {
    console.error('Error updating campaign AI content:', error);
    res.status(500).json({ error: 'Failed to update campaign AI content' });
  }
});

// Mock content generation functions
function generateMockCaption(campaignData, platform) {
  const { businessIntro, campaignGoal, brandVibe, location } = campaignData;
  
  const emojis = {
    'get-customers': '👥',
    'announce-product': '📢',
    'promote-offer': '🎁',
    'brand-love': '❤️'
  };
  
  const goalEmoji = emojis[campaignGoal] || '🚀';
  
  switch (platform) {
    case 'instagram':
      return `${goalEmoji} ${businessIntro} in ${location}! ${getVibeText(brandVibe)} #${businessIntro.replace(/\s+/g, '')} #${location} #${campaignGoal.replace('-', '')}`;
    
    case 'facebook':
      return `${goalEmoji} ${businessIntro} - ${getVibeText(brandVibe)} Located in ${location}. ${getGoalText(campaignGoal)}`;
    
    case 'twitter':
      return `${goalEmoji} ${businessIntro} in ${location}! ${getVibeText(brandVibe)} #${businessIntro.replace(/\s+/g, '')} #${location}`;
    
    case 'linkedin':
      return `Excited to share that ${businessIntro} is now serving ${location}! ${getVibeText(brandVibe)} We're focused on ${getGoalText(campaignGoal)}. #${businessIntro.replace(/\s+/g, '')} #${location} #BusinessGrowth`;
    
    case 'youtube':
      return `🎥 New video alert! Discover ${businessIntro} in ${location} and learn how we're ${getGoalText(campaignGoal)}. ${getVibeText(brandVibe)} Don't forget to subscribe and hit the notification bell! 🔔`;
    
    case 'tiktok':
      return `${goalEmoji} ${businessIntro} in ${location}! ${getVibeText(brandVibe)} #${businessIntro.replace(/\s+/g, '')} #${location} #${campaignGoal.replace('-', '')} #trending #viral`;
    
    case 'whatsapp':
      return `${goalEmoji} Hi! ${businessIntro} here in ${location}. ${getVibeText(brandVibe)} ${getGoalText(campaignGoal)}. Message us for more details!`;
    
    default:
      return `${goalEmoji} ${businessIntro} in ${location}! ${getVibeText(brandVibe)}`;
  }
}

function generateMockAdCopy(campaignData) {
  const { businessIntro, targetCustomer, budget, superpowers } = campaignData;
  
  const powerText = superpowers?.length > 0 ? ` ${superpowers.join(', ')}` : '';
  
  return `Discover ${businessIntro}! Perfect for ${targetCustomer}.${powerText} Starting at just ₹${budget}. Don't miss out - limited time offer!`;
}

function generateMockHashtags(campaignData) {
  const { businessIntro, location, campaignGoal, superpowers } = campaignData;
  
  const baseHashtags = [
    `#${businessIntro.replace(/\s+/g, '')}`,
    `#${location}`,
    `#${campaignGoal.replace('-', '')}`,
    '#LocalBusiness',
    '#SupportLocal'
  ];
  
  const powerHashtags = superpowers?.map(power => `#${power.replace('-', '')}`) || [];
  
  return [...baseHashtags, ...powerHashtags].join(' ');
}

function generateMockImagePrompt(campaignData) {
  const { businessIntro, brandVibe, adType } = campaignData;
  
  return `Professional ${adType} image of ${businessIntro}, ${getVibeStyle(brandVibe)}, clean modern design, high quality, Instagram aesthetic`;
}

function generateMockStrategy(campaignData) {
  const vibe = getVibeText(campaignData.brandVibe);
  const goal = getGoalText(campaignData.campaignGoal);
  
  return `Campaign Strategy for ${campaignData.businessIntro}:
  
🎯 Primary Goal: ${goal}
🎨 Brand Vibe: ${vibe}
💰 Budget Allocation: Focus on high-performing platforms
📱 Platform Strategy: 
  - Instagram: Visual content and stories
  - Facebook: Community engagement and ads
  - Google Ads: Search intent targeting
  
📊 Key Metrics to Track:
  - Engagement rate
  - Click-through rate
  - Conversion rate
  - Cost per acquisition

🔄 Optimization Plan: Weekly budget adjustments based on performance data`;
}

function generateMockImage(campaignData, platform) {
  const vibe = getVibeStyle(campaignData.brandVibe);
  const industry = campaignData.businessIntro.toLowerCase();
  
  // Generate mock image URLs based on platform and content
  const mockImageUrls = {
    instagram: `https://picsum.photos/1024/1024?random=${Date.now()}&blur=2`,
    facebook: `https://picsum.photos/1200/630?random=${Date.now() + 1}&blur=2`
  };
  
  return {
    url: mockImageUrls[platform],
    provider: 'mock',
    model: 'mock-image-generator',
    prompt: `${vibe} ${industry} content for ${platform}`,
    generatedAt: new Date()
  };
}

function getVibeText(vibe) {
  const vibeTexts = {
    'bold-energetic': 'Bold and energetic approach',
    'friendly-relatable': 'Friendly and relatable tone',
    'informative-trustworthy': 'Informative and trustworthy messaging',
    'sleek-premium': 'Sleek and premium positioning'
  };
  return vibeTexts[vibe] || 'Professional approach';
}

function getVibeStyle(vibe) {
  const vibeStyles = {
    'bold-energetic': 'vibrant colors, dynamic composition',
    'friendly-relatable': 'warm tones, approachable design',
    'informative-trustworthy': 'clean, professional layout',
    'sleek-premium': 'minimalist, luxury aesthetic'
  };
  return vibeStyles[vibe] || 'professional style';
}

function getGoalText(goal) {
  const goalTexts = {
    'get-customers': 'Acquire new customers and increase sales',
    'announce-product': 'Launch new product or service',
    'promote-offer': 'Promote special offers and discounts',
    'brand-love': 'Build brand awareness and loyalty'
  };
  return goalTexts[goal] || 'Achieve campaign objectives';
}

module.exports = router;