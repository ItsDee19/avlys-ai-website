const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/auth');

// Create a Stripe Checkout session
router.post('/create-checkout-session', authenticateUser, paymentController.createCheckoutSession);

// Stripe webhook for handling payment events
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

module.exports = router; 