import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/signin.css';

function SignIn({ isOpen, onClose, onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthStatus, user } = useAuth();
  const canClose = (!!user && !!user.email) || !isLoading;

  // Reset form when toggling between sign in/up
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', password: '', confirmPassword: '' });
      setError('');
      setSuccessMessage('');
      setFormErrors({});
    }
  }, [isOpen, isSignUp]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignUp && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      localStorage.setItem('user', JSON.stringify({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }));
      
      setSuccessMessage('Successfully signed in! Redirecting...');
      await checkAuthStatus();
      
      if (onSuccess) {
        onSuccess(navigate);
      } else {
        onClose?.();
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      const errorMessages = {
        'auth/popup-blocked': 'Please enable popups for this website to use Google sign-in',
        'auth/cancelled-popup-request': 'Sign-in was cancelled',
        'auth/unauthorized-domain': 'This domain is not authorized for Google sign-in',
        'auth/account-exists-with-different-credential': 'An account already exists with this email',
        'auth/popup-closed-by-user': 'Sign-in popup was closed'
      };
      
      setError(errorMessages[error.code] || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      await sendPasswordResetEmail(auth, formData.email);
      setSuccessMessage('Password reset email sent! Please check your inbox.');
      setShowResetPassword(false);
    } catch (error) {
      console.error('Password Reset Error:', error);
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
      
      setSuccessMessage(isSignUp ? 'Account created successfully!' : 'Signed in successfully!');
      await checkAuthStatus();
      
      if (onSuccess) {
        onSuccess(navigate);
      } else {
        onClose?.();
      }
    } catch (error) {
      console.error('Auth Error:', error);
      const errorMessages = {
        'auth/email-already-in-use': 'This email is already in use',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
        'auth/weak-password': 'Password should be at least 6 characters'
      };
      
      setError(errorMessages[error.code] || error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (canClose) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  const renderResetPasswordForm = () => (
    <div className="reset-password-form">
      <h2>Reset Password</h2>
      <p>Enter your email to receive a password reset link</p>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <form onSubmit={handlePasswordReset}>
        <div className="form-group">
          <label htmlFor="reset-email">Email</label>
          <input
            type="email"
            id="reset-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className={formErrors.email ? 'error' : ''}
            required
          />
          {formErrors.email && <span className="form-error">{formErrors.email}</span>}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="secondary-button"
            onClick={() => setShowResetPassword(false)}
            disabled={isLoading}
          >
            Back to Sign In
          </button>
          <button 
            type="submit" 
            className="primary-button"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderAuthForm = () => (
    <>
      <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
      <p className="auth-subtitle">
        {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
      </p>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className={formErrors.email ? 'error' : ''}
            autoComplete="email"
            required
          />
          {formErrors.email && <span className="form-error">{formErrors.email}</span>}
        </div>
        
        <div className="form-group">
          <div className="password-header">
            <label htmlFor="password">Password</label>
            {!isSignUp && (
              <button 
                type="button"
                className="text-button"
                onClick={() => setShowResetPassword(true)}
                disabled={isLoading}
              >
                Forgot password?
              </button>
            )}
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            className={formErrors.password ? 'error' : ''}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
          />
          {formErrors.password && <span className="form-error">{formErrors.password}</span>}
        </div>
        
        {isSignUp && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className={formErrors.confirmPassword ? 'error' : ''}
              autoComplete="new-password"
              required
            />
            {formErrors.confirmPassword && (
              <span className="form-error">{formErrors.confirmPassword}</span>
            )}
          </div>
        )}
        
        <button 
          type="submit" 
          className="submit-button primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <span>
              <span className="spinner" />
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </span>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button 
          type="button" 
          className="google-button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="google-logo"
          />
          {isSignUp ? 'Sign up with Google' : 'Continue with Google'}
        </button>
      </form>
      
      <p className="auth-footer">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button 
          type="button"
          className="text-button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
          disabled={isLoading}
        >
          {isSignUp ? 'Sign in instead' : 'Create an account'}
        </button>
      </p>
    </>
  );

  return (
    <div 
      className={`modal-overlay ${isLoading ? 'loading' : ''}`} 
      onClick={handleClose}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {canClose && (
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close modal"
            disabled={!canClose}
          >
            &times;
          </button>
        )}
        
        {showResetPassword ? renderResetPasswordForm() : renderAuthForm()}
        
        {isLoading && (
          <div className="modal-loading-overlay">
            <div className="loading-spinner" />
          </div>
        )}
      </div>
    </div>
  );
}

export default SignIn;
