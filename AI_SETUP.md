# AI Content Generation Setup Guide

This guide will help you set up the AI content generation system with multiple providers for fast and seamless content creation.

## Required Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="your-firebase-private-key"

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# AI Provider API Keys
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GEMINI_API_KEY=your-gemini-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Getting API Keys

### 1. OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys" in the sidebar
4. Click "Create new secret key"
5. Copy the key and add it to your `.env` file

### 2. Anthropic Claude API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys"
4. Click "Create Key"
5. Copy the key and add it to your `.env` file

### 3. Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

### 4. DeepSeek API Key
1. Go to [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys" in your dashboard
4. Click "Create API Key"
5. Copy the key and add it to your `.env` file

## Installing Dependencies

Run the following command in the `server` directory:

```bash
npm install
```

This will install all required AI provider SDKs:
- `openai` - OpenAI API client
- `@anthropic-ai/sdk` - Anthropic Claude API client
- `@google/generative-ai` - Google Gemini API client
- `axios` - HTTP client for DeepSeek API integration

## Features

### Multi-Provider AI System
- **Parallel Processing**: Generate content using multiple AI providers simultaneously
- **Fallback Support**: If one provider fails, others continue working
- **Provider Selection**: Choose specific providers or use all available ones
- **Health Monitoring**: Check the status of all AI providers

### Content Types Supported
1. **Social Media Captions** - Engaging captions for Instagram, Facebook, etc.
2. **Ad Copy** - Compelling advertising copy for various platforms
3. **Hashtags** - Relevant hashtags optimized for discoverability
4. **Image Prompts** - Detailed prompts for AI image generation
5. **Campaign Strategy** - Comprehensive marketing strategies

### AI Providers Used
- **OpenAI GPT-3.5/GPT-4** - Fast, reliable text generation
- **Anthropic Claude** - High-quality, context-aware responses
- **Google Gemini** - Cost-effective, multilingual support
- **DeepSeek** - Advanced reasoning and creative content generation

## API Endpoints

### Health Check
```
GET /api/ai/health
```
Check the status of all AI providers

### Get Available Providers
```
GET /api/ai/providers
```
List all available AI providers

### Generate Content (Parallel)
```
POST /api/ai/generate/parallel
```
Generate content using multiple providers simultaneously

### Generate Specific Content Types
```
POST /api/ai/captions
POST /api/ai/ad-copy
POST /api/ai/hashtags
POST /api/ai/image-prompts
POST /api/ai/campaign-strategy
```

### Generate Images
```
POST /api/ai/images
```
Generate images using DALL-E 3

### Generate Complete Campaign Content
```
POST /api/ai/campaign-content
```
Generate all content types for a campaign at once

## Usage Examples

### Generate Captions
```javascript
const response = await fetch('/api/ai/captions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    prompt: 'Herbal skincare brand in Bangalore',
    options: {
      platform: 'instagram',
      tone: 'friendly',
      length: 'medium'
    }
  })
});
```

### Generate All Campaign Content
```javascript
const response = await fetch('/api/ai/campaign-content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    campaignData: {
      businessIntro: 'Herbal skincare brand in Bangalore',
      campaignGoal: 'get-customers',
      targetCustomer: 'Young professionals aged 25-35',
      brandVibe: 'friendly-relatable',
      budget: '5000',
      superpowers: ['eco-friendly', 'affordable']
    },
    options: {
      useParallel: true,
      maxResults: 3
    }
  })
});
```

## Dashboard Features

### Campaign Overview
- View all campaigns with status indicators
- Quick statistics and metrics
- Recent campaign activity

### AI Content Generation
- Generate captions, ad copy, hashtags, and image prompts
- Multiple AI provider results for each content type
- Copy and regenerate functionality
- Provider and model information display

### Campaign Management
- View detailed campaign information
- Edit campaign settings
- Track campaign performance
- Generate new content for existing campaigns

## Error Handling

The system includes comprehensive error handling:
- Provider-specific error messages
- Graceful fallbacks when providers are unavailable
- Detailed logging for debugging
- User-friendly error messages

## Performance Optimization

- **Parallel Processing**: Multiple AI providers work simultaneously
- **Caching**: Results can be cached for faster retrieval
- **Rate Limiting**: Built-in rate limiting to prevent API abuse
- **Connection Pooling**: Efficient API connection management

## Security

- **Authentication Required**: All AI endpoints require JWT authentication
- **API Key Protection**: API keys are stored securely in environment variables
- **Input Validation**: All prompts are validated before processing
- **Rate Limiting**: Prevents abuse and ensures fair usage

## Monitoring

- **Health Checks**: Regular monitoring of AI provider status
- **Usage Tracking**: Track API usage and costs
- **Error Logging**: Comprehensive error logging for debugging
- **Performance Metrics**: Monitor response times and success rates

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify API keys are correctly set in `.env` file
   - Check API key permissions and quotas
   - Ensure keys are not expired

2. **Provider Unavailable**
   - Check internet connectivity
   - Verify provider service status
   - Review API rate limits

3. **Authentication Errors**
   - Ensure JWT token is valid
   - Check user permissions
   - Verify token expiration

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=ai-service:*
```

## Support

For issues or questions:
1. Check the error logs in the console
2. Verify all environment variables are set correctly
3. Test individual providers using the health check endpoint
4. Review API provider documentation for specific error codes 