// Authentication utilities for handling token refresh

class AuthUtils {
  static TOKEN_KEY = 'accessToken';
  static REFRESH_TOKEN_KEY = 'refreshToken';
  static API_BASE_URL = 'http://localhost:5000/api';
  static onAutoLogout = null; // callback for auto-logout

  // Store tokens in localStorage
  static setTokens(accessToken, refreshToken) {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  // Get access token from localStorage
  static getAccessToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get refresh token from localStorage
  static getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Remove tokens from localStorage
  static clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Refresh access token using refresh token
  static async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken);
      
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      if (typeof this.onAutoLogout === 'function') {
        this.onAutoLogout();
      }
      throw error;
    }
  }

  // Make authenticated API request with automatic token refresh
  static async authenticatedFetch(url, options = {}) {
    const makeRequest = async (token) => {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
        headers['x-refresh-token'] = this.getRefreshToken();
      }

      return fetch(url, {
        ...options,
        headers,
      });
    };

    try {
      let accessToken = this.getAccessToken();
      let response = await makeRequest(accessToken);

      // Check if new tokens were provided in response headers
      const newAccessToken = response.headers.get('x-new-access-token');
      const newRefreshToken = response.headers.get('x-new-refresh-token');
      
      if (newAccessToken && newRefreshToken) {
        this.setTokens(newAccessToken, newRefreshToken);
        console.log('Tokens automatically refreshed');
      }

      // If token is expired and no automatic refresh happened, try manual refresh
      if (response.status === 401 && !newAccessToken) {
        console.log('Token expired, attempting refresh...');
        accessToken = await this.refreshToken();
        response = await makeRequest(accessToken);
      }

      return response;
    } catch (error) {
      console.error('Authenticated fetch error:', error);
      throw error;
    }
  }

  // Login user and store tokens
  static async login(email, password) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register user and store tokens
  static async register(username, email, password) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken);
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout user
  static logout() {
    this.clearTokens();
    if (typeof this.onAutoLogout === 'function') {
      this.onAutoLogout();
    }
  }

  // Decode JWT token (without verification)
  static decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  // Check if token is expired
  static isTokenExpired(token) {
    if (!token) return true;
    
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }

  // Get user info from token
  static getUserFromToken() {
    const token = this.getAccessToken();
    if (!token || this.isTokenExpired(token)) return null;
    
    return this.decodeToken(token);
  }
}

export default AuthUtils;