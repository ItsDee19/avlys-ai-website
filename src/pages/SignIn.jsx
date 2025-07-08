import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/signin.css';
import { useToast } from '../components/ToastProvider';

function SignIn({ isOpen, onClose, onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const { /* checkAuthStatus */ } = useAuth();
  const { showToast } = useToast();
  
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
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem('user', JSON.stringify({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }));
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
    // Advanced validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      showToast('Email and password are required', 'warning');
      setIsLoading(false);
      return;
    }
    if (!emailPattern.test(formData.email)) {
      setError('Invalid email format.');
      showToast('Invalid email format.', 'warning');
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      showToast('Password must be at least 6 characters', 'warning');
      setIsLoading(false);
      return;
    }
    // Password strength for registration
    if (isSignUp) {
      const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/;
      if (!strongPassword.test(formData.password)) {
        setError('Password must be at least 8 characters and include a number.');
        showToast('Password must be at least 8 characters and include a number.', 'warning');
        setIsLoading(false);
        return;
      }
    }
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        showToast('Registration successful! Welcome!', 'success');
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        showToast('Login successful!', 'success');
      }
      const user = userCredential.user;
      localStorage.setItem('user', JSON.stringify({
        id: user.uid,
        email: user.email
      }));
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
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
        showToast('Invalid email or password', 'error');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Email is already in use. Please sign in or use a different email.');
        showToast('Email is already in use. Please sign in or use a different email.', 'error');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
        showToast('Password is too weak. Please use a stronger password.', 'warning');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format.');
        showToast('Invalid email format.', 'warning');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
        showToast('Network error. Please check your internet connection.', 'error');
      } else {
        setError(error.message);
        showToast(error.message, 'error');
      }
    }
  };

  if (!isOpen) return null;

  // If onClose is not provided, render as a full-page form
  if (!onClose) {
    return (
      <div className="signin-fullpage">
        <div className="modal-content">
          <button className="close-button" onClick={() => { navigate('/'); }}>&times;</button>
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

  return (
    <div
      className="modal-overlay"
      onClick={() => { if (onClose) onClose(); }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={() => { if (onClose) { onClose(); } else { navigate('/'); } }}>&times;</button>
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