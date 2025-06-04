import { useState } from 'react';
import { auth } from '../config/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import '../styles/signin.css';

function SignIn({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleSignIn = async () => {
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
      
      onClose();
      document.getElementById('workflow').scrollIntoView({ behavior: 'smooth' });
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
    
    try {
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
      localStorage.setItem('user', JSON.stringify({
        id: user.uid,
        email: user.email
      }));
      onClose();
      document.getElementById('workflow').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      setError(error.message);
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
          <button type="submit" className="submit-button">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
          <div className="divider">OR</div>
          <button 
            type="button" 
            className="google-button"
            onClick={handleGoogleSignIn}
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google logo" 
            />
            Sign in with Google
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