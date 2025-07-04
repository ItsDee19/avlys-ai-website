const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateUser } = require('../middleware/auth');
const { validate, profileValidationRules } = require('../middleware/validator');

// Get user profile
router.get('/', authenticateUser, profileController.getProfile);

// Create or update user profile
router.post('/', authenticateUser, profileValidationRules(), validate, profileController.updateProfile);

module.exports = router; 