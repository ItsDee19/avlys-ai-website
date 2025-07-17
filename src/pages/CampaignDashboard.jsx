import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bar, Line, Doughnut, Pie, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { LineChart, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie as RechartsPie, Cell, BarChart, Bar as RechartsBar, Legend as RechartsLegend } from 'recharts';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);
import './CampaignDashboard.css';
import { subscribeToCampaigns, subscribeToUserCampaigns } from '../utils/firestoreUtils';
import AuthUtils from '../utils/authUtils';
import { collection, query, where, orderBy, onSnapshot, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import Header from '../components/Header.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import SignIn from './SignIn';
import OverviewGrid from '../components/ui/OverviewGrid';
import { TrendingUp, Eye, MousePointerClick, Target, DollarSign, Activity, Edit2, Copy, Trash2, UserCircle, Settings as SettingsIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import DeploymentCenter from '../components/deployment/DeploymentCenter';
import { useToast } from '../components/ToastProvider';
import ImageGallery from '../components/ImageGallery';
import pauseIcon from '../assets/pause.svg';
import playIcon from '../assets/play.svg';
import trashIcon from '../assets/trash.svg';
import cameraMovieIcon from '../assets/camera-movie.svg';
import VideoPlayer from '../components/VideoPlayer';

// Memoized metric card component for better performance
const MetricCard = memo(({
  icon,
  title,
  value,
  change,
  secondary,
  ariaLabelledBy,
  background,
  iconBg = 'rgba(255,255,255,0.18)',
  progress = 1,
  progressColor = '#fff',
  progressBg = 'rgba(255,255,255,0.25)'
}) => (
  <div
    role="region"
    aria-labelledby={ariaLabelledBy}
    style={{
      background: background || '#fff',
      borderRadius: '18px',
      boxShadow: '0 4px 24px rgba(37,99,235,0.10)',
      padding: '1.7rem 1.5rem 1.2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      minWidth: 0,
      minHeight: '220px',
      flex: 1,
      position: 'relative',
      color: background ? '#fff' : '#222',
      overflow: 'hidden',
      margin: '0.5rem 0',
      transition: 'box-shadow 0.2s',
      border: 'none',
    }}
  >
    {/* Header row: title left, icon right */}
    <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{ fontWeight: 700, fontSize: '1.08rem', opacity: 0.97 }}>{title}</div>
      <div style={{
        background: iconBg,
        borderRadius: 12,
        width: 44,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        marginLeft: 12,
      }}>{icon}</div>
    </div>
    {/* Value */}
    <div style={{ fontWeight: 800, fontSize: '2.6rem', marginBottom: 8, marginTop: 2, letterSpacing: '-1.5px', lineHeight: 1.1 }}>{value}</div>
    {/* Trend */}
    {change && (
      <div style={{ color: change.type === 'positive' ? '#bbf7d0' : '#fecaca', fontWeight: 600, fontSize: '1.08rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }} aria-label={change.label}>
        <span style={{ fontSize: 18 }}>{change.type === 'positive' ? '↑' : '↓'}</span> {change.text}
      </div>
    )}
    {/* Secondary stats */}
    {secondary && (
      <div style={{ color: background ? 'rgba(255,255,255,0.93)' : '#94a3b8', fontSize: '1.08rem', fontWeight: 500, marginBottom: 8 }}>{secondary}</div>
    )}
    {/* Progress bar */}
    <div style={{ width: '100%', height: 9, background: progressBg, borderRadius: 8, marginTop: 'auto', marginBottom: 2, overflow: 'hidden' }}>
      <div style={{ width: `${Math.round(progress * 100)}%`, height: '100%', background: progressColor, borderRadius: 8, transition: 'width 0.4s' }}></div>
    </div>
  </div>
));

MetricCard.displayName = 'MetricCard';

// Error boundary component for better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Campaign Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="campaign-dashboard">
          <div className="error-state">
            <h2>Something went wrong</h2>
            <p>We're sorry, but there was an error loading the dashboard.</p>
            <button onClick={() => window.location.reload()}>Reload Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// 1. Add animated number component for metrics
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = Number(value);
    if (start === end) return;
    let increment = end / 30;
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
};

const CampaignDashboard = ({ showSignInModal, handleShowSignIn }) => {
  // All hooks must be at the top level, before any conditionals or returns
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [campaignsView, setCampaignsView] = useState('table');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileButtonRef = React.useRef(null);
  const [signInPrompted, setSignInPrompted] = useState(false);
  const { showToast } = useToast();
  const [videoGenerating, setVideoGenerating] = useState({});

  // All useEffects also at top level
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  // Settings state (with localStorage persistence)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('dashboardSettings');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      campaignAlerts: false,
      defaultView: 'Grid View',
      timeZone: 'UTC-5 (Eastern Time)'
    };
  });
  useEffect(() => {
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
  }, [settings]);

  // Handle URL parameters to set active tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'campaigns', 'analytics', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const handleNewCampaignClick = () => {
    if (user) {
      navigate('/campaign-builder');
    } else {
      handleShowSignIn();
    }
  };

  // Prevent closing sign-in modal unless user is authenticated
  const canCloseSignIn = !!user && !!user.email;

  // Platform distribution for Pie chart
  const platformCounts = useMemo(() => {
    const counts = {};
    campaigns.forEach(c => {
      (c.platforms || []).forEach(p => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });
    return counts;
  }, [campaigns]);

  // Radar data for campaign performance
  const radarLabels = useMemo(() => campaigns.map(c => c.title || 'Untitled'), [campaigns]);
  const radarData = {
    labels: radarLabels,
    datasets: [
      {
        label: 'Impressions',
        data: campaigns.map(c => c.impressions || 0),
        backgroundColor: 'rgba(37,99,235,0.08)',
        borderColor: '#2563eb',
        pointBackgroundColor: '#2563eb',
      },
      {
        label: 'Clicks',
        data: campaigns.map(c => c.clicks || 0),
        backgroundColor: 'rgba(16,185,129,0.08)',
        borderColor: '#10b981',
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'Conversions',
        data: campaigns.map(c => c.conversions || 0),
        backgroundColor: 'rgba(245,158,11,0.08)',
        borderColor: '#f59e0b',
        pointBackgroundColor: '#f59e0b',
      }
    ]
  };

  // Fetch campaigns from Firestore
  useEffect(() => {
    setLoading(true);
    setError(null);
    let unsubscribe;
    if (user && user.id) {
      console.log('Subscribing to campaigns for user:', user.id);
      unsubscribe = subscribeToUserCampaigns(user.id, (data) => {
        console.log('Campaigns loaded:', data.length, 'campaigns');
        data.forEach(campaign => {
          console.log('Campaign:', {
            id: campaign.id,
            title: campaign.title,
            userId: campaign.userId
          });
        });
        setCampaigns(data);
        setLoading(false);
      });
    } else {
      setCampaigns([]);
      setLoading(false);
    }
    return () => unsubscribe && unsubscribe();
  }, [user]);

  useEffect(() => {
    if (error) {
      console.error('Dashboard error state:', error);
    }
  }, [error]);

  useEffect(() => {
    if (!loading) {
      console.log('Fetched campaigns:', campaigns);
    }
  }, [loading, campaigns]);

  // Memoized calculations for performance
  const totalMetrics = useMemo(() => {
    if (!campaigns.length) return { budget: 0, spent: 0, impressions: 0, clicks: 0, conversions: 0 };
    
    return campaigns.reduce((acc, campaign) => ({
      budget: acc.budget + (campaign.budget || 0),
      spent: acc.spent + (campaign.spend || 0),
      impressions: acc.impressions + (campaign.impressions || 0),
      clicks: acc.clicks + (campaign.clicks || 0),
      conversions: acc.conversions + (campaign.conversions || 0)
    }), { budget: 0, spent: 0, impressions: 0, clicks: 0, conversions: 0 });
  }, [campaigns]);

  const averageCTR = useMemo(() => {
    if (!campaigns.length || totalMetrics.impressions === 0) return 0;
    return ((totalMetrics.clicks / totalMetrics.impressions) * 100).toFixed(2);
  }, [campaigns, totalMetrics]);

  const averageCPC = useMemo(() => {
    if (!campaigns.length || totalMetrics.clicks === 0) return 0;
    return (totalMetrics.spent / totalMetrics.clicks).toFixed(2);
  }, [campaigns, totalMetrics]);

  const conversionRate = useMemo(() => {
    if (!campaigns.length || totalMetrics.clicks === 0) return 0;
    return ((totalMetrics.conversions / totalMetrics.clicks) * 100).toFixed(2);
  }, [campaigns, totalMetrics]);

  // Enhanced helper functions with error handling
  const getStatusBadgeClass = useCallback((status) => {
    const statusMap = {
      'active': 'status-badge active',
      'paused': 'status-badge paused',
      'completed': 'status-badge completed',
      'draft': 'status-badge draft'
    };
    return statusMap[status] || 'status-badge';
  }, []);

  const formatCurrency = useCallback((amount) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `$${amount || 0}`;
    }
  }, []);

  const formatNumber = useCallback((number) => {
    try {
      return new Intl.NumberFormat('en-US').format(number || 0);
    } catch (error) {
      console.error('Error formatting number:', error);
      return String(number || 0);
    }
  }, []);

  const formatPercentage = useCallback((value) => {
    try {
      return `${Number(value || 0).toFixed(2)}%`;
    } catch (error) {
      console.error('Error formatting percentage:', error);
      return '0.00%';
    }
  }, []);

  // Retry function for failed operations
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    window.location.reload();
  }, []);

  // Show sign-in modal if not authenticated
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const showSignIn = searchParams.get('showSignIn');
    if ((!user || !user.email) && showSignIn === '1' && !signInPrompted) {
      const timer = setTimeout(() => {
        handleShowSignIn();
        setSignInPrompted(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, location.search, signInPrompted, handleShowSignIn]);

  // Show loading spinner during sign-out
  const [signOutLoading, setSignOutLoading] = useState(false);
  const handleLogout = async () => {
    setSignOutLoading(true);
    // Update user object with loading state
    if (user) {
      user.isLoggingOut = true;
    }
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      if (user) {
        user.isLoggingOut = false;
      }
      setSignOutLoading(false);
      handleShowSignIn();
    }
  };

  // Add spinner CSS dynamically
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'dashboard-spinner-style';
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .spinner {
        display: inline-block;
        width: 24px;
        height: 24px;
        border: 3px solid rgba(37, 99, 235, 0.2);
        border-radius: 50%;
        border-top-color: #2563eb;
        animation: spin 1s ease-in-out infinite;
      }
      
      .signout-spinner-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      
      .signout-spinner-overlay .spinner {
        width: 40px;
        height: 40px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('dashboard-spinner-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Replace the timestamp calculation in the recent activity section:
  const getTimestamp = (ts) => {
    if (!ts) return null;
    if (typeof ts === 'number') return new Date(ts);
    if (typeof ts === 'string') return new Date(ts);
    if (ts.toDate) return ts.toDate(); // Firestore Timestamp
    if (ts.seconds) return new Date(ts.seconds * 1000);
    return ts instanceof Date ? ts : null;
  };

  // Add placeholder handlers at the top of the CampaignDashboard component:
  const handleEditCampaign = (campaign) => {
    // TODO: Implement edit logic
    alert(`Edit campaign: ${campaign.title}`);
  };
  const handleDuplicateCampaign = (campaign) => {
    // TODO: Implement duplicate logic
    alert(`Duplicate campaign: ${campaign.title}`);
  };
  const handleDeleteCampaign = async (campaign) => {
    showToast(`Are you sure you want to delete campaign: ${campaign.title}?`, 'warning');
    if (window.confirm(`Are you sure you want to delete campaign: ${campaign.title}?`)) {
      try {
        // TODO: Replace with actual delete logic (API call)
        // await deleteCampaign(campaign.id);
        showToast('Campaign deleted successfully!', 'success');
      } catch (err) {
        showToast('Failed to delete campaign. Please try again.', 'error');
      }
    }
  };

  const handleResume = (id) => {
    // TODO: Implement resume logic (API call or state update)
    console.log('Resume campaign', id);
  };

  const handlePause = (id) => {
    // TODO: Implement pause logic (API call or state update)
    console.log('Pause campaign', id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await deleteDoc(doc(db, 'campaigns', id));
      // Optionally, show a toast or notification
      if (typeof showToast === 'function') showToast('Campaign deleted!', 'success');
      // Optionally, update local state if you want instant UI feedback:
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      if (typeof showToast === 'function') showToast('Failed to delete campaign.', 'error');
    }
  };

  const handleGenerateVideo = async (campaign) => {
    if (!campaign.id) {
      showToast('Campaign ID not found', 'error');
      return;
    }

    console.log('Generating video for campaign:', {
      id: campaign.id,
      title: campaign.title,
      userId: campaign.userId
    });

    setVideoGenerating(prev => ({ ...prev, [campaign.id]: true }));
    
    try {
      // Get Firebase ID token for authentication
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      console.log('Current user:', {
        uid: currentUser.uid,
        email: currentUser.email
      });
      
      const idToken = await currentUser.getIdToken();
      const url = `/api/campaigns/${campaign.id}/generate-video`;
      console.log('Making request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-firebase-user-id': idToken
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video');
      }

      const result = await response.json();
      console.log('API result:', result); // Add this for debugging

      setCampaigns(prev => {
        const updated = prev.map(c => 
          c.id === campaign.id 
            ? { ...c, generatedVideo: result.video }
            : c
        );
        console.log('Updated campaigns:', updated); // Add this for debugging
        return updated;
      });

      showToast('Video generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating video:', error);
      showToast(error.message || 'Failed to generate video', 'error');
    } finally {
      setVideoGenerating(prev => ({ ...prev, [campaign.id]: false }));
    }
  };

  // Enhanced loading state with accessibility
  if (loading) {
    return (
      <>
        <Header onLogout={handleLogout} user={user} onUserClick={handleShowSignIn} />
        <div
          className="campaign-dashboard"
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '3.5rem 0 2.5rem 0',
            fontFamily: 'Inter, Arial, sans-serif',
            width: '100vw',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="dashboard-container"
            style={{
              background: '#fff',
              borderRadius: '32px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
              maxWidth: 1000,
              width: '100%',
              margin: '0 auto',
              padding: '3.5rem 2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
              boxSizing: 'border-box',
            }}
          >
            <div className="dashboard-loading" role="status" aria-live="polite">
              <div className="spinner" aria-hidden="true"></div>
              <p>Loading your campaigns{retryCount > 0 ? ` (Attempt ${retryCount + 1}/4)` : ''}...</p>
              {retryCount > 0 && (
                <p className="retry-info">Retrying connection...</p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Enhanced error state with retry functionality
  if (error && retryCount >= 3) {
    return (
      <>
        <Header onLogout={logout} user={user} onUserClick={handleShowSignIn} />
        <div
          className="campaign-dashboard"
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '3.5rem 0 2.5rem 0',
            fontFamily: 'Inter, Arial, sans-serif',
            width: '100vw',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="dashboard-container"
            style={{
              background: '#fff',
              borderRadius: '32px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
              maxWidth: 1000,
              width: '100%',
              margin: '0 auto',
              padding: '3.5rem 2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
              boxSizing: 'border-box',
            }}
          >
            <div className="error-state" role="alert">
              <div className="error-icon" aria-hidden="true">⚠️</div>
              <h2>Unable to Load Dashboard</h2>
              <p>We're experiencing technical difficulties. Please try again.</p>
              <div className="error-details">
                <p><strong>Error:</strong> {error}</p>
              </div>
              <div className="error-actions">
                <button 
                  onClick={handleRetry}
                  className="retry-button"
                  aria-label="Retry loading campaigns"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="reload-button"
                  aria-label="Reload entire page"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  console.log('Dashboard user:', user);
  console.log('Dashboard isSignInOpen:', signInPrompted);

  if (!user || !user.email) {
    return (
      <>
        <Header onLogout={logout} user={user} onUserClick={handleShowSignIn} onSwitchAccount={() => { logout(); handleShowSignIn(); }} />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2.5rem 2rem', fontSize: '1.3rem', color: '#2563eb', fontWeight: 600, textAlign: 'center' }}>
            Please sign in to view your campaigns.
          </div>
        </div>
      </>
    );
  }

  // Handler to update socials from deployment center modal
  const handleUpdateSocials = (platform, value) => {
    // Platform-specific validation
    const patterns = {
      facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/[A-Za-z0-9.]{5,}$/,
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9_.]{1,30}$/,
      twitter: /^(https?:\/\/)?(www\.)?twitter\.com\/[A-Za-z0-9_]{1,15}$/,
      linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9-]{5,30}$/,
      tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[A-Za-z0-9_.]{2,24}$/,
      youtube: /^(https?:\/\/)?(www\.)?youtube\.com\/(channel|c|user)\/[A-Za-z0-9_-]{1,}$/,
    };
    const key = platform.toLowerCase();
    const pattern = patterns[key];
    if (pattern && !pattern.test(value)) {
      showToast(`Please enter a valid ${platform} profile URL.`, 'warning');
      return;
    }
    setSettings(s => ({ ...s, socials: { ...s.socials, [key]: value } }));
    showToast(`${platform} account connected!`, 'success');
  };

  return (
    <>
      <Header onLogout={handleLogout} user={user} onUserClick={handleShowSignIn} onSwitchAccount={() => { logout(); handleShowSignIn(); }} />
      {signOutLoading && <div className="signout-spinner-overlay"><span className="spinner" /></div>}
      <div
        className="campaign-dashboard"
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '3.5rem 0 2.5rem 0',
          fontFamily: 'Inter, Arial, sans-serif',
          width: '100vw',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="dashboard-container"
          style={{
            background: '#fff',
            borderRadius: '32px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
            maxWidth: 1000,
            width: '100%',
            margin: '0 auto',
            padding: '3.5rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2.5rem',
            boxSizing: 'border-box',
          }}
        >
          {/* Dashboard Header - simplified, since Header now provides navbar */}
          <div className="dashboard-header" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="header-content" style={{ textAlign: 'left' }}>
              <h1 style={{ fontWeight: 700, fontSize: '2.2rem', margin: 0, color: '#1e293b', letterSpacing: '-1px' }}>Campaign Dashboard</h1>
              <p style={{ color: '#64748b', fontWeight: 400, fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>Manage and monitor your AI-powered marketing campaigns</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <button
                onClick={handleNewCampaignClick}
                style={{
                  background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.8rem 2rem',
                  fontWeight: 700,
                  fontSize: '1.08rem',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
                  cursor: 'pointer',
                  marginLeft: '2rem',
                  transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s',
                  outline: 'none',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
                aria-label="Create new campaign"
                onMouseOver={e => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #1e40af 0%, #059669 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.18)';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.10)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <Plus size={20} style={{ marginRight: 4, marginBottom: 1 }} />
                New Campaign
              </button>
              {/* Profile Button */}
              <div ref={profileButtonRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  aria-label="Profile menu"
                  style={{
                    background: 'none',
                    border: 'none',
                    borderRadius: '50%',
                    padding: 0,
                    marginLeft: '1rem',
                    cursor: 'pointer',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: profileMenuOpen ? '0 0 0 2px #2563eb44' : 'none',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {user ? (
                    <img
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=2563eb&color=fff&rounded=true&size=40`}
                      alt="Profile"
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }}
                    />
                  ) : (
                    <UserCircle size={40} color="#2563eb" />
                  )}
                </button>
                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 52,
                      right: 0,
                      background: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 4px 24px rgba(37,99,235,0.13)',
                      minWidth: 180,
                      zIndex: 100,
                      padding: '0.5rem 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    <div style={{ padding: '0.7rem 1.2rem', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#2563eb', fontSize: '1.05rem' }}>
                      {user && user.displayName ? user.displayName : 'Profile'}
                    </div>
                    {/* Settings Option */}
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.7rem 1.2rem',
                        textAlign: 'left',
                        fontSize: '1rem',
                        color: '#222',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'background 0.15s',
                      }}
                      onClick={() => { setProfileMenuOpen(false); setSettingsModalOpen(true); }}
                    >
                      <SettingsIcon size={18} style={{ marginRight: 6 }} /> Settings
                    </button>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.7rem 1.2rem',
                        textAlign: 'left',
                        fontSize: '1rem',
                        color: '#ef4444',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => { setProfileMenuOpen(false); logout(); }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Settings Modal (scaffold) */}
          {settingsModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 40px rgba(37,99,235,0.13)', padding: '2rem 2.5rem', minWidth: 320, minHeight: 180, position: 'relative' }}>
                <button onClick={() => setSettingsModalOpen(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}>&times;</button>
                <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 16 }}>Settings</h2>
                <div style={{ marginBottom: 18 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 10, color: '#2563eb' }}>Social Media Accounts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { key: 'facebook', label: 'Facebook', color: '#1877f2' },
                      { key: 'instagram', label: 'Instagram', color: '#e1306c' },
                      { key: 'twitter', label: 'Twitter', color: '#1da1f2' },
                      { key: 'linkedin', label: 'LinkedIn', color: '#0a66c2' },
                      { key: 'tiktok', label: 'TikTok', color: '#000' },
                      { key: 'youtube', label: 'YouTube', color: '#ff0000' },
                    ].map(({ key, label, color }) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 15 }}>{label[0]}</span>
                        <label htmlFor={`settings-${key}`} style={{ minWidth: 80, color: '#222', fontWeight: 600 }}>{label}</label>
                        <input
                          id={`settings-${key}`}
                          type="text"
                          placeholder={`Enter your ${label} username or URL`}
                          value={settings.socials?.[key] || ''}
                          onChange={e => setSettings(s => ({ ...s, socials: { ...s.socials, [key]: e.target.value } }))}
                          style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: 8, border: '1.5px solid #e0e7ff', fontSize: '1rem', color: '#222', background: '#f8fafc', outline: 'none', boxShadow: '0 1px 4px #2563eb08', transition: 'border 0.2s' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* You can add more settings sections here */}
              </div>
            </div>
          )}
          {/* Dashboard Tabs */}
          <div className="dashboard-tabs" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {['overview', 'campaigns', 'analytics', 'deployment'].map(tab => (
              <button
                key={tab}
                className={`tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)' : '#f1f5f9',
                  color: activeTab === tab ? '#fff' : '#64748b',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.7rem 1.7rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(37,99,235,0.07)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                  outline: 'none',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {/* Dashboard Content */}
          <div className="dashboard-content">
            {activeTab === 'overview' && (
              <div className="overview-section" style={{ width: '100%' }}>
                {/* Responsive Summary Cards Row */}
                <div
                  style={{
                    display: 'flex',
                    gap: '2rem',
                    flexWrap: 'wrap',
                    marginBottom: 32,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Total Campaigns */}
                  <MetricCard
                    icon={<Target size={28} />}
                    iconBg="rgba(255,255,255,0.18)"
                    title="Total Campaigns"
                    value={campaigns.length}
                    change={{ text: '+8 this month', type: 'positive', label: 'Change this month' }}
                    secondary={`Active: ${campaigns.filter(c => c.status === 'active').length}   Paused: ${campaigns.filter(c => c.status === 'paused').length}   Draft: ${campaigns.filter(c => c.status === 'draft').length}`}
                    background="linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                    progress={campaigns.length ? campaigns.filter(c => c.status === 'active').length / campaigns.length : 0}
                    progressColor="#93c5fd"
                    progressBg="rgba(255,255,255,0.25)"
                  />
                  {/* Total Revenue */}
                  <MetricCard
                    icon={<DollarSign size={28} />}
                    iconBg="rgba(255,255,255,0.18)"
                    title="Total Revenue"
                    value={`₹${(campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0) / 100000).toFixed(1)}L`}
                    change={{ text: '+22% vs last month', type: 'positive', label: 'Revenue change' }}
                    secondary={`ROI: ${(campaigns.reduce((sum, c) => sum + (c.roi || 0), 0) / (campaigns.length || 1)).toFixed(1)}x   ROAS: ${((campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0) / (campaigns.reduce((sum, c) => sum + (c.spend || 0), 0) || 1)) * 100).toFixed(0)}%`}
                    background="linear-gradient(135deg, #059669 0%, #22d3ee 100%)"
                    progress={0.8}
                    progressColor="#6ee7b7"
                    progressBg="rgba(255,255,255,0.25)"
                  />
                  {/* Total Reach */}
                  <MetricCard
                    icon={<Eye size={28} />}
                    iconBg="rgba(255,255,255,0.18)"
                    title="Total Reach"
                    value={`${(campaigns.reduce((sum, c) => sum + (c.reach || 0), 0) / 1000000).toFixed(1)}M`}
                    change={{ text: '+45% growth', type: 'positive', label: 'Reach growth' }}
                    secondary={`Impressions: ${(campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0) / 1000000).toFixed(1)}M   CTR: ${((campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0) / (campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0) || 1)) * 100).toFixed(1)}%`}
                    background="linear-gradient(135deg, #a21caf 0%, #8b5cf6 100%)"
                    progress={0.7}
                    progressColor="#c4b5fd"
                    progressBg="rgba(255,255,255,0.25)"
                  />
                  {/* Avg. Conversion */}
                  <MetricCard
                    icon={<Activity size={28} />}
                    iconBg="rgba(255,255,255,0.18)"
                    title="Avg. Conversion"
                    value={`${((campaigns.reduce((sum, c) => sum + (c.conversionRate || 0), 0) / (campaigns.length || 1)) || 0).toFixed(1)}%`}
                    change={{ text: '+1.2% improvement', type: 'positive', label: 'Conversion improvement' }}
                    secondary={`Best: ${(Math.max(...campaigns.map(c => c.conversionRate || 0))).toFixed(1)}%   Avg Lead: ₹${(campaigns.reduce((sum, c) => sum + (c.leadValue || 0), 0) / (campaigns.length || 1)).toFixed(0)}`}
                    background="linear-gradient(135deg, #ea580c 0%, #f59e42 100%)"
                    progress={0.6}
                    progressColor="#fdba74"
                    progressBg="rgba(255,255,255,0.25)"
                  />
                </div>
                {/* Performance Trends and Top Performers Side by Side */}
                <div
                  style={{
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'stretch',
                    width: '100%',
                    flexWrap: 'wrap',
                    marginBottom: 16,
                  }}
                >
                  {/* Campaign Performance Trends (Left) */}
                  <div
                    style={{
                      flex: 2,
                      background: '#fff',
                      borderRadius: 24,
                      boxShadow: '0 4px 24px rgba(37,99,235,0.07)',
                      padding: '2.5rem 2rem',
                      marginBottom: 0,
                      boxSizing: 'border-box',
                      minWidth: 320,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#222', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.5px' }}><Eye size={22} /> Campaign Performance Trends</h3>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: 22, justifyContent: 'space-between' }}>
                      {/* This Week */}
                      <div style={{ flex: 1, minWidth: 120, background: '#e0e7ff', borderRadius: 14, padding: '1.2rem 1rem', textAlign: 'center', boxShadow: '0 2px 8px #2563eb11', transition: 'box-shadow 0.18s', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', height: 90, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px #2563eb22'}
                        onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px #2563eb11'}>
                        <div style={{ fontWeight: 900, fontSize: '1.6rem', color: '#2563eb', marginBottom: 2 }}>{(campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0) / 1000).toFixed(1)}K</div>
                        <div style={{ color: '#64748b', fontWeight: 700, fontSize: '1.02rem' }}>This Week</div>
                        <div style={{ color: '#10b981', fontWeight: 700, fontSize: '1.02rem' }}>↑ 18%</div>
                      </div>
                      {/* Revenue */}
                      <div style={{ flex: 1, minWidth: 120, background: '#d1fae5', borderRadius: 14, padding: '1.2rem 1rem', textAlign: 'center', boxShadow: '0 2px 8px #05966911', transition: 'box-shadow 0.18s', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', height: 90, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px #05966922'}
                        onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px #05966911'}>
                        <div style={{ fontWeight: 900, fontSize: '1.6rem', color: '#059669', marginBottom: 2 }}>₹{(campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0) / 100000).toFixed(2)}L</div>
                        <div style={{ color: '#64748b', fontWeight: 700, fontSize: '1.02rem' }}>Revenue</div>
                        <div style={{ color: '#10b981', fontWeight: 700, fontSize: '1.02rem' }}>↑ 25%</div>
                      </div>
                      {/* Conversion */}
                      <div style={{ flex: 1, minWidth: 120, background: '#f3e8ff', borderRadius: 14, padding: '1.2rem 1rem', textAlign: 'center', boxShadow: '0 2px 8px #a21caf11', transition: 'box-shadow 0.18s', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', height: 90, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px #a21caf22'}
                        onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px #a21caf11'}>
                        <div style={{ fontWeight: 900, fontSize: '1.6rem', color: '#a21caf', marginBottom: 2 }}>{((campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0) / (campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0) || 1)) * 100).toFixed(1)}%</div>
                        <div style={{ color: '#64748b', fontWeight: 700, fontSize: '1.02rem' }}>Conversion</div>
                        <div style={{ color: '#10b981', fontWeight: 700, fontSize: '1.02rem' }}>↑ 0.8%</div>
                      </div>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 16, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 700, fontSize: '1.13rem', marginTop: 8 }}>
                      Interactive chart will be displayed here
                    </div>
                  </div>
                  {/* Top Performers (Right) */}
                  <div
                    style={{
                      flex: 1,
                      background: '#fff',
                      borderRadius: 18,
                      boxShadow: '0 2px 12px #2563eb11',
                      padding: '2rem 1.5rem',
                      marginBottom: 0,
                      maxWidth: 340,
                      width: '100%',
                      boxSizing: 'border-box',
                      minWidth: 260,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <h3 style={{ fontSize: '1.18rem', color: '#222', fontWeight: 800, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.5px' }}><span style={{ color: '#059669', fontSize: 22 }}>⭐</span> Top Performers</h3>
                    <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 18 }}>Best campaigns this month</div>
                    {Array.isArray(campaigns) && campaigns.length > 0 ? (
                      [...campaigns]
                        .filter(c => c.status === 'active' || c.status === 'completed')
                        .sort((a, b) => (b.conversionRate || 0) - (a.conversionRate || 0))
                        .slice(0, 2)
                        .map((campaign, idx) => (
                          <div key={campaign.id || idx} style={{ background: idx === 0 ? '#f0fdf4' : '#f0f9ff', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 1px 6px #05966911', minHeight: 90, justifyContent: 'center' }}>
                            <div style={{ color: '#222', fontWeight: 800, fontSize: '1.08rem' }}>{campaign.title} <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.98rem', marginLeft: 8 }}>{campaign.status === 'active' ? 'Active' : 'Completed'}</span></div>
                            <div style={{ color: '#64748b', fontWeight: 600 }}>Conversion Rate: <span style={{ color: '#059669', fontWeight: 800 }}>{(campaign.conversionRate || 0).toFixed(1)}%</span></div>
                            <div style={{ color: '#64748b', fontWeight: 600 }}>Revenue: <span style={{ color: '#2563eb', fontWeight: 800 }}>₹{(campaign.revenue || 0).toLocaleString()}</span></div>
                            <div style={{ color: '#64748b', fontWeight: 600 }}>ROI: <span style={{ color: '#a21caf', fontWeight: 800 }}>{(campaign.roi || 0).toFixed(1)}x</span></div>
                          </div>
                        ))
                    ) : (
                      <div style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem 0' }}>No top performers yet.</div>
                    )}
                  </div>
                </div>
                {/* Responsive Trends Section */}
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 24,
                    boxShadow: '0 4px 24px rgba(37,99,235,0.07)',
                    padding: '2.5rem 2rem',
                    marginBottom: 32,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#222', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}><Eye size={22} /> Campaign Performance Trends</h3>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: 18 }}>
                    <div style={{ flex: 1, minWidth: 180, background: '#f8fafc', borderRadius: 14, padding: '1.2rem 1rem', textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#2563eb' }}>{(campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0) / 1000).toFixed(1)}K</div>
                      <div style={{ color: '#64748b', fontWeight: 600 }}>This Week</div>
                      <div style={{ color: '#10b981', fontWeight: 600, fontSize: '1rem' }}>↑ 18%</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 180, background: '#f8fafc', borderRadius: 14, padding: '1.2rem 1rem', textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#059669' }}>₹{(campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0) / 100000).toFixed(2)}L</div>
                      <div style={{ color: '#64748b', fontWeight: 600 }}>Revenue</div>
                      <div style={{ color: '#10b981', fontWeight: 600, fontSize: '1rem' }}>↑ 25%</div>
                  </div>
                    <div style={{ flex: 1, minWidth: 180, background: '#f8fafc', borderRadius: 14, padding: '1.2rem 1rem', textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#a21caf' }}>{((campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0) / (campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0) || 1)) * 100).toFixed(1)}%</div>
                      <div style={{ color: '#64748b', fontWeight: 600 }}>Conversion</div>
                      <div style={{ color: '#10b981', fontWeight: 600, fontSize: '1rem' }}>↑ 0.8%</div>
                </div>
                      </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 16, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 600, fontSize: '1.1rem' }}>
                    Interactive chart will be displayed here
                    </div>
                      </div>
                {/* Responsive Regional & Activity Row */}
                <div
                  style={{
                    display: 'flex',
                    gap: '2rem',
                    flexWrap: 'wrap',
                    marginBottom: 32,
                    flexDirection: 'row',
                  }}
                >
                  {/* Regional Performance */}
                  <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #2563eb11', padding: '2rem 1.5rem', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#222', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#a21caf', fontSize: 22 }}>📍</span> Regional Performance</h3>
                    <div style={{ color: '#64748b', fontWeight: 500, marginBottom: 18 }}>Campaign performance by region</div>
                    {Object.entries(campaigns.reduce((acc, c) => {
                      const region = c.location || 'Unknown';
                      acc[region] = acc[region] || { count: 0, revenue: 0 };
                      acc[region].count += 1;
                      acc[region].revenue += c.revenue || 0;
                      return acc;
                    }, {})).sort((a, b) => b[1].revenue - a[1].revenue).map(([region, data], idx) => (
                      <div key={region} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: idx === 0 ? '#f0fdf4' : idx === 1 ? '#f0f9ff' : idx === 2 ? '#f3f0ff' : '#fff7ed', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: 10 }}>
                        <div style={{ color: ['#059669', '#2563eb', '#a21caf', '#ea580c'][idx] || '#64748b', fontWeight: 700 }}>{region}</div>
                        <div style={{ color: '#64748b', fontWeight: 500 }}>{data.count} campaigns</div>
                        <div style={{ color: ['#059669', '#2563eb', '#a21caf', '#ea580c'][idx] || '#64748b', fontWeight: 800, fontSize: '1.1rem' }}>₹{(data.revenue / 100000).toFixed(1)}L</div>
                    </div>
                    ))}
                  </div>
                {/* Recent Activity */}
                  <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #2563eb11', padding: '2rem 1.5rem', marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#222', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#059669', fontSize: 22 }}>🟢</span> Recent Activity</h3>
                    <div style={{ color: '#64748b', fontWeight: 500, marginBottom: 18 }}>Latest updates and achievements</div>
                    {Array.isArray(campaigns) && campaigns.length > 0 ? (
                      [...campaigns]
                        .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
                        .slice(0, 4)
                        .map((campaign, idx) => {
                          let activity = '';
                          let color = '#059669';
                          if (campaign.status === 'completed') {
                            activity = `Campaign "${campaign.title}" completed`;
                            color = '#a21caf';
                          } else if (campaign.spend && campaign.budget && campaign.spend > 0.5 * campaign.budget) {
                            activity = `Campaign "${campaign.title}" reached 50% of budget`;
                            color = '#2563eb';
                          } else if (campaign.status === 'active') {
                            activity = `Campaign "${campaign.title}" is active`;
                            color = '#059669';
                          } else {
                            activity = `Campaign "${campaign.title}" created`;
                            color = '#ea580c';
                          }
                          const now = Date.now();
                          const tsRaw = campaign.updatedAt || campaign.createdAt || now;
                          const tsDate = getTimestamp(tsRaw);
                          const diff = tsDate ? Math.max(0, now - tsDate.getTime()) : 0;
                          let timeAgo = 'just now';
                          if (diff > 1000 * 60 * 60 * 24) {
                            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                            timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
                          } else if (diff > 1000 * 60 * 60) {
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
                          } else if (diff > 1000 * 60) {
                            const mins = Math.floor(diff / (1000 * 60));
                            timeAgo = `${mins} min${mins > 1 ? 's' : ''} ago`;
                          }
                          return (
                            <div key={campaign.id || idx} style={{ display: 'flex', alignItems: 'center', background: color + '11', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 10 }}>
                              <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, marginRight: 16 }}></div>
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#222', fontWeight: 600 }}>{activity}</div>
                                <div style={{ color: '#64748b', fontSize: '0.98rem' }}>{timeAgo}  •  {campaign.location || 'All regions'}</div>
                        </div>
                      </div>
                          );
                        })
                    ) : (
                      <div style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem 0' }}>No recent activity yet. Create a campaign to see activity here!</div>
                    )}
                        </div>
                      </div>
                {/* Responsive Top Performers Section */}
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 18,
                    boxShadow: '0 2px 12px #2563eb11',
                    padding: '2rem 1.5rem',
                    marginBottom: 16,
                    maxWidth: 600,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <h3 style={{ fontSize: '1.15rem', color: '#222', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#059669', fontSize: 22 }}>⭐</span> Top Performers</h3>
                  <div style={{ color: '#64748b', fontWeight: 500, marginBottom: 18 }}>Best campaigns this month</div>
                  {Array.isArray(campaigns) && campaigns.length > 0 ? (
                    [...campaigns]
                      .filter(c => c.status === 'active' || c.status === 'completed')
                      .sort((a, b) => (b.conversionRate || 0) - (a.conversionRate || 0))
                      .slice(0, 2)
                      .map((campaign, idx) => (
                        <div key={campaign.id || idx} style={{ background: idx === 0 ? '#f0fdf4' : '#f0f9ff', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ color: '#222', fontWeight: 700 }}>{campaign.title} <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.98rem', marginLeft: 8 }}>{campaign.status === 'active' ? 'Active' : 'Completed'}</span></div>
                          <div style={{ color: '#64748b', fontWeight: 500 }}>Conversion Rate: <span style={{ color: '#059669', fontWeight: 700 }}>{(campaign.conversionRate || 0).toFixed(1)}%</span></div>
                          <div style={{ color: '#64748b', fontWeight: 500 }}>Revenue: <span style={{ color: '#2563eb', fontWeight: 700 }}>₹{(campaign.revenue || 0).toLocaleString()}</span></div>
                          <div style={{ color: '#64748b', fontWeight: 500 }}>ROI: <span style={{ color: '#a21caf', fontWeight: 700 }}>{(campaign.roi || 0).toFixed(1)}x</span></div>
                        </div>
                      ))
                  ) : (
                    <div style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem 0' }}>No top performers yet.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'campaigns' && (
              <div className="campaigns-section">
                {/* Section Header */}
                <div style={{ background: '#a259f7', borderRadius: 18, padding: '2.2rem 2rem 1.2rem 2rem', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <span style={{ fontSize: 36, color: '#fff', marginRight: 18 }}>📋</span>
                  <div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fff', marginBottom: 2 }}>Campaign Management</div>
                    <div style={{ fontSize: '1.1rem', color: '#f3e8ff', fontWeight: 500 }}>View and manage all your marketing campaigns</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => setCampaignsView('table')}
                      style={{
                        background: campaignsView === 'table' ? '#fff' : 'transparent',
                        color: campaignsView === 'table' ? '#a259f7' : '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: '1rem',
                        padding: '0.5rem 1.2rem',
                        boxShadow: campaignsView === 'table' ? '0 2px 8px #a259f733' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.18s, color 0.18s',
                      }}
                      aria-pressed={campaignsView === 'table'}
                    >
                      Table View
                    </button>
                    <button
                      onClick={() => setCampaignsView('card')}
                      style={{
                        background: campaignsView === 'card' ? '#fff' : 'transparent',
                        color: campaignsView === 'card' ? '#a259f7' : '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: '1rem',
                        padding: '0.5rem 1.2rem',
                        boxShadow: campaignsView === 'card' ? '0 2px 8px #a259f733' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.18s, color 0.18s',
                      }}
                      aria-pressed={campaignsView === 'card'}
                    >
                      Card View
                    </button>
                  </div>
                </div>
                {/* Campaigns Table or Card View */}
                {campaignsView === 'table' ? (
                  <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #a259f71a', padding: '2rem 1.5rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead>
                        <tr style={{ background: '#f3e8ff' }}>
                          <th style={{ textAlign: 'left', padding: '1rem 0.7rem', fontWeight: 700, color: '#7c3aed', fontSize: '1.08rem' }}>Campaign Name</th>
                          <th style={{ textAlign: 'left', padding: '1rem 0.7rem', fontWeight: 700, color: '#7c3aed', fontSize: '1.08rem' }}>Status</th>
                          <th style={{ textAlign: 'left', padding: '1rem 0.7rem', fontWeight: 700, color: '#7c3aed', fontSize: '1.08rem' }}>Goal</th>
                          <th style={{ textAlign: 'left', padding: '1rem 0.7rem', fontWeight: 700, color: '#7c3aed', fontSize: '1.08rem' }}>Region</th>
                          <th style={{ textAlign: 'right', padding: '1rem 0.7rem', fontWeight: 700, color: '#7c3aed', fontSize: '1.08rem' }}>Reach</th>
                          <th style={{ textAlign: 'right', padding: '1rem 0.7rem', fontWeight: 700, color: '#7c3aed', fontSize: '1.08rem' }}>Engagement</th>
                          <th style={{ textAlign: 'right', padding: '1rem 0.7rem', fontWeight: 700, color: '#7c3aed', fontSize: '1.08rem' }}>Budget</th>
                          <th style={{ textAlign: 'center', padding: '1rem 0.7rem', fontWeight: 700, color: '#7c3aed', fontSize: '1.08rem' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((campaign, idx) => (
                          <tr key={campaign.id || idx} style={{ borderBottom: '1px solid #f3e8ff', background: idx % 2 === 0 ? '#fff' : '#faf5ff' }}>
                            <td style={{ padding: '0.9rem 0.7rem', color: '#1e293b', fontWeight: 600 }}>{campaign.title}</td>
                            <td style={{ padding: '0.9rem 0.7rem' }}>
                              {/* Status badge */}
                              <span style={{ display: 'inline-block', minWidth: 64, padding: '0.35em 1.1em', borderRadius: 999, fontWeight: 700, fontSize: '0.98rem', background: campaign.status === 'active' ? '#22c55e22' : campaign.status === 'paused' ? '#facc1522' : '#e5e7eb', color: campaign.status === 'active' ? '#16a34a' : campaign.status === 'paused' ? '#b45309' : '#64748b', textAlign: 'center' }}>{campaign.status}</span>
                            </td>
                            <td style={{ padding: '0.9rem 0.7rem', color: '#334155' }}>{campaign.campaignGoal || '-'}</td>
                            <td style={{ padding: '0.9rem 0.7rem', color: '#334155' }}>{campaign.location || '-'}</td>
                            <td style={{ padding: '0.9rem 0.7rem', color: '#1e293b', textAlign: 'right' }}>{campaign.reach ? campaign.reach.toLocaleString() : '-'}</td>
                            <td style={{ padding: '0.9rem 0.7rem', color: '#1e293b', textAlign: 'right' }}>{campaign.engagement ? campaign.engagement + '%' : '-'}</td>
                            <td style={{ padding: '0.9rem 0.7rem', color: '#1e293b', textAlign: 'right' }}>{campaign.budget ? `₹${campaign.budget.toLocaleString()}` : '-'}</td>
                            <td style={{ padding: '0.9rem 0.7rem', textAlign: 'center' }}>
                              {/* Actions: view, edit, duplicate, play/pause, delete (icons, tooltips) */}
                              {/* TODO: Add icons and handlers here */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                              }}>
                                <button
                                  title="Resume"
                                  onClick={() => handleResume(campaign.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  <img src={playIcon} alt="Resume" width={18} height={18} />
                                </button>
                                <button
                                  title="Pause"
                                  onClick={() => handlePause(campaign.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  <img src={pauseIcon} alt="Pause" width={18} height={18} />
                                </button>
                                <button
                                  title="Delete"
                                  onClick={() => handleDelete(campaign.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  <img src={trashIcon} alt="Delete" width={18} height={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                <div className="campaigns-grid">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="campaign-card"
                        style={{
                          background: '#fff',
                          borderRadius: 18,
                          boxShadow: '0 4px 24px rgba(37,99,235,0.10)',
                          padding: '2.2rem 1.5rem 1.7rem 1.5rem',
                          margin: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1.2rem',
                          minHeight: 320,
                          border: '1.5px solid #e0e7ff',
                          transition: 'box-shadow 0.2s, border 0.2s, transform 0.18s',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                        onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.16)'}
                        onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,0.10)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#2563eb' }}>
                            {campaign.platforms && campaign.platforms[0] ? campaign.platforms[0][0].toUpperCase() : 'C'}
                          </div>
                            <h3 style={{ color: '#1e293b', fontSize: '1.18rem', fontWeight: 700, margin: 0 }}>{campaign.title}</h3>
                        </div>
                          <div className="campaign-card-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                              className="card-action-btn edit"
                              title="Edit campaign"
                              aria-label="Edit campaign"
                              onClick={() => handleEditCampaign(campaign)}
                              tabIndex={0}
                              style={{
                                background: '#2563eb1a',
                                color: '#2563eb',
                                border: 'none',
                                borderRadius: '50%',
                                width: 38,
                                height: 38,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 4px #2563eb22',
                                transition: 'background 0.18s, color 0.18s',
                                cursor: 'pointer',
                                fontSize: 0,
                                outline: 'none',
                              }}
                              onMouseOver={e => e.currentTarget.style.background = '#2563eb33'}
                              onMouseOut={e => e.currentTarget.style.background = '#2563eb1a'}
                            >
                              <Edit2 size={20} strokeWidth={2.2} />
                            </button>
                            <button
                              className="card-action-btn copy"
                              title="Duplicate campaign"
                              aria-label="Duplicate campaign"
                              onClick={() => handleDuplicateCampaign(campaign)}
                              tabIndex={0}
                              style={{
                                background: '#a259f71a',
                                color: '#a259f7',
                                border: 'none',
                                borderRadius: '50%',
                                width: 38,
                                height: 38,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 4px #a259f733',
                                transition: 'background 0.18s, color 0.18s',
                                cursor: 'pointer',
                                fontSize: 0,
                                outline: 'none',
                              }}
                              onMouseOver={e => e.currentTarget.style.background = '#a259f733'}
                              onMouseOut={e => e.currentTarget.style.background = '#a259f71a'}
                            >
                              <Copy size={20} strokeWidth={2.2} />
                            </button>
                            <button
                              className="card-action-btn video"
                              title={campaign.generatedVideo ? "View generated video" : "Generate video"}
                              aria-label={campaign.generatedVideo ? "View generated video" : "Generate video"}
                              onClick={() => campaign.generatedVideo ? null : handleGenerateVideo(campaign)}
                              disabled={videoGenerating[campaign.id]}
                              tabIndex={0}
                              style={{
                                background: campaign.generatedVideo ? '#10b9811a' : '#f59e0b1a',
                                color: campaign.generatedVideo ? '#10b981' : '#f59e0b',
                                border: 'none',
                                borderRadius: '50%',
                                width: 38,
                                height: 38,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 4px #f59e0b22',
                                transition: 'background 0.18s, color 0.18s',
                                cursor: videoGenerating[campaign.id] ? 'not-allowed' : 'pointer',
                                fontSize: 0,
                                outline: 'none',
                                opacity: videoGenerating[campaign.id] ? 0.6 : 1,
                              }}
                              onMouseOver={e => {
                                if (!videoGenerating[campaign.id]) {
                                  e.currentTarget.style.background = campaign.generatedVideo ? '#10b98133' : '#f59e0b33';
                                }
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.background = campaign.generatedVideo ? '#10b9811a' : '#f59e0b1a';
                              }}
                            >
                              {videoGenerating[campaign.id] ? (
                                <div className="spinner" style={{ width: 16, height: 16, border: '2px solid #f59e0b', borderTop: '2px solid transparent' }}></div>
                              ) : campaign.generatedVideo ? (
                                <span style={{ fontSize: 18 }}>▶️</span>
                              ) : (
                                <img src={cameraMovieIcon} alt="Generate Video" width={18} height={18} />
                              )}
                            </button>
                            <button
                              className="card-action-btn delete"
                              title="Delete campaign"
                              aria-label="Delete campaign"
                              onClick={() => handleDeleteCampaign(campaign)}
                              tabIndex={0}
                              style={{
                                background: '#ef44441a',
                                color: '#ef4444',
                                border: 'none',
                                borderRadius: '50%',
                                width: 38,
                                height: 38,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 4px #ef444422',
                                transition: 'background 0.18s, color 0.18s',
                                cursor: 'pointer',
                                fontSize: 0,
                                outline: 'none',
                              }}
                              onMouseOver={e => e.currentTarget.style.background = '#ef444433'}
                              onMouseOut={e => e.currentTarget.style.background = '#ef44441a'}
                            >
                              <Trash2 size={20} strokeWidth={2.2} />
                            </button>
                          </div>
                      </div>
                        <div style={{ color: '#334155', fontSize: '1.02rem', marginBottom: 8 }}>{campaign.campaignGoal || '-'}</div>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: 8 }}>
                          <div style={{ color: '#64748b', fontWeight: 600 }}>Region: <span style={{ color: '#1e293b', fontWeight: 500 }}>{campaign.location || '-'}</span></div>
                          <div style={{ color: '#64748b', fontWeight: 600 }}>Reach: <span style={{ color: '#1e293b', fontWeight: 500 }}>{campaign.reach ? campaign.reach.toLocaleString() : '-'}</span></div>
                          <div style={{ color: '#64748b', fontWeight: 600 }}>Engagement: <span style={{ color: '#1e293b', fontWeight: 500 }}>{campaign.engagement ? campaign.engagement + '%' : '-'}</span></div>
                          <div style={{ color: '#64748b', fontWeight: 600 }}>Budget: <span style={{ color: '#1e293b', fontWeight: 500 }}>{campaign.budget ? `₹${campaign.budget.toLocaleString()}` : '-'}</span></div>
                        </div>
                      {campaign.aiContent && (
                          <div style={{
                            marginTop: 12,
                            background: '#f8fafc',
                            borderRadius: 12,
                            padding: '1rem 1.25rem',
                            boxShadow: '0 1px 6px rgba(37,99,235,0.06)',
                            color: '#222',
                            overflow: 'hidden',
                          }}>
                            {/* AI Generated Images */}
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <h4 style={{ margin: 0, color: '#2563eb', fontWeight: 600 }}>AI Generated Images</h4>
                              </div>
                              <ImageGallery 
                                images={campaign.generatedImages || []} 
                                title=""
                              />
                            </div>
                            {/* AI Generated Video */}
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h4 style={{ margin: 0, color: '#f59e0b', fontWeight: 600 }}>AI Generated Video</h4>
                                {!campaign.generatedVideo && (
                                  <button
                                    onClick={() => handleGenerateVideo(campaign)}
                                    disabled={videoGenerating[campaign.id]}
                                    style={{
                                      background: '#f59e0b',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: 8,
                                      padding: '0.5rem 1rem',
                                      fontWeight: 600,
                                      fontSize: '0.9rem',
                                      cursor: videoGenerating[campaign.id] ? 'not-allowed' : 'pointer',
                                      opacity: videoGenerating[campaign.id] ? 0.6 : 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 6,
                                    }}
                                  >
                                    {videoGenerating[campaign.id] ? (
                                      <>
                                        <div className="spinner" style={{ width: 12, height: 12, border: '2px solid #fff', borderTop: '2px solid transparent' }}></div>
                                        Generating...
                                      </>
                                    ) : (
                                      <>
                                        Generate Video
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                              {campaign.generatedVideo && campaign.generatedVideo.url ? (
                                <VideoPlayer 
                                  video={campaign.generatedVideo}
                                  poster={campaign.generatedImages?.[0]?.url}
                                />
                              ) : (
                                <div style={{ color: '#64748b', fontStyle: 'italic', marginTop: 8 }}>
                                  No video generated yet.
                                </div>
                              )}
                            </div>
                            {/* Captions, Ad Copy, Hashtags */}
                          {campaign.aiContent.captions && (
                            <div style={{ marginBottom: 6 }}>
                                <strong style={{ color: '#2563eb' }}>Instagram Caption:</strong>
                              <div style={{ color: '#222', marginTop: 2 }}>{campaign.aiContent.captions.instagram || 'N/A'}</div>
                            </div>
                          )}
                          {campaign.aiContent.adCopy && (
                            <div style={{ marginBottom: 6 }}>
                                <strong style={{ color: '#2563eb' }}>Ad Copy:</strong>
                              <ul style={{
                                margin: '10px 0 0 0',
                                padding: 0,
                                listStyle: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.1rem',
                              }}>
                                {(() => {
                                  // Split ad copy string into array by '**Ad Copy X:**'
                                  const adCopySections = campaign.aiContent.adCopy
                                    .split(/\*\*Ad Copy \d+:\*\*/g)
                                    .map(s => s.trim())
                                    .filter(Boolean);
                                  // Get the titles (Ad Copy 1, 2, etc.)
                                  const adCopyTitles = [...campaign.aiContent.adCopy.matchAll(/\*\*(Ad Copy \d+):\*\*/g)].map(m => m[1]);
                                  return adCopySections.map((copy, idx) => (
                                    <li key={idx} style={{
                                      background: '#f3f4f6',
                                      borderRadius: 10,
                                      padding: '1rem 1.2rem',
                                      boxShadow: '0 1px 4px rgba(37,99,235,0.07)',
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      justifyContent: 'space-between',
                                      gap: '1.2rem',
                                      position: 'relative',
                                    }}>
                                      <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 700, color: '#a259f7', marginRight: 8 }}>{adCopyTitles[idx] || `Ad Copy ${idx+1}`}:</span>
                                        <span style={{ color: '#222', whiteSpace: 'pre-line' }}>{copy}</span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(copy);
                                          if (typeof showToast === 'function') showToast('Copied!');
                                        }}
                                        style={{
                                          background: '#a259f7',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: 6,
                                          padding: '0.45rem 0.9rem',
                                          fontWeight: 600,
                                          fontSize: '1rem',
                                          cursor: 'pointer',
                                          boxShadow: '0 1px 4px #a259f733',
                                          transition: 'background 0.18s',
                                          marginLeft: 10,
                                        }}
                                        title="Copy Ad Copy"
                                      >
                                        Copy
                                      </button>
                                    </li>
                                  ));
                                })()}
                              </ul>
                            </div>
                          )}
                          {campaign.aiContent.hashtags && (
                            <div style={{ marginBottom: 6 }}>
                                <strong style={{ color: '#2563eb' }}>Hashtags:</strong>
                              <div style={{ color: '#222', marginTop: 2 }}>{campaign.aiContent.hashtags}</div>
                            </div>
                          )}
                            </div>
                          )}
                    </div>
                  ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="analytics-section" style={{ width: '100%' }}>
                {/* Section Header */}
                <div style={{ background: 'linear-gradient(90deg, #ff6a00 0%, #ff9800 100%)', borderRadius: 18, padding: '2.2rem 2rem 1.2rem 2rem', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <span style={{ fontSize: 36, color: '#fff', marginRight: 18 }}>📊</span>
                  <div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fff', marginBottom: 2 }}>Campaign Analytics</div>
                    <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 500, opacity: 0.92 }}>Detailed performance metrics and insights</div>
                </div>
                          </div>
                {/* Charts Row */}
                <div style={{ display: 'flex', gap: '2.5rem', marginBottom: 32, flexWrap: 'wrap' }}>
                  {/* Performance Trends Line Chart */}
                  <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px #ff980022', padding: '2rem 1.5rem', marginBottom: 16 }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#222', marginBottom: 2 }}>Performance Trends</div>
                    <div style={{ color: '#64748b', fontSize: '1rem', marginBottom: 18 }}>Campaign reach and engagement over time</div>
                    {loading ? <div style={{ color: '#64748b' }}>Loading...</div> : (
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={campaigns.map(c => ({
                          name: c.title || 'Untitled',
                          reach: c.reach || 0,
                          engagement: c.engagement || 0
                        }))}>
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <RechartsTooltip />
                          <RechartsLegend />
                          <Line type="monotone" dataKey="reach" stroke="#2563eb" strokeWidth={2} />
                          <Line type="monotone" dataKey="engagement" stroke="#f59e0b" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                        </div>
                  {/* Regional Distribution Pie Chart */}
                  <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px #ff980022', padding: '2rem 1.5rem', marginBottom: 16 }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#222', marginBottom: 2 }}>Regional Distribution</div>
                    <div style={{ color: '#64748b', fontSize: '1rem', marginBottom: 18 }}>Campaign distribution by region</div>
                    {loading ? <div style={{ color: '#64748b' }}>Loading...</div> : (
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <RechartsPie
                            data={Object.entries(campaigns.reduce((acc, c) => {
                              const region = c.location || 'Unknown';
                              acc[region] = (acc[region] || 0) + 1;
                              return acc;
                            }, {})).map(([region, count]) => ({ name: region, value: count }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#8884d8"
                            label
                          >
                            {Object.keys(campaigns.reduce((acc, c) => { acc[c.location || 'Unknown'] = true; return acc; }, {})).map((region, idx) => (
                              <Cell key={region} fill={["#2563eb", "#10b981", "#f59e0b", "#eab308", "#f43f5e", "#6366f1", "#f472b6"][idx % 7]} />
                            ))}
                          </RechartsPie>
                          <RechartsTooltip />
                          <RechartsLegend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                          </div>
                        </div>
                {/* Bar Chart Row */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px #ff980022', padding: '2rem 1.5rem', marginBottom: 32 }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#222', marginBottom: 2 }}>Campaign Goals Performance</div>
                  <div style={{ color: '#64748b', fontSize: '1rem', marginBottom: 18 }}>Success rates by campaign objectives</div>
                  {loading ? <div style={{ color: '#64748b' }}>Loading...</div> : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={Object.entries(campaigns.reduce((acc, c) => {
                        const goal = c.campaignGoal || 'Other';
                        acc[goal] = (acc[goal] || 0) + 1;
                        return acc;
                      }, {})).map(([goal, count]) => ({ name: goal, value: count }))}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <RechartsTooltip />
                        <RechartsBar dataKey="value" fill="#2563eb" radius={[8,8,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                          </div>
                {/* Summary Cards Row */}
                <div style={{ display: 'flex', gap: '2rem', marginBottom: 16, flexWrap: 'wrap' }}>
                  {/* Best Performing Region */}
                  <div style={{ flex: 1, minWidth: 220, background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px #ff980022', padding: '1.5rem 1.2rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: '1.05rem' }}>Best Performing Region</div>
                    {(() => {
                      if (loading || !campaigns.length) return <div style={{ color: '#64748b' }}>-</div>;
                      const regionCounts = campaigns.reduce((acc, c) => {
                        const region = c.location || 'Unknown';
                        acc[region] = (acc[region] || 0) + 1;
                        return acc;
                      }, {});
                      const bestRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0];
                      if (!bestRegion) return <div style={{ color: '#64748b' }}>-</div>;
                      const [region, count] = bestRegion;
                      const percent = ((count / campaigns.length) * 100).toFixed(1);
                      // Engagement rate for this region
                      const regionEngagement = campaigns.filter(c => (c.location || 'Unknown') === region).reduce((acc, c) => acc + (c.engagement || 0), 0);
                      const avgEngagement = (regionEngagement / count).toFixed(1);
                      return <>
                        <div style={{ color: '#1e293b', fontWeight: 800, fontSize: '1.25rem' }}>{region}</div>
                        <div style={{ color: '#64748b', fontSize: '1rem' }}>{percent}% of total campaigns</div>
                        <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '1rem' }}>+{avgEngagement}% engagement rate</div>
                      </>;
                    })()}
                        </div>
                  {/* Top Language */}
                  <div style={{ flex: 1, minWidth: 220, background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px #ff980022', padding: '1.5rem 1.2rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: '1.05rem' }}>Top Language</div>
                    {(() => {
                      if (loading || !campaigns.length) return <div style={{ color: '#64748b' }}>-</div>;
                      const langCounts = campaigns.reduce((acc, c) => {
                        (c.preferredLanguages || []).forEach(l => {
                          acc[l] = (acc[l] || 0) + 1;
                        });
                        return acc;
                      }, {});
                      const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0];
                      if (!topLang) return <div style={{ color: '#64748b' }}>-</div>;
                      const [lang, count] = topLang;
                      const percent = ((count / campaigns.length) * 100).toFixed(1);
                      // Conversion rate for this language
                      const langConversions = campaigns.filter(c => (c.preferredLanguages || []).includes(lang)).reduce((acc, c) => acc + (c.conversions || 0), 0);
                      const avgConversion = (langConversions / count).toFixed(1);
                      return <>
                        <div style={{ color: '#1e293b', fontWeight: 800, fontSize: '1.25rem' }}>{lang}</div>
                        <div style={{ color: '#64748b', fontSize: '1rem' }}>Used in {percent}% of campaigns</div>
                        <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '1rem' }}>Highest conversion rate: {avgConversion}%</div>
                      </>;
                    })()}
                          </div>
                  {/* Average Budget */}
                  <div style={{ flex: 1, minWidth: 220, background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px #ff980022', padding: '1.5rem 1.2rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: '1.05rem' }}>Average Budget</div>
                    {(() => {
                      if (loading || !campaigns.length) return <div style={{ color: '#64748b' }}>-</div>;
                      const avgBudget = (campaigns.reduce((acc, c) => acc + (c.budget || 0), 0) / campaigns.length).toFixed(0);
                      // ROI: (total conversions * value per conversion) / total spend (assume value per conversion = 1000 for demo)
                      const totalConversions = campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);
                      const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
                      const roi = totalSpend > 0 ? ((totalConversions * 1000) / totalSpend).toFixed(2) : 'N/A';
                      return <>
                        <div style={{ color: '#1e293b', fontWeight: 800, fontSize: '1.25rem' }}>₹{Number(avgBudget).toLocaleString()}</div>
                        <div style={{ color: '#64748b', fontSize: '1rem' }}>Per campaign</div>
                        <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '1rem' }}>ROI: {roi}x</div>
                      </>;
                    })()}
                        </div>
                      </div>
              </div>
            )}

            {activeTab === 'deployment' && (
              <div className="deployment-section" style={{ width: '100%' }}>
                <DeploymentCenter campaigns={campaigns} userSocials={settings.socials || {}} onUpdateSocials={handleUpdateSocials} showToast={showToast} />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Toast notification */}
      {showToast.message && (
        <div style={{ position: 'fixed', top: 24, right: 32, zIndex: 9999, minWidth: 280, background: showToast.type === 'success' ? 'linear-gradient(90deg, #10b981 0%, #2563eb 100%)' : showToast.type === 'error' ? '#ef4444' : showToast.type === 'warning' ? '#f59e42' : '#2563eb', color: '#fff', padding: '1rem 2rem', borderRadius: 12, fontWeight: 700, fontSize: '1.08rem', boxShadow: '0 4px 24px rgba(37,99,235,0.13)', transition: 'opacity 0.2s, transform 0.2s', opacity: showToast.message ? 1 : 0, display: 'flex', alignItems: 'center', gap: 14, transform: showToast.message ? 'translateY(0)' : 'translateY(-20px)' }}>
          <span style={{ fontSize: 22, display: 'flex', alignItems: 'center' }}>
            {showToast.type === 'success' && '✅'}
            {showToast.type === 'error' && '❌'}
            {showToast.type === 'warning' && '⚠️'}
            {showToast.type === 'info' && 'ℹ️'}
          </span>
          <span>{showToast.message}</span>
        </div>
      )}
    </>
  );
};

// Wrapped component with error boundary
const CampaignDashboardWithErrorBoundary = (props) => (
  <ErrorBoundary>
    <CampaignDashboard {...props} />
  </ErrorBoundary>
);

export default CampaignDashboardWithErrorBoundary;