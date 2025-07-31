const firestoreService = require('../services/firestoreService');
const aiService = require('../services/aiService'); // Assuming aiService is needed for creation

// Create a new campaign
exports.createCampaign = async (req, res) => {
    try {
        const campaignData = {
            ...req.body,
            userId: req.user.id,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Ensure required 'name' field for Firestore
        campaignData.name = campaignData.businessIntro || campaignData.title || 'Untitled Campaign';

        // Generate all campaign content (captions, hashtags, ad copy, image) using Mistral + Replicate
        try {
            console.log('Generating AI content for campaign:', campaignData);
            await aiService.initEnrichmentData(campaignData);
            const aiContent = await aiService.generateCampaignContent(campaignData);
            console.log('Raw AI content result:', aiContent);
            campaignData.caption = typeof aiContent.caption === 'string' ? aiContent.caption : '';
            campaignData.hashtags = typeof aiContent.hashtags === 'string' ? aiContent.hashtags : '';
            campaignData.adCopy = typeof aiContent.adCopy === 'string' ? aiContent.adCopy : '';
            campaignData.imageUrl = typeof aiContent.imageUrl === 'string' ? aiContent.imageUrl : '';
            campaignData.generatedImages = aiContent.generatedImages || [];
            campaignData.aiContent = aiContent; // Store all raw AI content for reference
            console.log('AI content to be saved:', {
              caption: campaignData.caption,
              hashtags: campaignData.hashtags,
              adCopy: campaignData.adCopy,
              imageUrl: campaignData.imageUrl
            });
        } catch (err) {
            console.error('Failed to generate full campaign content:', err);
            campaignData.caption = '';
            campaignData.hashtags = '';
            campaignData.adCopy = '';
            campaignData.imageUrl = '';
        }

        const campaign = await firestoreService.createCampaign(campaignData);
        res.status(201).json(campaign);
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
};

// Get all campaigns for the authenticated user
exports.getUserCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;
        const campaigns = await firestoreService.getCampaignsByUser(userId);
        res.json(campaigns);
    } catch (error) {
        console.error('Error getting user campaigns:', error);
        res.status(500).json({ error: 'Failed to get campaigns' });
    }
};

// Get a single campaign by ID
exports.getCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await firestoreService.getCampaignById(id);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        // Basic authorization: ensure user can only access their own campaigns
        if (campaign.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this campaign' });
        }
        res.json(campaign);
    } catch (error) {
        console.error('Error getting campaign:', error);
        res.status(500).json({ error: 'Failed to get campaign' });
    }
};

// Update a campaign
exports.updateCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const campaignData = req.body;
        
        // Ensure user can only update their own campaigns
        const existingCampaign = await firestoreService.getCampaignById(id);
        if (!existingCampaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        if (existingCampaign.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this campaign' });
        }

        // Regenerate image if relevant fields are updated
        const shouldRegenerateImage =
            campaignData.imagePrompt !== undefined ||
            campaignData.businessIntro !== undefined ||
            campaignData.campaignGoal !== undefined ||
            campaignData.brandVibe !== undefined;
        if (shouldRegenerateImage) {
            try {
                await aiService.initEnrichmentData(campaignData);
                let imagePrompt = campaignData.imagePrompt;
                if (!imagePrompt) {
                    const imagePromptResult = await aiService.generateImagePrompt('', 'mistral', {});
                    imagePrompt = imagePromptResult.content;
                }
                const imageResult = await aiService.generateImage(imagePrompt, { provider: 'replicate' });
                campaignData.imageUrl = imageResult.url;
            } catch (imgErr) {
                console.error('Failed to regenerate campaign image:', imgErr);
                // Optionally keep the old imageUrl
            }
        }

        const updatedCampaign = await firestoreService.updateCampaign(id, campaignData);
        res.json(updatedCampaign);
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
};

// Delete a campaign
exports.deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure user can only delete their own campaigns
        const existingCampaign = await firestoreService.getCampaignById(id);
        if (!existingCampaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        if (existingCampaign.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this campaign' });
        }

        // Delete from both main collection and user subcollection
        await firestoreService.deleteCampaign(id);
        
        // Also delete from user subcollection to ensure frontend updates
        try {
            await firestoreService.deleteUserCampaign(req.user.id, id);
        } catch (subcollectionError) {
            console.warn('Failed to delete from user subcollection:', subcollectionError.message);
            // Don't fail the request if subcollection deletion fails
        }
        
        res.status(204).send(); // No Content
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
}; 