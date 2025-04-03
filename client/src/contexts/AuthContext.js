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
      return { 
        success: true, 
        message: res.data.message,
        email: res.data.email // Return email for verification step
      };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Registration failed');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Add verification method
  const verifyEmail = async (email, otp) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/verify-email', { email, otp });
      setLoading(false);
      return { 
        success: true, 
        message: res.data.message 
      };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Verification failed');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Verification failed' 
      };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError('');
      // Add a timeout to handle network issues
      const timeout = setTimeout(() => {
        console.log('Request is taking too long, might be a connectivity issue');
      }, 10000); // 10 second warning

      const res = await api.post('/api/auth/login', credentials);
      clearTimeout(timeout);
      
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
      
      // Add deployment-specific error checks
      if (error.message === 'Network Error') {
        setError('Cannot connect to server. Please check your connection or try again later.');
        return {
          success: false,
          message: 'Cannot connect to server. Please check your connection or try again later.',
          errorType: 'NETWORK_ERROR'
        };
      }
      
      // Extract error details from the response
      const errorMessage = error.response?.data?.message || 'Login failed';
      const errorType = error.response?.data?.errorType || 'UNKNOWN_ERROR';
      
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

  // Delete faculty (Admin only)
  const deleteFaculty = async (facultyId) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/faculty/${facultyId}`);
      setLoading(false);
      return { 
        success: true, 
        message: res.data?.message || 'Faculty member successfully deleted' 
      };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to delete faculty member');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete faculty member' 
      };
    }
  };

  // Request password reset OTP (renamed from forgotPassword)
  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setLoading(false);
      return { 
        success: true, 
        message: res.data.message,
        email: res.data.email
      };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to process request');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to process request' 
      };
    }
  };

  // Verify password reset OTP
  const verifyResetOTP = async (email, otp) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/verify-reset-otp', { email, otp });
      setLoading(false);
      return { 
        success: true, 
        message: res.data.message,
        email: res.data.email
      };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to verify code');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to verify code' 
      };
    }
  };

  // Reset password with OTP
  const resetPassword = async (email, otp, password) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/reset-password', { email, otp, password });
      setLoading(false);
      return { 
        success: true, 
        message: res.data.message 
      };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to reset password');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  };

  // Request password change OTP (for logged in users)
  const requestPasswordChangeOTP = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/request-password-change-otp');
      setLoading(false);
      return { 
        success: true, 
        message: res.data.message,
        email: res.data.email
      };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to send verification code');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send verification code' 
      };
    }
  };

  // Change password with OTP verification
  const changePasswordWithOTP = async (otp, newPassword) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/change-password', { otp, newPassword });
      setLoading(false);
      return { 
        success: true, 
        message: res.data.message 
      };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to change password');
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to change password' 
      };
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
    verifyEmail, // Add the new method to the context
    login,
    logout,
    createUser,
    deleteFaculty, // Add the new method to the context
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    requestPasswordChangeOTP,
    changePasswordWithOTP,
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
