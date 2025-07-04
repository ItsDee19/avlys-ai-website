const jwt = require('jsonwebtoken');
const JWTUtil = require('../utils/jwt');
const { auth, firebaseInitialized } = require('../config/firebase');
const firestoreService = require('../services/firestoreService');

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const firebaseUserId = req.headers['x-firebase-user-id'];

    if (!token && !firebaseUserId) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Try Firebase authentication first
    if (firebaseUserId && firebaseInitialized) {
      try {
        const decodedToken = await auth.verifyIdToken(firebaseUserId);
        req.user = {
          id: decodedToken.uid,
          email: decodedToken.email,
          authType: 'firebase'
        };
        return next();
      } catch (firebaseError) {
        console.warn('Firebase token verification failed:', firebaseError.message);
        // Continue to JWT fallback
      }
    }

    // JWT fallback
    if (token) {
      try {
        const decoded = JWTUtil.verifyToken(token);
        req.user = {
          id: decoded.userId || decoded.id,
          email: decoded.email,
          authType: 'jwt'
        };
        return next();
      } catch (jwtError) {
        console.warn('JWT token verification failed:', jwtError.message);
        
        // Check if token is expired and try to refresh
        if (jwtError.message === 'Token expired') {
          const refreshToken = req.headers['x-refresh-token'];
          if (refreshToken) {
            try {
              const refreshDecoded = JWTUtil.verifyRefreshToken(refreshToken);
              const { accessToken, refreshToken: newRefreshToken } = JWTUtil.generateTokens(
                refreshDecoded.userId,
                refreshDecoded.email
              );
              
              // Set new tokens in response headers
              res.setHeader('x-new-access-token', accessToken);
              res.setHeader('x-new-refresh-token', newRefreshToken);
              
              req.user = {
                id: refreshDecoded.userId,
                email: refreshDecoded.email,
                authType: 'jwt',
                tokenRefreshed: true
              };
              return next();
            } catch (refreshError) {
              console.warn('Token refresh failed:', refreshError.message);
            }
          }
        }
      }
    }

    // If both authentication methods failed
    return res.status(401).json({ error: 'Invalid authentication token' });

  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.message.includes('Firebase not initialized')) {
      return res.status(503).json({ 
        error: 'Authentication service unavailable', 
        message: 'Please check Firebase configuration' 
      });
    }
    
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const firebaseUserId = req.headers['x-firebase-user-id'];

    if (!token && !firebaseUserId) {
      req.user = null;
      return next();
    }

    // Try Firebase authentication first
    if (firebaseUserId && firebaseInitialized) {
      try {
        const decodedToken = await auth.verifyIdToken(firebaseUserId);
        req.user = {
          id: decodedToken.uid,
          email: decodedToken.email,
          authType: 'firebase'
        };
        return next();
      } catch (firebaseError) {
        console.warn('Firebase token verification failed:', firebaseError.message);
        // Continue to JWT fallback
      }
    }

    // JWT fallback
    if (token) {
      try {
        const decoded = JWTUtil.verifyToken(token);
        req.user = {
          id: decoded.userId || decoded.id,
          email: decoded.email,
          authType: 'jwt'
        };
        return next();
      } catch (jwtError) {
        console.warn('JWT token verification failed:', jwtError.message);
        
        // Check if token is expired and try to refresh
        if (jwtError.message === 'Token expired') {
          const refreshToken = req.headers['x-refresh-token'];
          if (refreshToken) {
            try {
              const refreshDecoded = JWTUtil.verifyRefreshToken(refreshToken);
              const { accessToken, refreshToken: newRefreshToken } = JWTUtil.generateTokens(
                refreshDecoded.userId,
                refreshDecoded.email
              );
              
              // Set new tokens in response headers
              res.setHeader('x-new-access-token', accessToken);
              res.setHeader('x-new-refresh-token', newRefreshToken);
              
              req.user = {
                id: refreshDecoded.userId,
                email: refreshDecoded.email,
                authType: 'jwt',
                tokenRefreshed: true
              };
              return next();
            } catch (refreshError) {
              console.warn('Token refresh failed:', refreshError.message);
            }
          }
        }
      }
    }

    // If both authentication methods failed, continue without user
    req.user = null;
    next();

  } catch (error) {
    console.error('Optional authentication error:', error);
    req.user = null;
    next();
  }
};

module.exports = { authenticateUser, optionalAuth };