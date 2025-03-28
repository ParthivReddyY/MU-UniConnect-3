import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }
  
  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If no specific roles required, just being logged in is enough
  if (allowedRoles.length === 0) {
    return children;
  }
  
  // Check if user has at least one of the allowed roles - log for debugging
  console.log(`User role: ${currentUser.role}, Allowed roles:`, allowedRoles);
  
  // Explicitly check if the user's role is included in the allowedRoles array
  if (allowedRoles.includes(currentUser.role)) {
    return children;
  }
  
  // If user doesn't have required role, redirect to unauthorized
  console.log(`Access denied: User with role ${currentUser.role} tried to access a route requiring one of:`, allowedRoles);
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
