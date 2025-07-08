import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { scheduleDeployment, getDeploymentStatus, getDeploymentHistory } from '../../utils/deploymentApi';
import CampaignSelector from './CampaignSelector';
import DeploymentPreview from './DeploymentPreview';
import DeploymentStatusMonitor from './DeploymentStatusMonitor';
import DeploymentHistory from './DeploymentHistory';
import { Rocket, ListChecks, Eye, History, CheckCircle } from 'lucide-react';
import AuthUtils from '../../utils/authUtils';

export default function DeploymentCenter({ campaigns = [], userSocials = {}, onUpdateSocials, showToast }) {
  const { user } = useAuth();
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [history, setHistory] = useState([]);
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const pollingIntervalRef = useRef(null);

  // Fetch deployment status
  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const data = await getDeploymentStatus();
      setDeployments(data.deployments || []);
    } catch {
      setDeployments([]);
    } finally {
      setStatusLoading(false);
    }
  };

  // Fetch deployment history
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getDeploymentHistory();
      setHistory(data.history || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Helper to check for active deployments
  const hasActiveDeployments = deployments.some(
    d => !['completed', 'failed', 'cancelled'].includes((d.status || '').toLowerCase())
  );

  // Poll both status and history
  const poll = async () => {
    await fetchStatus();
    await fetchHistory();
  };

  // Helper to start polling
  const startPolling = () => {
    if (pollingIntervalRef.current) return;
    pollingIntervalRef.current = setInterval(poll, 30000);
  };

  // Helper to stop polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // On mount, fetch once and start polling if needed
  useEffect(() => {
    poll();
    return () => stopPolling();
  }, []);

  // Watch deployments: start/stop polling as needed
  useEffect(() => {
    if (hasActiveDeployments) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [hasActiveDeployments]);

  // Manual refresh button handler
  const handleManualRefresh = () => {
    poll();
  };

  const handleCampaignSelect = (id) => {
    setSelectedCampaigns((prev) =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handlePlatformSelect = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setDeployError('');
    try {
      await scheduleDeployment({ campaignIds: selectedCampaigns, platforms: selectedPlatforms });
      await fetchStatus();
      await fetchHistory();
      setActiveStep(3);
    } catch (err) {
      setDeployError(err.message || 'Failed to deploy');
    } finally {
      setDeploying(false);
    }
  };

  // Placeholder for backend sync
  const syncSocialToBackend = async (platform, value) => {
    try {
      // Merge the new value into socials
      const socials = { ...userSocials, [platform.toLowerCase()]: value };
      const res = await AuthUtils.authenticatedFetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socials }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update profile');
      }
      if (showToast) showToast(`${platform} account synced to backend!`, 'success');
      return await res.json();
    } catch (err) {
      if (showToast) showToast('Failed to sync with backend. Please try again.', 'error');
      throw err;
    }
  };

  // Handler for connecting a social account from the modal
  const handleConnectSocial = async (platform, value) => {
    if (onUpdateSocials) {
      onUpdateSocials(platform, value);
      try {
        await syncSocialToBackend(platform, value);
      } catch (err) {
        if (showToast) showToast('Failed to sync with backend. Please try again.', 'error');
      }
    }
  };

  // Stepper UI
  const steps = [
    { label: 'Select Campaigns', icon: <ListChecks size={22} /> },
    { label: 'Preview & Platforms', icon: <Eye size={22} /> },
    { label: 'Deployment Status', icon: <Rocket size={22} /> },
    { label: 'Deployment History', icon: <History size={22} /> },
  ];

  // Add helper for step navigation
  const canGoNextFromStep1 = selectedCampaigns.length > 0;
  const canGoNextFromStep2 = selectedCampaigns.length > 0 && selectedPlatforms.length > 0 && Object.values(userSocials).filter(Boolean).length > 0;

  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: '2.5rem 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem',
      fontFamily: 'Inter, Arial, sans-serif',
      background: 'linear-gradient(135deg, #f8fafc 80%, #e0e7ff 100%)',
      borderRadius: 32,
      boxShadow: '0 8px 40px rgba(37,99,235,0.10)',
      border: '1.5px solid #e0e7ff',
      minHeight: 600,
      position: 'relative',
    }}>
      {/* Manual Refresh Button */}
      <button onClick={handleManualRefresh} style={{ marginBottom: 16, alignSelf: 'flex-end', background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)', color: '#fff', border: 'none', borderRadius: 999, padding: '0.6rem 1.8rem', fontWeight: 700, fontSize: '1.02rem', boxShadow: '0 2px 8px #2563eb22', cursor: 'pointer', outline: 'none' }}>Refresh</button>
      {/* Modern Stepper */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
        marginBottom: 32,
        marginTop: 8,
        position: 'relative',
        zIndex: 2,
      }}>
        {steps.map((step, idx) => (
          <div key={step.label} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            minWidth: 110,
          }}>
            <div style={{
              background: activeStep === idx + 1 ? 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)' : '#e0e7ff',
              color: activeStep === idx + 1 ? '#fff' : '#64748b',
              borderRadius: '50%',
              width: 54,
              height: 54,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 26,
              boxShadow: activeStep === idx + 1 ? '0 4px 16px #2563eb33' : 'none',
              border: activeStep === idx + 1 ? '3px solid #10b981' : '2px solid #e0e7ff',
              transition: 'all 0.2s',
              zIndex: 2,
              marginBottom: 8,
            }}>{step.icon}</div>
            <div style={{
              marginTop: 6,
              fontWeight: 800,
              fontSize: '1.13rem',
              color: activeStep === idx + 1 ? '#2563eb' : '#64748b',
              textAlign: 'center',
              letterSpacing: '-0.5px',
              textShadow: activeStep === idx + 1 ? '0 2px 8px #2563eb22' : 'none',
            }}>{step.label}</div>
            {idx < steps.length - 1 && (
              <div style={{
                position: 'absolute',
                top: 27,
                left: 54,
                width: 60,
                height: 5,
                background: activeStep > idx + 1 ? 'linear-gradient(90deg, #10b981 0%, #2563eb 100%)' : '#e0e7ff',
                zIndex: 1,
                borderRadius: 3,
                boxShadow: activeStep > idx + 1 ? '0 2px 8px #10b98122' : 'none',
                transition: 'background 0.2s',
              }} />
            )}
          </div>
        ))}
      </div>
      {/* Step 1: Select Campaigns */}
      <section style={{
        background: 'linear-gradient(135deg, #fff 60%, #f1f5f9 100%)',
        borderRadius: 24,
        boxShadow: '0 4px 24px rgba(37,99,235,0.10)',
        padding: '2.5rem 2.2rem 2rem 2.2rem',
        marginBottom: 8,
        transition: 'box-shadow 0.2s',
        border: activeStep === 1 ? '2.5px solid #2563eb' : 'none',
        minHeight: 220,
        display: activeStep === 1 ? 'block' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <ListChecks size={22} color={activeStep === 1 ? '#2563eb' : '#64748b'} />
          <h2 style={{ color: '#222', fontWeight: 800, fontSize: '1.35rem', margin: 0, letterSpacing: '-0.5px' }}>1. Select Campaigns</h2>
        </div>
        <div style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: 12 }}>Choose one or more campaigns to deploy. You can compare and deploy multiple at once.</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 22,
          marginTop: 10,
        }}>
          {campaigns.length === 0 && <div style={{ color: '#888', padding: '0.7rem 0' }}>No campaigns found.</div>}
          {campaigns.map(campaign => {
            const selected = selectedCampaigns.includes(campaign.id);
            return (
              <div
                key={campaign.id}
                style={{
                  background: selected ? 'linear-gradient(90deg, #2563eb11 0%, #10b98111 100%)' : '#f8fafc',
                  borderRadius: 16,
                  boxShadow: selected ? '0 2px 12px #2563eb22' : '0 1px 4px #2563eb08',
                  border: selected ? '2.5px solid #2563eb' : '1.5px solid #e0e7ff',
                  padding: '1.3rem 1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.18s, border 0.18s, background 0.18s',
                  minHeight: 120,
                  position: 'relative',
                  outline: selected ? '2px solid #2563eb' : 'none',
                }}
                onClick={() => handleCampaignSelect(campaign.id)}
                onKeyDown={e => { if (e.key === 'Enter') handleCampaignSelect(campaign.id); }}
                tabIndex={0}
                title={campaign.title}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#2563eb', flexShrink: 0, boxShadow: '0 1px 4px #2563eb11' }}>
                    {campaign.title ? campaign.title[0].toUpperCase() : <ListChecks size={22} color="#2563eb" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#1e293b', fontWeight: 800, fontSize: '1.13rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={campaign.title}>{campaign.title || 'Untitled Campaign'}</div>
                    <div style={{ color: '#64748b', fontWeight: 500, fontSize: '0.98rem', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{campaign.campaignGoal || 'No goal set'}</div>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: selected ? '#bbf7d0' : '#e0e7ff', color: selected ? '#16a34a' : '#2563eb', borderRadius: 8, padding: '0.3em 0.9em', fontWeight: 700, fontSize: '0.98rem', marginLeft: 8 }}>
                    {selected ? 'Selected' : 'Select'}
                  </span>
                </div>
                {/* Platform chips */}
                <div style={{ display: 'flex', gap: 7, marginTop: 2, flexWrap: 'wrap' }}>
                  {(campaign.platforms || []).map((p, idx) => (
                    <span key={idx} style={{ background: '#2563eb', color: '#fff', borderRadius: 7, padding: '0.18em 0.7em', fontWeight: 700, fontSize: '0.93rem', letterSpacing: '0.01em', boxShadow: '0 1px 4px #2563eb08' }}>{p}</span>
                  ))}
                </div>
                {/* Metrics row */}
                <div style={{ display: 'flex', gap: 18, marginTop: 6, color: '#64748b', fontWeight: 600, fontSize: '0.97rem', flexWrap: 'wrap' }}>
                  <span title="Reach">👁️ {campaign.reach ? campaign.reach.toLocaleString() : '-'}</span>
                  <span title="Engagement">💬 {campaign.engagement ? campaign.engagement + '%' : '-'}</span>
                  <span title="Budget">💰 {campaign.budget ? `₹${campaign.budget.toLocaleString()}` : '-'}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            onClick={() => setActiveStep(2)}
            disabled={!canGoNextFromStep1}
            style={{
              background: canGoNextFromStep1 ? 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)' : '#e5e7eb',
              color: canGoNextFromStep1 ? '#fff' : '#888',
              border: 'none',
              borderRadius: 999,
              padding: '0.9rem 2.5rem',
              fontWeight: 800,
              fontSize: '1.13rem',
              boxShadow: canGoNextFromStep1 ? '0 2px 8px #2563eb22' : 'none',
              cursor: canGoNextFromStep1 ? 'pointer' : 'not-allowed',
              opacity: canGoNextFromStep1 ? 1 : 0.7,
              transition: 'background 0.2s, color 0.2s',
              outline: 'none',
            }}
          >
            Next
          </button>
        </div>
      </section>
      {/* Step 2: Preview & Platforms */}
      <section style={{
        background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
        borderRadius: 24,
        boxShadow: '0 4px 24px rgba(16,185,129,0.10)',
        padding: '2.5rem 2.2rem 2rem 2.2rem',
        marginBottom: 8,
        transition: 'box-shadow 0.2s',
        border: activeStep === 2 ? '2.5px solid #10b981' : 'none',
        minHeight: 220,
        display: activeStep === 2 ? 'block' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <Eye size={22} color={activeStep === 2 ? '#10b981' : '#64748b'} />
          <h2 style={{ color: '#222', fontWeight: 800, fontSize: '1.35rem', margin: 0, letterSpacing: '-0.5px' }}>2. Preview & Platforms</h2>
        </div>
        <div style={{ color: '#64748b', fontSize: '1.08rem', marginBottom: 18, fontWeight: 500 }}>Review your selected campaigns and choose the platforms for deployment. Connect your social accounts for a seamless experience.</div>
        {/* Selected Campaigns Card Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
          marginBottom: 28,
          padding: '0.5rem 0',
        }}>
          {selectedCampaigns.length === 0 ? (
            <div style={{ color: '#888', fontWeight: 600 }}>No campaigns selected.</div>
          ) : (
            selectedCampaigns.map((cid, idx) => {
              const c = campaigns.find(c => c.id === cid);
              const status = c?.status || 'Draft';
              const statusColors = {
                Active: { bg: 'rgba(16,185,129,0.13)', color: '#10b981' },
                Draft: { bg: 'rgba(239,68,68,0.13)', color: '#ef4444' },
                Paused: { bg: 'rgba(245,158,11,0.13)', color: '#f59e0b' },
                Completed: { bg: 'rgba(37,99,235,0.13)', color: '#2563eb' },
              };
              const statusStyle = statusColors[status] || statusColors['Draft'];
              return (
                <div
                  key={cid}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 70%, #e0e7ff 100%)',
                    borderRadius: 20,
                    boxShadow: '0 8px 32px 0 rgba(31,41,55,0.10)',
                    padding: '1.3rem 1.4rem 1.1rem 1.4rem',
                    minHeight: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    alignItems: 'flex-start',
                    border: '2.5px solid #e0e7ff',
                    position: 'relative',
                    backdropFilter: 'blur(8px)',
                    transition: 'box-shadow 0.22s, border 0.22s, transform 0.22s, opacity 0.5s',
                    overflow: 'hidden',
                    opacity: 0,
                    animation: `fadeInCard 0.7s ${0.1 + idx * 0.08}s forwards`,
                  }}
                  tabIndex={0}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 12px 32px 0 rgba(37,99,235,0.13)'; e.currentTarget.style.transform = 'scale(1.025)'; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31,41,55,0.10)'; e.currentTarget.style.transform = 'scale(1)'; }}
                  onFocus={e => { e.currentTarget.style.outline = '3px solid #2563eb'; e.currentTarget.style.background = '#f1f5f9'; }}
                  onBlur={e => { e.currentTarget.style.outline = 'none'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.85) 70%, #e0e7ff 100%)'; }}
                >
                  {/* Status badge */}
                  <span style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    borderRadius: 8,
                    padding: '0.3em 0.9em',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    zIndex: 2,
                    boxShadow: '0 1px 4px #2563eb08',
                  }}>{status}</span>
                  {/* Avatar + Title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: c?.avatarUrl ? 'none' : '#e0e7ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      fontWeight: 900,
                      color: '#2563eb',
                      boxShadow: '0 1px 4px #2563eb11',
                      overflow: 'hidden',
                    }}>
                      {c?.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        c?.title ? c.title[0].toUpperCase() : <CheckCircle size={22} color="#10b981" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#1e293b', fontWeight: 800, fontSize: '1.13rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c?.title}>{c?.title || 'Untitled'}</div>
                      <div style={{ color: '#64748b', fontWeight: 500, fontSize: '0.98rem', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c?.campaignGoal || 'No goal set'}</div>
                    </div>
                    {/* View Details button */}
                    <button
                      title="View Details"
                      style={{
                        background: 'rgba(37,99,235,0.08)',
                        border: 'none',
                        borderRadius: 8,
                        padding: 6,
                        marginLeft: 8,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      tabIndex={-1}
                      onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(37,99,235,0.08)'}
                    >
                      <Eye size={18} color="#2563eb" />
                    </button>
                  </div>
                  {/* Metrics row */}
                  <div style={{ display: 'flex', gap: 18, marginTop: 6, color: '#64748b', fontWeight: 600, fontSize: '0.97rem', flexWrap: 'wrap' }}>
                    <span title="Reach">👁️ {c?.reach ? c.reach.toLocaleString() : '-'}</span>
                    <span title="Engagement">💬 {c?.engagement ? c.engagement + '%' : '-'}</span>
                    <span title="Budget">💰 {c?.budget ? `₹${c.budget.toLocaleString()}` : '-'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Platform Selection Pill Group */}
        <div style={{ marginBottom: 24, color: '#334155', width: '100%' }}>
          <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8, fontSize: '1.08rem' }}>Platforms</div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
            {[
              { name: 'Facebook', icon: <span style={{ color: '#1877f2', fontWeight: 900, fontSize: 22 }}>📘</span> },
              { name: 'Instagram', icon: <span style={{ color: '#e1306c', fontWeight: 900, fontSize: 22 }}>📸</span> },
              { name: 'Twitter', icon: <span style={{ color: '#1da1f2', fontWeight: 900, fontSize: 22 }}>🐦</span> },
              { name: 'LinkedIn', icon: <span style={{ color: '#0a66c2', fontWeight: 900, fontSize: 22 }}>💼</span> },
              { name: 'TikTok', icon: <span style={{ color: '#000', fontWeight: 900, fontSize: 22 }}>🎵</span> },
              { name: 'YouTube', icon: <span style={{ color: '#ff0000', fontWeight: 900, fontSize: 22 }}>▶️</span> },
            ].map((platformObj, idx) => {
              const platform = platformObj.name;
              const isConnected = !!userSocials[platform.toLowerCase()];
              const isSelected = selectedPlatforms.includes(platform);
              return (
                <div key={platform} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 140 }}>
                  <button
                    type="button"
                    onClick={() => isConnected ? handlePlatformSelect(platform) : handleConnectSocial(platform, '')}
                    disabled={deploying}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: isSelected && isConnected
                        ? 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)'
                        : isConnected ? '#f1f5f9' : '#fee2e2',
                      color: isSelected && isConnected ? '#fff' : isConnected ? '#2563eb' : '#ef4444',
                      border: isSelected && isConnected ? '2.5px solid #10b981' : '2px solid #e0e7ff',
                      borderRadius: 999,
                      padding: '1.1rem 2.1rem',
                      fontWeight: 700,
                      fontSize: '1.08rem',
                      boxShadow: isSelected && isConnected ? '0 4px 16px #10b98133' : '0 1px 4px #2563eb08',
                      cursor: deploying ? 'not-allowed' : isConnected ? 'pointer' : 'pointer',
                      opacity: deploying ? 0.7 : isConnected ? 1 : 0.7,
                      transition: 'background 0.22s, color 0.22s, border 0.22s, box-shadow 0.22s, transform 0.22s',
                      outline: isSelected ? '3px solid #10b981' : 'none',
                      position: 'relative',
                      minWidth: 120,
                      marginBottom: 6,
                      boxSizing: 'border-box',
                      animation: `fadeInPill 0.7s ${0.2 + idx * 0.08}s forwards`,
                    }}
                    title={isConnected ? `Click to ${isSelected ? 'deselect' : 'select'} ${platform}` : 'Connect this account to enable deployment'}
                    tabIndex={0}
                    onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px #10b98155'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                    onBlur={e => { e.currentTarget.style.boxShadow = isSelected && isConnected ? '0 4px 16px #10b98133' : '0 1px 4px #2563eb08'; e.currentTarget.style.transform = 'scale(1)'; }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    {platformObj.icon}
                    <span style={{ fontWeight: 800, fontSize: '1.08rem', marginLeft: 8 }}>{platform}</span>
                    {isConnected ? (
                      isSelected ? (
                        <span style={{ marginLeft: 10, color: '#fff', fontWeight: 900, fontSize: 18 }} title="Connected and selected">✔</span>
                      ) : (
                        <span style={{ marginLeft: 10, color: '#10b981', fontWeight: 900, fontSize: 18 }} title="Connected">✔</span>
                      )
                    ) : (
                      <span style={{ marginLeft: 10, color: '#ef4444', fontWeight: 900, fontSize: 18 }} title="Not connected">✖</span>
                    )}
                  </button>
                  {!isConnected && (
                    <button
                      type="button"
                      onClick={() => handleConnectSocial(platform, '')}
                      style={{
                        marginTop: 2,
                        background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 999,
                        padding: '0.4rem 1.2rem',
                        fontWeight: 700,
                        fontSize: '0.97rem',
                        boxShadow: '0 1px 4px #ef444422',
                        cursor: 'pointer',
                        opacity: 1,
                        transition: 'background 0.18s, color 0.18s',
                        outline: 'none',
                        minWidth: 90,
                      }}
                      title={`Connect your ${platform} account`}
                    >
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Deploy Summary Card */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0.85) 60%, #e0e7ff 100%)',
          borderRadius: 22,
          boxShadow: '0 8px 32px 0 rgba(16,185,129,0.13)',
          padding: '2.1rem 1.7rem',
          marginBottom: 0,
          width: '100%',
          boxSizing: 'border-box',
          minHeight: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 18,
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(8px)',
          transition: 'box-shadow 0.22s, opacity 0.5s',
          opacity: 0,
          animation: 'fadeInSummary 0.8s 0.4s forwards',
        }}>
          {/* Animated Progress Bar */}
          <div style={{ width: '100%', marginBottom: 10 }}>
            <div style={{ height: 10, background: '#e0e7ff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px #10b98111' }}>
              <div style={{
                width: `${Math.round(((selectedPlatforms.length > 0 ? 1 : 0) + (selectedCampaigns.length > 0 ? 1 : 0) + (Object.values(userSocials).filter(Boolean).length > 0 ? 1 : 0)) / 3 * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)',
                borderRadius: 8,
                transition: 'width 0.5s',
              }}></div>
            </div>
          </div>
          {/* Checklist */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1.08rem', color: selectedCampaigns.length > 0 ? '#10b981' : '#64748b', transition: 'color 0.2s' }}>
              <span style={{ fontSize: 22 }}>{selectedCampaigns.length > 0 ? '✅' : '⬜'}</span> Campaign selected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1.08rem', color: selectedPlatforms.length > 0 ? '#10b981' : '#64748b', transition: 'color 0.2s' }}>
              <span style={{ fontSize: 22 }}>{selectedPlatforms.length > 0 ? '✅' : '⬜'}</span> Platform selected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1.08rem', color: Object.values(userSocials).filter(Boolean).length > 0 ? '#10b981' : '#64748b', transition: 'color 0.2s' }}>
              <span style={{ fontSize: 22 }}>{Object.values(userSocials).filter(Boolean).length > 0 ? '✅' : '⬜'}</span> Account connected
            </div>
          </div>
          {/* Summary and Deploy Button Row */}
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginTop: 8 }}>
            <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '1.18rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Rocket size={24} color="#10b981" style={{ filter: 'drop-shadow(0 2px 8px #10b98122)' }} />
              <span><span style={{ color: '#10b981', fontWeight: 900 }}>{selectedCampaigns.length}</span> campaign(s) will be deployed to <span style={{ color: '#10b981', fontWeight: 900 }}>{selectedPlatforms.length}</span> platform(s).</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setActiveStep(1)}
                style={{
                  background: '#e5e7eb',
                  color: '#2563eb',
                  border: 'none',
                  borderRadius: 999,
                  padding: '0.9rem 2.5rem',
                  fontWeight: 800,
                  fontSize: '1.13rem',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  opacity: 1,
                  transition: 'background 0.2s, color 0.2s',
                  outline: 'none',
                }}
              >
                Back
              </button>
              <button
                style={{
                  padding: '1.1rem 2.8rem',
                  borderRadius: 999,
                  background: canGoNextFromStep2 ? 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)' : '#e5e7eb',
                  color: canGoNextFromStep2 ? '#fff' : '#888',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '1.18rem',
                  boxShadow: canGoNextFromStep2 ? '0 4px 16px #10b98133' : 'none',
                  cursor: canGoNextFromStep2 ? 'pointer' : 'not-allowed',
                  opacity: canGoNextFromStep2 ? 1 : 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'background 0.2s, color 0.2s',
                  outline: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                disabled={!canGoNextFromStep2}
                onClick={() => setActiveStep(3)}
              >
                {deploying && <span className="spinner" style={{ width: 24, height: 24, border: '3px solid #fff', borderTop: '3px solid #10b981', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>}
                <Rocket size={22} style={{ marginBottom: 2 }} /> Deploy
              </button>
            </div>
          </div>
        </div>
        {/* Add keyframes for fade-in animations */}
        <style>{`
        @keyframes fadeInCard { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
        @keyframes fadeInPill { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeInSummary { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: none; } }
        `}</style>
      </section>
      {/* Step 3: Deployment Status */}
      <section style={{
        background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
        borderRadius: 24,
        boxShadow: '0 4px 24px rgba(37,99,235,0.10)',
        padding: '2.5rem 2.2rem 2rem 2.2rem',
        marginBottom: 8,
        transition: 'box-shadow 0.2s',
        border: activeStep === 3 ? '2.5px solid #2563eb' : 'none',
        minHeight: 220,
        display: activeStep === 3 ? 'block' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <Rocket size={22} color={activeStep === 3 ? '#2563eb' : '#64748b'} />
          <h2 style={{ color: '#222', fontWeight: 800, fontSize: '1.35rem', margin: 0, letterSpacing: '-0.5px' }}>3. Deployment Status</h2>
        </div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #2563eb11', padding: '1.7rem 1.3rem', minHeight: 120 }}>
          <DeploymentStatusMonitor deployments={deployments} loading={statusLoading} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            onClick={() => setActiveStep(2)}
            style={{
              background: '#e5e7eb',
              color: '#2563eb',
              border: 'none',
              borderRadius: 999,
              padding: '0.9rem 2.5rem',
              fontWeight: 800,
              fontSize: '1.13rem',
              boxShadow: 'none',
              cursor: 'pointer',
              opacity: 1,
              transition: 'background 0.2s, color 0.2s',
              outline: 'none',
            }}
          >
            Back
          </button>
          <button
            onClick={() => setActiveStep(4)}
            style={{
              background: 'linear-gradient(90deg, #a21caf 0%, #8b5cf6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '0.9rem 2.5rem',
              fontWeight: 800,
              fontSize: '1.13rem',
              boxShadow: '0 2px 8px #a21caf22',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
              outline: 'none',
              marginLeft: 12,
            }}
          >
            View History
          </button>
        </div>
      </section>
      {/* Step 4: Deployment History */}
      <section style={{
        background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
        borderRadius: 24,
        boxShadow: '0 4px 24px rgba(100,116,139,0.10)',
        padding: '2.5rem 2.2rem 2rem 2.2rem',
        marginBottom: 8,
        transition: 'box-shadow 0.2s',
        border: activeStep === 4 ? '2.5px solid #64748b' : 'none',
        minHeight: 220,
        display: activeStep === 4 ? 'block' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <History size={22} color={activeStep === 4 ? '#64748b' : '#cbd5e1'} />
          <h2 style={{ color: '#222', fontWeight: 800, fontSize: '1.35rem', margin: 0, letterSpacing: '-0.5px' }}>4. Deployment History</h2>
        </div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #64748b11', padding: '1.7rem 1.3rem', minHeight: 120 }}>
          <DeploymentHistory history={history} loading={historyLoading} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            onClick={() => setActiveStep(1)}
            style={{
              background: '#e5e7eb',
              color: '#2563eb',
              border: 'none',
              borderRadius: 999,
              padding: '0.9rem 2.5rem',
              fontWeight: 800,
              fontSize: '1.13rem',
              boxShadow: 'none',
              cursor: 'pointer',
              opacity: 1,
              transition: 'background 0.2s, color 0.2s',
              outline: 'none',
            }}
          >
            Start Over
          </button>
        </div>
      </section>
    </div>
  );
} 