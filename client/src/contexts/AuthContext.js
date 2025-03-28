import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';  // Using our configured axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load user data on initial load or token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/api/auth/me');
        setCurrentUser(res.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        setToken('');
        setError('Session expired. Please log in again.');
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user (students only)
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', userData);
      setLoading(false);
      return { success: true, message: res.data.message };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Registration failed');
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError('');
      console.log('Login attempt for:', credentials.email, 'to', api.defaults.baseURL);
      const res = await api.post('/api/auth/login', credentials);
      
      console.log('Login response received:', res.status);
      
      if (res.data.success) {
        setCurrentUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        
        return { success: true };
      } else {
        // This case shouldn't happen as API should throw error for failures
        setError(res.data.message || 'Login failed');
        return { 
          success: false, 
          message: res.data.message || 'Login failed',
          errorType: res.data.errorType 
        };
      }
    } catch (error) {
      console.error('Login error in context:', error);
      
      let errorMessage = 'Login failed';
      let errorType = 'UNKNOWN_ERROR';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Server might be down or unavailable.';
        errorType = 'TIMEOUT';
      } else if (error.message && error.message.includes('Network Error')) {
        errorMessage = `Network error - cannot connect to server. Please check your connection or try again later. (Server: ${api.defaults.baseURL})`;
        errorType = 'NETWORK_ERROR';
      } else if (error.response) {
        // Extract error details from the response
        errorMessage = error.response.data?.message || 'Server error';
        errorType = error.response.data?.errorType || 'SERVER_ERROR';
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        errorType: errorType 
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCurrentUser(null);
  };

  // Create user (Admin only)
  const createUser = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/create-user', userData);
      setLoading(false);
      return { success: true, message: res.data.message };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to create user');
      return { success: false, message: error.response?.data?.message || 'Failed to create user' };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setLoading(false);
      return { success: true, message: res.data.message };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to process request');
      return { success: false, message: error.response?.data?.message || 'Failed to process request' };
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    setLoading(true);
    try {
      const res = await api.post(`/api/auth/reset-password/${token}`, { password });
      setLoading(false);
      return { success: true, message: res.data.message };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to reset password');
      return { success: false, message: error.response?.data?.message || 'Failed to reset password' };
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!currentUser) return false;
    if (typeof role === 'string') return currentUser.role === role;
    if (Array.isArray(role)) return role.includes(currentUser.role);
    return false;
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is faculty
  const isFaculty = () => hasRole('faculty');

  // Check if user is club head
  const isClubHead = () => hasRole('clubHead');

  // Check if user is student
  const isStudent = () => hasRole('student');

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    createUser,
    forgotPassword,
    resetPassword,
    hasRole,
    isAdmin,
    isFaculty,
    isClubHead,
    isStudent,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
