import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/signin.css';

function SignIn({ isOpen, onClose, onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard?tab=campaigns';
  const { checkAuthStatus } = useAuth();
  
  // Add spinner CSS dynamically
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
      }
      .error-message {
        color: #e53e3e;
        background-color: #fed7d7;
        border-radius: 4px;
        padding: 8px 12px;
        margin-bottom: 16px;
        font-size: 14px;
      }
      .submit-button:disabled,
      .google-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('spinner-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Add scopes for additional Google permissions if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }));
      
      // Update auth state and wait for it to propagate
      await checkAuthStatus();
      
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        setIsLoading(false);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(from, { replace: true });
        }
      }, 500);
    } catch (error) {
      console.error('Google Sign In Error:', error);
      // More specific error messages
      if (error.code === 'auth/popup-blocked') {
        setError('Please enable popups for this website to use Google sign-in');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google sign-in. Please contact support.');
      } else {
        setError(error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Validate form data
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setIsLoading(false);
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
      
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
      }

      const user = userCredential.user;
      
      // Store user info
      localStorage.setItem('user', JSON.stringify({
        id: user.uid,
        email: user.email
      }));
      
      // Try to get JWT tokens from backend for API authentication
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-firebase-user-id': idToken
          },
          body: JSON.stringify({
            email: user.email,
            firebaseUid: user.uid
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.accessToken && data.refreshToken) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            console.log('JWT tokens obtained successfully');
          }
        } else {
          console.warn('Failed to get JWT tokens, will use Firebase auth only');
        }
      } catch (tokenError) {
        console.warn('Error getting JWT tokens:', tokenError.message);
      }
      
      // Update auth state and wait for it to propagate
      await checkAuthStatus();
      
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        setIsLoading(false);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(from, { replace: true });
        }
      }, 500);
    } catch (error) {
      setIsLoading(false);
      // Provide more user-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Email is already in use. Please sign in or use a different email.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(error.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="sign-in-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                {isSignUp ? 'Signing Up...' : 'Signing In...'}
              </>
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </button>
          <div className="divider">OR</div>
          <button 
            type="button" 
            className="google-button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing in with Google...
              </>
            ) : (
              <>
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google logo" 
                />
                Sign in with Google
              </>
            )}
          </button>
        </form>
        <p className="toggle-form">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            className="toggle-button" 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFormData({ email: '', password: '' });
              setError('');
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignIn;