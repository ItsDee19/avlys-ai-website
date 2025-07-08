import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthUtils from '../utils/authUtils';
import { getUserProfile } from '../utils/firestoreUtils'; // Assuming this function exists or will be created

const Toast = ({ message, type }) => (
  message ? (
    <div style={{ position: 'fixed', top: 24, right: 32, zIndex: 9999, minWidth: 280, background: type === 'success' ? 'linear-gradient(90deg, #10b981 0%, #2563eb 100%)' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e42' : '#2563eb', color: '#fff', padding: '1rem 2rem', borderRadius: 12, fontWeight: 700, fontSize: '1.08rem', boxShadow: '0 4px 24px rgba(37,99,235,0.13)', transition: 'opacity 0.2s, transform 0.2s', opacity: message ? 1 : 0, display: 'flex', alignItems: 'center', gap: 14, transform: message ? 'translateY(0)' : 'translateY(-20px)' }}>
      <span style={{ fontSize: 22, display: 'flex', alignItems: 'center' }}>
        {type === 'success' && '✅'}
        {type === 'error' && '❌'}
        {type === 'warning' && '⚠️'}
        {type === 'info' && 'ℹ️'}
      </span>
      <span>{message}</span>
    </div>
  ) : null
);

const AiCampaignCreator = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const user = AuthUtils.getUserFromToken();
      if (!user) {
        setError('You must be logged in to create a campaign.');
        setLoading(false);
        return;
      }
      try {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      } catch (err) {
        setError('Failed to fetch your profile. Please complete your profile first.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 2500);
  };

  const handleCreateCampaign = async () => {
    setLoading(true);
    setError(null);
    try {
      // This would call your backend to create a campaign and get a stripe session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthUtils.getToken()}`
        },
        body: JSON.stringify({
          // You might need to create a preliminary campaign doc first
          // and pass the campaignId and priceId here.
          priceId: 'your-price-id', // Replace with your Stripe Price ID
          campaignData: {
            businessName: profile.business.name,
            industry: profile.business.industry,
            //... other details
          }
        })
      });

      if (!response.ok) {
        showToast('Failed to create campaign. Please try again.', 'error');
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      showToast('Campaign created successfully! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = url; // Redirect to Stripe
      }, 1200);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div>Loading your profile...</div>;
  }

  if (error) {
    return <div style={{color: 'red'}}>Error: {error}</div>;
  }

  return (
    <div className="ai-campaign-creator">
      <Toast message={toast.message} type={toast.type} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Create Your AI-Powered Campaign</h1>
        <p>Review your business details below. The AI will use this information to generate a unique campaign strategy, ad copy, and images for you.</p>
        
        <div className="profile-summary">
          <h2>Business Details</h2>
          <p><strong>Name:</strong> {profile?.business?.name || 'Not set'}</p>
          <p><strong>Industry:</strong> {profile?.business?.industry || 'Not set'}</p>
          <p><strong>Description:</strong> {profile?.business?.description || 'Not set'}</p>
        </div>

        <button onClick={handleCreateCampaign} disabled={loading}>
          {loading ? 'Processing...' : 'Generate Campaign with AI'}
        </button>
      </motion.div>
    </div>
  );
};

export default AiCampaignCreator; 