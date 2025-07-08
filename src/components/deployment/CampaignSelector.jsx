import React, { useState } from 'react';
import { ListChecks, Target, PauseCircle, CheckCircle, FileText, Eye } from 'lucide-react';

const statusColors = {
  active: { bg: '#bbf7d0', color: '#16a34a', label: 'Active', icon: <CheckCircle size={16} color="#16a34a" /> },
  paused: { bg: '#fef3c7', color: '#b45309', label: 'Paused', icon: <PauseCircle size={16} color="#b45309" /> },
  completed: { bg: '#dbeafe', color: '#2563eb', label: 'Completed', icon: <CheckCircle size={16} color="#2563eb" /> },
  draft: { bg: '#fee2e2', color: '#ef4444', label: 'Draft', icon: <FileText size={16} color="#ef4444" /> },
};

const platformColors = {
  facebook: '#1877f2',
  instagram: '#e1306c',
  twitter: '#1da1f2',
  linkedin: '#0a66c2',
  tiktok: '#000',
  youtube: '#ff0000',
};

function getAvatar(campaign) {
  // Use first letter of title or platform icon
  if (campaign.platforms && campaign.platforms.length > 0) {
    const p = campaign.platforms[0].toLowerCase();
    if (p.startsWith('f')) return <span style={{ color: '#1877f2', fontWeight: 900 }}>F</span>;
    if (p.startsWith('i')) return <span style={{ color: '#e1306c', fontWeight: 900 }}>I</span>;
    if (p.startsWith('t')) return <span style={{ color: '#1da1f2', fontWeight: 900 }}>T</span>;
    if (p.startsWith('l')) return <span style={{ color: '#0a66c2', fontWeight: 900 }}>L</span>;
    if (p.startsWith('y')) return <span style={{ color: '#ff0000', fontWeight: 900 }}>Y</span>;
  }
  return <Target size={18} color="#2563eb" />;
}

function formatNumber(n) {
  if (!n) return '-';
  if (n > 999999) return (n / 1000000).toFixed(1) + 'M';
  if (n > 999) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function CampaignSelector({ campaigns = [], selected = [], onChange }) {
  const [search, setSearch] = useState('');
  const filtered = campaigns.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  // Quick view handler (stub)
  const handleQuickView = (campaign, e) => {
    e.stopPropagation();
    alert(`Quick view for: ${campaign.title}`);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #2563eb11', padding: '1.5rem 1.2rem', marginBottom: 0, width: '100%', boxSizing: 'border-box', minHeight: 180 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <ListChecks size={20} color={'#2563eb'} />
        <h3 style={{ fontWeight: 700, fontSize: '1.13rem', color: '#222', margin: 0, letterSpacing: '-0.5px' }}>Select Campaigns</h3>
      </div>
      <input
        type="text"
        placeholder="Search campaigns..."
        style={{ width: '100%', marginBottom: 18, padding: '0.7rem 1rem', borderRadius: 10, border: '1.5px solid #e0e7ff', color: '#222', background: '#f8fafc', fontSize: '1rem', outline: 'none', boxShadow: '0 1px 4px #2563eb08', transition: 'border 0.2s' }}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.length === 0 && <div style={{ color: '#888', padding: '0.7rem 0' }}>No campaigns found.</div>}
        {filtered.map(campaign => {
          const status = statusColors[campaign.status] || statusColors['draft'];
          return (
            <div
              key={campaign.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                background: selected.includes(campaign.id) ? 'linear-gradient(90deg, #2563eb11 0%, #10b98111 100%)' : '#f8fafc',
                borderRadius: 14,
                padding: '1rem 1.1rem',
                boxShadow: selected.includes(campaign.id) ? '0 2px 8px #2563eb22' : '0 1px 4px #2563eb08',
                fontWeight: selected.includes(campaign.id) ? 700 : 500,
                cursor: 'pointer',
                border: selected.includes(campaign.id) ? '2px solid #2563eb' : '1.5px solid #e0e7ff',
                transition: 'box-shadow 0.18s, border 0.18s, background 0.18s',
                minHeight: 90,
                position: 'relative',
              }}
              onClick={() => onChange(campaign.id)}
              onKeyDown={e => { if (e.key === 'Enter') onChange(campaign.id); }}
              tabIndex={0}
              title={campaign.title}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#2563eb', flexShrink: 0 }}>
                  {getAvatar(campaign)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.08rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={campaign.title}>{campaign.title || 'Untitled Campaign'}</div>
                  <div style={{ color: '#64748b', fontWeight: 500, fontSize: '0.98rem', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{campaign.campaignGoal || 'No goal set'}</div>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: status.bg, color: status.color, borderRadius: 8, padding: '0.3em 0.9em', fontWeight: 700, fontSize: '0.98rem', marginLeft: 8 }}>
                  {status.icon} {status.label}
                </span>
                <button
                  title="Quick view"
                  onClick={e => handleQuickView(campaign, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    marginLeft: 8,
                    padding: 4,
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                  tabIndex={-1}
                >
                  <Eye size={18} color="#2563eb" />
                </button>
                <input
                  type="checkbox"
                  checked={selected.includes(campaign.id)}
                  onChange={() => onChange(campaign.id)}
                  style={{ width: 20, height: 20, accentColor: '#2563eb', marginLeft: 10, cursor: 'pointer' }}
                  tabIndex={-1}
                />
              </div>
              {/* Platform chips */}
              <div style={{ display: 'flex', gap: 7, marginTop: 2, flexWrap: 'wrap' }}>
                {(campaign.platforms || []).map((p, idx) => (
                  <span key={idx} style={{ background: platformColors[p.toLowerCase()] || '#e0e7ff', color: '#fff', borderRadius: 7, padding: '0.18em 0.7em', fontWeight: 700, fontSize: '0.93rem', letterSpacing: '0.01em', boxShadow: '0 1px 4px #2563eb08' }}>{p}</span>
                ))}
              </div>
              {/* Metrics row */}
              <div style={{ display: 'flex', gap: 18, marginTop: 6, color: '#64748b', fontWeight: 600, fontSize: '0.97rem', flexWrap: 'wrap' }}>
                <span title="Reach">👁️ {formatNumber(campaign.reach)}</span>
                <span title="Engagement">💬 {campaign.engagement ? campaign.engagement + '%' : '-'}</span>
                <span title="Budget">💰 {campaign.budget ? `₹${formatNumber(campaign.budget)}` : '-'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 