const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { authenticateUser } = require('../middleware/auth');

// Health check for AI providers
router.get('/health', async (req, res) => {
  try {
    const health = await aiService.healthCheck();
    res.json({
      status: 'success',
      providers: health,
      available: Object.keys(health).filter(provider => health[provider].status === 'healthy')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available AI providers
router.get('/providers', (req, res) => {
  try {
    const providers = aiService.getAvailableProviders();
    res.json({
      status: 'success',
      providers: providers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate content using multiple providers in parallel
router.post('/generate/parallel', authenticateUser, async (req, res) => {
  try {
    const { type, prompt, options = {} } = req.body;
    
    if (!type || !prompt) {
      return res.status(400).json({ error: 'Type and prompt are required' });
    }

    const results = await aiService.generateContentParallel(type, prompt, options);
    
    res.json({
      status: 'success',
      type: type,
      results: results,
      count: results.length
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate content using specific provider
router.post('/generate/:provider', authenticateUser, async (req, res) => {
  try {
    const { provider } = req.params;
    const { type, prompt, options = {} } = req.body;
    
    if (!type || !prompt) {
      return res.status(400).json({ error: 'Type and prompt are required' });
    }

    const result = await aiService.generateContent(type, prompt, { provider, ...options });
    
    res.json({
      status: 'success',
      type: type,
      provider: provider,
      result: result
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate social media captions
router.post('/captions', authenticateUser, async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const results = await aiService.generateContentParallel('caption', prompt, {
      providers: ['openai', 'claude', 'gemini'],
      maxResults: 3,
      ...options
    });
    
    res.json({
      status: 'success',
      type: 'caption',
      results: results,
      count: results.length
    });
  } catch (error) {
    console.error('Caption generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate social media captions for multiple platforms
router.post('/captions/multi-platform', authenticateUser, async (req, res) => {
  try {
    const { prompt, platforms = ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok'], options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const captionPromises = platforms.map(platform => 
      aiService.generateContent('caption', prompt, {
        provider: 'deepseek',
        platform: platform,
        tone: options.tone || 'friendly',
        length: options.length || 'medium',
        ...options
      })
    );

    const results = await Promise.allSettled(captionPromises);
    
    const captions = {};
    platforms.forEach((platform, index) => {
      if (results[index].status === 'fulfilled') {
        captions[platform] = results[index].value.content;
      } else {
        captions[platform] = null;
        console.error(`Failed to generate caption for ${platform}:`, results[index].reason);
      }
    });
    
    res.json({
      status: 'success',
      type: 'multiPlatformCaptions',
      captions: captions,
      platforms: platforms,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Multi-platform caption generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate ad copy
router.post('/ad-copy', authenticateUser, async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const results = await aiService.generateContentParallel('adCopy', prompt, {
      providers: ['openai', 'claude', 'gemini'],
      maxResults: 3,
      ...options
    });
    
    res.json({
      status: 'success',
      type: 'adCopy',
      results: results,
      count: results.length
    });
  } catch (error) {
    console.error('Ad copy generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate hashtags
router.post('/hashtags', authenticateUser, async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const results = await aiService.generateContentParallel('hashtags', prompt, {
      providers: ['openai', 'claude', 'gemini'],
      maxResults: 3,
      ...options
    });
    
    res.json({
      status: 'success',
      type: 'hashtags',
      results: results,
      count: results.length
    });
  } catch (error) {
    console.error('Hashtag generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate image prompts
router.post('/image-prompts', authenticateUser, async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const results = await aiService.generateContentParallel('imagePrompt', prompt, {
      providers: ['openai', 'claude', 'gemini'],
      maxResults: 3,
      ...options
    });
    
    res.json({
      status: 'success',
      type: 'imagePrompt',
      results: results,
      count: results.length
    });
  } catch (error) {
    console.error('Image prompt generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate images using AI ML
router.post('/images', authenticateUser, async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Generating image with prompt:', prompt);
    console.log('Options:', options);

    const result = await aiService.generateImage(prompt, options);
    
    console.log('Image generation result:', result);
    
    res.json({
      status: 'success',
      type: 'image',
      result: result
    });
  } catch (error) {
    console.error('Image generation error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data || 'No additional details available'
    });
  }
});

// Generate multiple images using Replicate
router.post('/images/multiple', authenticateUser, async (req, res) => {
  try {
    const { prompt, count = 4, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const results = await aiService.generateImage(prompt, { 
      ...options, 
      count: count,
      provider: 'aiml'
    });
    
    res.json({
      status: 'success',
      type: 'multiple_images',
      count: Array.isArray(results) ? results.length : 1,
      results: results
    });
  } catch (error) {
    console.error('Multiple image generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate campaign strategy
router.post('/campaign-strategy', authenticateUser, async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const results = await aiService.generateContentParallel('campaignStrategy', prompt, {
      providers: ['openai', 'claude', 'gemini'],
      maxResults: 2,
      ...options
    });
    
    res.json({
      status: 'success',
      type: 'campaignStrategy',
      results: results,
      count: results.length
    });
  } catch (error) {
    console.error('Campaign strategy generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate complete campaign content
router.post('/campaign-content', authenticateUser, async (req, res) => {
  try {
    const { campaignData, options = {} } = req.body;
    
    if (!campaignData) {
      return res.status(400).json({ error: 'Campaign data is required' });
    }

    const results = await aiService.generateCampaignContent(campaignData, {
      useParallel: true,
      maxResults: 3,
      ...options
    });
    
    res.json({
      status: 'success',
      type: 'campaignContent',
      results: results,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Campaign content generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint (no auth required)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'AI API is working!',
    availableProviders: aiService.getAvailableProviders(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 