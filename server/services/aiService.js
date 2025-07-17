const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const { ChatOpenAI } = require('@langchain/openai');
const Replicate = require('replicate');
const { Mistral } = require('@mistralai/mistralai');
const { fal } = require("@fal-ai/client");

// OpenRouter direct API call helper (must be outside the class)
const generateWithOpenRouterAPI = async (messages, model) => {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.8,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
};

class AIService {
  constructor() {
    this.providers = {};
    this.initializeProviders();
    // Initialize Replicate
    if (process.env.REPLICATE_API_TOKEN) {
      this.providers.replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN
      });
    }
    // Initialize Mistral
    if (process.env.MISTRAL_API_KEY) {
      this.providers.mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    }

  }

  initializeProviders() {
    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY.startsWith('sk-or-')) {
      this.providers.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, 
      });
    } else if (process.env.OPENAI_API_KEY && process.env.OPENROUTER_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-or-')) {
      console.warn('⚠️  Detected OpenRouter key in OPENAI_API_KEY. This will not work. Please use a real OpenAI key for OPENAI_API_KEY.');
    }

    // Initialize Google Gemini
    if (process.env.GEMINI_API_KEY) {
      this.providers.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    // Initialize Anthropic Claude
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.claude = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    // Initialize DeepSeek
    if (process.env.DEEPSEEK_API_KEY) {
      this.providers.deepseek = {
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com/v1'
      };
    }

    // Initialize AI ML Image provider
    if (process.env.AI_ML_API_KEY) {
      this.providers.aiml = {
        apiKey: process.env.AI_ML_API_KEY,
        baseURL: 'https://api.aimlapi.com/v1/images/generations'
      };
    }

    console.log(`AI Service initialized with ${Object.keys(this.providers).length} providers`);
  }

  // Get available providers
  getAvailableProviders() {
    const providers = Object.keys(this.providers);
    if (process.env.OPENROUTER_API_KEY) providers.push('openrouter');
    return providers;
  }



  // Generate content using multiple providers in parallel
  async generateContentParallel(type, prompt, options = {}) {
    const { providers = ['openrouter'], maxResults = 3 } = options;
    
    const availableProviders = providers.filter(provider => provider === 'openrouter' ? !!process.env.OPENROUTER_API_KEY : this.providers[provider]);
    
    if (availableProviders.length === 0) {
      throw new Error('No AI providers available');
    }

    const promises = availableProviders.map(provider => 
      this.generateContent(type, prompt, { provider, ...options })
        .catch(error => {
          console.error(`Error with ${provider}:`, error.message);
          return null;
        })
    );

    const results = await Promise.allSettled(promises);
    const successfulResults = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value)
      .slice(0, maxResults);

    return successfulResults;
  }

  // Generate content using a specific provider
  async generateContent(type, prompt, options = {}) {
    // Force provider to 'mistral' for all text content
    const provider = 'mistral';
    switch (type) {
      case 'caption':
        return this.generateCaption(prompt, provider, options);
      case 'adCopy':
        return this.generateAdCopy(prompt, provider, options);
      case 'hashtags':
        return this.generateHashtags(prompt, provider, options);
      case 'imagePrompt':
        return this.generateImagePrompt(prompt, provider, options);
      case 'campaignStrategy':
        return this.generateCampaignStrategy(prompt, provider, options);
      default:
        throw new Error(`Unknown content type: ${type}`);
    }
  }

  // Generate social media captions
  async generateCaption(prompt, provider, options) {
    const { tone = 'friendly', platform = 'instagram', length = 'medium' } = options;
    
    // Platform-specific configurations
    const platformConfigs = {
      instagram: {
        maxLength: 2200,
        features: 'visual content, stories, reels',
        style: 'visual-first, hashtag-friendly, emoji-rich',
        callToAction: 'swipe up, tap link in bio, follow for more'
      },
      facebook: {
        maxLength: 63206,
        features: 'community engagement, sharing',
        style: 'conversational, community-focused, shareable',
        callToAction: 'like, share, comment, visit our page'
      },
      twitter: {
        maxLength: 280,
        features: 'real-time updates, trending topics',
        style: 'concise, trending, hashtag-heavy',
        callToAction: 'retweet, follow, reply'
      },
      linkedin: {
        maxLength: 3000,
        features: 'professional networking, thought leadership',
        style: 'professional, value-driven, industry-focused',
        callToAction: 'connect, share insights, visit profile'
      },
      youtube: {
        maxLength: 5000,
        features: 'video content, community tab',
        style: 'engaging, descriptive, call-to-action focused',
        callToAction: 'subscribe, like, comment, hit notification bell'
      },
      tiktok: {
        maxLength: 2200,
        features: 'short-form video, trending sounds',
        style: 'trendy, casual, hashtag-heavy, sound-focused',
        callToAction: 'follow, like, comment, duet'
      },
      whatsapp: {
        maxLength: 1000,
        features: 'direct messaging, status updates',
        style: 'personal, conversational, local language friendly',
        callToAction: 'message us, save our number, share with friends'
      }
    };

    const config = platformConfigs[platform] || platformConfigs.instagram;
    
    const systemPrompt = `You are a creative social media expert specializing in ${platform} content. 
    Create engaging, authentic captions that resonate with Indian audiences.
    
    Platform: ${platform}
    Max Length: ${config.maxLength} characters
    Features: ${config.features}
    Style: ${config.style}
    Call-to-Action: ${config.callToAction}
    
    Tone: ${tone}
    Length: ${length}
    
    Guidelines:
    - Include relevant emojis and hashtags when appropriate
    - Make it feel personal and relatable to Indian audiences
    - Use local cultural references when relevant
    - Optimize for the platform's specific features
    - Include appropriate call-to-action for the platform
    - Consider the platform's character limits
    - Use trending hashtags and formats for the platform`;

    const userPrompt = `Create a ${platform} caption for: ${prompt}`;

    try {
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(systemPrompt, userPrompt, 'caption');
        case 'claude':
          return await this.generateWithClaude(systemPrompt, userPrompt, 'caption');
        case 'gemini':
          return await this.generateWithGemini(systemPrompt, userPrompt, 'caption');
        case 'deepseek':
          return await this.generateWithDeepSeek(systemPrompt, userPrompt, 'caption');
        case 'openrouter':
          return await this.generateWithOpenRouter(systemPrompt, userPrompt, 'caption', options);
        case 'mistral':
          return await this.generateWithMistral(systemPrompt, userPrompt, 'caption');
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error generating caption with ${provider}:`, error);
      throw error;
    }
  }

  // Generate ad copy
  async generateAdCopy(prompt, provider, options) {
    const { adType = 'social', platform = 'facebook', tone = 'persuasive' } = options;
    
    const systemPrompt = `You are a professional copywriter specializing in ${platform} advertising.
    Create compelling ad copy that drives action and conversions.
    Ad Type: ${adType}
    Tone: ${tone}
    Focus on benefits, urgency, and clear call-to-action.
    Optimize for Indian market and cultural context.`;

    const userPrompt = `Create ${adType} ad copy for: ${prompt}`;

    try {
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(systemPrompt, userPrompt, 'adCopy');
        case 'claude':
          return await this.generateWithClaude(systemPrompt, userPrompt, 'adCopy');
        case 'gemini':
          return await this.generateWithGemini(systemPrompt, userPrompt, 'adCopy');
        case 'deepseek':
          return await this.generateWithDeepSeek(systemPrompt, userPrompt, 'adCopy');
        case 'openrouter':
          return await this.generateWithOpenRouter(systemPrompt, userPrompt, 'adCopy', options);
        case 'mistral':
          return await this.generateWithMistral(systemPrompt, userPrompt, 'adCopy');
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error generating ad copy with ${provider}:`, error);
      throw error;
    }
  }

  // Generate hashtags
  async generateHashtags(prompt, provider, options) {
    const { count = 15, platform = 'instagram', includeTrending = true } = options;
    
    const systemPrompt = `You are a social media hashtag expert.
    Generate relevant, trending hashtags for ${platform} content.
    Include a mix of popular, niche, and location-specific hashtags.
    Focus on Indian market and cultural relevance.
    Return only hashtags, separated by spaces.`;

    const userPrompt = `Generate ${count} hashtags for: ${prompt}`;

    try {
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(systemPrompt, userPrompt, 'hashtags');
        case 'claude':
          return await this.generateWithClaude(systemPrompt, userPrompt, 'hashtags');
        case 'gemini':
          return await this.generateWithGemini(systemPrompt, userPrompt, 'hashtags');
        case 'deepseek':
          return await this.generateWithDeepSeek(systemPrompt, userPrompt, 'hashtags');
        case 'openrouter':
          return await this.generateWithOpenRouter(systemPrompt, userPrompt, 'hashtags', options);
        case 'mistral':
          return await this.generateWithMistral(systemPrompt, userPrompt, 'hashtags');
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error generating hashtags with ${provider}:`, error);
      throw error;
    }
  }

  // Generate image prompts for DALL-E/Midjourney
  async generateImagePrompt(prompt, provider, options) {
    const { style = 'photorealistic', platform = 'instagram', mood = 'positive' } = options;
    
    const systemPrompt = `You are an expert AI image prompt engineer.
    Create a detailed, effective prompt for DALL-E 3 or Stable Diffusion to generate an image.
    The prompt should be in English and include details about style, lighting, composition, and mood.
    Platform: ${platform}
    Style: ${style}
    Mood: ${mood}`;

    const userPrompt = `Create an image prompt for: ${prompt}`;

    try {
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(systemPrompt, userPrompt, 'imagePrompt');
        case 'claude':
          return await this.generateWithClaude(systemPrompt, userPrompt, 'imagePrompt');
        case 'gemini':
          return await this.generateWithGemini(systemPrompt, userPrompt, 'imagePrompt');
        case 'deepseek':
          return await this.generateWithDeepSeek(systemPrompt, userPrompt, 'imagePrompt');
        case 'openrouter':
          return await this.generateWithOpenRouter(systemPrompt, userPrompt, 'imagePrompt', options);
        case 'mistral':
          return await this.generateWithMistral(systemPrompt, userPrompt, 'imagePrompt');
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error generating image prompt with ${provider}:`, error);
      throw error;
    }
  }

  // Generate campaign strategy
  async generateCampaignStrategy(prompt, provider, options) {
    const { budget = 'medium', duration = '1 month', platforms = ['facebook', 'instagram'] } = options;
    
    const systemPrompt = `You are a digital marketing strategist specializing in Indian markets.
    Create comprehensive campaign strategies that drive results.
    Budget: ${budget}
    Duration: ${duration}
    Platforms: ${platforms.join(', ')}
    Include targeting, messaging, content calendar, and budget allocation.`;

    const userPrompt = `Create a campaign strategy for: ${prompt}`;

    try {
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(systemPrompt, userPrompt, 'campaignStrategy');
        case 'claude':
          return await this.generateWithClaude(systemPrompt, userPrompt, 'campaignStrategy');
        case 'gemini':
          return await this.generateWithGemini(systemPrompt, userPrompt, 'campaignStrategy');
        case 'deepseek':
          return await this.generateWithDeepSeek(systemPrompt, userPrompt, 'campaignStrategy');
        case 'openrouter':
          return await this.generateWithOpenRouter(systemPrompt, userPrompt, 'campaignStrategy', options);
        case 'mistral':
          return await this.generateWithMistral(systemPrompt, userPrompt, 'campaignStrategy');
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error generating campaign strategy with ${provider}:`, error);
      throw error;
    }
  }

  // OpenAI implementation
  async generateWithOpenAI(systemPrompt, userPrompt, type) {
    const model = type === 'imagePrompt' ? 'gpt-4' : 'gpt-3.5-turbo';
    
    const response = await this.providers.openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    return {
      content: response.choices[0].message.content,
      provider: 'openai',
      type: type,
      model: model
    };
  }

  // Claude implementation
  async generateWithClaude(systemPrompt, userPrompt, type) {
    const response = await this.providers.claude.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      temperature: 0.8,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    return {
      content: response.content[0].text,
      provider: 'claude',
      type: type,
      model: 'claude-3-sonnet'
    };
  }

  // Gemini implementation
  async generateWithGemini(systemPrompt, userPrompt, type) {
    const model = this.providers.gemini.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      content: text,
      provider: 'gemini',
      type: type,
      model: 'gemini-pro'
    };
  }

  // DeepSeek implementation
  async generateWithDeepSeek(systemPrompt, userPrompt, type) {
    const response = await axios.post(`${this.providers.deepseek.baseURL}/chat/completions`, {
      model: "deepseek-chat",
      messages: [
        { "role": "system", "content": systemPrompt },
        { "role": "user", "content": userPrompt }
      ],
      max_tokens: 1024
    }, {
      headers: {
        'Authorization': `Bearer ${this.providers.deepseek.apiKey}`
      }
    });

    const content = response.data.choices[0].message.content;
    return { provider: 'deepseek', type, content };
  }

  // Update generateWithOpenRouter to use direct API call
  async generateWithOpenRouter(systemPrompt, userPrompt, type, options = {}) {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    const modelName = options.modelName || 'openai/gpt-3.5-turbo';
    const content = await generateWithOpenRouterAPI(messages, modelName);
    return { provider: 'openrouter', type, content, model: modelName };
  }

  // Mistral implementation
  async generateWithMistral(systemPrompt, userPrompt, type) {
    const client = this.providers.mistral;
    if (!client) throw new Error('Mistral provider not available');
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    const response = await client.chat.complete({
      model: 'mistral-medium',
      messages,
      max_tokens: 512,
      temperature: 0.7
    });
    return {
      content: response.choices[0].message.content,
      provider: 'mistral',
      type: type,
      model: 'mistral-medium'
    };
  }



  // Generate images using DALL-E, Replicate, or AI ML
  async generateImage(imagePrompt, options = {}) {
    const { provider = 'aiml', size = '1024x1024', quality = 'standard', style = 'vivid', model = 'stability-ai/sdxl', count = 1 } = options;
    
    if (provider === 'replicate') {
      if (!this.providers.replicate) {
        throw new Error('Replicate provider not available for image generation');
      }
      try {
        // Generate multiple images in parallel
        const imagePromises = [];
        for (let i = 0; i < count; i++) {
          imagePromises.push(
            this.providers.replicate.run(
              model,
              {
                input: {
                  prompt: imagePrompt,
                  width: parseInt(size.split('x')[0]),
                  height: parseInt(size.split('x')[1]),
                  // Add seed for variety
                  seed: Math.floor(Math.random() * 1000000),
                  // Add more parameters as needed
                }
              }
            )
          );
        }
        
        const outputs = await Promise.all(imagePromises);
        
        // Process all generated images
        const images = outputs.map((output, index) => ({
          url: Array.isArray(output) ? output[0] : output,
          provider: 'replicate',
          model,
          prompt: imagePrompt,
          index: index + 1
        }));
        
        // Log generated image URLs
        console.log(`[IMAGE GENERATION] Generated ${images.length} image(s) with Replicate:`);
        images.forEach((image, index) => {
          console.log(`[IMAGE ${index + 1}] URL: ${image.url}`);
          console.log(`[IMAGE ${index + 1}] Model: ${image.model}`);
          console.log(`[IMAGE ${index + 1}] Prompt: ${image.prompt}`);
        });
        
        // Return single image if count is 1, otherwise return array
        return count === 1 ? images[0] : images;
      } catch (error) {
        console.error('Error generating image with Replicate:', error);
                          throw error;
       }
     } else if (provider === 'aiml') {
       if (!this.providers.aiml) {
         throw new Error('AI ML provider not available for image generation');
       }
       try {
         // Generate multiple images in parallel for AI ML
         const imagePromises = [];
         for (let i = 0; i < count; i++) {
           imagePromises.push(
             axios.post(this.providers.aiml.baseURL, {
               prompt: imagePrompt,
               model: 'openai/gpt-image-1',
               size: size
             }, {
               headers: {
                 'Authorization': `Bearer ${this.providers.aiml.apiKey}`,
                 'Content-Type': 'application/json'
               },
               timeout: 60000 // 60 second timeout
             })
           );
         }
         
         const responses = await Promise.all(imagePromises);
         
         // Process all generated images
         const images = responses.map((response, index) => {
           const responseData = response.data;
           return {
             url: responseData.data?.[0]?.url || responseData.url,
            //  provider: 'aiml',
            //  model: 'openai/gpt-image-1',
            //  prompt: imagePrompt,
             index: index + 1
           };
         }).filter(image => image.url); // Filter out any failed generations
         
         // Log generated image URLs
         console.log(`[IMAGE GENERATION] Generated ${images.length} image(s) with AI ML:`);
         images.forEach((image, index) => {
           console.log(`[IMAGE ${index + 1}] URL: ${image.url}`);
           console.log(`[IMAGE ${index + 1}] Model: ${image.model}`);
           console.log(`[IMAGE ${index + 1}] Prompt: ${image.prompt}`);
         });
         
         // Return single image if count is 1, otherwise return array
         return count === 1 ? images[0] : images;
       } catch (error) {
         console.error('Error generating image with AI ML:', error);
         if (error.response) {
           console.error('AI ML API Error:', error.response.data);
         }
         throw error;
       }
     } else {
       throw new Error(`Provider ${provider} not supported for image generation`);
     }
   }

  // Generate videos using FAL (ByteDance Seedance via FAL)
  async generateVideo(videoPrompt, options = {}) {
    const { duration = 5, image_url = null, width = null, height = null } = options;

    try {
      console.log('[VIDEO GENERATION] Starting video generation with FAL:', videoPrompt);

      // Prepare input for FAL
      const input = {
        prompt: videoPrompt,
      };
      if (image_url) input.image_url = image_url;
      if (width) input.width = width;
      if (height) input.height = height;

      // Call FAL subscribe
      const result = await fal.subscribe("fal-ai/bytedance/seedance/v1/lite/image-to-video", {
        input,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      // ADD THIS LINE:
      console.log('[VIDEO GENERATION] FAL raw result:', JSON.stringify(result, null, 2));

      // result.data contains the video result, result.requestId is the job id
      const videoUrl = result.data?.video?.url;
      if (!videoUrl) {
        throw new Error('No video URL found in FAL response');
      }

      const videoResult = {
        url: videoUrl,
        provider: 'fal-ai',
        model: 'bytedance/seedance/v1/lite/image-to-video',
        prompt: videoPrompt,
        duration: duration,
        generatedAt: new Date(),
        requestId: result.requestId,
      };

      console.log('[VIDEO GENERATION] Generated video successfully:', videoResult);
      return videoResult;

    } catch (error) {
      console.error('[VIDEO GENERATION] Error generating video with FAL:', error);
      throw error;
    }
  }

  // Batch generate multiple content types
  async generateCampaignContent(campaignData, options = {}) {
    const { useParallel = true, maxResults = 3 } = options;
    // Use Mistral for all content types with improved prompts
    const contentTypes = [
      {
        type: 'caption',
        prompt: `You are a creative social media marketer. Write a catchy, engaging Instagram caption for the following campaign.\nBusiness: ${campaignData.businessIntro}\nGoal: ${campaignData.campaignGoal}\nBrand Vibe: ${campaignData.brandVibe}\nTarget Audience: ${campaignData.targetCustomer}\nInclude relevant emojis and a call to action. Limit to 1-2 sentences.`
      },
      {
        type: 'adCopy',
        prompt: `You are an expert ad copywriter. Write persuasive, high-converting ad copy for this campaign.\nBusiness: ${campaignData.businessIntro}\nGoal: ${campaignData.campaignGoal}\nBrand Vibe: ${campaignData.brandVibe}\nTarget Audience: ${campaignData.targetCustomer}\nBudget: ${campaignData.budget}\n${campaignData.preferredLanguages && campaignData.preferredLanguages.length > 0 ? `For each of the following languages, provide a separate ad copy version, clearly labeled (e.g., "Ad Copy in Hindi:", "Ad Copy in Marathi:"). Use natural, idiomatic, and culturally relevant language for each: ${campaignData.preferredLanguages.join(', ')}.` : ''}\nHighlight the offer and benefits. Use a friendly, energetic tone. Limit each ad copy to 2-3 sentences.`
      },
      {
        type: 'hashtags',
        prompt: `Generate a list of 5-8 relevant, trending hashtags for this campaign.\nBusiness: ${campaignData.businessIntro}\nGoal: ${campaignData.campaignGoal}\nBrand Vibe: ${campaignData.brandVibe}\nTarget Audience: ${campaignData.targetCustomer}\nReturn only the hashtags, separated by spaces.`
      },
      {
        type: 'imagePrompt',
        prompt: `Generate a highly engaging, visually striking image that captures the essence of **${campaignData.businessIntro}**. The image should reflect the **${campaignData.brandVibe}** style—bringing out the emotions, tone, and energy that align with the brand’s identity. The visual should be designed for promotional use on digital platforms, focusing on creating a memorable brand impression.

          **Key Visual Elements to Include:**

          - **Brand Colors:** Use a color palette that complements or matches the brand’s identity.
          - **Mood & Atmosphere:** Create a setting that reflects the vibe—whether it’s vibrant and energetic, calm and elegant, luxurious and premium, or youthful and fun (as per ${campaignData.brandVibe}).
          - **Context:** The image should feature elements that naturally relate to **${campaignData.businessIntro}**, such as relevant products, services, or experiences.
          - **Composition:** Keep it modern, minimalistic, or playful based on the brand vibe, with proper focus on the main product or theme.
          `
      }
      // { type: 'campaignStrategy', prompt: `Business: ${campaignData.businessIntro}, Goal: ${campaignData.campaignGoal}, Target: ${campaignData.targetCustomer}, Budget: ${campaignData.budget}` }
    ];

    const results = {};

    // Generate all content types with Mistral
    for (const { type, prompt } of contentTypes) {
      try {
        console.log(`[AI DEBUG] Generating ${type} with provider 'mistral'. Prompt:`, prompt);
        const contentResult = await this.generateContent(type, prompt, { provider: 'mistral', maxResults });
        // Always extract the .content field (handle array or object)
        let content = '';
        if (Array.isArray(contentResult)) {
          content = contentResult[0]?.content || '';
        } else if (contentResult && typeof contentResult === 'object') {
          content = contentResult.content || '';
        } else if (typeof contentResult === 'string') {
          content = contentResult;
        }
        results[type] = content;
        console.log(`[AI DEBUG] Result for ${type}:`, content);
      } catch (error) {
        console.error(`Error generating ${type} with Mistral:`, error);
        results[type] = '';
      }
    }

    // Generate 4 images using the specified provider and the Mistral-refined image prompt
    let generatedImages = [];
    try {
      const imagePromptContent = results.imagePrompt;
      if (imagePromptContent) {
        const imageResults = await this.generateImage(imagePromptContent, { 
          provider: options.imageProvider || 'aiml',
          count: 3,
          size: '1024x1024'
        });
        
        // Handle both single image and array responses
        if (Array.isArray(imageResults)) {
          generatedImages = imageResults;
          results.imageUrl = imageResults[0]?.url || null; // Keep first image as primary
        } else {
          generatedImages = [imageResults];
          results.imageUrl = imageResults.url;
        }
        
        results.generatedImages = generatedImages;
        
        // Log campaign image generation results
        console.log(`[CAMPAIGN IMAGES] Generated ${generatedImages.length} image(s) for campaign:`);
        generatedImages.forEach((image, index) => {
          console.log(`[CAMPAIGN IMAGE ${index + 1}] URL: ${image.url}`);
          console.log(`[CAMPAIGN IMAGE ${index + 1}] Provider: ${image.provider}`);
          console.log(`[CAMPAIGN IMAGE ${index + 1}] Model: ${image.model}`);
        });
      }
    } catch (imgErr) {
      console.error('Error generating campaign images with Replicate:', imgErr);
      results.imageUrl = null;
      results.generatedImages = [];
    }

    return results;
  }

  // Health check for all providers
  async healthCheck() {
    const health = {};
    
    for (const [provider, client] of Object.entries(this.providers)) {
      try {
        // Simple test prompt
        const testPrompt = 'Say "Hello"';
        await this.generateContent('caption', testPrompt, { provider });
        health[provider] = { status: 'healthy', timestamp: new Date() };
      } catch (error) {
        health[provider] = { 
          status: 'unhealthy', 
          error: error.message, 
          timestamp: new Date() 
        };
      }
    }

    return health;
  }
}

module.exports = new AIService(); 