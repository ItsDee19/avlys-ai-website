import React, { useState } from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, CheckCircle, Rocket, Info, X } from 'lucide-react';

const PLATFORMS = [
  { name: 'Facebook', icon: <Facebook size={18} color="#1877f2" /> },
  { name: 'Instagram', icon: <Instagram size={18} color="#e1306c" /> },
  { name: 'Twitter', icon: <Twitter size={18} color="#1da1f2" /> },
  { name: 'LinkedIn', icon: <Linkedin size={18} color="#0a66c2" /> },
  { name: 'TikTok', icon: <Youtube size={18} color="#000" /> }, // TikTok icon fallback
  { name: 'YouTube', icon: <Youtube size={18} color="#ff0000" /> },
];

export default function DeploymentPreview({ selectedCampaigns = [], campaigns = [], selectedPlatforms = [], onPlatformChange, onDeploy, deploying, deployError, userSocials = {}, onConnectSocial, showToast }) {
  const [localError, setLocalError] = useState('');
  const [connectModal, setConnectModal] = useState({ open: false, platform: null, value: '' });
  const selectedCampaignObjs = campaigns.filter(c => selectedCampaigns.includes(c.id));
  // Only allow deploy if all selected platforms are connected
  const canDeploy = selectedCampaignObjs.length > 0 && selectedPlatforms.length > 0 && !deploying && selectedPlatforms.every(p => userSocials[p.toLowerCase()]);

  // Socials summary
  const socialsList = PLATFORMS.map(p => ({
    ...p,
    value: userSocials[p.name.toLowerCase()] || ''
  }));
  const hasAnySocial = socialsList.some(s => s.value);

  // Handle deploy click
  const handleDeployClick = () => {
    if (!selectedPlatforms || selectedPlatforms.length === 0) {
      if (showToast) showToast('Please select at least one platform to deploy.', 'error');
      return;
    }
    if (onDeploy) {
      onDeploy();
      if (showToast) showToast('Deployment started!', 'success');
    }
  };

  // Handle connect modal open
  const openConnectModal = (platform) => {
    setConnectModal({ open: true, platform, value: userSocials[platform.toLowerCase()] || '' });
  };
  const closeConnectModal = () => setConnectModal({ open: false, platform: null, value: '' });
  const handleConnect = () => {
    if (!connectModal.value) {
      setLocalError('Please enter your account/handle.');
      if (showToast) showToast('Please enter your account/handle.', 'error');
      return;
    }
    if (onConnectSocial) {
      onConnectSocial(connectModal.platform, connectModal.value);
      setConnectModal({ open: false, platform: null, value: '' });
      if (showToast) showToast(`${connectModal.platform} account connected!`, 'success');
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #10b98111', padding: '1.7rem 1.3rem', marginBottom: 0, width: '100%', boxSizing: 'border-box', minHeight: 180, position: 'relative' }}>
      <h3 style={{ fontWeight: 700, fontSize: '1.13rem', marginBottom: 18, color: '#10b981', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Rocket size={20} color="#10b981" /> Deployment Preview
      </h3>
      {/* Socials summary */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 6 }}>Connected Social Accounts</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {socialsList.map(s => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, background: s.value ? '#e0e7ff' : '#fee2e2', color: s.value ? '#2563eb' : '#ef4444', borderRadius: 8, padding: '0.3em 1.1em', fontWeight: 600, fontSize: '0.98rem', minWidth: 120, justifyContent: 'center' }}>
              {s.icon} {s.name}
              {s.value ? <span style={{ color: '#10b981', marginLeft: 6, fontWeight: 700 }}>Connected</span> : <span style={{ color: '#ef4444', marginLeft: 6, fontWeight: 700 }}>Not Connected</span>}
            </div>
          ))}
        </div>
        {!hasAnySocial && (
          <div style={{ color: '#ef4444', marginTop: 10, fontWeight: 600, fontSize: '1.01rem' }}>
            No social accounts connected. Please add your social media accounts in <span style={{ color: '#2563eb', textDecoration: 'underline', cursor: 'pointer' }}>Settings</span> to enable deployment.
          </div>
        )}
      </div>
      {/* Selected Campaigns Summary */}
      <div style={{ marginBottom: 18, color: '#334155', background: '#f8fafc', borderRadius: 12, padding: '1rem 1.2rem', boxShadow: '0 1px 6px #10b98108', fontWeight: 600, fontSize: '1.05rem' }}>
        <strong style={{ color: '#2563eb' }}>Selected Campaigns:</strong>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#334155', fontWeight: 500, fontSize: '1.01rem', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {selectedCampaignObjs.length === 0 ? <li style={{ color: '#888' }}>No campaigns selected.</li> : selectedCampaignObjs.map(c => (
            <li key={c.id} style={{ background: '#e0e7ff', color: '#2563eb', borderRadius: 8, padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              <CheckCircle size={16} color="#10b981" /> {c.title || 'Untitled Campaign'}
            </li>
          ))}
        </ul>
      </div>
      {/* Platform Selection */}
      <div style={{ marginBottom: 18, color: '#334155' }}>
        <strong style={{ color: '#10b981' }}>Platforms:</strong>
        <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
          {PLATFORMS.map(platform => {
            const isConnected = !!userSocials[platform.name.toLowerCase()];
            const isSelected = selectedPlatforms.includes(platform.name);
            return (
              <button
                key={platform.name}
                type="button"
                onClick={() => isConnected ? onPlatformChange(platform.name) : openConnectModal(platform.name)}
                disabled={deploying}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  background: isSelected && isConnected
                    ? 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)'
                    : '#f1f5f9',
                  color: isSelected && isConnected ? '#fff' : isConnected ? '#2563eb' : '#ef4444',
                  border: 'none',
                  borderRadius: 999,
                  padding: '0.6rem 1.3rem',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: isSelected && isConnected ? '0 2px 8px #10b98122' : 'none',
                  cursor: deploying ? 'not-allowed' : isConnected ? 'pointer' : 'pointer',
                  opacity: deploying ? 0.7 : isConnected ? 1 : 0.7,
                  transition: 'background 0.18s, color 0.18s',
                  outline: 'none',
                  position: 'relative',
                }}
                title={isConnected ? '' : 'Connect this account to enable deployment'}
              >
                {platform.icon} {platform.name}
                {!isConnected && <Info size={16} style={{ marginLeft: 4 }} />}
              </button>
            );
          })}
        </div>
      </div>
      {/* Deploy Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <button
          style={{
            padding: '0.9rem 2.5rem',
            borderRadius: 999,
            background: canDeploy ? 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)' : '#e5e7eb',
            color: canDeploy ? '#fff' : '#888',
            border: 'none',
            fontWeight: 800,
            fontSize: '1.13rem',
            boxShadow: canDeploy ? '0 2px 8px #10b98122' : 'none',
            cursor: canDeploy ? 'pointer' : 'not-allowed',
            opacity: canDeploy ? 1 : 0.7,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'background 0.2s, color 0.2s',
            outline: 'none',
          }}
          disabled={!canDeploy}
          onClick={handleDeployClick}
        >
          {deploying && <span className="spinner" style={{ width: 22, height: 22, border: '3px solid #fff', borderTop: '3px solid #10b981', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>}
          <Rocket size={20} style={{ marginBottom: 2 }} /> Deploy
        </button>
      </div>
      {(deployError || localError) && <div style={{ color: '#ef4444', marginTop: 14, fontWeight: 600, fontSize: '1.05rem' }}>{deployError || localError}</div>}

      {/* Connect Social Modal */}
      {connectModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 40px rgba(37,99,235,0.13)', padding: '2rem 2.5rem', minWidth: 320, minHeight: 120, position: 'relative' }}>
            <button onClick={closeConnectModal} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}><X size={22} /></button>
            <h2 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 16, color: '#2563eb' }}>Connect {connectModal.platform}</h2>
            <input
              type="text"
              placeholder={`Enter your ${connectModal.platform} username or URL`}
              value={connectModal.value}
              onChange={e => setConnectModal(m => ({ ...m, value: e.target.value }))}
              style={{ width: '100%', marginBottom: 18, padding: '0.7rem 1rem', borderRadius: 10, border: '1.5px solid #e0e7ff', color: '#222', background: '#f8fafc', fontSize: '1rem', outline: 'none', boxShadow: '0 1px 4px #2563eb08', transition: 'border 0.2s' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={closeConnectModal} style={{ background: '#e5e7eb', color: '#2563eb', border: 'none', borderRadius: 999, padding: '0.7rem 2.2rem', fontWeight: 700, fontSize: '1.08rem', cursor: 'pointer', transition: 'background 0.2s, color 0.2s', outline: 'none' }}>Cancel</button>
              <button onClick={handleConnect} style={{ background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)', color: '#fff', border: 'none', borderRadius: 999, padding: '0.7rem 2.2rem', fontWeight: 700, fontSize: '1.08rem', cursor: 'pointer', transition: 'background 0.2s, color 0.2s', outline: 'none' }} disabled={!connectModal.value}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 