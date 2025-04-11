import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Get token and user from localStorage
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Set auth token to axios default headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Try to parse stored user
          try {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
          } catch (e) {
            console.error('Error parsing stored user:', e);
            // Clear invalid user data
            localStorage.removeItem('user');
          }
          
          // Optionally verify token with backend
          // const response = await api.get('/api/auth/verify');
          // if (!response.data.success) {
          //   handleLogout();
          // }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setError('Failed to authenticate user');
        // Logout user if token is invalid
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);
  
  // Login function
  const login = async (credentials) => {
    try {
      setError('');
      const response = await api.post('/api/auth/login', credentials);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Save token and user to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set auth token to axios default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update context
        setCurrentUser(user);
        return { success: true, user };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Login failed',
        errorType: err.response?.data?.errorType || 'UNKNOWN_ERROR'
      };
    }
  };
  
  // Logout function
  const handleLogout = () => {
    // Remove token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove auth token from axios default headers
    delete api.defaults.headers.common['Authorization'];
    
    // Clear user from context
    setCurrentUser(null);
  };
  
  // Create alias for handleLogout to maintain backward compatibility
  const logout = handleLogout;
  
  // Register function
  const register = async (userData) => {
    try {
      setError('');
      const response = await api.post('/api/auth/register', userData);
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message || err.message || 'Registration failed' };
    }
  };
  
  // Role-based access control functions
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };
  
  const isFaculty = () => {
    return currentUser?.role === 'faculty';
  };
  
  const isStudent = () => {
    return currentUser?.role === 'student';
  };
  
  const isClubHead = () => {
    return currentUser?.role === 'clubHead';
  };
  
  // Context value
  const value = {
    currentUser,
    login,
    handleLogout,
    logout, // Add the alias to the exported context
    register,
    loading,
    error,
    setError,
    isAdmin,
    isFaculty,
    isStudent,
    isClubHead
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
