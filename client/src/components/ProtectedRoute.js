import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading state if auth is still being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If roles are specified, check if user has at least one of the allowed roles
  const userHasAllowedRole = allowedRoles.length > 0 ? hasRole(allowedRoles) : true;

  if (!userHasAllowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has allowed role (if specified)
  return children;
};

export default ProtectedRoute;
