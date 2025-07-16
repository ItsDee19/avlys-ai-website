# AI ML Image Generation Setup

This document explains how to set up and use the AI ML provider for image generation alongside the existing Replicate provider.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# AI ML Provider Configuration
AIML_API_KEY=your_aiml_api_key_here
AIML_BASE_URL=https://api.aiml.com/v1  # Optional, defaults to this URL
```

## Model Information

The AI ML provider uses the `openai/gpt-image-1` model for image generation. This model:
- Generates high-quality images from text prompts
- Uses the OpenAI-compatible API format
- Returns images in the chat completions response format

## Usage

### Basic Image Generation

```javascript
const aiService = require('./services/aiService');

// Generate a single image with AI ML
const image = await aiService.generateImage('A beautiful sunset over mountains', {
  provider: 'aiml'
});

console.log('Generated image URL:', image.url);
```

### Generate Multiple Images

```javascript
// Generate multiple images in parallel
const images = await aiService.generateImage('A futuristic cityscape', {
  provider: 'aiml',
  count: 4
});

images.forEach((image, index) => {
  console.log(`Image ${index + 1}: ${image.url}`);
});
```

### Campaign Content Generation with AI ML

```javascript
// Generate campaign content with AI ML for images
const campaignContent = await aiService.generateCampaignContent(campaignData, {
  imageProvider: 'aiml',  // Use AI ML for image generation
  maxResults: 3
});
```

## Available Options

### Image Generation Options

- `provider`: 'aiml' or 'replicate' (default: 'replicate')
- `count`: Number of images to generate (default: 1)

**Note**: The AI ML provider uses the `openai/gpt-image-1` model which handles image generation internally. Size, quality, and style parameters are managed by the model itself.

### Response Format

The AI ML provider returns the same format as Replicate:

```javascript
{
  url: 'https://example.com/generated-image.jpg',
  provider: 'aiml',
  model: 'openai/gpt-image-1',
  prompt: 'Original prompt used',
  index: 1  // Only present when generating multiple images
}
```

## Testing

Run the test file to verify your AI ML setup:

```bash
cd server
node test-aiml-image.js
```

## Error Handling

The AI ML provider includes comprehensive error handling:

- API key validation
- Network timeout (60 seconds)
- Response format validation
- Detailed error logging

## Provider Comparison

| Feature | Replicate | AI ML |
|---------|-----------|-------|
| API Key Required | `REPLICATE_API_TOKEN` | `AIML_API_KEY` |
| Base URL Configurable | No | Yes (`AIML_BASE_URL`) |
| Parallel Generation | ✅ | ✅ |
| Error Handling | ✅ | ✅ |
| Response Format | Consistent | Consistent |

## Troubleshooting

### Common Issues

1. **"AI ML provider not available"**
   - Check that `AIML_API_KEY` is set in your environment
   - Verify the API key is valid

2. **"Network timeout"**
   - The default timeout is 60 seconds
   - Check your internet connection
   - Verify the AI ML service is accessible

3. **"Invalid response format"**
   - The provider expects a response with `url`, `image_url`, or `data.url`
   - Check the AI ML API documentation for the correct response format

### Debug Mode

Enable detailed logging by checking the console output. The service logs:
- Provider initialization
- Image generation requests
- Generated image URLs
- Error details with API responses 