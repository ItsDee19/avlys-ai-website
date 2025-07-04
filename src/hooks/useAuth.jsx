import { useState, useEffect, useContext, createContext } from 'react';
import AuthUtils from '../utils/authUtils';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { jwtDecode } from 'jwt-decode';

// Create Auth Context
const AuthContext = createContext();

const JWT_TOKEN_KEY = 'accessToken';
const JWT_REFRESH_KEY = 'refreshToken';
const API_BASE_URL = 'http://localhost:5000/api';

async function fetchJwtTokens(firebaseUser) {
  const idToken = await firebaseUser.getIdToken();
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-firebase-user-id': idToken },
    body: JSON.stringify({ email: firebaseUser.email, firebaseUid: firebaseUser.uid })
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
    body: JSON.stringify({ refreshToken })
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
  return fetch(url, { ...options, headers });
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        const timeUntilExpiry = decoded.exp - currentTime;
        // Refresh token 2 minutes before expiry
        if (timeUntilExpiry <= 120 && timeUntilExpiry > 0) {
          console.log('JWT token expiring soon, refreshing...');
          try {
            await refreshJwtToken();
          } catch (err) {
            console.error('JWT auto-refresh failed:', err);
          }
        }
      } catch (err) {
        console.error('JWT decode error:', err);
      }
    };
    const interval = setInterval(checkTokenExpiry, 60000);
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
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshJwtToken,
    authenticatedApiFetch
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