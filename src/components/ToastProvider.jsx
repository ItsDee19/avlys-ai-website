import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

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

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: '', type: '' });
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 2500);
  }, []);
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={toast.message} type={toast.type} />
    </ToastContext.Provider>
  );
}; 