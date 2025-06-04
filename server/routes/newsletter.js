const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingEmail = await Newsletter.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    const newSubscription = new Newsletter({ email });
    await newSubscription.save();
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error subscribing', error: error.message });
  }
});

module.exports = router;