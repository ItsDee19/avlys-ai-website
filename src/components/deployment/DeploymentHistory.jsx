import React from 'react';
import { History, CheckCircle, XCircle } from 'lucide-react';

export default function DeploymentHistory({ history = [], loading }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #64748b11', padding: '1.5rem 1.2rem', marginBottom: 0, width: '100%', boxSizing: 'border-box', minHeight: 120 }}>
      <h3 style={{ fontWeight: 700, fontSize: '1.13rem', marginBottom: 18, color: '#64748b', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <History size={20} color="#64748b" /> Deployment History
      </h3>
      {loading ? (
        <div style={{ color: '#2563eb', fontWeight: 600, margin: '1.2rem 0', fontSize: '1.08rem' }}>Loading history...</div>
      ) : history.length === 0 ? (
        <div style={{ color: '#888', margin: '1.2rem 0', fontWeight: 500 }}>No deployment history yet.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 12, overflow: 'hidden', color: '#334155', fontWeight: 500, fontSize: '1.01rem', boxShadow: '0 1px 6px #64748b08' }}>
          <thead style={{ background: '#f1f5f9', color: '#222' }}>
            <tr>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, fontSize: '1.05rem', borderTopLeftRadius: 12 }}>Campaign</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, fontSize: '1.05rem' }}>Platform</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, fontSize: '1.05rem' }}>Time</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, fontSize: '1.05rem' }}>Status</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, fontSize: '1.05rem', borderTopRightRadius: 12 }}>Metrics</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={idx} style={{ color: '#334155', background: idx % 2 === 0 ? '#f8fafc' : '#fff', transition: 'background 0.18s', cursor: 'pointer' }}>
                <td style={{ padding: '10px 8px', fontWeight: 700 }}>{item.campaign}</td>
                <td style={{ padding: '10px 8px' }}>{item.platform}</td>
                <td style={{ padding: '10px 8px', color: '#64748b', fontWeight: 500 }}>{item.time}</td>
                <td style={{ padding: '10px 8px', fontWeight: 700 }}>
                  {item.status === 'Success' ? (
                    <span style={{ color: '#10b981', background: '#bbf7d0', borderRadius: 8, padding: '0.3em 1.1em', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={16} /> Success
                    </span>
                  ) : (
                    <span style={{ color: '#ef4444', background: '#fee2e2', borderRadius: 8, padding: '0.3em 1.1em', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <XCircle size={16} /> {item.status}
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px 8px', color: '#2563eb', fontWeight: 700 }}>{item.metrics}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 