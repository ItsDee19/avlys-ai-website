// Authentication utilities for handling token refresh

class AuthUtils {
  constructor() {
    this.TOKEN_KEY = 'accessToken';
    this.REFRESH_TOKEN_KEY = 'refreshToken';
    this.CSRF_TOKEN_KEY = 'csrfToken';
    this.API_BASE_URL = 'http://localhost:5001/api';
  }

  // Store tokens in localStorage
  storeTokens(accessToken, refreshToken) {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  // Get access token from localStorage
  getAccessToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get refresh token from localStorage
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Remove tokens from localStorage
  clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.CSRF_TOKEN_KEY);
  }

  // Generate and store CSRF token
  generateCSRFToken() {
    const token = this.generateRandomToken(32);
    localStorage.setItem(this.CSRF_TOKEN_KEY, token);
    return token;
  }

  // Get stored CSRF token
  getCSRFToken() {
    return localStorage.getItem(this.CSRF_TOKEN_KEY);
  }

  // Generate random token
  generateRandomToken(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Authenticated fetch with CSRF protection
  async authenticatedFetch(url, options = {}) {
    const token = this.getAccessToken();
    const csrfToken = this.getCSRFToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include' // Include cookies for secure authentication
    };

    try {
      const response = await fetch(url, config);
      
      // Handle token refresh if needed
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the request with new token
          const newToken = this.getAccessToken();
          headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(url, { ...config, headers });
        }
      }
      
      return response;
    } catch (error) {
      console.error('Authenticated fetch error:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.storeTokens(data.accessToken, data.refreshToken);
        return true;
      } else {
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) return false;
    
    try {
      // Basic token validation (check if it's not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Get user info from token
  getUserFromToken() {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId || payload.id,
        email: payload.email
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint to clear server-side cookies
      await fetch(`${this.API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clear local storage regardless
      this.clearTokens();
    }
  }
}

export default new AuthUtils();