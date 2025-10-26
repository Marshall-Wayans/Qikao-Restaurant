import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        Loading...
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}