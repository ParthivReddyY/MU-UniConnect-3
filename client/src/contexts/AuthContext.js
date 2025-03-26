import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000/api';

  // Configure axios with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user data on initial load or token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/me`);
        setCurrentUser(res.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        setToken('');
        setError('Session expired. Please log in again.');
      }
      setLoading(false);
    };

    loadUser();
  }, [token, API_URL]);

  // Register user (students only)
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
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
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, credentials);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setCurrentUser(res.data.user);
      setLoading(false);
      
      return { success: true };
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Login failed');
      return { success: false, message: error.response?.data?.message || 'Login failed' };
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
      const res = await axios.post(`${API_URL}/auth/create-user`, userData);
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
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
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
      const res = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
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
