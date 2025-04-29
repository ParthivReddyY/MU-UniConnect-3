import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/api/auth/current-user');
      setCurrentUser(response.data.user);
    } catch (error) {
      // Handle token expiry/invalid token
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Fix login function to handle both object and separate parameters
  const login = async (emailOrData, passwordParam) => {
    try {
      // Clear any previous errors
      setError('');
      
      let email, password;
      
      // Check if first parameter is an object (formData) or a string (email)
      if (typeof emailOrData === 'object' && emailOrData !== null) {
        // Extract email and password from the formData object
        email = emailOrData.email;
        password = emailOrData.password;
        console.log('Login with formData object', { email: email ? 'provided' : 'missing', password: password ? 'provided' : 'missing' });
      } else {
        // Use parameters directly
        email = emailOrData;
        password = passwordParam;
        console.log('Login with direct parameters', { email: email ? 'provided' : 'missing', password: password ? 'provided' : 'missing' });
      }
      
      // Validate email and password
      if (!email || !password) {
        const errorMessage = 'Email and password are required';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
      
      // Make the login request with properly extracted data
      const response = await api.post('/api/auth/login', { email, password });
      
      // If login successful, store the token and user data
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      
      return { success: true, user };
    } catch (error) {
      // Handle specific error types
      if (error.response) {
        const { data } = error.response;
        const errorMessage = data.message || 'Login failed';
        setError(errorMessage);
        return { success: false, message: errorMessage, errorType: data.errorType };
      } else {
        const errorMessage = 'Network or server error. Please try again.';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    // Instead of navigating here, return a flag that the component can use
    return { success: true, shouldRedirect: true };
  };

  // Check if the current user has a specific role
  const hasRole = (roles) => {
    // Return false if not logged in
    if (!currentUser) return false;
    
    // If roles is a string, convert to array
    const rolesToCheck = typeof roles === 'string' ? [roles] : roles;
    
    // Debug log
    console.log("Checking roles:", rolesToCheck, "User role:", currentUser.role);
    
    // Check if current user's role is in the list
    return rolesToCheck.includes(currentUser.role);
  };

  // Convenience functions for common role checks
  const isAdmin = () => hasRole(['admin']);
  const isStudent = () => hasRole(['student']);
  const isFaculty = () => hasRole(['faculty']);
  const isClubHead = () => hasRole(['clubHead', 'clubs']);

  // On mount, check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          // Ensure userId is set properly
          if (!parsedUser.userId && parsedUser._id) {
            parsedUser.userId = parsedUser._id;
          }
          
          setCurrentUser(parsedUser);
          
          // Debug user data on load
          console.log("Loaded user from storage:", parsedUser);
          console.log("User ID:", parsedUser.userId || parsedUser._id);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    hasRole,
    isAdmin,
    isStudent,
    isFaculty,
    isClubHead
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
