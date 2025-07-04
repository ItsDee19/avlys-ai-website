import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header({ onLogout, user, onUserClick, onSwitchAccount }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Add fadeIn animation CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'header-dropdown-style';
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: currentColor;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
      }
      
      .header-dropdown-hover:hover {
        background-color: #f1f5f9;
      }
      
      button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('header-dropdown-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  // Function to handle scrolling to section when Use Cases is clicked
  const scrollToUseCases = (e) => {
    e.preventDefault();
    setMobileNavOpen(false);
    const useCasesSection = document.getElementById('use-cases');
    if (useCasesSection) {
      useCasesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on home page, navigate to home then scroll
      window.location.href = '/#use-cases';
    }
  };

  // Detect if on dashboard route
  const isDashboard = location.pathname.startsWith('/dashboard');

  // Show dropdown if user is present (robust fallback)
  const showUserDropdown = (user && user.email);

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <nav
        className="navbar"
        style={isDashboard ? {
          background: '#fff',
          color: '#1e293b',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          borderBottom: '1px solid #f1f5f9',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          minHeight: '68px',
          padding: '0 2.5rem',
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'Inter, Arial, sans-serif',
        } : {}}
      >
        <div className="logo" style={isDashboard ? { fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-1px', color: '#2563eb', marginRight: '2.5rem' } : {}}>
          <Link to="/" style={isDashboard ? { color: '#2563eb', fontWeight: 800, textDecoration: 'none' } : {}}>AVLYS AI</Link>
        </div>
        <button
          className={`mobile-toggle ${mobileNavOpen ? 'active' : ''}`}
          onClick={toggleMobileNav}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={`nav-links ${mobileNavOpen ? 'active' : ''}`} style={isDashboard ? { color: '#1e293b', display: 'flex', gap: '2.2rem', fontWeight: 600, fontSize: '1.05rem', alignItems: 'center', margin: 0 } : {}}>
          <li><Link to="/about" onClick={() => setMobileNavOpen(false)} style={isDashboard ? { color: '#1e293b', textDecoration: 'none', padding: '0.25rem 0.5rem', borderRadius: '6px', transition: 'background 0.15s', fontWeight: 600 } : {}} onMouseOver={e => { if(isDashboard) e.target.style.background='#f1f5f9'; }} onMouseOut={e => { if(isDashboard) e.target.style.background='transparent'; }}>About</Link></li>
          <li><Link to="/features" onClick={() => setMobileNavOpen(false)} style={isDashboard ? { color: '#1e293b', textDecoration: 'none', padding: '0.25rem 0.5rem', borderRadius: '6px', transition: 'background 0.15s', fontWeight: 600 } : {}} onMouseOver={e => { if(isDashboard) e.target.style.background='#f1f5f9'; }} onMouseOut={e => { if(isDashboard) e.target.style.background='transparent'; }}>Features</Link></li>
          <li><Link to="/use-cases" onClick={() => setMobileNavOpen(false)} style={isDashboard ? { color: '#1e293b', textDecoration: 'none', padding: '0.25rem 0.5rem', borderRadius: '6px', transition: 'background 0.15s', fontWeight: 600 } : {}} onMouseOver={e => { if(isDashboard) e.target.style.background='#f1f5f9'; }} onMouseOut={e => { if(isDashboard) e.target.style.background='transparent'; }}>Use Cases</Link></li>
          <li><Link to="/blog" onClick={() => setMobileNavOpen(false)} style={isDashboard ? { color: '#1e293b', textDecoration: 'none', padding: '0.25rem 0.5rem', borderRadius: '6px', transition: 'background 0.15s', fontWeight: 600 } : {}} onMouseOver={e => { if(isDashboard) e.target.style.background='#f1f5f9'; }} onMouseOut={e => { if(isDashboard) e.target.style.background='transparent'; }}>Blog</Link></li>
          <li><Link to="/contact" onClick={() => setMobileNavOpen(false)} style={isDashboard ? { color: '#1e293b', textDecoration: 'none', padding: '0.25rem 0.5rem', borderRadius: '6px', transition: 'background 0.15s', fontWeight: 600 } : {}} onMouseOver={e => { if(isDashboard) e.target.style.background='#f1f5f9'; }} onMouseOut={e => { if(isDashboard) e.target.style.background='transparent'; }}>Contact</Link></li>
        </ul>
        {showUserDropdown && (
          <div style={{ marginLeft: 'auto', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                cursor: 'pointer',
                borderRadius: '50%',
                overflow: 'hidden',
                width: 40,
                height: 40,
                background: '#e0e7ef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: showDropdown ? '2px solid #2563eb' : 'none',
                boxShadow: showDropdown ? '0 0 0 2px #2563eb33' : 'none',
                transition: 'box-shadow 0.2s, outline 0.2s',
              }}
              onClick={() => setShowDropdown(v => !v)}
              tabIndex={0}
              role="button"
              aria-haspopup="true"
              aria-expanded={showDropdown}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') setShowDropdown(v => !v);
              }}
            >
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=2563eb&color=fff&rounded=true&size=40`} 
                alt="User Avatar" 
                style={{ width: 40, height: 40 }} 
              />
              {showDropdown && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    right: 0, 
                    top: 50, 
                    background: '#fff', 
                    boxShadow: '0 4px 24px rgba(0,0,0,0.10)', 
                    borderRadius: 12, 
                    minWidth: 240, 
                    zIndex: 200, 
                    padding: '0.5rem 0', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div style={{ 
                    padding: '0.75rem 1.25rem', 
                    borderBottom: '1px solid #f1f5f9', 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {user.displayName && (
                      <div style={{ 
                        fontWeight: 600, 
                        fontSize: '1rem', 
                        color: '#1e293b'
                      }}>
                        {user.displayName}
                      </div>
                    )}
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#64748b',
                      wordBreak: 'break-all'
                    }}>
                      {user.email}
                    </div>
                  </div>
                  <div style={{ width: '100%', padding: '0.5rem 0' }}>
                    <button 
                       className="header-dropdown-hover"
                       style={{ 
                         width: '100%', 
                         background: 'none', 
                         border: 'none', 
                         padding: '0.75rem 1.25rem', 
                         textAlign: 'left', 
                         color: '#ef4444', 
                         fontWeight: 500, 
                         fontSize: '0.875rem', 
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '8px',
                         transition: 'background-color 0.2s'
                       }} 
                      onClick={() => { 
                        setShowDropdown(false); 
                        if (onLogout) onLogout(); 
                      }}
                      disabled={user?.isLoggingOut}
                      role="menuitem"
                    >
                      {user?.isLoggingOut ? (
                        <>
                          <span className="spinner"></span>
                          Logging out...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          Logout
                        </>
                      )}
                    </button>
                    {onSwitchAccount && (
                      <button 
                         className="header-dropdown-hover"
                         style={{ 
                           width: '100%', 
                           background: 'none', 
                           border: 'none', 
                           padding: '0.75rem 1.25rem', 
                           textAlign: 'left', 
                           color: '#2563eb', 
                           fontWeight: 500, 
                           fontSize: '0.875rem', 
                           cursor: 'pointer',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '8px',
                           transition: 'background-color 0.2s'
                         }} 
                        onClick={() => { 
                          setShowDropdown(false); 
                          if (onSwitchAccount) onSwitchAccount(); 
                        }}
                        role="menuitem"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Switch Account
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;