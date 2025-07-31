const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTUtil {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.accessTokenExpiry = '15m'; // 15 minutes
    this.refreshTokenExpiry = '7d'; // 7 days
  }

  generateTokens(userId, email) {
    const accessToken = jwt.sign(
      { userId, email, type: 'access' },
      this.secret,
      { expiresIn: this.accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { userId, email, type: 'refresh' },
      this.refreshSecret,
      { expiresIn: this.refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Token verification failed');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch (error) {
      throw new Error('Refresh token verification failed');
    }
  }

  // New: Cookie-based token management for enhanced security
  setSecureCookies(res, accessToken, refreshToken) {
    const cookieOptions = {
      httpOnly: true, // Prevents XSS access
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 15 * 60 * 1000, // 15 minutes for access token
      path: '/'
    };

    const refreshCookieOptions = {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
      path: '/api/auth/refresh' // Only accessible to refresh endpoint
    };

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  }

  clearSecureCookies(res) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  }

  // New: Generate CSRF token for additional protection
  generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // New: Verify CSRF token
  verifyCSRFToken(token, storedToken) {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(storedToken, 'hex')
    );
  }
}

module.exports = new JWTUtil();