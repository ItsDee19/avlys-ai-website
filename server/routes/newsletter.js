const express = require('express');
const router = express.Router();
const firestoreService = require('../services/firestoreService');

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    await firestoreService.addNewsletterSubscriber(email);
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    if (error.message === 'Email already subscribed') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error subscribing', error: error.message });
  }
});

module.exports = router;