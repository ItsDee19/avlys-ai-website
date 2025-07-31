const jwt = require('jsonwebtoken');
const JWTUtil = require('../utils/jwt');
const { auth, firebaseInitialized } = require('../config/firebase');
const firestoreService = require('../services/firestoreService');

// CSRF token validation middleware
const validateCSRFToken = (req, res, next) => {
  // Skip CSRF validation for GET requests and certain endpoints
  if (req.method === 'GET' || 
      req.path.includes('/health') || 
      req.path.includes('/auth/login') || 
      req.path.includes('/auth/register')) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'];
  const storedToken = req.session?.csrfToken;

  if (!csrfToken || !storedToken) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  try {
    if (!JWTUtil.verifyCSRFToken(csrfToken, storedToken)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    next();
  } catch (error) {
    console.error('CSRF validation error:', error);
    return res.status(403).json({ error: 'CSRF token validation failed' });
  }
};

const authenticateUser = async (req, res, next) => {
  try {
    // Priority 1: Check for secure HTTP-only cookies (most secure)
    let token = req.cookies?.accessToken;
    let firebaseUserId = req.headers['x-firebase-user-id'];

    // Priority 2: Fallback to Authorization header (for API clients)
    if (!token) {
      token = req.headers.authorization?.split(' ')[1];
    }

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

    // JWT fallback with enhanced security
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
        if (jwtError.message === 'Token expired' || jwtError.name === 'TokenExpiredError') {
          const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
          if (refreshToken) {
            try {
              const refreshDecoded = JWTUtil.verifyRefreshToken(refreshToken);
              const { accessToken, refreshToken: newRefreshToken } = JWTUtil.generateTokens(
                refreshDecoded.userId,
                refreshDecoded.email
              );
              
              // Set new tokens in secure cookies
              JWTUtil.setSecureCookies(res, accessToken, newRefreshToken);
              
              // Also set in headers for API clients
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
              // Clear invalid cookies
              JWTUtil.clearSecureCookies(res);
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
    // Priority 1: Check for secure HTTP-only cookies
    let token = req.cookies?.accessToken;
    let firebaseUserId = req.headers['x-firebase-user-id'];

    // Priority 2: Fallback to Authorization header
    if (!token) {
      token = req.headers.authorization?.split(' ')[1];
    }

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
        if (jwtError.message === 'Token expired' || jwtError.name === 'TokenExpiredError') {
          const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
          if (refreshToken) {
            try {
              const refreshDecoded = JWTUtil.verifyRefreshToken(refreshToken);
              const { accessToken, refreshToken: newRefreshToken } = JWTUtil.generateTokens(
                refreshDecoded.userId,
                refreshDecoded.email
              );
              
              // Set new tokens in secure cookies
              JWTUtil.setSecureCookies(res, accessToken, newRefreshToken);
              
              // Also set in headers for API clients
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
              // Clear invalid cookies
              JWTUtil.clearSecureCookies(res);
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

module.exports = { authenticateUser, optionalAuth, validateCSRFToken };