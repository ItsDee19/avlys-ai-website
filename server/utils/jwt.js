const jwt = require('jsonwebtoken');

class JWTUtil {
  static generateTokens(userId, email) {
    const accessToken = jwt.sign(
      { userId, email, type: 'access' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, email, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  static generateToken(userId, email) {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      throw new Error('Invalid token');
    }
  }

  static verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret');
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      }
      throw new Error('Invalid refresh token');
    }
  }

  static isTokenExpired(token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return false;
    } catch (error) {
      return error.name === 'TokenExpiredError';
    }
  }
}

module.exports = JWTUtil;