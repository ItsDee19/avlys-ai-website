import React from 'react';
import { Rocket, Pause, Play, XCircle, CheckCircle } from 'lucide-react';

export default function DeploymentStatusMonitor({ deployments = [], loading }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #f59e0b11', padding: '1.5rem 1.2rem', marginBottom: 0, width: '100%', boxSizing: 'border-box', minHeight: 120 }}>
      <h3 style={{ fontWeight: 700, fontSize: '1.13rem', marginBottom: 18, color: '#f59e0b', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Rocket size={20} color="#f59e0b" /> Deployment Status
      </h3>
      {loading ? (
        <div style={{ color: '#2563eb', fontWeight: 600, margin: '1.2rem 0', fontSize: '1.08rem' }}>Loading status...</div>
      ) : deployments.length === 0 ? (
        <div style={{ color: '#888', margin: '1.2rem 0', fontWeight: 500 }}>No active deployments.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#334155', fontWeight: 500, fontSize: '1.01rem' }}>
          {deployments.map(dep => (
            <li key={dep.id} style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 18, color: '#334155', background: '#f8fafc', borderRadius: 10, padding: '0.8rem 1.2rem', boxShadow: '0 1px 6px #f59e0b08', fontWeight: 600 }}>
              <span style={{ minWidth: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {dep.status === 'Deploying' && <Rocket size={18} color="#10b981" />}
                {dep.status === 'Paused' && <Pause size={18} color="#f59e0b" />}
                {dep.status === 'Completed' && <CheckCircle size={18} color="#2563eb" />}
                {dep.status === 'Failed' && <XCircle size={18} color="#ef4444" />}
              </span>
              <span style={{ minWidth: 120, fontWeight: 700, color: '#2563eb' }}>{dep.campaign}</span>
              <span style={{ minWidth: 90, fontWeight: 700, color: dep.status === 'Deploying' ? '#10b981' : dep.status === 'Paused' ? '#f59e0b' : dep.status === 'Completed' ? '#2563eb' : '#ef4444', background: dep.status === 'Deploying' ? '#bbf7d0' : dep.status === 'Paused' ? '#fef3c7' : dep.status === 'Completed' ? '#dbeafe' : '#fee2e2', borderRadius: 8, padding: '0.3em 1.1em', fontSize: '0.98rem', display: 'inline-block', textAlign: 'center' }}>{dep.status}</span>
              <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.98rem', marginLeft: 'auto' }}>{dep.platforms?.join(', ')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 