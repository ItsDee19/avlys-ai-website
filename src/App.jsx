import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './components/BlogPost';
import './styles/style.css';
import UseCases from './pages/UseCases';
import SignIn from './pages/SignIn';
import CampaignBuilder from './pages/CampaignBuilder';
import CampaignDashboard from './pages/CampaignDashboard';
import AiCampaignCreator from './pages/AiCampaignCreator.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/ToastProvider';

function AppContent({ showSignInModal, handleShowSignIn, handleCloseSignIn, handleLoginSuccess }) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <ToastProvider>
      <div className="app-container">
        <div className="cosmic-background">
          <div className="stars"></div>   
          <div className="twinkling"></div>
          <div className="orb-1"></div>
          <div className="orb-2"></div>
          <div className="orb-3"></div>
          <div className="orb-4"></div>
          <div className="orb-5"></div>
        </div>
        <Header onLogout={() => handleShowSignIn(location.pathname)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/use-cases" element={<UseCases />} />
            <Route path="/campaign-builder" element={<ProtectedRoute><CampaignBuilder /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><CampaignDashboard /></ProtectedRoute>} />
            <Route path="/create-ai-campaign" element={<AiCampaignCreator />} />
            <Route path="/signin" element={<SignIn isOpen={true} />} />
            <Route path="/privacy" element={<Navigate to="/about" />} />
            <Route path="/terms" element={<Navigate to="/about" />} />
            <Route path="/security" element={<Navigate to="/about" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        {!isDashboard && <Footer />}
      </div>
    </ToastProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

