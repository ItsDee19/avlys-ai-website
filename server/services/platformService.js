const adsSdk = require('facebook-nodejs-business-sdk');
const { GoogleAdsApi } = require('google-ads-api');

class PlatformService {
  constructor() {
    this.initializePlatforms();
  }

  initializePlatforms() {
    // Facebook/Instagram
    adsSdk.FacebookAdsApi.init(process.env.FACEBOOK_ACCESS_TOKEN);
    this.facebookSdk = adsSdk;
    
    // Google Ads
    this.googleAds = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_DEVELOPER_TOKEN,
    });
  }

  async deployToAllPlatforms(campaign) {
    const results = {};
    const { strategy, preferredChannels } = campaign;

    for (const platform of preferredChannels) {
      try {
        switch (platform.toLowerCase()) {
          case 'facebook':
          case 'instagram':
            results[platform] = await this.deployToFacebook(campaign, platform);
            break;
          case 'google ads':
            results[platform] = await this.deployToGoogle(campaign);
            break;
          default:
            results[platform] = { error: 'Platform not supported' };
        }
      } catch (error) {
        results[platform] = { error: error.message };
      }
    }

    return results;
  }

  async deployToFacebook(campaign, platform) {
    const { strategy } = campaign;
    const adCopy = strategy.adCopy.find(copy => copy.platform.toLowerCase() === platform.toLowerCase());
    const Campaign = this.facebookSdk.Campaign;
    const AdSet = this.facebookSdk.AdSet;
    const AdCreative = this.facebookSdk.AdCreative;
    const AdAccount = this.facebookSdk.AdAccount;
    const account = new AdAccount(process.env.FACEBOOK_AD_ACCOUNT_ID);

    // Create campaign
    const fbCampaign = await account.createCampaign([], {
      [Campaign.Fields.name]: `${campaign.businessName} - ${platform}`,
      [Campaign.Fields.objective]: Campaign.Objective.conversions,
      [Campaign.Fields.status]: Campaign.Status.paused,
    });

    // Create ad set
    const adSet = await account.createAdSet([], {
      [AdSet.Fields.name]: `${campaign.businessName} - AdSet`,
      [AdSet.Fields.optimization_goal]: AdSet.OptimizationGoal.conversions,
      [AdSet.Fields.billing_event]: AdSet.BillingEvent.impressions,
      [AdSet.Fields.bid_amount]: Math.floor(strategy.budgetAllocation[platform.toLowerCase()] / 30 * 100),
      [AdSet.Fields.targeting]: {
        age_min: 18,
        age_max: 65,
        interests: strategy.targetingRecommendations.interests.map(interest => ({ name: interest })),
      },
      [AdSet.Fields.campaign_id]: fbCampaign.id,
      [AdSet.Fields.status]: AdSet.Status.paused,
    });

    // Create ad creative
    const creative = await account.createAdCreative([], {
      [AdCreative.Fields.name]: `${campaign.businessName} - Creative`,
      [AdCreative.Fields.object_story_spec]: {
        page_id: process.env.FACEBOOK_PAGE_ID,
        link_data: {
          message: adCopy.description,
          name: adCopy.headline,
          call_to_action: {
            type: 'LEARN_MORE',
            value: {
              link: campaign.landingPageUrl || 'https://your-website.com',
            },
          },
        },
      },
    });

    // Create ad
    const ad = await account.createAd([], {
      name: `${campaign.businessName} - Ad`,
      [this.facebookSdk.Ad.Fields.creative]: { creative_id: creative.id },
      [this.facebookSdk.Ad.Fields.status]: this.facebookSdk.Ad.Status.paused,
      [this.facebookSdk.Ad.Fields.adset_id]: adSet.id,
      [this.facebookSdk.Ad.Fields.campaign_id]: fbCampaign.id,
    });

    return {
      campaignId: fbCampaign.id,
      adSetId: adSet.id,
      adId: ad.id,
      status: 'created',
    };
  }

  async deployToGoogle(campaign) {
    const { strategy } = campaign;
    const adCopy = strategy.adCopy.find(copy => copy.platform.toLowerCase() === 'google ads');
    
    const customer = this.googleAds.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    // Create campaign
    const campaignOperation = {
      create: {
        name: `${campaign.businessName} - Search`,
        advertising_channel_type: 'SEARCH',
        status: 'PAUSED',
        manual_cpc: {
          enhanced_cpc_enabled: true,
        },
        campaign_budget: {
          amount_micros: strategy.budgetAllocation.googleAds * 1000000, // Convert to micros
          delivery_method: 'STANDARD',
        },
      },
    };

    const campaignResult = await customer.campaigns.create([campaignOperation]);
    
    return {
      campaignId: campaignResult.results[0].resource_name,
      status: 'created',
    };
  }

  async getAggregatedAnalytics(campaignId) {
    const campaign = await Campaign.findById(campaignId);
    const analytics = {
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      platformBreakdown: {},
    };

    // Aggregate data from all platforms
    for (const platform of campaign.preferredChannels) {
      try {
        let platformData;
        switch (platform.toLowerCase()) {
          case 'facebook':
          case 'instagram':
            platformData = await this.getFacebookAnalytics(campaign, platform);
            break;
          case 'google ads':
            platformData = await this.getGoogleAnalytics(campaign);
            break;
        }
        
        if (platformData) {
          analytics.totalSpend += platformData.spend;
          analytics.totalImpressions += platformData.impressions;
          analytics.totalClicks += platformData.clicks;
          analytics.totalConversions += platformData.conversions;
          analytics.platformBreakdown[platform] = platformData;
        }
      } catch (error) {
        console.error(`Error fetching ${platform} analytics:`, error);
      }
    }

    return analytics;
  }
}

module.exports = new PlatformService();