const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWTUtil = require('../utils/jwt');
const firestoreService = require('../services/firestoreService');
const { authenticateUser } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await firestoreService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = await firestoreService.createUser({
      username,
      email,
      password
    });

    // Generate JWT tokens
    const { accessToken, refreshToken } = JWTUtil.generateTokens(user.id, user.email);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('Firestore is not available')) {
      res.status(503).json({ 
        error: 'Service unavailable', 
        message: 'Please check Firebase configuration' 
      });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, firebaseUid } = req.body;
    const firebaseToken = req.headers['x-firebase-user-id'];

    let user = null;

    // Handle Firebase authentication
    if (firebaseToken && firebaseUid) {
      try {
        const { auth } = require('../config/firebase');
        const decodedToken = await auth.verifyIdToken(firebaseToken);
        
        if (decodedToken.uid === firebaseUid && decodedToken.email === email) {
          // Try to find existing user by email
          user = await firestoreService.getUserByEmail(email);
          
          // If user doesn't exist, create one
          if (!user) {
            const userData = {
              username: email.split('@')[0],
              email: email,
              firebaseUid: firebaseUid,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            user = await firestoreService.createUser(userData);
          }
        } else {
          return res.status(401).json({ error: 'Invalid Firebase token' });
        }
      } catch (firebaseError) {
        console.error('Firebase authentication failed:', firebaseError);
        return res.status(401).json({ error: 'Firebase authentication failed' });
      }
    }
    // Handle traditional email/password authentication
    else if (email && password) {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Get user by email
      user = await firestoreService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      return res.status(400).json({ error: 'Either email/password or Firebase authentication is required' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = JWTUtil.generateTokens(user.id, user.email);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.message.includes('Firestore is not available')) {
      res.status(503).json({ 
        error: 'Service unavailable', 
        message: 'Please check Firebase configuration' 
      });
    } else {
      res.status(500).json({ error: 'Login failed' });
    }
  }
});

// Get current user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await firestoreService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    if (error.message.includes('Firestore is not available')) {
      res.status(503).json({ 
        error: 'Service unavailable', 
        message: 'Please check Firebase configuration' 
      });
    } else {
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { username, email } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const updatedUser = await firestoreService.updateUser(req.user.id, updateData);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.message.includes('Firestore is not available')) {
      res.status(503).json({ 
        error: 'Service unavailable', 
        message: 'Please check Firebase configuration' 
      });
    } else {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
});

// Verify token
router.get('/verify', authenticateUser, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      authType: req.user.authType
    },
    tokenRefreshed: req.user.tokenRefreshed || false
  });
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = JWTUtil.verifyRefreshToken(refreshToken);
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = JWTUtil.generateTokens(
      decoded.userId,
      decoded.email
    );

    res.json({
      message: 'Tokens refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.message.includes('expired')) {
      return res.status(401).json({ error: 'Refresh token expired. Please login again.' });
    }
    
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;