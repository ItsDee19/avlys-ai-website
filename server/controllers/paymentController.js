const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const firestoreService = require('../services/firestoreService');
const aiService = require('../services/aiService');
const platformService = require('../services/platformService');

// Create a Stripe Checkout session for a one-time payment
exports.createCheckoutSession = async (req, res) => {
  try {
    const { priceId, campaignId } = req.body; // e.g., price_12345, campaign_abcde
    const userId = req.user.id;

    if (!priceId || !campaignId) {
        return res.status(400).json({ error: 'Price ID and Campaign ID are required.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?payment=cancelled`,
      metadata: {
        userId,
        campaignId,
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
};

// Handle incoming webhooks from Stripe
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      // Fulfill the purchase, e.g., mark the campaign as 'active'
      await firestoreService.updateCampaign(session.metadata.campaignId, { 
        status: 'active',
        paymentStatus: 'paid',
        stripeSessionId: session.id 
      });
      break;
    // ... handle other event types like payment_failed, etc.
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Handle successful payment event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, campaignId } = session.metadata;

    try {
      // 1. Fetch the campaign
      const campaign = await firestoreService.getCampaignById(campaignId);
      if (!campaign) throw new Error('Campaign not found');

      // 2. Generate AI Content
      const strategy = await aiService.generateContent('campaignStrategy', JSON.stringify(campaign), {
        provider: 'openrouter',
        modelName: 'anthropic/claude-3.5-sonnet'
      });
      const aiContent = JSON.parse(strategy.content);

      // 3. Update campaign with AI content
      const updatedCampaignData = { ...campaign, strategy: aiContent };
      await firestoreService.updateCampaign(campaignId, { strategy: aiContent, status: 'generating' });
      
      // 4. Deploy to ad platforms
      const deploymentResults = await platformService.deployToAllPlatforms(updatedCampaignData);

      // 5. Final update to campaign status
      await firestoreService.updateCampaign(campaignId, { status: 'active', deployment: deploymentResults });

      console.log(`Successfully processed and deployed campaign ${campaignId}`);

    } catch (error) {
      console.error(`Webhook Error for campaign ${campaignId}:`, error);
      await firestoreService.updateCampaign(campaignId, { status: 'failed', error: error.message });
      // Optionally, notify the user or admin of the failure
    }
  }

  res.json({ received: true });
}; 