import { useState, useEffect, useContext, createContext } from 'react';
import AuthUtils from '../utils/authUtils';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { jwtDecode } from 'jwt-decode';

// Create Auth Context
const AuthContext = createContext();

const JWT_TOKEN_KEY = 'accessToken';
const JWT_REFRESH_KEY = 'refreshToken';
const API_BASE_URL = 'http://localhost:5001/api';

// Session timeout configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
const TOKEN_REFRESH_THRESHOLD = 2 * 60 * 1000; // 2 minutes before expiry

async function fetchJwtTokens(firebaseUser) {
  const idToken = await firebaseUser.getIdToken();
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-firebase-user-id': idToken },
    body: JSON.stringify({ email: firebaseUser.email, firebaseUid: firebaseUser.uid }),
    credentials: 'include' // Include cookies
  });
  if (!response.ok) throw new Error('Failed to fetch JWT tokens');
  const data = await response.json();
  if (data.accessToken && data.refreshToken) {
    localStorage.setItem(JWT_TOKEN_KEY, data.accessToken);
    localStorage.setItem(JWT_REFRESH_KEY, data.refreshToken);
  }
  return data;
}

async function refreshJwtToken() {
  const refreshToken = localStorage.getItem(JWT_REFRESH_KEY);
  if (!refreshToken) throw new Error('No refresh token');
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    credentials: 'include' // Include cookies
  });
  if (!response.ok) throw new Error('Failed to refresh JWT token');
  const data = await response.json();
  if (data.accessToken && data.refreshToken) {
    localStorage.setItem(JWT_TOKEN_KEY, data.accessToken);
    localStorage.setItem(JWT_REFRESH_KEY, data.refreshToken);
  }
  return data;
}

async function authenticatedApiFetch(url, options = {}) {
  const token = localStorage.getItem(JWT_TOKEN_KEY);
  const headers = { ...(options.headers || {}), Authorization: token ? `Bearer ${token}` : undefined };
  return fetch(url, { ...options, headers, credentials: 'include' });
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // Activity tracking
  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  // Session timeout handler
  const handleSessionTimeout = () => {
    console.log('Session timeout - logging out user');
    logout();
    alert('Your session has expired due to inactivity. Please log in again.');
  };

  // Set up activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      updateActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true);
      });
    };
  }, []);

  // Session timeout monitoring
  useEffect(() => {
    if (!isAuthenticated) {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        setSessionTimeout(null);
      }
      return;
    }

    const checkSessionTimeout = () => {
      const timeSinceActivity = Date.now() - lastActivity;
      if (timeSinceActivity > SESSION_TIMEOUT) {
        handleSessionTimeout();
      } else {
        // Set next check
        const remainingTime = SESSION_TIMEOUT - timeSinceActivity;
        const timeoutId = setTimeout(checkSessionTimeout, remainingTime);
        setSessionTimeout(timeoutId);
      }
    };

    const timeoutId = setTimeout(checkSessionTimeout, SESSION_TIMEOUT);
    setSessionTimeout(timeoutId);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAuthenticated, lastActivity]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
        setIsAuthenticated(true);
        updateActivity();
        
        // Fetch JWT tokens if not present
        if (!localStorage.getItem(JWT_TOKEN_KEY) || !localStorage.getItem(JWT_REFRESH_KEY)) {
          try {
            await fetchJwtTokens(firebaseUser);
          } catch (err) {
            console.error('Failed to fetch JWT tokens:', err);
          }
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(JWT_TOKEN_KEY);
        localStorage.removeItem(JWT_REFRESH_KEY);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiry = async () => {
      const token = localStorage.getItem(JWT_TOKEN_KEY);
      if (!token) return;
      try {
        const decoded = jwtDecode(token);
        if (!decoded || !decoded.exp) return;
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = (decoded.exp - currentTime) * 1000; // Convert to milliseconds
        
        // Refresh token 2 minutes before expiry
        if (timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD && timeUntilExpiry > 0) {
          console.log('JWT token expiring soon, refreshing...');
          try {
            await refreshJwtToken();
          } catch (err) {
            console.error('JWT auto-refresh failed:', err);
            // If refresh fails, logout user
            logout();
            alert('Your session has expired. Please log in again.');
          }
        }
      } catch (err) {
        console.error('JWT decode error:', err);
      }
    };
    
    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = async (email, password) => {
    const auth = getAuth();
    setLoading(true);
    try {
      const { user: firebaseUser } = await auth.signInWithEmailAndPassword(email, password);
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
      setIsAuthenticated(true);
      updateActivity();
      await fetchJwtTokens(firebaseUser);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    const auth = getAuth();
    setLoading(true);
    try {
      const { user: firebaseUser } = await auth.createUserWithEmailAndPassword(email, password);
      await firebaseUser.updateProfile({ displayName: username });
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: username,
        photoURL: firebaseUser.photoURL
      });
      setIsAuthenticated(true);
      updateActivity();
      await fetchJwtTokens(firebaseUser);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const auth = getAuth();
    await auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(JWT_TOKEN_KEY);
    localStorage.removeItem(JWT_REFRESH_KEY);
    
    // Clear session timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
    
    // Call logout endpoint to clear server-side cookies
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to clear server cookies:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshJwtToken,
    authenticatedApiFetch,
    updateActivity // Expose for manual activity updates
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      window.location.href = '/signin';
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default useAuth;