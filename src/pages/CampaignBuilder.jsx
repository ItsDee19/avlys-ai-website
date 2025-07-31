import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './CampaignBuilder.css';
import { addUserCampaign } from '../utils/firestoreUtils';

// Import SVG icons
import UsersIcon from '../assets/users-alt.svg';
import MegaphoneIcon from '../assets/megaphone.svg';
import GiftIcon from '../assets/badge-percent.svg';
import HeartIcon from '../assets/heart.svg';
import ZapIcon from '../assets/bolt.svg';
import SmileIcon from '../assets/face-awesome.svg';
import BookIcon from '../assets/terms-info.svg';
import SparklesIcon from '../assets/star-christmas.svg';
import LeafIcon from '../assets/bio.svg';
import HomeIcon from '../assets/house-chimney.svg';
import TargetIcon from '../assets/badge-percent.svg';
import SackDollarIcon from '../assets/piggy-bank.svg';
import BullseyeIcon from '../assets/badge-percent.svg';
import PiggyBankIcon from '../assets/piggy-bank.svg';
import ShieldIcon from '../assets/terms-info.svg';
import ClockIcon from '../assets/time-fast.svg';
import HelpIcon from '../assets/user-headset.svg';
import CameraIcon from '../assets/camera.svg';
import ClapperIcon from '../assets/clapper-open.svg';
import DiceIcon from '../assets/dice-alt.svg';
import GameIcon from '../assets/game.svg';

const CampaignBuilder = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState({
    businessIntro: '',
    location: '',
    businessType: '', // Optional: Helps with categorization
    campaignGoal: '',
    brandVibe: '',
    budget: '',
    targetCustomer: '',
    preferredLanguages: [],
    superpowers: [],
    additionalInfo: '',
    adType: ''
  });
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

    const steps = [
    {
      id: 'business-intro',
      title: 'Tell us about your business',
      question: 'What\'s your business name and where are you located?',
      subtitle: 'Just the basics - our AI will research everything else!',
      fields: ['businessIntro', 'location']
    },
    {
      id: 'campaign-goal',
      title: 'What\'s your goal?',
      question: 'What do you want this campaign to achieve?',
      subtitle: 'Choose your main objective',
      fields: ['campaignGoal', 'brandVibe']
    },
    {
      id: 'budget',
      title: 'What\'s your budget?',
      question: 'How much do you want to spend on this campaign?',
      subtitle: 'This helps us recommend the right platforms and strategy',
      fields: ['budget']
    },
    {
      id: 'target-customer',
      title: 'Who\'s your audience?',
      question: 'Who should see your ads?',
      subtitle: 'Help us target the right people',
      fields: ['targetCustomer', 'preferredLanguages']
    },
    {
      id: 'superpower',
      title: 'What makes you special?',
      question: 'What sets you apart from competitors?',
      subtitle: 'Choose your unique strengths',
      fields: ['superpowers', 'adType']
    }
  ];

  const handleInputChange = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      await generateAIResponse();
    } else {
      await generateCampaign();
    }
  };

  const generateAIResponse = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/campaigns/ai/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: currentStep,
          data: campaignData
        })
      });
      const result = await response.json();
      setAiResponse(result.message);
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
    setIsLoading(false);
  };

  const generateCampaign = async () => {
    setIsLoading(true);
    try {
      // Get user from localStorage (Firebase Auth)
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user) {
        alert('Please sign in to create a campaign');
        return;
      }

      console.log('User found:', user);

      // First, test if the server is running
      try {
        const healthResponse = await fetch('/health');
        if (!healthResponse.ok) {
          throw new Error('Server is not responding properly');
        }
        const healthData = await healthResponse.json();
        console.log('Server health check:', healthData);
      } catch (healthError) {
        console.error('Server health check failed:', healthError);
        throw new Error('Cannot connect to server. Please make sure the server is running.');
      }

      const getPlatformsFromAdType = (adType) => {
        switch (adType) {
          case 'static':
            return ['Instagram', 'Facebook'];
          case 'reels':
            return ['Instagram', 'YouTube', 'TikTok'];
          case 'carousel':
            return ['Instagram', 'Facebook', 'LinkedIn'];
          case 'surprise':
            return ['Instagram', 'Facebook', 'Twitter', 'YouTube'];
          default:
            return ['Instagram', 'Facebook'];
        }
      };

             // Helper to generate a refined, creative prompt from business details
       const generateImagePromptFromDetails = (data) => {
         let prompt = `Create a visually stunning, high-quality marketing image for a campaign.`;
         if (data.businessIntro) prompt += ` The business is: ${data.businessIntro}.`;
         if (data.location) prompt += ` Located in ${data.location}.`;
         if (data.businessType) prompt += ` Business type: ${data.businessType}.`;
         if (data.campaignGoal) prompt += ` The main goal is to ${data.campaignGoal.replace(/-/g, ' ')}.`;
         if (data.brandVibe) {
           const vibeMap = {
             'bold-energetic': 'bold and energetic',
             'friendly-relatable': 'friendly and relatable',
             'informative-trustworthy': 'informative and trustworthy',
             'sleek-premium': 'sleek and premium'
           };
           prompt += ` The campaign vibe should be ${vibeMap[data.brandVibe] || data.brandVibe}.`;
         }
         if (data.targetCustomer) prompt += ` Target audience: ${data.targetCustomer}.`;
         if (data.superpowers && data.superpowers.length > 0) prompt += ` Unique strengths: ${data.superpowers.join(', ')}.`;
         if (data.adType) prompt += ` Ad format: ${data.adType}.`;
         if (data.preferredLanguages && data.preferredLanguages.length > 0) prompt += ` Use languages: ${data.preferredLanguages.join(', ')}.`;
         prompt += ` The image should be eye-catching, modern, and relevant to the business context. Avoid text in the image.`;
         return prompt.replace(/\s+/g, ' ').trim();
       };

             // Prepare campaign data with required fields
       const campaignPayload = {
         title: campaignData.businessIntro, // Use businessIntro as title
         description: `Campaign for ${campaignData.businessIntro}`,
         businessIntro: campaignData.businessIntro,
         location: campaignData.location,
         businessType: campaignData.businessType,
         campaignGoal: campaignData.campaignGoal,
         brandVibe: campaignData.brandVibe,
         budget: Number(campaignData.budget) || 0,
         targetCustomer: campaignData.targetCustomer,
         preferredLanguages: campaignData.preferredLanguages,
         superpowers: campaignData.superpowers,
         adType: campaignData.adType,
         platforms: getPlatformsFromAdType(campaignData.adType),
         // Add default values for dashboard display
         status: 'draft',
         impressions: 0,
         clicks: 0,
         conversions: 0,
         spend: 0,
         aiGenerated: true,
         // Add a meaningful image/content prompt
         imagePrompt: generateImagePromptFromDetails(campaignData)
       };

      console.log('Campaign payload:', campaignPayload);

      // Get Firebase ID token for authentication
      let authHeaders = {
        'Content-Type': 'application/json'
      };

      // Try to get Firebase ID token first
      try {
        const { auth } = await import('../config/firebase');
        const currentUser = auth.currentUser;
        if (currentUser) {
          const idToken = await currentUser.getIdToken();
          authHeaders['x-firebase-user-id'] = idToken;
          console.log('Using Firebase authentication');
        } else {
          throw new Error('No Firebase user found');
        }
      } catch (firebaseError) {
        console.warn('Firebase auth failed, trying JWT fallback:', firebaseError.message);
        
        // Fallback to JWT if available
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken) {
          authHeaders['Authorization'] = `Bearer ${accessToken}`;
          if (refreshToken) {
            authHeaders['x-refresh-token'] = refreshToken;
          }
          console.log('Using JWT authentication');
        } else {
          throw new Error('No valid authentication token found. Please sign in again.');
        }
      }

      console.log('Making API request to /api/campaigns/generate...');

      const response = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(campaignPayload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        // Try to parse error response as JSON, fallback to text if it fails
        let errorMessage = 'Failed to create campaign';
        try {
          const errorData = await response.json();
          console.log('Error response (JSON):', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('JSON parse error:', parseError);
          // If JSON parsing fails, try to get text response
          try {
            const errorText = await response.text();
            console.log('Error response (text):', errorText);
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.log('Text parse error:', textError);
            // If both JSON and text parsing fail, use status text
            errorMessage = response.statusText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Campaign created successfully:', result);
      
      // Also save campaign to Firestore subcollection for dashboard real-time updates
      console.log('Saving campaign for user:', user);
      if (user && user.id) {
        console.log(`Firestore path: users/${user.id}/campaigns`);
        console.log('Campaign data:', result);
        try {
          await addUserCampaign(user.id, result);
          console.log('Campaign also saved to Firestore subcollection');
        } catch (firestoreError) {
          console.error('Error saving campaign to Firestore subcollection:', firestoreError);
        }
      } else {
        console.error('User ID not found, cannot save campaign to Firestore subcollection');
      }
      
      // Only show a generic success message, never AI content in alerts
      alert('🎉 Campaign created successfully! Redirecting to your dashboard...');
      
      // Add a small delay to ensure the alert is shown before redirect
      setTimeout(() => {
        // Use navigate instead of window.location.href for better React Router integration
        navigate('/dashboard?section=campaigns');
      }, 100);
      
    } catch (error) {
      console.error('Error generating campaign:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      alert('Failed to create campaign: ' + error.message);
    }
    setIsLoading(false);
  };

  const isStepValid = () => {
    const step = steps[currentStep];
    
    // Special validation for business-intro step - only business name and location required
    if (step.id === 'business-intro') {
      const requiredFields = ['businessIntro', 'location'];
      return requiredFields.every(field => {
        const value = campaignData[field];
        return value && value.trim() !== '';
      });
    }
    
    // For other steps, all fields are optional - user can proceed with any amount of information
    return true;
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
             case 'business-intro':
         return (
           <motion.div 
             className="step-content"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
           >
             <div className="required-fields-notice">
               <p>🚀 <strong>Quick start:</strong> Just tell us your business name and location. Our AI will research everything else automatically!</p>
             </div>
            
            <div className="input-group">
              <label className="input-label">Business Name *</label>
              <input
                type="text"
                placeholder="e.g., Herbal skincare brand in Bangalore"
                value={campaignData.businessIntro}
                onChange={(e) => handleInputChange('businessIntro', e.target.value)}
                className="wizard-input"
                required
              />
              <div className="input-hint">
                💡 Use your exact business name as it appears on Google Maps
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Where are you based? *</label>
              <input
                type="text"
                placeholder="City, State (e.g., Bangalore, Karnataka)"
                value={campaignData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="wizard-input"
                required
              />
              <div className="input-hint">
                💡 Include city and state for better local market research
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Business Type (Optional)</label>
              <select
                value={campaignData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="wizard-input"
              >
                <option value="">Select business type (optional)</option>
                <option value="restaurant">Restaurant & Food</option>
                <option value="retail">Retail & Shopping</option>
                <option value="healthcare">Healthcare & Wellness</option>
                <option value="beauty">Beauty & Personal Care</option>
                <option value="fitness">Fitness & Sports</option>
                <option value="education">Education & Training</option>
                <option value="technology">Technology & IT</option>
                <option value="automotive">Automotive</option>
                <option value="real-estate">Real Estate</option>
                <option value="entertainment">Entertainment & Events</option>
                <option value="services">Professional Services</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
              <div className="input-hint">
                💡 Helps us categorize your business better
              </div>
            </div>
          </motion.div>
        );
      
      
      
      case 'campaign-goal':
        return (
          <motion.div 
            className="step-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="goals-section">
              <h3>What do you want this campaign to do?</h3>
              <div className="goals-grid">
                {[
                  { value: 'get-customers', label: 'Get more customers', icon: UsersIcon },
                  { value: 'announce-product', label: 'Announce a product/service', icon: MegaphoneIcon },
                  { value: 'promote-offer', label: 'Promote an offer or discount', icon: GiftIcon },
                  { value: 'brand-love', label: 'Just build brand love', icon: HeartIcon }
                ].map((goal, index) => (
                  <motion.button
                    key={goal.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`goal-option ${campaignData.campaignGoal === goal.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('campaignGoal', goal.value)}
                  >
                    <span className="goal-icon">
                      <img src={goal.icon} alt="" style={{ width: '24px', height: '24px' }} />
                    </span>
                    <span className="goal-label">{goal.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className="vibe-section">
              <h3>What should your vibe be?</h3>
              <div className="vibe-grid">
                {[
                  { value: 'bold-energetic', label: 'Bold & Energetic', icon: ZapIcon },
                  { value: 'friendly-relatable', label: 'Friendly & Relatable', icon: SmileIcon },
                  { value: 'informative-trustworthy', label: 'Informative & Trustworthy', icon: BookIcon },
                  { value: 'sleek-premium', label: 'Sleek & Premium', icon: SparklesIcon }
                ].map((vibe, index) => (
                  <motion.button
                    key={vibe.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`vibe-option ${campaignData.brandVibe === vibe.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('brandVibe', vibe.value)}
                  >
                    <span className="vibe-icon">
                      <img src={vibe.icon} alt="" style={{ width: '24px', height: '24px' }} />
                    </span>
                    <span className="vibe-label">{vibe.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      
      case 'budget':
        return (
          <motion.div 
            className="step-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="budget-options">
              <div className="budget-input-section">
                <label className="input-label">Enter your budget (in ₹)</label>
                <div className="budget-input-group">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    placeholder="5000"
                    value={campaignData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="wizard-input budget-input"
                  />
                </div>
                <div className="input-hint">
                  💡 Your budget helps us choose the right platforms and optimize ad spend for maximum ROI
                </div>
              </div>
              
              <div className="budget-alternative">
                <button
                  className={`budget-option ${campaignData.budget === 'organic' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('budget', 'organic')}
                >
                  <span className="budget-icon">
                    <img src={PiggyBankIcon} alt="" style={{ width: '24px', height: '24px' }} />
                  </span>
                  <div className="budget-info">
                    <span className="budget-label">I prefer organic marketing</span>
                    <span className="budget-desc">No paid advertising budget</span>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        );
      
      case 'target-customer':
        return (
          <motion.div 
            className="step-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
                         <div className="input-group">
               <label className="input-label">Describe your ideal customer</label>
               <textarea
                 placeholder="e.g., Young professionals aged 25-35, mostly women, who care about natural skincare, live in urban areas, shop online frequently, value sustainability..."
                 value={campaignData.targetCustomer}
                 onChange={(e) => handleInputChange('targetCustomer', e.target.value)}
                 className="wizard-textarea"
                 rows={4}
               />
               <div className="input-hint">
                 💡 Tell us about age, gender, lifestyle, interests - the more specific, the better!
               </div>
             </div>
            
            <div className="languages-section">
              <label className="input-label">Preferred language(s) for the ad</label>
              <div className="languages-grid">
                {[
                  { value: 'hindi', label: 'Hindi', icon: '🇮🇳' },
                  { value: 'english', label: 'English', icon: '🇺🇸' },
                  { value: 'marathi', label: 'Marathi', icon: '🇮🇳' },
                  { value: 'gujarati', label: 'Gujarati', icon: '🇮🇳' },
                  { value: 'tamil', label: 'Tamil', icon: '🇮🇳' },
                  { value: 'telugu', label: 'Telugu', icon: '🇮🇳' },
                  { value: 'bengali', label: 'Bengali', icon: '🇮🇳' },
                  { value: 'punjabi', label: 'Punjabi', icon: '🇮🇳' }
                ].map((lang, index) => (
                  <motion.button
                    key={lang.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`language-option ${campaignData.preferredLanguages.includes(lang.value) ? 'selected' : ''}`}
                    onClick={() => {
                      const languages = campaignData.preferredLanguages.includes(lang.value)
                        ? campaignData.preferredLanguages.filter(l => l !== lang.value)
                        : [...campaignData.preferredLanguages, lang.value];
                      handleInputChange('preferredLanguages', languages);
                    }}
                  >
                    <span className="language-icon">{lang.icon}</span>
                    <span className="language-label">{lang.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      
      case 'superpower':
        return (
          <motion.div 
            className="step-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="superpowers-section">
              <h3>What's your superpower? (Pick up to 3)</h3>
              <div className="superpowers-grid">
                {[
                  { value: 'affordable', label: 'Super affordable', icon: SackDollarIcon },
                  { value: 'local-needs', label: 'Made for local needs', icon: HomeIcon },
                  { value: 'personalized', label: 'Personalised experience', icon: BullseyeIcon },
                  { value: 'eco-friendly', label: 'Eco-friendly or sustainable', icon: PiggyBankIcon },
                  { value: 'quick-service', label: 'Super quick service', icon: ClockIcon },
                  { value: 'great-support', label: 'Support that actually helps', icon: HelpIcon }
                ].map((power, index) => (
                  <motion.button
                    key={power.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`superpower-option ${campaignData.superpowers.includes(power.value) ? 'selected' : ''}`}
                    onClick={() => {
                      const superpowers = campaignData.superpowers.includes(power.value)
                        ? campaignData.superpowers.filter(s => s !== power.value)
                        : campaignData.superpowers.length < 3
                        ? [...campaignData.superpowers, power.value]
                        : campaignData.superpowers;
                      handleInputChange('superpowers', superpowers);
                    }}
                    disabled={!campaignData.superpowers.includes(power.value) && campaignData.superpowers.length >= 3}
                  >
                    <span className="superpower-icon">
                      <img src={power.icon} alt="" style={{ width: '24px', height: '24px' }} />
                    </span>
                    <span className="superpower-label">{power.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            
            
            
            <div className="ad-type-section">
              <h3>What kind of ad would you like to see?</h3>
              <div className="ad-type-grid">
                {[
                  { value: 'static', label: 'Static post', icon: CameraIcon },
                  { value: 'reels', label: 'Reels / short videos', icon: ClapperIcon },
                  { value: 'carousel', label: 'Carousels', icon: GameIcon },
                  { value: 'surprise', label: 'Surprise me!', icon: DiceIcon }
                ].map((type, index) => (
                  <motion.button
                    key={type.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`ad-type-option ${campaignData.adType === type.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('adType', type.value)}
                  >
                    <span className="ad-type-icon">
                      <img src={type.icon} alt="" style={{ width: '24px', height: '24px' }} />
                    </span>
                    <span className="ad-type-label">{type.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  // Final success screen
  const renderFinalScreen = () => (
    <motion.div 
      className="final-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="success-content">
        <motion.div 
          className="success-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          🎉
        </motion.div>
        <h1>You're all set!</h1>
        <p>Your AI-powered marketing sidekicks are ready to roll.</p>
        <p>Let's launch your first campaign now.</p>
        
        <motion.button 
          onClick={generateCampaign}
          disabled={isLoading}
          className="final-cta-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <span className="loading-text">
              <span className="spinner"></span>
              <div className="loading-details">
                <div>Creating your campaign...</div>
                <div className="loading-subtitle">🤖 Generating AI content with DeepSeek</div>
              </div>
            </span>
          ) : (
            'LET\'S GO! 🚀'
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="campaign-builder-page">
      <div className="wizard-container">
        {/* Progress Header */}
        <div className="wizard-header">
          <div className="progress-section">
            <div className="progress-bar">
              <motion.div 
                className="progress-fill" 
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="progress-text">
              <span className="step-counter">{currentStep + 1} of {steps.length}</span>
              <span className="progress-percentage">{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="wizard-content">
          <AnimatePresence mode="wait">
            {currentStep === steps.length ? (
              renderFinalScreen()
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="step-container"
              >
                <div className="step-header">
                  <motion.h1 
                    className="step-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {steps[currentStep].title}
                  </motion.h1>
                  <motion.p 
                    className="step-question"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    {steps[currentStep].question}
                  </motion.p>
                  <motion.p 
                    className="step-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {steps[currentStep].subtitle}
                  </motion.p>
                </div>
                
                {renderStepContent()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {currentStep < steps.length && (
          <motion.div 
            className="wizard-navigation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {currentStep > 0 && (
              <motion.button 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="nav-btn secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Back
              </motion.button>
            )}
            
            <motion.button 
              onClick={handleNext}
              disabled={!isStepValid() || isLoading}
              className="nav-btn primary"
              whileHover={{ scale: isStepValid() ? 1.02 : 1 }}
              whileTap={{ scale: isStepValid() ? 0.98 : 1 }}
            >
              {isLoading ? (
                <span className="loading-text">
                  <span className="spinner"></span>
                  Processing...
                </span>
              ) : (
                'Continue →'
              )}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CampaignBuilder;