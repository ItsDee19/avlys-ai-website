import React from 'react';
import useAuth from '../hooks/useAuth.jsx';

const ProtectedRoute = ({ children, showSignInModal, isSignInModalOpen }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    if (showSignInModal && !isSignInModalOpen) {
      showSignInModal();
    }
    // Don't render children or anything else while modal is open
    return null;
  }

  return children;
};

export default ProtectedRoute;