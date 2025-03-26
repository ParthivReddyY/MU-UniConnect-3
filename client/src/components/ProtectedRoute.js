import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component to handle routes that require authentication
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow access if no specific roles are required
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has the required role
  if (allowedRoles.includes(currentUser.role)) {
    return children;
  }

  // Redirect to unauthorized page if user doesn't have required role
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
